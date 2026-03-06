import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, Monitor, Grid, Mic, Trophy, 
  Heart, Package, User, ChevronRight, Bell, Volume2, 
  Play, Copy, Image as ImageIcon, Type, Plus, MoreHorizontal,
  ChevronDown, X, Upload, Search, Moon, Sun, BellRing
} from 'lucide-react';

const MenuItem = ({ icon: Icon, label, active = false, hasSubmenu = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} strokeWidth={2} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    {hasSubmenu && <ChevronRight size={16} className="opacity-50" />}
  </button>
);

const Tab = ({ label, active = false }: any) => (
  <button className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
    active 
      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
  }`}>
    {label}
  </button>
);

const Section = ({ title, children }: any) => (
  <div className="bg-white dark:bg-[#181a20] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
    <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">{title}</h3>
    <p className="text-xs text-slate-500 mb-6">방송 주제별로 프리셋을 그룹화하여 다르게 적용할 수 있습니다.</p>
    {children}
  </div>
);

const PresetItem = ({ label, desc }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
    <div className="flex items-center gap-4">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
      <span className="text-xs text-slate-500 border-l border-slate-300 dark:border-slate-600 pl-4">{desc}</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked />
        <div className="w-9 h-5 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
      </div>
      <button className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-600">설정 ▼</button>
    </div>
  </div>
);

const SettingRow = ({ label, children }: any) => (
  <div className="flex items-start py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div className="w-40 pt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{label}</div>
    <div className="flex-1">{children}</div>
  </div>
);

const LayoutOption = ({ icon: Icon, active = false, label }: any) => (
  <button className={`flex flex-col items-center justify-center gap-2 w-20 h-20 rounded-lg border-2 transition-all ${
    active 
      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-400'
  }`}>
    <Icon size={24} />
    {label && <span className="text-xs font-medium">{label}</span>}
  </button>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false); // Local state for dashboard demo

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f1115] text-slate-800 dark:text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#181a20] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-20">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
           <span className="text-blue-500 font-black text-xl mr-2">+OO</span>
           <span className="font-bold text-lg tracking-tight">toonation</span>
           <button className="ml-auto text-slate-400 hover:text-slate-600">
             <ChevronRight size={16} className="rotate-180"/>
           </button>
        </div>
        
        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          <MenuItem icon={LayoutDashboard} label="대시보드" />
          <MenuItem icon={Settings} label="간편설정" />
          <MenuItem icon={Monitor} label="전체 화면 위젯" onClick={() => navigate('/')} />
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>
            <MenuItem icon={Bell} label="통합 알림창" active />
          </div>
          <MenuItem icon={Grid} label="위젯" />
          <MenuItem icon={Mic} label="모두의 보이스" />
          <MenuItem icon={Trophy} label="랭킹" />
          <MenuItem icon={Heart} label="후원관리" hasSubmenu />
          <MenuItem icon={Package} label="인벤토리" />
          <MenuItem icon={User} label="계정설정" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#181a20] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
           <h1 className="text-xl font-bold text-slate-800 dark:text-white">통합알림창</h1>
           
           <div className="flex items-center gap-4">
             <div className="relative">
               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="검색" className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all" />
             </div>
             <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
               <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                 <Moon size={20} />
               </button>
               <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#181a20]"></span>
               </button>
               <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full ml-2"></div>
               <span className="text-sm font-medium">크리에이터 님</span>
               <ChevronDown size={14} className="text-slate-400" />
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
           <div className="max-w-7xl mx-auto">
             {/* Tabs */}
             <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8">
               <Tab label="후원 알림 설정" active />
               <Tab label="트위치 알림 설정" />
               <Tab label="유튜브 알림 설정" />
             </div>

             {/* Sub-tabs */}
             <div className="flex gap-2 mb-8">
               <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">텍스트 후원 알림</button>
               {/* ... other alert types ... */}
             </div>

             <div className="grid grid-cols-12 gap-8">
               {/* Settings Form */}
               <div className="col-span-8 space-y-6">
                 {/* Preset Group Settings */}
                 <Section title="프리셋 그룹 설정">
                   <div className="flex items-center justify-between mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                     <div className="flex items-center gap-3">
                       <span className="text-sm font-bold text-blue-500">• 현재 그룹</span>
                       <select className="border rounded-md px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                         <option>기본 방송 (Default)</option>
                       </select>
                     </div>
                     <button className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm font-medium hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                       <Settings size={14} />
                       그룹 관리
                     </button>
                   </div>
                   
                   <div className="space-y-3">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-bold text-blue-500 flex items-center gap-2">
                         • 그룹 내 프리셋 목록
                       </span>
                       <button className="text-blue-500 text-sm font-bold hover:text-blue-600 flex items-center gap-1">
                         <Plus size={16} />
                         프리셋 추가
                       </button>
                     </div>
                     {/* Preset Items */}
                     <PresetItem label="1번 프리셋" desc="후원금액 1,000 cash 이상" />
                     <PresetItem label="2번 프리셋" desc="후원금액 10,000 cash 이상" />
                   </div>
                 </Section>

                 {/* Basic Settings */}
                 <Section title="기본 설정">
                   <SettingRow label="알림 표시">
                     <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </div>
                   </SettingRow>
                   <SettingRow label="알림 레이아웃">
                     <div className="flex gap-3">
                       <LayoutOption icon={ImageIcon} label="IMG" active />
                       <LayoutOption icon={Type} label="TEXT" />
                       <LayoutOption icon={LayoutDashboard} label="TEXT" />
                     </div>
                   </SettingRow>
                   <SettingRow label="알림 효과">
                     <div className="flex items-center gap-3 w-full max-w-md">
                       <select className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                         <option>Fade In</option>
                       </select>
                       <span className="text-slate-400">~</span>
                       <select className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                         <option>Fade Out</option>
                       </select>
                     </div>
                   </SettingRow>
                    <SettingRow label="텍스트 애니메이션">
                     <div className="flex items-center gap-3 w-full max-w-md">
                       <select className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                         <option>Pulse</option>
                       </select>
                       <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap">텍스트 효과 미리보기</button>
                     </div>
                   </SettingRow>
                   <SettingRow label="알림 이미지">
                     <div className="flex items-center gap-3">
                       <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center relative group overflow-hidden">
                          <img src="https://picsum.photos/seed/guitar/100/100" className="w-10 h-10 object-contain" />
                          <button className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                       </div>
                       <button className="w-20 h-20 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                         <Plus size={24} className="text-slate-400" />
                       </button>
                     </div>
                   </SettingRow>
                   <SettingRow label="알림 효과음">
                     <div className="flex items-center gap-2 w-full max-w-md">
                       <div className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                         <span>sound_effect_01.mp3</span>
                         <button className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
                       </div>
                       <button className="p-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"><Play size={16} fill="currentColor"/></button>
                       <button className="p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Plus size={16}/></button>
                     </div>
                   </SettingRow>
                 </Section>
               </div>

               {/* Preview */}
               <div className="col-span-4 space-y-4">
                 <div className="sticky top-6">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                     <span className="text-xs font-bold text-slate-900 dark:text-white">미리보기</span>
                   </div>
                   <div className="bg-[#111] rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800 shadow-2xl mb-4">
                     {/* Preview Content */}
                     <div className="text-center w-full px-8">
                       <div className="mb-4 animate-bounce">
                         <img src="https://picsum.photos/seed/guitar/100/100" className="w-20 h-20 mx-auto object-contain drop-shadow-2xl" />
                       </div>
                       <div className="text-white font-bold text-xl mb-1 leading-relaxed drop-shadow-md">
                         <span className="text-blue-400">투네이션</span>님이 <span className="text-yellow-400">1,000원</span>을 후원하셨습니다!
                       </div>
                     </div>
                   </div>
                   
                   <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all mb-6 active:scale-[0.98]">
                     <Play size={18} fill="currentColor" />
                     후원 테스트
                   </button>
                   
                   <div className="bg-white dark:bg-[#181a20] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                     <label className="text-xs font-bold text-slate-500 mb-2 block">알림창 URL</label>
                     <div className="flex gap-2">
                       <input type="text" value="https://toon.at/widget/alertbox/..." readOnly className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-500 font-mono" />
                       <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">복사</button>
                     </div>
                   </div>
                   
                   <div className="fixed bottom-8 right-8">
                      <button className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-500 transition-colors">
                        <MessageSquare size={24} />
                      </button>
                   </div>
                   <div className="fixed bottom-24 right-8">
                      <button className="w-10 h-10 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <ChevronDown size={20} className="rotate-180" />
                      </button>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MessageSquare({ size, className }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
