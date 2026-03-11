import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, Monitor, Grid, Mic, Trophy, 
  Heart, Package, User, ChevronRight, Bell, Volume2, 
  Play, Copy, Image as ImageIcon, Type, Plus, MoreHorizontal,
  ChevronDown, X, Upload, Search, Moon, Sun, BellRing,
  Pin, Menu, Pencil, Check, Lock
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

const Section = ({ title, subtitle, children }: any) => (
  <div className="bg-white dark:bg-[#181a20] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
    <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">{title}</h3>
    {subtitle && <p className="text-xs text-slate-500 mb-6">{subtitle}</p>}
    {children}
  </div>
);

const PresetItem = ({ label, desc, isChecked = true }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg mb-2 gap-3 sm:gap-0">
    <div className="flex items-center gap-4 w-full sm:w-24 shrink-0">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{label}</span>
    </div>
    <div className="flex-1 w-full sm:w-auto sm:px-4">
      <input type="text" defaultValue={desc} placeholder={desc.includes('조건') ? desc : ''} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0">
      <div className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={isChecked} />
        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
      </div>
      <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1">
        설정 <ChevronDown size={14} className="text-slate-400" />
      </button>
    </div>
  </div>
);

const SettingRow = ({ label, children }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-start py-4 border-b border-slate-100 dark:border-slate-800 last:border-0 gap-2 sm:gap-0">
    <div className="w-full sm:w-40 sm:pt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{label}</div>
    <div className="flex-1 w-full">{children}</div>
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
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('크루 후원 - A 그룹');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopy = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(type);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f1115] text-slate-800 dark:text-slate-200 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-200 ease-in-out w-64 bg-white dark:bg-[#181a20] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-30`}>
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
        <header className="h-16 bg-white dark:bg-[#181a20] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0">
           <div className="flex items-center gap-3">
             <button 
               className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
               onClick={() => setIsMobileMenuOpen(true)}
             >
               <Menu size={20} />
             </button>
             <h1 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-white">통합알림창</h1>
           </div>
           
           <div className="flex items-center gap-2 lg:gap-4">
             <div className="relative hidden md:block">
               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="검색" className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all" />
             </div>
             <div className="flex items-center gap-1 lg:gap-2 md:border-l border-slate-200 dark:border-slate-700 md:pl-4">
               <button className="hidden sm:block p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                 <Moon size={20} />
               </button>
               <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#181a20]"></span>
               </button>
               <button 
                 onClick={() => navigate('/creator')}
                 className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors ml-1 lg:ml-2"
               >
                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shrink-0"></div>
                 <span className="text-sm font-medium hidden sm:block">크리에이터 님</span>
                 <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
               </button>
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
           <div className="max-w-7xl mx-auto">
             {/* Tabs */}
             <div className="flex gap-2 mb-6 lg:mb-8 overflow-x-auto custom-scrollbar pb-2">
               <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold whitespace-nowrap">후원 알림 설정</button>
               <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">유튜브 알림 설정</button>
               <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">치지직 알림 설정</button>
               <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">트위치 알림 설정</button>
             </div>

             {/* URL Section */}
             <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-[#181a20] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm mb-8">
               <div className="w-full sm:w-48 shrink-0">
                 <div className="relative">
                   <select className="w-full appearance-none bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-8 py-2 cursor-pointer">
                     <option>통합 알림 URL</option>
                   </select>
                   <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
               </div>
               
               <div className="flex-1 w-full relative group">
                 {/* Revealed state (always takes up space) */}
                 <div className="bg-white dark:bg-[#181a20] rounded-xl border border-blue-200 dark:border-blue-900/50 p-2 space-y-2 shadow-inner opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   {/* PC URL */}
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-500 w-12 shrink-0 text-center">PC용</span>
                     <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded px-3 py-2 text-xs text-slate-600 dark:text-slate-300 font-mono truncate">
                       https://toon.at/widget/alertbox/pc/a1b2c3d4e5f6
                     </div>
                     <button
                       onClick={() => handleCopy('https://toon.at/widget/alertbox/pc/a1b2c3d4e5f6', 'pc')}
                       className="px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                     >
                       {copiedUrl === 'pc' ? <><Check size={14} /> 복사됨</> : <><Copy size={14} /> 복사</>}
                     </button>
                   </div>
                   {/* Mobile URL */}
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-500 w-12 shrink-0 text-center">모바일용</span>
                     <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded px-3 py-2 text-xs text-slate-600 dark:text-slate-300 font-mono truncate">
                       https://toon.at/widget/alertbox/mobile/a1b2c3d4e5f6
                     </div>
                     <button
                       onClick={() => handleCopy('https://toon.at/widget/alertbox/mobile/a1b2c3d4e5f6', 'mobile')}
                       className="px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                     >
                       {copiedUrl === 'mobile' ? <><Check size={14} /> 복사됨</> : <><Copy size={14} /> 복사</>}
                     </button>
                   </div>
                 </div>

                 {/* Hidden state (default) */}
                 <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-xl z-10 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0 group-hover:pointer-events-none border border-slate-200 dark:border-slate-700">
                   <span className="text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center gap-2">
                     <Lock size={16} /> 마우스 오버하여 URL 확인
                   </span>
                 </div>
               </div>
             </div>

             {/* Sub-tabs Dropdown */}
             <div className="mb-6 lg:mb-8">
               <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#181a20] border border-slate-200 dark:border-slate-800 rounded-full shadow-sm text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                 <div className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center text-xs font-black">T</div>
                 텍스트 후원 알림
                 <ChevronDown size={16} className="text-slate-400 ml-1" />
               </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
               {/* Settings Form */}
               <div className="lg:col-span-8 space-y-6">
                 {/* Preset Group Settings */}
                 <Section title="프리셋 그룹 설정" subtitle="방송 주제 별로 프리셋을 그룹화하여 다르게 적용할 수 있습니다.">
                    <div className="flex items-center justify-between mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-6">
                        <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-1 h-1 bg-slate-900 dark:bg-white rounded-full"></span>
                          현재 그룹
                        </span>
                        <div className="relative">
                          <button 
                            onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                            className="flex items-center justify-between w-64 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {selectedGroup}
                            <ChevronDown size={16} className="text-slate-400" />
                          </button>
                          
                          {isGroupDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10 p-2">
                              <div className="space-y-1 mb-2">
                                {['토크 방송', '게임 방송', '크루 후원 - A 그룹', '크루 후원 - B 그룹'].map(group => (
                                  <label key={group} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="group" 
                                      value={group}
                                      checked={selectedGroup === group}
                                      onChange={() => setSelectedGroup(group)}
                                      className="w-4 h-4 text-blue-500 border-slate-300 focus:ring-blue-500" 
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-200">{group}</span>
                                  </label>
                                ))}
                              </div>
                              <button 
                                onClick={() => setIsGroupDropdownOpen(false)}
                                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-bold transition-colors"
                              >
                                선택
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsGroupModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
                      >
                        <Settings size={16} className="text-slate-500" />
                        그룹 관리
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-3 sm:gap-0">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            {`{${selectedGroup}}`} 그룹 내 프리셋 목록
                          </h4>
                          <p className="text-xs text-slate-500">알림 조건을 미리 설정하여 쉽게 추가하고 삭제 할 수 있는 기능입니다.</p>
                        </div>
                        <button className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1">
                          <Plus size={16} />
                          프리셋 추가
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <PresetItem label="1번 프리셋" desc="후원금액 1,000 cash 이상" isChecked={true} />
                        <PresetItem label="2번 프리셋" desc="후원금액 10,000 cash 이상" isChecked={true} />
                        <PresetItem label="3번 프리셋" desc="조건을 입력하세요 (예: 후원금액 1,000 cash 이상)" isChecked={true} />
                      </div>
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
                     <div className="flex flex-wrap gap-3">
                       <LayoutOption icon={ImageIcon} label="IMG" active />
                       <LayoutOption icon={Type} label="TEXT" />
                       <LayoutOption icon={LayoutDashboard} label="TEXT" />
                     </div>
                   </SettingRow>
                   <SettingRow label="알림 효과">
                     <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                       <select className="w-full sm:flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                         <option>Fade In</option>
                       </select>
                       <span className="text-slate-400 hidden sm:block">~</span>
                       <select className="w-full sm:flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                         <option>Fade Out</option>
                       </select>
                     </div>
                   </SettingRow>
                    <SettingRow label="텍스트 애니메이션">
                     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full max-w-md">
                       <select className="w-full sm:flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                         <option>Pulse</option>
                       </select>
                       <button className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap">텍스트 효과 미리보기</button>
                     </div>
                   </SettingRow>
                   <SettingRow label="알림 이미지">
                     <div className="flex items-center gap-3">
                       <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center relative group overflow-hidden shrink-0">
                          <img src="https://picsum.photos/seed/guitar/100/100" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                          <button className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                       </div>
                       <button className="w-16 h-16 sm:w-20 sm:h-20 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0">
                         <Plus size={24} className="text-slate-400" />
                       </button>
                     </div>
                   </SettingRow>
                   <SettingRow label="알림 효과음">
                     <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full max-w-md">
                       <div className="w-full sm:flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                         <span className="truncate">sound_effect_01.mp3</span>
                         <button className="text-slate-400 hover:text-slate-600 shrink-0 ml-2"><X size={14}/></button>
                       </div>
                       <div className="flex items-center gap-2">
                         <button className="p-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"><Play size={16} fill="currentColor"/></button>
                         <button className="p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Plus size={16}/></button>
                       </div>
                     </div>
                   </SettingRow>
                 </Section>
               </div>

               {/* Preview */}
               <div className="lg:col-span-4 space-y-4">
                 <div className="sticky top-6">
                   <div className="bg-white dark:bg-[#181a20] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                     <div className="flex items-center gap-2 p-3 bg-[#1a1d24] text-white">
                       <div className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></div>
                       <span className="text-xs font-bold">미리보기</span>
                     </div>
                     
                     <div className="bg-black aspect-video relative flex flex-col items-center justify-center border-b border-slate-200 dark:border-slate-800">
                       <div className="text-center w-full px-8">
                         <div className="mb-2 animate-bounce flex justify-center">
                           <img src="https://picsum.photos/seed/character/120/120" className="w-24 h-24 object-contain drop-shadow-2xl rounded-full" />
                         </div>
                         <div className="text-white font-black text-lg mb-1 leading-tight drop-shadow-lg" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                           <span className="text-[#00e5ff]">투네이션</span>님이 <span className="text-white">1,000원</span>을 후원<br/>하셨습니다!
                         </div>
                       </div>
                     </div>
                     
                     <div className="p-4 space-y-2">
                       <div className="flex gap-2">
                         <div className="relative w-1/2">
                           <select className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                             <option>텍스트 후원</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                         </div>
                         <div className="relative w-1/2">
                           <input type="text" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg pl-3 pr-10 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" />
                           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">캐시</span>
                         </div>
                       </div>
                       
                       <input type="text" defaultValue="테스트 입니다." className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                       
                       <button className="w-full py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white font-bold rounded-lg transition-colors mt-1">
                         후원 테스트
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
      {/* Group Management Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-[480px] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">프리셋 그룹 관리</h2>
              <button onClick={() => setIsGroupModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <Menu size={16} className="text-slate-400 cursor-grab" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">크루 후원 - A 그룹</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-slate-400 hover:text-slate-600"><Pencil size={16} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <Menu size={16} className="text-slate-400 cursor-grab" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">크루 후원 - B 그룹</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-slate-400 hover:text-slate-600"><Pencil size={16} /></button>
                  <button className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                </div>
              </div>
              
              <button className="w-full py-3 mt-4 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors">
                + 새 그룹 추가
              </button>
            </div>
          </div>
        </div>
      )}
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
