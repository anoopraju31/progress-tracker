import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbService } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId, taskId } = await params;
    const body = await request.json();
    const { title, description } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Task title is required' }, { status: 400 });
    }

    const updated = await dbService.updateTask(taskId, goalId, {
      title: title.trim(),
      description: description ? description.trim() : null,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId, taskId } = await params;
    const result = await dbService.deleteTask(taskId, goalId);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}
