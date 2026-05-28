// API: Get video details
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getVideoForPlayback } from '@/lib/video-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const video = await getVideoForPlayback(params.id);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (err) {
    console.error('Error getting video:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
