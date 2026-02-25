/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Layout, Layers, Plus, Settings, Play, Save, Monitor, 
  Type, Image as ImageIcon, Volume2, Move, ChevronDown, 
  ChevronRight, Trash2, Copy, Eye, EyeOff, MousePointer2,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Video, Mic, Gift, Target, ListTodo, HelpCircle, Music, Palette,
  Box, Gamepad2
} from 'lucide-react';

// --- Types ---
type WidgetType = 
  | 'text-alert' | 'voice-alert' | 'video-alert' | 'mini-alert'
  | 'roulette' | 'poll' | 'quest' | 'lucky-box'
  | 'wishlist' | 'picture-alert' | 'play-alert' | 'karaoke';

interface Widget {
  id: string;
  type: WidgetType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  settings: any;
}

interface Preset {
  id: string;
  name: string;
  widgets: Widget[];
}

// --- Mock Data & Config ---
const WIDGET_CATEGORIES = [
  {
    title: '알림 (Alerts)',
    items: [
      { type: 'text-alert', name: '텍스트 후원 알림', icon: Type },
      { type: 'voice-alert', name: '음성 후원 알림', icon: Mic },
      { type: 'video-alert', name: '영상 후원 알림', icon: Video },
      { type: 'mini-alert', name: '미니 후원 알림', icon: AlignLeft },
    ]
  },
  {
    title: '참여 (Engagement)',
    items: [
      { type: 'roulette', name: '룰렛 후원', icon: Target },
      { type: 'poll', name: '투표 알림', icon: HelpCircle },
      { type: 'quest', name: '퀘스트 알림', icon: ListTodo },
      { type: 'lucky-box', name: '럭키박스 알림', icon: Box },
    ]
  },
  {
    title: '기타 (Others)',
    items: [
      { type: 'wishlist', name: '위시리스트 알림', icon: Gift },
      { type: 'picture-alert', name: '그림 후원 알림', icon: Palette },
      { type: 'play-alert', name: '플레이 후원 알림', icon: Gamepad2 },
      { type: 'karaoke', name: '노래방 후원 알림', icon: Music },
    ]
  }
];

const INITIAL_WIDGETS: Widget[] = [
  {
    id: 'w-1',
    type: 'text-alert',
    name: '텍스트 후원 알림',
    x: 320,
    y: 180,
    width: 640,
    height: 360,
    visible: true,
    settings: {
      minAmount: 1000,
      layout: 'img-top',
      animationIn: 'Fade In',
      animationOut: 'Fade Out',
      template: '{닉네임}님이 {금액}원을 후원해 주셨어요!',
      duration: 5,
      fontFamily: 'Pretendard',
      fontSize: 36,
      fontColor: '#ffffff',
      highlightColor: '#18C9FF'
    }
  }
];

// --- Components ---

const Accordion = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-700/50">
      <button 
        className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 text-xs font-semibold text-slate-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && <div className="p-3 pt-0 space-y-4">{children}</div>}
    </div>
  );
};

const FormGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, type = "text", className = "" }: any) => (
  <input 
    type={type} 
    value={value} 
    onChange={onChange}
    className={`w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${className}`}
  />
);

const Select = ({ value, onChange, options }: any) => (
  <select 
    value={value} 
    onChange={onChange}
    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
  >
    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
  </select>
);

export default function App() {
  const [presets, setPresets] = useState<Preset[]>([
    { id: 'preset-1', name: '기본 프리셋', widgets: INITIAL_WIDGETS }
  ]);
  const [activePresetId, setActivePresetId] = useState<string>('preset-1');
  
  const [widgets, setWidgets] = useState<Widget[]>(INITIAL_WIDGETS);
  const [selectedId, setSelectedId] = useState<string | null>('w-1');
  const [leftTab, setLeftTab] = useState<'add' | 'layers'>('add');
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedWidget = widgets.find(w => w.id === selectedId);

  const loadPreset = (id: string) => {
    // Auto-save current state to the active preset before switching
    setPresets(prev => prev.map(p => p.id === activePresetId ? { ...p, widgets } : p));
    
    const preset = presets.find(p => p.id === id);
    if (preset) {
      setWidgets(preset.widgets);
      setActivePresetId(id);
      setSelectedId(null);
    }
  };

  const createNewPreset = () => {
    setPresets(prev => prev.map(p => p.id === activePresetId ? { ...p, widgets } : p));
    
    const newId = `preset-${Date.now()}`;
    const newPreset = { id: newId, name: `프리셋 ${presets.length + 1}`, widgets: [] };
    setPresets(prev => [...prev, newPreset]);
    setWidgets([]);
    setActivePresetId(newId);
    setSelectedId(null);
  };

  const deletePreset = (id: string) => {
    if (presets.length === 1) {
      alert('최소 1개의 프리셋이 필요합니다.');
      return;
    }
    if (confirm('이 프리셋을 삭제하시겠습니까?')) {
      const newPresets = presets.filter(p => p.id !== id);
      setPresets(newPresets);
      if (activePresetId === id) {
        setWidgets(newPresets[0].widgets);
        setActivePresetId(newPresets[0].id);
        setSelectedId(null);
      }
    }
  };

  const saveCurrentPreset = () => {
    setPresets(prev => prev.map(p => p.id === activePresetId ? { ...p, widgets } : p));
    alert('현재 프리셋이 저장되었습니다.');
  };

  const addWidget = (type: WidgetType, name: string) => {
    const newWidget: Widget = {
      id: `w-${Date.now()}`,
      type,
      name,
      x: 100 + (widgets.length * 20),
      y: 100 + (widgets.length * 20),
      width: 400,
      height: 300,
      visible: true,
      settings: {}
    };
    setWidgets([...widgets, newWidget]);
    setSelectedId(newWidget.id);
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const updateSettings = (id: string, settingUpdates: any) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, settings: { ...w.settings, ...settingUpdates } } : w));
  };

  const deleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string, handle?: string) => {
    e.stopPropagation();
    setSelectedId(id);
    
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    const scaleX = 1920 / rect.width;
    const scaleY = 1080 / rect.height;

    const startX = e.clientX;
    const startY = e.clientY;
    
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;

    const initialX = widget.x;
    const initialY = widget.y;
    const initialWidth = widget.width;
    const initialHeight = widget.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) * scaleX;
      const deltaY = (moveEvent.clientY - startY) * scaleY;
      
      if (handle) {
        let newX = initialX;
        let newY = initialY;
        let newWidth = initialWidth;
        let newHeight = initialHeight;

        if (handle.includes('left')) {
          newX = Math.min(initialX + deltaX, initialX + initialWidth - 20);
          newWidth = Math.max(initialWidth - deltaX, 20);
        }
        if (handle.includes('right')) {
          newWidth = Math.max(initialWidth + deltaX, 20);
        }
        if (handle.includes('top')) {
          newY = Math.min(initialY + deltaY, initialY + initialHeight - 20);
          newHeight = Math.max(initialHeight - deltaY, 20);
        }
        if (handle.includes('bottom')) {
          newHeight = Math.max(initialHeight + deltaY, 20);
        }

        updateWidget(id, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newWidth),
          height: Math.round(newHeight)
        });
      } else {
        updateWidget(id, {
          x: Math.round(initialX + deltaX),
          y: Math.round(initialY + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f1115] text-slate-200 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-[#181a20] border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-lg tracking-tight">
            <Monitor size={20} />
            <span>Toonation Studio</span>
          </div>
          <div className="h-4 w-px bg-slate-700 mx-2"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">통합 전체화면 위젯</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">1920x1080</span>
          </div>
          <div className="h-4 w-px bg-slate-700 mx-2"></div>
          
          {/* Preset Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
            <select 
              value={activePresetId}
              onChange={(e) => loadPreset(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-slate-200 focus:outline-none px-2 py-1 cursor-pointer appearance-none pr-6 relative"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '16px' }}
            >
              {presets.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
            </select>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <button onClick={createNewPreset} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="새 프리셋">
              <Plus size={14} />
            </button>
            <button onClick={() => deletePreset(activePresetId)} className="p-1.5 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors" title="현재 프리셋 삭제">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors">
            <Play size={16} />
            <span>시뮬레이션</span>
          </button>
          <button onClick={saveCurrentPreset} className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors shadow-lg shadow-blue-900/20">
            <Save size={16} />
            <span>저장하기</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors shadow-lg shadow-emerald-900/20">
            <span>URL 복사</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Tools & Layers */}
        <aside className="w-64 bg-[#181a20] border-r border-slate-800 flex flex-col shrink-0 z-10">
          <div className="flex border-b border-slate-800">
            <button 
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${leftTab === 'add' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              onClick={() => setLeftTab('add')}
            >
              <Plus size={16} /> 위젯 추가
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${leftTab === 'layers' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              onClick={() => setLeftTab('layers')}
            >
              <Layers size={16} /> 레이어
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {leftTab === 'add' ? (
              <div className="space-y-6">
                {WIDGET_CATEGORIES.map((category, idx) => (
                  <div key={idx}>
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">{category.title}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {category.items.map((item, i) => (
                        <button 
                          key={i}
                          onClick={() => addWidget(item.type as WidgetType, item.name)}
                          className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 rounded-lg transition-all group"
                        >
                          <item.icon size={20} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                          <span className="text-[11px] font-medium text-slate-300 text-center leading-tight">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {widgets.map((widget) => (
                  <div 
                    key={widget.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer border ${selectedId === widget.id ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800'}`}
                    onClick={() => setSelectedId(widget.id)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Layout size={14} className="shrink-0 opacity-70" />
                      <span className="text-sm truncate">{widget.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
                        onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { visible: !widget.visible }); }}
                      >
                        {widget.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button 
                        className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                        onClick={(e) => { e.stopPropagation(); deleteWidget(widget.id); }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {widgets.length === 0 && (
                  <div className="text-center py-8 text-sm text-slate-500">
                    추가된 위젯이 없습니다.
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Middle Sidebar - Properties */}
        <aside className="w-80 bg-[#181a20] border-r border-slate-800 flex flex-col shrink-0 z-10 overflow-y-auto custom-scrollbar">
          {selectedWidget ? (
            <div className="pb-20">
              <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-800/20">
                <div className="p-2 bg-blue-500/20 rounded text-blue-400">
                  <Settings size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedWidget.name}</h2>
                  <p className="text-[11px] text-slate-400">ID: {selectedWidget.id}</p>
                </div>
              </div>

              <Accordion title="위치 및 크기 (Transform)" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-3">
                  <FormGroup label="X 위치">
                    <Input type="number" value={selectedWidget.x} onChange={(e: any) => updateWidget(selectedWidget.id, { x: Number(e.target.value) })} />
                  </FormGroup>
                  <FormGroup label="Y 위치">
                    <Input type="number" value={selectedWidget.y} onChange={(e: any) => updateWidget(selectedWidget.id, { y: Number(e.target.value) })} />
                  </FormGroup>
                  <FormGroup label="너비 (Width)">
                    <Input type="number" value={selectedWidget.width} onChange={(e: any) => updateWidget(selectedWidget.id, { width: Number(e.target.value) })} />
                  </FormGroup>
                  <FormGroup label="높이 (Height)">
                    <Input type="number" value={selectedWidget.height} onChange={(e: any) => updateWidget(selectedWidget.id, { height: Number(e.target.value) })} />
                  </FormGroup>
                </div>
              </Accordion>

              {/* Dynamic Settings based on Widget Type (Mocking Text Alert settings from PDF) */}
              <Accordion title="기본 설정 (General)">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">위젯 사용하기</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={selectedWidget.visible} onChange={() => updateWidget(selectedWidget.id, { visible: !selectedWidget.visible })} />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  <FormGroup label="최소 후원 캐시">
                    <div className="flex items-center gap-2">
                      <Input type="number" value={selectedWidget.settings.minAmount || 0} onChange={(e: any) => updateSettings(selectedWidget.id, { minAmount: Number(e.target.value) })} />
                      <span className="text-sm text-slate-400 shrink-0">캐시</span>
                    </div>
                  </FormGroup>
                </div>
              </Accordion>

              <Accordion title="레이아웃 및 효과 (Layout & Effects)">
                <div className="space-y-4">
                  <FormGroup label="알림 레이아웃">
                    <div className="grid grid-cols-3 gap-2">
                      {['img-top', 'img-left', 'img-right'].map(layout => (
                        <button 
                          key={layout}
                          className={`h-12 border rounded flex flex-col items-center justify-center gap-1 ${selectedWidget.settings.layout === layout ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-500'}`}
                          onClick={() => updateSettings(selectedWidget.id, { layout })}
                        >
                          <ImageIcon size={14} />
                          <div className="w-6 h-1 bg-current rounded-full opacity-50"></div>
                        </button>
                      ))}
                    </div>
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="등장 효과 (In)">
                      <Select value={selectedWidget.settings.animationIn || 'Fade In'} onChange={(e: any) => updateSettings(selectedWidget.id, { animationIn: e.target.value })} options={['Fade In', 'Slide Up', 'Zoom In', 'Bounce']} />
                    </FormGroup>
                    <FormGroup label="퇴장 효과 (Out)">
                      <Select value={selectedWidget.settings.animationOut || 'Fade Out'} onChange={(e: any) => updateSettings(selectedWidget.id, { animationOut: e.target.value })} options={['Fade Out', 'Slide Down', 'Zoom Out']} />
                    </FormGroup>
                  </div>
                  <FormGroup label="텍스트 애니메이션">
                    <Select value="Pulse" onChange={() => {}} options={['None', 'Pulse', 'Wave', 'Wiggle']} />
                  </FormGroup>
                </div>
              </Accordion>

              <Accordion title="미디어 (Media)">
                <div className="space-y-4">
                  <FormGroup label="알림 이미지">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded flex items-center justify-center overflow-hidden">
                        <img src="https://picsum.photos/seed/toon/100/100" alt="preview" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                      </div>
                      <button className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm py-2 rounded transition-colors">
                        이미지 변경
                      </button>
                    </div>
                  </FormGroup>
                  <FormGroup label="알림 효과음">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-3 py-2">
                        <Music size={14} className="text-slate-500" />
                        <span className="text-sm text-slate-300 truncate">default_alert.mp3</span>
                      </div>
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors">
                        <Play size={16} className="text-slate-300" />
                      </button>
                    </div>
                  </FormGroup>
                  <FormGroup label="효과음 볼륨">
                    <div className="flex items-center gap-3">
                      <Volume2 size={16} className="text-slate-500" />
                      <input type="range" min="0" max="100" defaultValue="50" className="flex-1 accent-blue-500" />
                      <span className="text-xs text-slate-400 w-8 text-right">50%</span>
                    </div>
                  </FormGroup>
                </div>
              </Accordion>

              <Accordion title="메시지 설정 (Message)">
                <div className="space-y-4">
                  <FormGroup label="메시지 템플릿">
                    <textarea 
                      value={selectedWidget.settings.template || ''}
                      onChange={(e) => updateSettings(selectedWidget.id, { template: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">사용 가능 변수: {'{닉네임}'}, {'{금액}'}</p>
                  </FormGroup>
                  
                  <FormGroup label="알림 노출 시간 (초)">
                    <Input type="number" value={selectedWidget.settings.duration || 5} onChange={(e: any) => updateSettings(selectedWidget.id, { duration: Number(e.target.value) })} />
                  </FormGroup>

                  <div className="h-px bg-slate-800 my-2"></div>

                  <FormGroup label="폰트 설정">
                    <Select value={selectedWidget.settings.fontFamily || 'Pretendard'} onChange={(e: any) => updateSettings(selectedWidget.id, { fontFamily: e.target.value })} options={['Pretendard', 'Noto Sans KR', 'Gmarket Sans', 'Maplestory']} />
                  </FormGroup>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="폰트 크기">
                      <div className="flex items-center gap-2">
                        <Input type="number" value={selectedWidget.settings.fontSize || 36} onChange={(e: any) => updateSettings(selectedWidget.id, { fontSize: Number(e.target.value) })} />
                        <span className="text-xs text-slate-500">px</span>
                      </div>
                    </FormGroup>
                    <FormGroup label="텍스트 정렬">
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded overflow-hidden">
                        <button className="flex-1 py-1.5 flex justify-center hover:bg-slate-800 text-slate-400 hover:text-white"><AlignLeft size={16} /></button>
                        <button className="flex-1 py-1.5 flex justify-center bg-slate-800 text-white"><AlignCenter size={16} /></button>
                        <button className="flex-1 py-1.5 flex justify-center hover:bg-slate-800 text-slate-400 hover:text-white"><AlignRight size={16} /></button>
                      </div>
                    </FormGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="기본 컬러">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-slate-600" style={{ backgroundColor: selectedWidget.settings.fontColor || '#ffffff' }}></div>
                        <Input value={selectedWidget.settings.fontColor || '#ffffff'} onChange={(e: any) => updateSettings(selectedWidget.id, { fontColor: e.target.value })} className="uppercase font-mono text-xs" />
                      </div>
                    </FormGroup>
                    <FormGroup label="강조 컬러 (닉네임/금액)">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-slate-600" style={{ backgroundColor: selectedWidget.settings.highlightColor || '#18C9FF' }}></div>
                        <Input value={selectedWidget.settings.highlightColor || '#18C9FF'} onChange={(e: any) => updateSettings(selectedWidget.id, { highlightColor: e.target.value })} className="uppercase font-mono text-xs" />
                      </div>
                    </FormGroup>
                  </div>
                </div>
              </Accordion>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <MousePointer2 size={48} className="mb-4 opacity-20" />
              <p className="text-sm">캔버스에서 위젯을 선택하거나<br/>왼쪽 패널에서 새 위젯을 추가하세요.</p>
            </div>
          )}
        </aside>

        {/* Right Canvas Area - Preview */}
        <main className="flex-1 relative bg-[#0a0b0e] overflow-hidden flex items-center justify-center p-8">
          {/* Dot Grid Background */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          {/* 16:9 Canvas Container */}
          <div 
            ref={canvasRef}
            className="relative bg-black/40 border border-slate-700/50 shadow-2xl overflow-hidden ring-1 ring-white/5"
            style={{ width: '100%', maxWidth: '1280px', aspectRatio: '16/9' }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedId(null);
              }
            }}
          >
            {/* Render Widgets */}
            {widgets.filter(w => w.visible).map(widget => (
              <div
                key={widget.id}
                className={`absolute border-2 cursor-move flex flex-col items-center justify-center bg-slate-800/80 backdrop-blur-sm transition-colors ${selectedId === widget.id ? 'border-blue-500 z-10' : 'border-dashed border-slate-600 hover:border-slate-400'}`}
                style={{
                  left: `${(widget.x / 1920) * 100}%`,
                  top: `${(widget.y / 1080) * 100}%`,
                  width: `${(widget.width / 1920) * 100}%`,
                  height: `${(widget.height / 1080) * 100}%`,
                }}
                onMouseDown={(e) => handleMouseDown(e, widget.id)}
              >
                {/* Mock Content based on type */}
                {widget.type === 'text-alert' && (
                  <>
                    <div className="w-16 h-16 bg-slate-700 rounded-full mb-4 flex items-center justify-center">
                      <ImageIcon size={24} className="text-slate-500" />
                    </div>
                    <div 
                      className="text-center px-4"
                      style={{ 
                        fontFamily: widget.settings.fontFamily || 'sans-serif',
                        color: widget.settings.fontColor || '#fff',
                        fontSize: 'clamp(12px, 2vw, 24px)'
                      }}
                    >
                      <span style={{ color: widget.settings.highlightColor || '#18C9FF' }}>도네이터</span>님이 1,000원을 후원해 주셨어요!
                    </div>
                  </>
                )}
                {widget.type !== 'text-alert' && (
                  <div className="text-slate-400 font-medium flex flex-col items-center gap-2">
                    <Layout size={32} className="opacity-50" />
                    {widget.name} 영역
                  </div>
                )}

                {/* Resize Handles */}
                {selectedId === widget.id && (
                  <>
                    <div 
                      className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-nwse-resize"
                      onMouseDown={(e) => handleMouseDown(e, widget.id, 'top-left')}
                    ></div>
                    <div 
                      className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-nesw-resize"
                      onMouseDown={(e) => handleMouseDown(e, widget.id, 'top-right')}
                    ></div>
                    <div 
                      className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-nesw-resize"
                      onMouseDown={(e) => handleMouseDown(e, widget.id, 'bottom-left')}
                    ></div>
                    <div 
                      className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-nwse-resize"
                      onMouseDown={(e) => handleMouseDown(e, widget.id, 'bottom-right')}
                    ></div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Canvas Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#181a20] border border-slate-800 rounded-full px-4 py-2 shadow-xl">
            <span className="text-xs font-medium text-slate-400">해상도 기준: 1920 x 1080</span>
            <div className="w-px h-4 bg-slate-700 mx-2"></div>
            <button className="text-slate-400 hover:text-white"><Monitor size={16} /></button>
          </div>
        </main>
      </div>
      
      {/* Global CSS for custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #475569;
        }
      `}} />
    </div>
  );
}
