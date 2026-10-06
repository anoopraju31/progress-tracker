import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbService } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId, taskId } = await params;
    const updated = await dbService.toggleTask(taskId, goalId);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error toggling task:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to toggle task' },
      { status: 500 }
    );
  }
}
