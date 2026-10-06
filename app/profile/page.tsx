'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { User, Mail, Calendar, ShieldCheck, LogOut, CheckCircle2, Target, Layers } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; createdAt: string } | null>(null);
  const [stats, setStats] = useState({ totalGoals: 0, totalTasks: 0, completedTasks: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        const goalsRes = await fetch('/api/goals');
        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          const goals = goalsData.data || [];
          const totalTasks = goals.reduce((acc: number, g: any) => acc + (g.totalTasksCount || 0), 0);
          const completedTasks = goals.reduce((acc: number, g: any) => acc + (g.completedTasksCount || 0), 0);
          setStats({
            totalGoals: goals.length,
            totalTasks,
            completedTasks,
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            User Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your account credentials and inspect your productivity metrics.
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 rounded-3xl bg-slate-900/50 border border-slate-800 animate-pulse" />
        ) : (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/25">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                    <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{user?.email}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-sm font-semibold border border-rose-500/20 transition-all self-start sm:self-auto"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span>Total Goals</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white">{stats.totalGoals}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Total Tasks</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white">{stats.totalTasks}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Tasks Completed</span>
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-400">{stats.completedTasks}</p>
                </div>
              </div>
            </div>

            {/* System Info Box */}
            <div className="rounded-3xl bg-slate-900/40 border border-slate-800/80 p-6 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Architecture & Security Standards</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>HTTP-only SameSite cookies guarding protected route edge execution.</li>
                <li>Single-writer MongoDB Atlas schema modeled via Prisma ORM adjacency list.</li>
                <li>Infinite recursive subtree calculation with client-side LIFO navigation stack.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
