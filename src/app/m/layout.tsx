import React from 'react';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
