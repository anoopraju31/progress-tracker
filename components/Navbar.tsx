'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Target, User, LogOut, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

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
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Progress Tracker
            </span>
            <span className="block text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
              Hierarchical Engine
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'bg-slate-800 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <Link
            href="/profile"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/profile'
                ? 'bg-slate-800 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center pl-2 pr-1 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="px-2 font-medium text-slate-200">{user.name}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Log out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
