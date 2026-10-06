import { prisma } from './prisma';
import type { Goal, Task } from '@prisma/client';
import { buildTaskTreeAndCalculateProgress, collectDescendantTaskIds, GoalWithTree, TaskNode } from './tree';

// Fallback in-memory store for instant zero-config testing if cloud MongoDB is offline
interface MemoryUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryGoal {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  themeBgColor: string;
  themeTextColor: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryTask {
  id: string;
  goalId: string;
  parentId: string | null;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const memoryStore = {
  users: [] as MemoryUser[],
  goals: [] as MemoryGoal[],
  tasks: [] as MemoryTask[],
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

// Helper to determine if we should fallback
async function withPrismaOrFallback<T>(
  prismaFn: () => Promise<T>,
  fallbackFn: () => Promise<T> | T
): Promise<T> {
  try {
    return await prismaFn();
  } catch (error: any) {
    // If connection error or DB offline, gracefully fallback
    console.warn('[DB Notice] MongoDB unavailable, utilizing local storage fallback:', error?.message || error);
    return await fallbackFn();
  }
}

export const dbService = {
  // USER OPERATIONS
  async findUserByEmail(email: string) {
    return withPrismaOrFallback(
      () => prisma.user.findUnique({ where: { email } }),
      () => memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
    );
  },

  async findUserById(id: string) {
    return withPrismaOrFallback(
      () => prisma.user.findUnique({ where: { id } }),
      () => memoryStore.users.find((u) => u.id === id) || null
    );
  },

  async createUser(data: { name: string; email: string; password: string }) {
    return withPrismaOrFallback(
      () => prisma.user.create({ data }),
      () => {
        const newUser: MemoryUser = {
          id: generateId(),
          name: data.name,
          email: data.email,
          password: data.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.users.push(newUser);
        return newUser;
      }
    );
  },

  // GOAL OPERATIONS
  async getGoalsForUser(userId: string): Promise<GoalWithTree[]> {
    return withPrismaOrFallback<GoalWithTree[]>(
      async () => {
        const goals = await prisma.goal.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        const goalIds = goals.map((g: Goal) => g.id);
        const allTasks = await prisma.task.findMany({
          where: { goalId: { in: goalIds } },
          orderBy: { createdAt: 'asc' },
        });

        return goals.map((goal: Goal) => {
          const goalTasks = allTasks.filter((t: Task) => t.goalId === goal.id);
          const { tree, totalGoalProgress, totalCount, completedCount } =
            buildTaskTreeAndCalculateProgress(goalTasks);

          return {
            ...goal,
            progress: totalGoalProgress,
            tasks: tree,
            totalTasksCount: totalCount,
            completedTasksCount: completedCount,
          };
        });
      },
      () => {
        const userGoals = memoryStore.goals
          .filter((g) => g.userId === userId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return userGoals.map((goal: MemoryGoal) => {
          const goalTasks = memoryStore.tasks.filter((t: MemoryTask) => t.goalId === goal.id);
          const { tree, totalGoalProgress, totalCount, completedCount } =
            buildTaskTreeAndCalculateProgress(goalTasks);

          return {
            ...goal,
            progress: totalGoalProgress,
            tasks: tree,
            totalTasksCount: totalCount,
            completedTasksCount: completedCount,
          };
        });
      }
    );
  },

  async createGoal(data: {
    userId: string;
    title: string;
    description?: string;
    themeBgColor?: string;
    themeTextColor?: string;
  }) {
    return withPrismaOrFallback(
      () =>
        prisma.goal.create({
          data: {
            userId: data.userId,
            title: data.title,
            description: data.description,
            themeBgColor: data.themeBgColor || '#1e293b',
            themeTextColor: data.themeTextColor || '#f8fafc',
          },
        }),
      () => {
        const newGoal: MemoryGoal = {
          id: generateId(),
          userId: data.userId,
          title: data.title,
          description: data.description || null,
          themeBgColor: data.themeBgColor || '#1e293b',
          themeTextColor: data.themeTextColor || '#f8fafc',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.goals.push(newGoal);
        return newGoal;
      }
    );
  },

  async updateGoal(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      themeBgColor?: string;
      themeTextColor?: string;
    }
  ) {
    return withPrismaOrFallback(
      () =>
        prisma.goal.update({
          where: { id, userId },
          data,
        }),
      () => {
        const goalIndex = memoryStore.goals.findIndex((g) => g.id === id && g.userId === userId);
        if (goalIndex === -1) throw new Error('Goal not found');
        const updated = {
          ...memoryStore.goals[goalIndex],
          ...data,
          updatedAt: new Date(),
        };
        memoryStore.goals[goalIndex] = updated;
        return updated;
      }
    );
  },

  async deleteGoal(id: string, userId: string) {
    return withPrismaOrFallback(
      () => prisma.goal.delete({ where: { id, userId } }),
      () => {
        const goalIndex = memoryStore.goals.findIndex((g) => g.id === id && g.userId === userId);
        if (goalIndex === -1) throw new Error('Goal not found');
        memoryStore.goals.splice(goalIndex, 1);
        memoryStore.tasks = memoryStore.tasks.filter((t) => t.goalId !== id);
        return { id };
      }
    );
  },

  // TASK OPERATIONS
  async createTask(data: {
    goalId: string;
    parentId?: string | null;
    title: string;
    description?: string;
  }) {
    return withPrismaOrFallback(
      () =>
        prisma.task.create({
          data: {
            goalId: data.goalId,
            parentId: data.parentId || null,
            title: data.title,
            description: data.description,
            isCompleted: false,
            order: 0,
          },
        }),
      () => {
        const newTask: MemoryTask = {
          id: generateId(),
          goalId: data.goalId,
          parentId: data.parentId || null,
          title: data.title,
          description: data.description || null,
          isCompleted: false,
          order: memoryStore.tasks.filter((t) => t.goalId === data.goalId && t.parentId === (data.parentId || null)).length,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.tasks.push(newTask);
        return newTask;
      }
    );
  },

  async updateTask(
    taskId: string,
    goalId: string,
    data: { title?: string; description?: string }
  ) {
    return withPrismaOrFallback(
      () =>
        prisma.task.update({
          where: { id: taskId, goalId },
          data,
        }),
      () => {
        const taskIndex = memoryStore.tasks.findIndex((t) => t.id === taskId && t.goalId === goalId);
        if (taskIndex === -1) throw new Error('Task not found');
        const updated = {
          ...memoryStore.tasks[taskIndex],
          ...data,
          updatedAt: new Date(),
        };
        memoryStore.tasks[taskIndex] = updated;
        return updated;
      }
    );
  },

  async toggleTask(taskId: string, goalId: string) {
    return withPrismaOrFallback(
      async () => {
        const existing = await prisma.task.findUnique({
          where: { id: taskId, goalId },
        });
        if (!existing) throw new Error('Task not found');
        return prisma.task.update({
          where: { id: taskId },
          data: { isCompleted: !existing.isCompleted },
        });
      },
      () => {
        const task = memoryStore.tasks.find((t) => t.id === taskId && t.goalId === goalId);
        if (!task) throw new Error('Task not found');
        task.isCompleted = !task.isCompleted;
        task.updatedAt = new Date();
        return task;
      }
    );
  },

  async deleteTask(taskId: string, goalId: string) {
    return withPrismaOrFallback(
      async () => {
        const allGoalTasks = await prisma.task.findMany({ where: { goalId } });
        const idsToDelete = collectDescendantTaskIds(allGoalTasks, taskId);
        await prisma.task.deleteMany({
          where: { id: { in: idsToDelete } },
        });
        return { deletedIds: idsToDelete };
      },
      () => {
        const allGoalTasks = memoryStore.tasks.filter((t) => t.goalId === goalId);
        const idsToDelete = collectDescendantTaskIds(allGoalTasks, taskId);
        memoryStore.tasks = memoryStore.tasks.filter((t) => !idsToDelete.includes(t.id));
        return { deletedIds: idsToDelete };
      }
    );
  },
};
