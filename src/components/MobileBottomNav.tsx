'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, ClipboardList, Settings, Video } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: '관원 목록', href: '/m/students', icon: Users },
    { name: '출결 기록', href: '/m/attendance', icon: ClipboardList },
    { name: '모니터', href: '/attendance', icon: Video },
    { name: '설정', href: '/m/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href) && (tab.href !== '/m' || pathname === '/m');
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
