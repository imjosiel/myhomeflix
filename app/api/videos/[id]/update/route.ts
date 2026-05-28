// API: Update video
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { updateVideo } from '@/lib/video-service';
import { isAdmin } from '@/lib/auth-utils';
import { VideoStatus } from '@prisma/client';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, status } = body;

    const video = await updateVideo({
      id: params.id,
      userId: session.user.id,
      isAdmin: isAdmin(session.user.roles),
      title,
      description,
      status: status as VideoStatus | undefined,
    });

    return NextResponse.json(video);
  } catch (err: any) {
    console.error('Error updating video:', err);
    
    if (err.message?.includes('not found or unauthorized')) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
