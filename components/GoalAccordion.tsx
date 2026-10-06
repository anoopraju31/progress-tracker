'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  toggleAccordion,
  pushTaskContainer,
  openAddTaskModal,
  openEditTaskModal,
} from '@/store/navigationSlice';
import { GoalWithTree, TaskNode } from '@/lib/tree';
import { TaskItem } from './TaskItem';
import { TaskContainer } from './TaskContainer';
import { ProgressBar } from './ProgressBar';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  FolderTree,
  Calendar,
} from 'lucide-react';

interface GoalAccordionProps {
  goal: GoalWithTree;
  onDeleteGoal: (goalId: string) => void;
  onToggleTask: (taskId: string, goalId: string) => void;
  onDeleteTask: (taskId: string, goalId: string) => void;
}

// Recursive finder for active task in tree by ID
function findTaskInTree(nodes: TaskNode[], targetId: string): TaskNode | null {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.subTasks && node.subTasks.length > 0) {
      const found = findTaskInTree(node.subTasks, targetId);
      if (found) return found;
    }
  }
  return null;
}

export function GoalAccordion({
  goal,
  onDeleteGoal,
  onToggleTask,
  onDeleteTask,
}: GoalAccordionProps) {
  const dispatch = useDispatch();

  const isExpanded = useSelector(
    (state: RootState) => Boolean(state.navigation.expandedGoals[goal.id])
  );

  const stack = useSelector(
    (state: RootState) => state.navigation.taskStacks[goal.id] || []
  );

  // If stack has elements, find the current active task container
  const currentTaskInStack =
    stack.length > 0
      ? findTaskInTree(goal.tasks, stack[stack.length - 1].id)
      : null;

  const handleToggleExpand = () => {
    dispatch(toggleAccordion(goal.id));
  };

  const handleAddRootTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      openAddTaskModal({
        goalId: goal.id,
        parentId: null,
      })
    );
  };

  const handleDrillDown = (task: TaskNode) => {
    dispatch(
      pushTaskContainer({
        goalId: goal.id,
        task: { id: task.id, title: task.title },
      })
    );
  };

  // Safe color styles
  const cardStyle: React.CSSProperties = {
    backgroundColor: goal.themeBgColor || '#1e293b',
    color: goal.themeTextColor || '#f8fafc',
  };

  return (
    <div
      className="rounded-2xl border border-white/10 shadow-xl overflow-hidden transition-all duration-300"
      style={cardStyle}
    >
      {/* Accordion Header (Always visible) */}
      <div
        onClick={handleToggleExpand}
        className="cursor-pointer p-4 sm:p-5 select-none transition-colors hover:bg-black/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        {/* Left: Title & Metadata */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 shrink-0">
            <FolderTree className="w-5 h-5" style={{ color: goal.themeTextColor }} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight truncate">
                {goal.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/25 border border-white/10">
                {goal.completedTasksCount} / {goal.totalTasksCount} completed
              </span>
            </div>

            {goal.description && (
              <p className="text-xs opacity-80 mt-0.5 line-clamp-1">
                {goal.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Progress Bar & Actions */}
        <div className="flex items-center gap-4 justify-between md:justify-end shrink-0">
          <div className="w-36 sm:w-48">
            <ProgressBar
              progress={goal.progress}
              textColor={goal.themeTextColor}
              size="md"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Add Task button */}
            <button
              onClick={handleAddRootTask}
              type="button"
              title="Add task to this goal"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-current border border-white/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Delete Goal button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete goal "${goal.title}"?`)) {
                  onDeleteGoal(goal.id);
                }
              }}
              type="button"
              title="Delete goal"
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Expand / Collapse Chevron */}
            <div className="p-1.5 rounded-lg bg-black/20 text-current">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Body (Rendered when expanded) */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-white/10 bg-black/15">
          {/* If the user is currently drilled into a sub-container in the stack */}
          {currentTaskInStack ? (
            <div className="pt-4">
              <TaskContainer
                goalId={goal.id}
                themeBgColor={goal.themeBgColor}
                themeTextColor={goal.themeTextColor}
                currentTask={currentTaskInStack}
                onToggleTask={(tId) => onToggleTask(tId, goal.id)}
                onDeleteTask={(tId) => onDeleteTask(tId, goal.id)}
              />
            </div>
          ) : (
            /* Otherwise, show the top-level task list */
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Top-Level Tasks ({goal.tasks.length})
                </span>

                <button
                  onClick={handleAddRootTask}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold transition-all border border-white/10 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {goal.tasks.length > 0 ? (
                <div className="space-y-2.5">
                  {goal.tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      goalId={goal.id}
                      themeTextColor={goal.themeTextColor}
                      onToggle={(tId) => onToggleTask(tId, goal.id)}
                      onEdit={(t) =>
                        dispatch(
                          openEditTaskModal({
                            goalId: goal.id,
                            taskToEdit: {
                              id: t.id,
                              title: t.title,
                              description: t.description,
                            },
                          })
                        )
                      }
                      onDelete={(tId) => onDeleteTask(tId, goal.id)}
                      onDrillDown={handleDrillDown}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/10">
                  <FolderTree className="w-10 h-10 opacity-40 mb-2 stroke-1" />
                  <p className="text-sm font-medium opacity-90">
                    No tasks created for this goal yet
                  </p>
                  <p className="text-xs opacity-60 mt-0.5">
                    Start by breaking this goal down into executable tasks.
                  </p>
                  <button
                    onClick={handleAddRootTask}
                    type="button"
                    className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Task</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
