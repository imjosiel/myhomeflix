// API: List videos
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listVideos } from '@/lib/video-service';
import { VideoStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as VideoStatus | null;
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const result = await listVideos({
      userId: userId ?? undefined,
      status: status ?? undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error listing videos:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
