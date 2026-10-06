export interface TaskNode {
  id: string;
  goalId: string;
  parentId: string | null;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  progress: number;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  subTasks: TaskNode[];
}

export interface GoalWithTree {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  themeBgColor: string;
  themeTextColor: string;
  progress: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  tasks: TaskNode[];
  totalTasksCount: number;
  completedTasksCount: number;
}

/**
 * Builds a hierarchical tree from a flat list of tasks and calculates recursive progress.
 */
export function buildTaskTreeAndCalculateProgress(flatTasks: any[]): {
  tree: TaskNode[];
  totalGoalProgress: number;
  totalCount: number;
  completedCount: number;
} {
  const nodeMap = new Map<string, TaskNode>();
  const roots: TaskNode[] = [];
  let totalCount = flatTasks.length;
  let completedCount = 0;

  // 1. Initialize node map
  for (const t of flatTasks) {
    if (t.isCompleted) completedCount++;
    nodeMap.set(t.id, {
      id: t.id,
      goalId: t.goalId,
      parentId: t.parentId || null,
      title: t.title,
      description: t.description,
      isCompleted: Boolean(t.isCompleted),
      progress: 0,
      order: t.order ?? 0,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      subTasks: [],
    });
  }

  // 2. Assemble parent-child tree
  for (const t of flatTasks) {
    const node = nodeMap.get(t.id)!;
    if (t.parentId && nodeMap.has(t.parentId)) {
      nodeMap.get(t.parentId)!.subTasks.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children by order / createdAt
  const sortNodes = (nodes: TaskNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach(n => sortNodes(n.subTasks));
  };
  sortNodes(roots);

  // 3. Post-order DFS calculation for progress
  function computeProgress(node: TaskNode): number {
    if (node.subTasks.length === 0) {
      node.progress = node.isCompleted ? 100 : 0;
      return node.progress;
    }

    const childSum = node.subTasks.reduce((acc, child) => acc + computeProgress(child), 0);
    const avg = Math.round(childSum / node.subTasks.length);
    // If explicitly marked as completed, progress is 100%, otherwise average of subtasks
    node.progress = node.isCompleted ? 100 : avg;
    return node.progress;
  }

  roots.forEach(root => computeProgress(root));

  const totalGoalProgress =
    roots.length === 0
      ? 0
      : Math.round(roots.reduce((acc, r) => acc + r.progress, 0) / roots.length);

  return {
    tree: roots,
    totalGoalProgress,
    totalCount,
    completedCount,
  };
}

/**
 * Returns all descendant task IDs of a given target task (used for cascade deletion).
 */
export function collectDescendantTaskIds(flatTasks: any[], targetTaskId: string): string[] {
  const result: string[] = [targetTaskId];
  const childrenMap = new Map<string, string[]>();

  for (const t of flatTasks) {
    if (t.parentId) {
      if (!childrenMap.has(t.parentId)) {
        childrenMap.set(t.parentId, []);
      }
      childrenMap.get(t.parentId)!.push(t.id);
    }
  }

  const queue = [targetTaskId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const directChildren = childrenMap.get(current) || [];
    for (const childId of directChildren) {
      result.push(childId);
      queue.push(childId);
    }
  }

  return result;
}
