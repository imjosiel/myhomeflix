// API: Generate presigned URL for R2 upload
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUploadUrl } from '@/lib/r2-presign';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { canUploadVideos } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has permission to upload
    if (!canUploadVideos(session.user.roles)) {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { filename, contentType, kind, title, description, videoId, languageCode, label } = body;

    if (!filename || !contentType || !kind) {
      return NextResponse.json(
        { error: 'filename, contentType and kind are required' },
        { status: 400 }
      );
    }

    let key: string;
    let resultVideoId: string;

    if (kind === 'video_master') {
      // Create new video record
      const id = uuidv4();
      resultVideoId = id;
      
      // Updated key structure: videos/{id}/input.mp4
      // This matches the processor's expected structure
      const extension = filename.split('.').pop() || 'mp4';
      key = `videos/${id}/input.${extension}`;

      await prisma.video.create({
        data: {
          id,
          title: title ?? filename,
          name: title ?? filename, // Alias for processor
          description: description ?? '',
          status: 'UPLOADING',
          sourceKey: key,
          originalVideoKey: key, // Alias for processor
          userId: session.user.id,
          hlsProcessed: false,
          processingProgress: 0,
        },
      });
    } else if (kind === 'subtitle') {
      // Validate required fields for subtitle
      if (!videoId || !languageCode || !label) {
        return NextResponse.json(
          { error: 'videoId, languageCode and label are required for subtitles' },
          { status: 400 }
        );
      }

      resultVideoId = videoId;
      key = `videos/${videoId}/subtitles/${filename}`;

      // Create subtitle record
      await prisma.subtitle.create({
        data: {
          videoId,
          languageCode,
          label,
          key,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid kind' }, { status: 400 });
    }

    // Generate presigned URL
    const uploadUrl = await getUploadUrl({
      key,
      contentType,
      expiresInSeconds: 60 * 30, // 30 minutes for large uploads
    });

    return NextResponse.json({
      uploadUrl,
      key,
      videoId: resultVideoId,
    });
  } catch (err) {
    console.error('Error generating upload URL:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
