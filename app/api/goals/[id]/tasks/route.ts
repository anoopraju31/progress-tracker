import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbService } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId } = await params;
    const body = await request.json();
    const { title, description, parentId } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Task title is required' }, { status: 400 });
    }

    const newTask = await dbService.createTask({
      goalId,
      parentId: parentId || null,
      title: title.trim(),
      description: description ? description.trim() : null,
    });

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}
