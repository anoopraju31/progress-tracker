'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { closeAddTaskModal, closeEditTaskModal } from '@/store/navigationSlice';
import { X, CheckSquare, Edit3 } from 'lucide-react';

interface TaskModalProps {
  onTaskMutated: () => void;
}

export function TaskModal({ onTaskMutated }: TaskModalProps) {
  const dispatch = useDispatch();

  const isAddOpen = useSelector((state: RootState) => state.navigation.isAddModalOpen);
  const isEditOpen = useSelector((state: RootState) => state.navigation.isEditModalOpen);
  const context = useSelector((state: RootState) => state.navigation.modalContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isOpen = isAddOpen || isEditOpen;
  const isEditing = isEditOpen;

  useEffect(() => {
    if (isEditOpen && context?.taskToEdit) {
      setTitle(context.taskToEdit.title || '');
      setDescription(context.taskToEdit.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    setError('');
  }, [isEditOpen, isAddOpen, context]);

  if (!isOpen || !context) return null;

  const handleClose = () => {
    if (isAddOpen) dispatch(closeAddTaskModal());
    if (isEditOpen) dispatch(closeEditTaskModal());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing && context.taskToEdit) {
        // Edit existing task
        const res = await fetch(`/api/goals/${context.goalId}/tasks/${context.taskToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update task');
      } else {
        // Add new task (root or subtask)
        const res = await fetch(`/api/goals/${context.goalId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentId: context.parentId || null,
            title: title.trim(),
            description: description.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create task');
      }

      handleClose();
      onTaskMutated();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            {isEditing ? <Edit3 className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isEditing ? 'Edit Task' : context.parentId ? 'Add Subtask' : 'Add Task'}
            </h2>
            <p className="text-xs text-slate-400">
              {isEditing
                ? 'Update task title and details.'
                : context.parentId
                ? 'Adding a subtask into the current container.'
                : 'Adding a top-level task to this goal.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement user authentication middleware"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional criteria, requirements, or links..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
