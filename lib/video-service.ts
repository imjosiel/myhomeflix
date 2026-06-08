// Updated video service with processor compatibility
import { prisma } from './prisma';
import { VideoStatus } from '@prisma/client';

export async function createVideoStub(params: {
  id: string;
  title: string;
  description?: string;
  sourceKey: string;
  userId: string;
  videoQualityHeights?: number[];
}) {
  const video = await prisma.video.create({
    data: {
      id: params.id,
      title: params.title,
      name: params.title, // Alias for processor
      description: params.description ?? '',
      status: VideoStatus.UPLOADING,
      sourceKey: params.sourceKey,
      originalVideoKey: params.sourceKey, // Alias for processor
      userId: params.userId,
      videoQualityHeights: params.videoQualityHeights ?? [720, 1080],
      hlsProcessed: false,
      processingProgress: 0,
    },
  });
  return video;
}

export async function markVideoQueuedForTranscode(id: string) {
  return prisma.video.update({
    where: { id },
    data: { 
      status: VideoStatus.QUEUED_FOR_TRANSCODE,
      processingProgress: 5,
    },
  });
}

export async function updateVideoAfterTranscode(params: {
  id: string;
  masterPlaylistKey: string;
  duration?: number;
  qualities: Array<{
    label: string;
    width: number;
    height: number;
    bitrate: number;
    playlistKey: string;
  }>;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.video.update({
      where: { id: params.id },
      data: {
        status: VideoStatus.READY,
        masterPlaylistKey: params.masterPlaylistKey,
        duration: params.duration,
        hlsProcessed: true,
        processingProgress: 100,
      },
    });

    for (const quality of params.qualities) {
      await tx.videoQuality.create({
        data: {
          videoId: params.id,
          label: quality.label,
          width: quality.width,
          height: quality.height,
          bitrate: quality.bitrate,
          playlistKey: quality.playlistKey,
        },
      });
    }

    return tx.video.findUnique({
      where: { id: params.id },
      include: {
        qualities: true,
        subtitles: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  });
}

export async function getVideoForPlayback(id: string) {
  return prisma.video.findUnique({
    where: { id },
    include: {
      qualities: {
        orderBy: {
          bitrate: 'desc',
        },
      },
      subtitles: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

export async function listVideos(params?: {
  userId?: string;
  status?: VideoStatus;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  
  if (params?.userId) {
    where.userId = params.userId;
  }
  
  if (params?.status) {
    where.status = params.status;
  }

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            qualities: true,
            subtitles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: params?.limit ?? 50,
      skip: params?.offset ?? 0,
    }),
    prisma.video.count({ where }),
  ]);

  return { videos, total };
}

export async function deleteVideo(id: string, userId: string, isAdmin: boolean = false) {
  // Check ownership unless admin
  if (!isAdmin) {
    const video = await prisma.video.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!video || video.userId !== userId) {
      throw new Error('Video not found or unauthorized');
    }
  }

  return prisma.video.delete({
    where: { id },
  });
}

export async function updateVideo(params: {
  id: string;
  userId: string;
  isAdmin?: boolean;
  title?: string;
  description?: string;
  status?: VideoStatus;
  videoQualityHeights?: number[];
}) {
  // Check ownership unless admin
  if (!params.isAdmin) {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!video || video.userId !== params.userId) {
      throw new Error('Video not found or unauthorized');
    }
  }

  const data: any = {};
  if (params.title !== undefined) {
    data.title = params.title;
    data.name = params.title; // Keep alias synced
  }
  if (params.description !== undefined) data.description = params.description;
  if (params.status !== undefined) data.status = params.status;
  if (params.videoQualityHeights !== undefined) data.videoQualityHeights = params.videoQualityHeights;

  return prisma.video.update({
    where: { id: params.id },
    data,
    include: {
      qualities: true,
      subtitles: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
