// API: Mark video upload as complete
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { markVideoQueuedForTranscode } from '@/lib/video-service';
import { canUploadVideos } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!canUploadVideos(session.user.roles)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { videoId, sourceKey } = await req.json();

    if (!videoId || !sourceKey) {
      return NextResponse.json(
        { error: 'videoId and sourceKey are required' },
        { status: 400 }
      );
    }

    // Update video status to queued for transcoding
    const video = await markVideoQueuedForTranscode(videoId);

    // TODO: Enqueue transcoding job (e.g., to a message queue)
    // For now, this could be handled by a separate worker polling the database

    return NextResponse.json({ success: true, video });
  } catch (err) {
    console.error('Error marking upload complete:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
