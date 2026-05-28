// API: Delete video
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteVideo } from '@/lib/video-service';
import { isAdmin } from '@/lib/auth-utils';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteVideo(
      params.id,
      session.user.id,
      isAdmin(session.user.roles)
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting video:', err);
    
    if (err.message?.includes('not found or unauthorized')) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
