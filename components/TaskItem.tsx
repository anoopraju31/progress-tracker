'use client';

import React from 'react';
import { TaskNode } from '@/lib/tree';
import { ProgressBar } from './ProgressBar';
import { CheckCircle2, Circle, Edit3, Trash2, ChevronRight, CornerDownRight } from 'lucide-react';

interface TaskItemProps {
  task: TaskNode;
  goalId: string;
  themeTextColor?: string;
  onToggle: (taskId: string) => void;
  onEdit: (task: TaskNode) => void;
  onDelete: (taskId: string) => void;
  onDrillDown: (task: TaskNode) => void;
  levelDepth?: number;
}

export function TaskItem({
  task,
  goalId,
  themeTextColor,
  onToggle,
  onEdit,
  onDelete,
  onDrillDown,
  levelDepth = 0,
}: TaskItemProps) {
  const hasSubtasks = task.subTasks && task.subTasks.length > 0;
  const completedSubtasks = task.subTasks ? task.subTasks.filter((st) => st.isCompleted).length : 0;

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-black/20 hover:bg-black/35 border border-white/5 hover:border-white/15 transition-all duration-200">
      {/* Left section: Checkbox, Title, and Subtask tag */}
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        {/* Mark as Done Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          type="button"
          aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
          className="mt-0.5 sm:mt-0 p-1 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          {task.isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
          ) : (
            <Circle className="w-5 h-5 text-slate-400 hover:text-emerald-400" />
          )}
        </button>

        {/* Task Title & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-medium text-sm transition-all truncate ${
                task.isCompleted
                  ? 'line-through text-slate-400/80'
                  : 'text-slate-100'
              }`}
              style={{ color: task.isCompleted ? undefined : themeTextColor }}
            >
              {task.title}
            </span>

            {/* Subtask count badge */}
            <button
              onClick={() => onDrillDown(task)}
              type="button"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10 transition-colors"
              title="Click to drill into subtasks"
            >
              <CornerDownRight className="w-3 h-3 text-indigo-400" />
              <span>
                {task.subTasks.length} {task.subTasks.length === 1 ? 'subtask' : 'subtasks'}
              </span>
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-slate-400/90 mt-0.5 truncate">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Middle/Right: Progress Bar & Actions */}
      <div className="flex items-center gap-4 sm:w-72 justify-between sm:justify-end">
        {/* Progress Bar */}
        <div className="flex-1 sm:max-w-[130px]">
          <ProgressBar progress={task.progress} textColor={themeTextColor} size="sm" />
        </div>

        {/* Action Buttons: Edit, Delete, Drill Down */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            type="button"
            title="Edit task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-white/10 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            type="button"
            title="Delete task and subtasks"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Drill Down Button */}
          <button
            onClick={() => onDrillDown(task)}
            type="button"
            title="Open task sub-container"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all shadow-sm group-hover:border-indigo-500/50"
          >
            <span>Subtasks</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
