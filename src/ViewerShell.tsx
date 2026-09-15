import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Search, Bell, ChevronDown, Home, Play, Star, Package, User, Trophy,
  Gamepad2, ShoppingBag, Headphones, Smartphone,
} from 'lucide-react';

// 시청자(도네이터) 측 공통 셸 — 후원 페이지(CreatorPage)와 같은 사이드바 톤을 유지한다.
// hideChrome: 극장 모드 등에서 사이드바 · 상단 헤더를 숨기고 콘텐츠만 남긴다.

type NavKey = 'home' | 'live' | 'favorites' | 'inventory';

export default function ViewerShell({
  children, active = 'live', hideChrome = false, title,
}: { children: React.ReactNode; active?: NavKey; hideChrome?: boolean; title?: string }) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navCls = (key: NavKey) =>
    `w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-lg transition-colors ${
      active === key
        ? 'text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
    }`;

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-[#181a20] text-slate-800 dark:text-slate-200">
        {/* Sidebar */}
        {!hideChrome && (
          <aside className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#181a20] shrink-0 overflow-y-auto custom-scrollbar">
            <div className="p-4 flex items-center gap-2">
              <Menu size={24} className="text-slate-600 dark:text-slate-300" />
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-blue-500 font-bold text-xl hover:opacity-80 transition-opacity">
                <span className="text-2xl">+</span>
                <span className="text-slate-800 dark:text-white">toonation</span>
              </button>
            </div>

            <div className="px-4 py-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">LV.50</div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">블랙 다이아</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">김종윤</div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">소셜 ID</span>
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1"><span className="w-3 h-3 bg-purple-500 rounded-sm inline-block" />00loopi1@gmail.com</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">투네이션 ID</span>
                  <span className="text-blue-500 hover:underline cursor-pointer">투네이션 ID 연결</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center"><span className="text-sm text-slate-600 dark:text-slate-400">캐시</span><span className="text-sm font-bold text-slate-800 dark:text-white">27,422,490</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-slate-600 dark:text-slate-400">강냉이</span><span className="text-sm font-bold text-slate-800 dark:text-white">9,792,431</span></div>
              </div>
              <div className="space-y-2 mb-6">
                <button className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors">캐시 충전</button>
                <button className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                  <Smartphone size={16} /> 모바일에서 충전 (QR코드)
                </button>
              </div>
            </div>

            <nav className="flex-1 px-2 space-y-1">
              <button onClick={() => navigate('/creator')} className={navCls('home')}><Home size={18} /> 홈</button>
              <button onClick={() => navigate('/live')} className={navCls('live')}>
                <Play size={18} /> 전체 라이브
                <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">LIVE</span>
              </button>
              <button onClick={() => navigate('/live?tab=favorites')} className={navCls('favorites')}><Star size={18} /> 즐겨찾기</button>
              <button className={navCls('inventory')}><Package size={18} /> 인벤토리</button>
              <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                <span className="flex items-center gap-3"><User size={18} /> 내정보</span><ChevronDown size={16} />
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                <span className="flex items-center gap-3"><Trophy size={18} /> 투네 랭킹</span><ChevronDown size={16} />
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg"><Gamepad2 size={18} /> 강냉이 사용하기(투네랜드)</button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg"><ShoppingBag size={18} /> 투네이션 더굿즈(기프트 샵)</button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg"><Headphones size={18} /> 고객센터</button>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">어두운 테마</span>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-blue-500' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!hideChrome && (
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between shrink-0">
              <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white truncate">{title}</h1>
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="relative hidden md:block">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input placeholder="라이브 · 크리에이터 검색" className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
                </div>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
                  <Bell size={20} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#181a20]" />
                </button>
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shrink-0" />
                    <span className="text-sm font-medium hidden sm:block">크리에이터 님</span>
                    <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2">
                    <button onClick={() => navigate('/dashboard')} className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-lg mb-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">크리에이터 스튜디오</button>
                    <button onClick={() => navigate('/live')} className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-lg bg-blue-500 text-white">도네이터 후원페이지</button>
                  </div>
                </div>
              </div>
            </header>
          )}
          {/* relative: absolute/sr-only 자손이 문서 높이를 늘리지 않도록 가둠 */}
          <div className="relative flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
