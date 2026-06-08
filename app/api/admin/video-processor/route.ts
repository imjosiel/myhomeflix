// API for video processor (GitHub Action)
// GET: Fetch pending videos for processing
// PATCH: Update processing progress and mark as done

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VideoStatus } from '@prisma/client';

const PROCESSOR_API_KEY = process.env.PROCESSOR_API_KEY;

// Verify processor authentication
function verifyProcessorAuth(req: NextRequest): boolean {
  const key = req.headers.get('x-processor-key');
  return key === PROCESSOR_API_KEY && !!PROCESSOR_API_KEY;
}

// GET: Fetch videos pending HLS processing
export async function GET(req: NextRequest) {
  try {
    if (!verifyProcessorAuth(req)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid processor key' },
        { status: 401 }
      );
    }

    // Find videos that are queued for transcoding but not yet processed
    const pending = await prisma.video.findMany({
      where: {
        status: VideoStatus.QUEUED_FOR_TRANSCODE,
        hlsProcessed: false,
        sourceKey: { not: null },
      },
      select: {
        id: true,
        title: true,
        sourceKey: true,
        videoQualityHeights: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 10, // Process max 10 at a time
    });

    // Map to format expected by processor
    const formatted = pending.map((video) => ({
      id: video.id,
      name: video.title, // Processor expects 'name'
      originalVideoKey: video.sourceKey,
      videoQualityHeights: video.videoQualityHeights,
    }));

    return NextResponse.json({
      pending: formatted,
      count: formatted.length,
    });
  } catch (err) {
    console.error('Error fetching pending videos:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update processing progress or mark as done
export async function PATCH(req: NextRequest) {
  try {
    if (!verifyProcessorAuth(req)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid processor key' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, processingProgress, hlsProcessed, originalVideoKey } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (typeof processingProgress === 'number') {
      updateData.processingProgress = Math.min(100, Math.max(0, processingProgress));
    }

    if (hlsProcessed === true) {
      updateData.hlsProcessed = true;
      updateData.status = VideoStatus.READY;
      updateData.processingProgress = 100;

      // Set master playlist key based on folder structure
      if (originalVideoKey) {
        const folder = originalVideoKey.slice(0, originalVideoKey.lastIndexOf('/') + 1);
        updateData.masterPlaylistKey = `${folder}hls/master.m3u8`;
        updateData.thumbnailKey = `${folder}thumb.jpg`;
        updateData.teaserKey = `${folder}teaser.mp4`;
      }
    }

    // Update video
    const video = await prisma.video.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        status: true,
        hlsProcessed: true,
        processingProgress: true,
        masterPlaylistKey: true,
      },
    });

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (err: any) {
    console.error('Error updating video processing:', err);

    if (err.code === 'P2025') {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
