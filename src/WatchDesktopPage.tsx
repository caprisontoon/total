import React from 'react';
import { Monitor } from 'lucide-react';

// 시청용 데스크탑 - 새 창으로 열리는 페이지.
// 이곳에 시청용 데스크탑에 노출할 콘텐츠를 구성하세요.
export default function WatchDesktopPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#181a20] text-slate-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1f222a]">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
          <Monitor size={22} />
        </div>
        <div>
          <h1 className="text-lg font-bold">시청용 데스크탑</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Watch Desktop</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400">
          이곳에 시청용 데스크탑 콘텐츠를 구성하세요.
        </div>
      </main>
    </div>
  );
}
