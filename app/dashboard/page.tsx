'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { GoalAccordion } from '@/components/GoalAccordion';
import { CreateGoalModal } from '@/components/CreateGoalModal';
import { TaskModal } from '@/components/TaskModal';
import { GoalWithTree } from '@/lib/tree';
import {
  Plus,
  Target,
  Sparkles,
  Layers,
  CheckCircle2,
  TrendingUp,
  FolderPlus,
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [goals, setGoals] = useState<GoalWithTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);

  // Fetch current user
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  }, []);

  // Fetch user goals
  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchGoals();
  }, [fetchUser, fetchGoals]);

  // Goal & Task action handlers
  const handleDeleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
      if (res.ok) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
      }
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const handleToggleTask = async (taskId: string, goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}/tasks/${taskId}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchGoals();
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string, goalId: string) => {
    if (!confirm('Are you sure you want to delete this task and all its subtasks?')) return;
    try {
      const res = await fetch(`/api/goals/${goalId}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchGoals();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Metrics calculations
  const totalGoals = goals.length;
  const totalTasks = goals.reduce((acc, g) => acc + g.totalTasksCount, 0);
  const totalCompleted = goals.reduce((acc, g) => acc + g.completedTasksCount, 0);
  const overallProgress =
    totalGoals === 0
      ? 0
      : Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Welcome Header with Button to Create Goal */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hierarchical Task Orchestrator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Welcome back{user ? `, ${user.name}` : ''}!
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-2xl">
              Deconstruct ambitious goals into recursive subtasks and track deterministic progress rollups.
            </p>
          </div>

          <button
            onClick={() => setIsCreateGoalOpen(true)}
            type="button"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Goal</span>
          </button>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">Active Goals</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {totalGoals}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {totalTasks}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">Tasks Completed</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tabular-nums">
              {totalCompleted}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">Average Progress</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums">
              {overallProgress}%
            </p>
          </div>
        </section>

        {/* Main Goals Accordion Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200 tracking-tight">
              Your Goal Trackers ({goals.length})
            </h2>
            <span className="text-xs text-slate-400">
              Click any goal to expand and drill into task containers
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <GoalAccordion
                  key={goal.id}
                  goal={goal}
                  onDeleteGoal={handleDeleteGoal}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                <FolderPlus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No goals configured yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                Create your first goal to begin breaking down complex milestones into recursive subtasks.
              </p>
              <button
                onClick={() => setIsCreateGoalOpen(true)}
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Goal</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <CreateGoalModal
        isOpen={isCreateGoalOpen}
        onClose={() => setIsCreateGoalOpen(false)}
        onGoalCreated={fetchGoals}
      />

      <TaskModal onTaskMutated={fetchGoals} />
    </div>
  );
}
