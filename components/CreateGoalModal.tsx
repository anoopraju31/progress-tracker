'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
}

// Curated themes
const PRESET_THEMES = [
  { name: 'Midnight Slate', bg: '#0f172a', text: '#f8fafc' },
  { name: 'Royal Indigo', bg: '#1e1b4b', text: '#e0e7ff' },
  { name: 'Emerald Depths', bg: '#064e3b', text: '#ecfdf5' },
  { name: 'Crimson Velvet', bg: '#4c0519', text: '#ffe4e6' },
  { name: 'Amethyst Night', bg: '#3b0764', text: '#fae8ff' },
  { name: 'Sunset Bronze', bg: '#431407', text: '#ffedd5' },
  { name: 'Cyber Blue', bg: '#082f49', text: '#e0f2fe' },
  { name: 'Obsidian Noir', bg: '#18181b', text: '#fafafa' },
];

export function CreateGoalModal({
  isOpen,
  onClose,
  onGoalCreated,
}: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [themeBgColor, setThemeBgColor] = useState('#1e293b');
  const [themeTextColor, setThemeTextColor] = useState('#f8fafc');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          themeBgColor,
          themeTextColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create goal');
      }

      setTitle('');
      setDescription('');
      onGoalCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Create New Goal</h2>
            <p className="text-xs text-slate-400">
              Establish a high-level objective and personalize its theme.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Goal Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Full-Stack Web Development"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          {/* Description input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or high-level milestones for this goal..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Theme Color Palette */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Theme Color Preset
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {PRESET_THEMES.map((theme) => {
                const isSelected =
                  themeBgColor.toLowerCase() === theme.bg.toLowerCase() &&
                  themeTextColor.toLowerCase() === theme.text.toLowerCase();
                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => {
                      setThemeBgColor(theme.bg);
                      setThemeTextColor(theme.text);
                    }}
                    style={{ backgroundColor: theme.bg }}
                    className={`h-11 rounded-xl border flex items-center justify-center p-1 transition-all ${
                      isSelected
                        ? 'border-indigo-400 ring-2 ring-indigo-400/50 scale-[1.03]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4" style={{ color: theme.text }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Pickers */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="block text-[11px] text-slate-400 mb-1">Custom Background</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="color"
                    value={themeBgColor}
                    onChange={(e) => setThemeBgColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={themeBgColor}
                    onChange={(e) => setThemeBgColor(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-200 uppercase font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 mb-1">Custom Text Color</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="color"
                    value={themeTextColor}
                    onChange={(e) => setThemeTextColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={themeTextColor}
                    onChange={(e) => setThemeTextColor(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-200 uppercase font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="pt-2">
            <span className="block text-[11px] text-slate-400 mb-1.5 font-medium">
              Live Accordion Preview:
            </span>
            <div
              className="p-3.5 rounded-xl border border-white/10 shadow-md transition-colors"
              style={{ backgroundColor: themeBgColor, color: themeTextColor }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-sm truncate">
                  {title || 'Example Goal Title'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/25">
                  0/3 tasks
                </span>
              </div>
              <ProgressBar progress={65} textColor={themeTextColor} size="sm" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
