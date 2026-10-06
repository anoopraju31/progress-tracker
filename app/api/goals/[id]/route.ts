import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbService } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, themeBgColor, themeTextColor } = body;

    const updated = await dbService.updateGoal(id, session.userId, {
      title,
      description,
      themeBgColor,
      themeTextColor,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbService.deleteGoal(id, session.userId);

    return NextResponse.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
