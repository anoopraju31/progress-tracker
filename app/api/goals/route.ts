import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const goals = await dbService.getGoalsForUser(session.userId);
    return NextResponse.json({ success: true, data: goals });
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, themeBgColor, themeTextColor } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Goal title is required' }, { status: 400 });
    }

    const newGoal = await dbService.createGoal({
      userId: session.userId,
      title: title.trim(),
      description: description ? description.trim() : null,
      themeBgColor: themeBgColor || '#1e293b',
      themeTextColor: themeTextColor || '#f8fafc',
    });

    return NextResponse.json({ success: true, data: newGoal }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create goal' },
      { status: 500 }
    );
  }
}
