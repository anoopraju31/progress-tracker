'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  popTaskContainer,
  jumpToStackLevel,
  openAddTaskModal,
  openEditTaskModal,
  pushTaskContainer,
} from '@/store/navigationSlice';
import { TaskNode } from '@/lib/tree';
import { TaskItem } from './TaskItem';
import { ProgressBar } from './ProgressBar';
import { ArrowLeft, Plus, FolderTree, ChevronRight } from 'lucide-react';

interface TaskContainerProps {
  goalId: string;
  themeBgColor: string;
  themeTextColor: string;
  currentTask: TaskNode;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskContainer({
  goalId,
  themeBgColor,
  themeTextColor,
  currentTask,
  onToggleTask,
  onDeleteTask,
}: TaskContainerProps) {
  const dispatch = useDispatch();
  const stack = useSelector(
    (state: RootState) => state.navigation.taskStacks[goalId] || []
  );

  const handleBack = () => {
    dispatch(popTaskContainer(goalId));
  };

  const handleAddSubtask = () => {
    dispatch(
      openAddTaskModal({
        goalId,
        parentId: currentTask.id,
      })
    );
  };

  const handleEditCurrentTask = () => {
    dispatch(
      openEditTaskModal({
        goalId,
        taskToEdit: {
          id: currentTask.id,
          title: currentTask.title,
          description: currentTask.description,
        },
      })
    );
  };

  const handleDrillDown = (subtask: TaskNode) => {
    dispatch(
      pushTaskContainer({
        goalId,
        task: { id: subtask.id, title: subtask.title },
      })
    );
  };

  return (
    <div className="flex flex-col rounded-2xl bg-black/40 border border-white/10 p-4 sm:p-5 shadow-2xl backdrop-blur-md animate-fade-in">
      {/* Container Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={handleBack}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 font-medium text-xs sm:text-sm border border-white/10 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>

          {/* Current Container Info */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium flex-wrap">
              <button
                onClick={() => dispatch(jumpToStackLevel({ goalId, index: -1 }))}
                className="hover:text-indigo-400 transition-colors"
              >
                Top Level
              </button>
              {stack.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <button
                    onClick={() => dispatch(jumpToStackLevel({ goalId, index }))}
                    className={`hover:text-indigo-400 transition-colors truncate max-w-[120px] ${
                      index === stack.length - 1 ? 'text-indigo-400 font-semibold' : ''
                    }`}
                  >
                    {item.title}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <h3
              className="font-bold text-base sm:text-lg tracking-tight mt-0.5"
              style={{ color: themeTextColor || '#f8fafc' }}
            >
              {currentTask.title}
            </h3>
          </div>
        </div>

        {/* Right side: Overall Container Progress & Add Task Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="w-28 sm:w-36">
            <ProgressBar progress={currentTask.progress} textColor={themeTextColor} size="sm" />
          </div>

          <button
            onClick={handleAddSubtask}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Subtasks List */}
      <div className="pt-4 space-y-2.5">
        {currentTask.subTasks && currentTask.subTasks.length > 0 ? (
          currentTask.subTasks.map((subtask) => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              goalId={goalId}
              themeTextColor={themeTextColor}
              onToggle={onToggleTask}
              onEdit={(t) =>
                dispatch(
                  openEditTaskModal({
                    goalId,
                    taskToEdit: { id: t.id, title: t.title, description: t.description },
                  })
                )
              }
              onDelete={onDeleteTask}
              onDrillDown={handleDrillDown}
            />
          ))
        ) : (
          <div className="py-10 text-center flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
            <FolderTree className="w-9 h-9 text-slate-500 mb-2 stroke-1" />
            <p className="text-sm font-medium text-slate-300">
              No subtasks inside this container yet
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Decompose this task further into nested steps.
            </p>
            <button
              onClick={handleAddSubtask}
              type="button"
              className="mt-4 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Subtask</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
