import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { ReduxProvider } from '@/store/Providers';

export const metadata: Metadata = {
  title: 'Progress Tracker | Hierarchical Goal & Task Management',
  description: 'Track multi-tiered goals and recursive task hierarchies with interactive container drilldowns.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
