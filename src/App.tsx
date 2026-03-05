/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Layout, Layers, Plus, Settings, Play, Save, Monitor, 
  Type, Image as ImageIcon, Volume2, Move, ChevronDown, 
  ChevronRight, Trash2, Copy, Eye, EyeOff, MousePointer2,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Video, Mic, Gift, Target, ListTodo, HelpCircle, Music, Palette,
  Box, Gamepad2, GripVertical, BellRing, LayoutGrid, MessageSquare, QrCode, PiggyBank, Bell, Coins, Trophy, Users, Star, Package, Edit2,
  Heart, Zap, Gem, DollarSign, UserPlus
} from 'lucide-react';

// --- Types ---
type WidgetType = string;

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
const DONATION_ALERTS = [
  { id: 'text-alert', name: '텍스트 후원 알림', icon: Type, desc: '텍스트로 후원 메시지를 받으며 도네이터와 소통할 수 있습니다.' },
  { id: 'game-alert', name: '게임 후원', icon: Gamepad2, desc: '도네이터가 직접 크리에이터에게 게임 아이템을 선물 할 수 있습니다.' },
  { id: 'signature-alert', name: '시그니처 후원 알림', icon: Star, desc: '지정된 시그니처 리액션을 선택해서 후원할 수 있습니다.' },
  { id: 'voice-alert', name: '음성 후원 알림', icon: Mic, desc: '녹음한 음성 또는 파일등록을 통하여 후원 메시지를 받을 수 있습니다.' },
  { id: 'video-alert', name: '영상 후원 알림', icon: Video, desc: '후원과 함께 공유한 영상을 받아 볼 수 있습니다.' },
  { id: 'roulette-alert', name: '룰렛 후원 알림', icon: Target, desc: '여러가지 항목을 설정하여 룰렛을 돌릴 수 있습니다.' },
  { id: 'wishlist-alert', name: '위시리스트 알림', icon: Gift, desc: '원하는 것들을 방송을 통해 도네이터들에게 알려주세요.' },
  { id: 'vote-alert', name: '투표 알림', icon: HelpCircle, desc: '도네이터들의 의견을 투표를 통해 들을 수 있습니다.' },
  { id: 'quest-alert', name: '퀘스트 알림', icon: ListTodo, desc: '도네이터들의 요구를 퀘스트를 통해 듣고 수행해 나갈 수 있습니다.' },
  { id: 'drawing-alert', name: '그림 후원 알림', icon: Palette, desc: '도네이터가 직접 그린 그림을 통해 소통할 수 있습니다.' },
  { id: 'gift-alert', name: '기프트 후원 알림', icon: Package, desc: '도네이터가 선물을 보내면 선물 사진과 함께 알림을 확인할 수 있습니다.' },
  { id: 'luckybox-alert', name: '럭키박스 알림', icon: Box, desc: '도네이터들이 보내준 럭키박스를 통해 함께 즐기며 소통할 수 있습니다.' },
  { id: 'play-alert', name: '플레이 후원 알림', icon: Gamepad2, desc: '퀴즈와 같은 재미있고 다양한 방법으로 도네이터와 소통할 수 있습니다.' },
];

const YOUTUBE_ALERTS = [
  { id: 'yt-superchat', name: '슈퍼챗 알림', icon: MessageSquare, desc: '슈퍼챗으로 받은 후원을 알려줍니다.' },
  { id: 'yt-sponsor', name: '스폰서 알림', icon: DollarSign, desc: '새로운 스폰서를 알려줍니다.' },
];

const CHZZK_ALERTS = [
  { id: 'chzzk-sub', name: '치지직 구독 알림', icon: Zap, desc: '새로운 구독자를 알려줍니다' },
  { id: 'chzzk-cheese', name: '치즈 알림', icon: Coins, desc: '치즈로 받은 후원을 알림으로 받을 수 있습니다.' },
];

const TWITCH_ALERTS = [
  { id: 'twitch-sub', name: '구독 알림', icon: Star, desc: '새로운 구독자를 알려줍니다' },
  { id: 'twitch-follow', name: '팔로우 알림', icon: Heart, desc: '새로운 팔로워를 알려줍니다.' },
  { id: 'twitch-bit', name: '비트 알림', icon: Gem, desc: '비트로 받은 후원을 알림으로 받을 수 있습니다.' },
  { id: 'twitch-sub-gift', name: '구독선물 알림', icon: Gift, desc: '구독 선물을 알려 줍니다.' },
  { id: 'twitch-sub-gift-cnt', name: '구독선물개수 알림', icon: Gift, desc: '구독 선물 받은 개수를 알려줍니다.' },
  { id: 'twitch-raid', name: '레이드 알림', icon: UserPlus, desc: '레이드 알림을 받을 수 있습니다.' },
];

const ALERTS_DATA = {
  donation: DONATION_ALERTS,
  youtube: YOUTUBE_ALERTS,
  chzzk: CHZZK_ALERTS,
  twitch: TWITCH_ALERTS
};

const WIDGETS_MENU = [
  { id: 'chat', name: '채팅창', icon: MessageSquare },
  { id: 'qr', name: '후원 QR코드', icon: QrCode },
  { id: 'goal', name: '후원목표', icon: Target },
  { id: 'accumulated', name: '후원누적금액', icon: PiggyBank },
  { id: 'recent', name: '최근알림', icon: AlignLeft },
  { id: 'event', name: '이벤트', icon: Bell },
  { id: 'mini', name: '미니후원', icon: Coins },
  { id: 'ranking', name: '후원랭킹', icon: Trophy },
  { id: 'sound', name: '커스텀 사운드', icon: Volume2 },
  { id: 'wishlist-widget', name: '위시리스트', icon: Gift },
  { id: 'vote-widget', name: '투표', icon: HelpCircle },
  { id: 'quest-widget', name: '퀘스트', icon: ListTodo },
  { id: 'drawing-widget', name: '그림후원', icon: Palette },
  { id: 'luckybox-widget', name: '럭키박스', icon: Box },
  { id: 'play-widget', name: '플레이', icon: Gamepad2 },
  { id: 'gacha', name: '뽑기 후원', icon: Package },
  { id: 'wallpaper', name: '벽지', icon: ImageIcon },
  { id: 'crew', name: '크루 후원', icon: Users },
];

const DEFAULT_TEXT_PRESET = {
  id: 'p-1',
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
};

const INITIAL_WIDGETS: Widget[] = [
  {
    id: 'w-1',
    type: 'integrated-alert',
    name: '통합 알림창',
    x: (1920 - 640) / 2,
    y: (1080 - 360) / 2,
    width: 640,
    height: 360,
    visible: false,
    settings: {
      activeAlertTab: 'text-alert',
      textAlert: {
        presetGroups: [
          {
            id: 'g-1',
            name: '기본 프리셋 그룹',
            presets: [DEFAULT_TEXT_PRESET]
          }
        ],
        activeGroupId: 'g-1',
        editingPresetId: 'p-1'
      },
      signatureAlert: {
        presetGroups: [
          {
            id: 'g-2',
            name: '기본 프리셋 그룹',
            presets: [{ ...DEFAULT_TEXT_PRESET, id: 'p-2' }]
          }
        ],
        activeGroupId: 'g-2',
        editingPresetId: 'p-2'
      }
    }
  },
  ...WIDGETS_MENU.map((w, i) => ({
    id: `w-${i+2}`,
    type: w.id,
    name: w.name,
    x: (1920 - 300) / 2,
    y: (1080 - 300) / 2,
    width: 300,
    height: 300,
    visible: false,
    settings: {}
  }))
];

// --- Components ---

const Accordion = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-700 rounded-lg bg-[#22252d] overflow-hidden shadow-sm">
      <button 
        className={`w-full flex items-center justify-between p-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700/50 ${isOpen ? 'bg-[#2a2d36] border-b border-slate-700' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
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
    className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm ${className}`}
  />
);

const Select = ({ value, onChange, options }: any) => (
  <select 
    value={value} 
    onChange={onChange}
    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none shadow-sm transition-all"
  >
    {options.map((opt: any) => {
      const isObj = typeof opt === 'object';
      const val = isObj ? opt.value : opt;
      const label = isObj ? opt.label : opt;
      return <option key={val} value={val}>{label}</option>;
    })}
  </select>
);

export default function App() {
  const [widgets, setWidgets] = useState<Widget[]>(INITIAL_WIDGETS);
  const [selectedId, setSelectedId] = useState<string | null>('w-1');
  const [leftTab, setLeftTab] = useState<'alerts' | 'widgets' | 'layers'>('alerts');
  const [alertCategory, setAlertCategory] = useState<'donation' | 'youtube' | 'chzzk' | 'twitch'>('donation');
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedWidget = widgets.find(w => w.id === selectedId);

  const saveCurrentPreset = () => {
    alert('저장되었습니다.');
  };

  const handleAlertClick = (alertId: string) => {
    let alertWidget = widgets.find(w => w.type === 'integrated-alert');
    if (alertWidget) {
      updateSettings(alertWidget.id, { activeAlertTab: alertId });
      setSelectedId(alertWidget.id);
    }
  };

  const handleWidgetClick = (widgetItem: any) => {
    const existing = widgets.find(w => w.type === widgetItem.id);
    if (existing) {
      setSelectedId(existing.id);
    }
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const updateSettings = (id: string, settingUpdates: any) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, settings: { ...w.settings, ...settingUpdates } } : w));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    setWidgets(prev => {
      const displayed = [...prev].reverse();
      const draggedIdx = displayed.findIndex(w => w.id === draggedWidgetId);
      const targetIdx = displayed.findIndex(w => w.id === targetId);
      
      if (draggedIdx === -1 || targetIdx === -1) return prev;
      
      const [draggedWidget] = displayed.splice(draggedIdx, 1);
      displayed.splice(targetIdx, 0, draggedWidget);
      
      return displayed.reverse();
    });
    setDraggedWidgetId(null);
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

  const isIntegratedAlert = selectedWidget?.type === 'integrated-alert';
  const activeAlertTab = isIntegratedAlert ? selectedWidget?.settings.activeAlertTab : null;
  const isPresetSupportedTab = isIntegratedAlert && (activeAlertTab === 'text-alert' || activeAlertTab === 'signature-alert');
  
  const alertSettingsKey = activeAlertTab === 'text-alert' ? 'textAlert' : 'signatureAlert';
  const currentAlertSettings = isPresetSupportedTab ? selectedWidget?.settings[alertSettingsKey] : null;
  const activeGroup = isPresetSupportedTab && currentAlertSettings ? currentAlertSettings.presetGroups?.find((g: any) => g.id === currentAlertSettings.activeGroupId) : null;
  const editingPreset = activeGroup ? activeGroup.presets.find((p: any) => p.id === currentAlertSettings.editingPresetId) : selectedWidget?.settings;

  const handleSettingChange = (updates: any) => {
    if (!selectedWidget) return;
    
    if (isPresetSupportedTab && currentAlertSettings) {
      const updatedGroups = currentAlertSettings.presetGroups.map((group: any) => {
        if (group.id === currentAlertSettings.activeGroupId) {
          return {
            ...group,
            presets: group.presets.map((preset: any) => 
              preset.id === currentAlertSettings.editingPresetId ? { ...preset, ...updates } : preset
            )
          };
        }
        return group;
      });
      updateSettings(selectedWidget.id, { 
        [alertSettingsKey]: {
          ...currentAlertSettings,
          presetGroups: updatedGroups 
        }
      });
    } else {
      updateSettings(selectedWidget.id, updates);
    }
  };

  const handleAddGroup = () => {
    if (!selectedWidget || !isPresetSupportedTab || !currentAlertSettings) return;
    const newGroupId = `g-${Date.now()}`;
    const newPresetId = `p-${Date.now()}`;
    const newGroup = {
      id: newGroupId,
      name: `새 프리셋 그룹 ${currentAlertSettings.presetGroups.length + 1}`,
      presets: [{ ...DEFAULT_TEXT_PRESET, id: newPresetId }]
    };
    updateSettings(selectedWidget.id, { 
      [alertSettingsKey]: {
        ...currentAlertSettings,
        presetGroups: [...currentAlertSettings.presetGroups, newGroup],
        activeGroupId: newGroupId,
        editingPresetId: newPresetId
      }
    });
  };

  const handleDeleteGroup = () => {
    if (!selectedWidget || !isPresetSupportedTab || !currentAlertSettings || currentAlertSettings.presetGroups.length <= 1) {
      alert('최소 1개의 프리셋 그룹이 필요합니다.');
      return;
    }
    if (confirm('이 프리셋 그룹을 삭제하시겠습니까?')) {
      const updatedGroups = currentAlertSettings.presetGroups.filter((g: any) => g.id !== currentAlertSettings.activeGroupId);
      updateSettings(selectedWidget.id, { 
        [alertSettingsKey]: {
          ...currentAlertSettings,
          presetGroups: updatedGroups,
          activeGroupId: updatedGroups[0].id,
          editingPresetId: updatedGroups[0].presets[0].id
        }
      });
    }
  };

  const handleEditGroupName = () => {
    if (!selectedWidget || !isPresetSupportedTab || !currentAlertSettings || !activeGroup) return;
    const newName = prompt('프리셋 그룹 이름을 입력하세요:', activeGroup.name);
    if (newName && newName.trim() !== '') {
      const updatedGroups = currentAlertSettings.presetGroups.map((group: any) => {
        if (group.id === currentAlertSettings.activeGroupId) {
          return { ...group, name: newName.trim() };
        }
        return group;
      });
      updateSettings(selectedWidget.id, { 
        [alertSettingsKey]: {
          ...currentAlertSettings,
          presetGroups: updatedGroups
        }
      });
    }
  };

  const handleAddPreset = () => {
    if (!selectedWidget || !isPresetSupportedTab || !activeGroup || !currentAlertSettings) return;
    const newPresetId = `p-${Date.now()}`;
    const newPreset = {
      ...editingPreset,
      id: newPresetId,
      minAmount: (editingPreset?.minAmount || 0) + 1000
    };
    
    const updatedGroups = currentAlertSettings.presetGroups.map((group: any) => {
      if (group.id === currentAlertSettings.activeGroupId) {
        return { ...group, presets: [...group.presets, newPreset] };
      }
      return group;
    });

    updateSettings(selectedWidget.id, { 
      [alertSettingsKey]: {
        ...currentAlertSettings,
        presetGroups: updatedGroups,
        editingPresetId: newPresetId
      }
    });
  };

  const handleDeletePreset = (presetId: string) => {
    if (!selectedWidget || !isPresetSupportedTab || !activeGroup || activeGroup.presets.length <= 1 || !currentAlertSettings) {
      alert('최소 1개의 프리셋이 필요합니다.');
      return;
    }
    if (confirm('이 프리셋을 삭제하시겠습니까?')) {
      const updatedGroups = currentAlertSettings.presetGroups.map((group: any) => {
        if (group.id === currentAlertSettings.activeGroupId) {
          const filteredPresets = group.presets.filter((p: any) => p.id !== presetId);
          return { ...group, presets: filteredPresets };
        }
        return group;
      });

      const newEditingId = currentAlertSettings.editingPresetId === presetId 
        ? updatedGroups.find((g: any) => g.id === currentAlertSettings.activeGroupId).presets[0].id 
        : currentAlertSettings.editingPresetId;

      updateSettings(selectedWidget.id, { 
        [alertSettingsKey]: {
          ...currentAlertSettings,
          presetGroups: updatedGroups,
          editingPresetId: newEditingId
        }
      });
    }
  };

  const getWidgetPreviewSettings = (widget: Widget, isSelected: boolean) => {
    if (widget.type === 'integrated-alert') {
      const tab = widget.settings.activeAlertTab;
      if (tab === 'text-alert' || tab === 'signature-alert') {
        const settingsKey = tab === 'text-alert' ? 'textAlert' : 'signatureAlert';
        const currentSettings = widget.settings[settingsKey];
        if (!currentSettings) return widget.settings;
        
        const group = currentSettings.presetGroups?.find((g: any) => g.id === currentSettings.activeGroupId);
        if (isSelected) {
          return group?.presets.find((p: any) => p.id === currentSettings.editingPresetId) || widget.settings;
        } else {
          return group?.presets[0] || widget.settings;
        }
      }
    }
    return widget.settings;
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
              className={`flex-1 py-3 text-xs font-bold transition-colors flex flex-col items-center gap-1 ${leftTab === 'alerts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              onClick={() => setLeftTab('alerts')}
            >
              <BellRing size={16} />
              통합 알림창
            </button>
            <button 
              className={`flex-1 py-3 text-xs font-bold transition-colors flex flex-col items-center gap-1 ${leftTab === 'widgets' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              onClick={() => setLeftTab('widgets')}
            >
              <LayoutGrid size={16} />
              위젯
            </button>
            <button 
              className={`flex-1 py-3 text-xs font-bold transition-colors flex flex-col items-center gap-1 ${leftTab === 'layers' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              onClick={() => setLeftTab('layers')}
            >
              <Layers size={16} />
              레이어
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {leftTab === 'alerts' && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 mb-3 px-1">통합 알림창 (Integrated Alerts)</div>
                
                {/* Category Tabs */}
                <div className="flex p-1 bg-[#22252d] rounded-lg mb-3 gap-1 overflow-x-auto custom-scrollbar">
                  {[
                    { id: 'donation', label: '후원' },
                    { id: 'youtube', label: '유튜브' },
                    { id: 'chzzk', label: '치지직' },
                    { id: 'twitch', label: '트위치' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAlertCategory(tab.id as any)}
                      className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors ${
                        alertCategory === tab.id 
                          ? 'bg-slate-700 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {ALERTS_DATA[alertCategory].map(alert => (
                  <button
                    key={alert.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group shadow-sm ${
                      activeAlertTab === alert.id 
                        ? 'bg-blue-500/10 border-blue-500/50' 
                        : 'bg-[#22252d] border-slate-700 hover:bg-[#2a2d36] hover:border-slate-500'
                    }`}
                    onClick={() => handleAlertClick(alert.id)}
                  >
                    <div className={`p-2 rounded-md transition-colors shrink-0 ${
                      activeAlertTab === alert.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-800 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300'
                    }`}>
                      <alert.icon size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <div className={`text-sm font-medium truncate ${
                        activeAlertTab === alert.id ? 'text-blue-400' : 'text-slate-200'
                      }`}>{alert.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{alert.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {leftTab === 'widgets' && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 mb-3 px-1">개별 위젯 (Individual Widgets)</div>
                <div className="grid grid-cols-2 gap-2">
                  {WIDGETS_MENU.map(widget => {
                    const isSelected = selectedWidget?.type === widget.id;
                    return (
                      <button
                        key={widget.id}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all group shadow-sm ${
                          isSelected 
                            ? 'bg-blue-500/10 border-blue-500/50' 
                            : 'bg-[#22252d] border-slate-700 hover:bg-[#2a2d36] hover:border-slate-500'
                        }`}
                        onClick={() => handleWidgetClick(widget)}
                      >
                        <widget.icon 
                          size={20} 
                          className={`transition-colors ${
                            isSelected ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'
                          }`} 
                        />
                        <span className={`text-xs font-medium text-center ${
                          isSelected ? 'text-blue-400' : 'text-slate-300'
                        }`}>
                          {widget.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {leftTab === 'layers' && (
              <div className="space-y-1">
                {/* Render layers in reverse order so top layer is at the top of the list */}
                {[...widgets].reverse().map((widget) => (
                  <div 
                    key={widget.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, widget.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, widget.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors shadow-sm ${selectedId === widget.id ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-[#22252d] border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-[#2a2d36]'} ${draggedWidgetId === widget.id ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedId(widget.id)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300">
                        <GripVertical size={14} />
                      </div>
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
        <aside className="w-80 bg-[#181a20] border-r border-slate-800 flex flex-col shrink-0 z-10">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
          {selectedWidget ? (
            <div className="pb-6">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/20 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded text-blue-400">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{selectedWidget.name}</h2>
                    <p className="text-[11px] text-slate-400">ID: {selectedWidget.id}</p>
                  </div>
                </div>
              </div>

              <div className="px-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-[#22252d] border border-slate-700 rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-slate-200">위젯 사용하기</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={selectedWidget.visible} onChange={() => updateWidget(selectedWidget.id, { visible: !selectedWidget.visible })} />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>

              <div className="px-3 space-y-3">
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

              {isPresetSupportedTab && activeGroup && currentAlertSettings && (
                <Accordion title="테마 및 금액 설정 (Themes & Amounts)">
                  <div className="space-y-4">
                    {/* Theme Selection */}
                    <FormGroup label="방송 테마 (Preset Group)">
                      <div className="flex items-center gap-2">
                        <Select 
                          value={currentAlertSettings.activeGroupId} 
                          onChange={(e: any) => {
                            const group = currentAlertSettings.presetGroups.find((g: any) => g.id === e.target.value);
                            updateSettings(selectedWidget.id, { 
                              [alertSettingsKey]: {
                                ...currentAlertSettings,
                                activeGroupId: e.target.value, 
                                editingPresetId: group.presets[0].id 
                              }
                            });
                          }}
                          options={currentAlertSettings.presetGroups.map((g: any) => ({ label: g.name, value: g.id }))} 
                        />
                        <button onClick={handleEditGroupName} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors" title="테마 이름 변경"><Edit2 size={16}/></button>
                        <button onClick={handleAddGroup} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors" title="새 테마 추가"><Plus size={16}/></button>
                        <button onClick={handleDeleteGroup} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors" title="현재 테마 삭제"><Trash2 size={16}/></button>
                      </div>
                    </FormGroup>

                    {/* Amount Presets */}
                    <FormGroup label="금액별 설정 (Amount Presets)">
                      <div className="space-y-2">
                        {[...activeGroup.presets].sort((a,b) => a.minAmount - b.minAmount).map((preset: any) => (
                          <div 
                            key={preset.id} 
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors shadow-sm ${currentAlertSettings.editingPresetId === preset.id ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800'}`}
                            onClick={() => updateSettings(selectedWidget.id, { 
                              [alertSettingsKey]: {
                                ...currentAlertSettings,
                                editingPresetId: preset.id 
                              }
                            })}
                          >
                            <span className="text-sm font-medium">{preset.minAmount.toLocaleString()} 캐시 이상</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDeletePreset(preset.id); }} className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-700 transition-colors"><Trash2 size={14}/></button>
                          </div>
                        ))}
                        <button onClick={handleAddPreset} className="w-full py-2 border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 hover:bg-slate-800 rounded-lg text-sm flex items-center justify-center gap-2 transition-all">
                          <Plus size={14} /> 새 금액 구간 추가
                        </button>
                      </div>
                    </FormGroup>
                  </div>
                </Accordion>
              )}

              {/* Dynamic Settings based on Widget Type (Mocking Text Alert settings from PDF) */}
              <Accordion title="기본 설정 (General)">
                <div className="space-y-4">
                  <FormGroup label="최소 후원 캐시">
                    <div className="flex items-center gap-2">
                      <Input type="number" value={editingPreset?.minAmount || 0} onChange={(e: any) => handleSettingChange({ minAmount: Number(e.target.value) })} />
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
                          className={`h-12 border rounded-lg flex flex-col items-center justify-center gap-1 shadow-sm transition-colors ${editingPreset?.layout === layout ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-500 hover:bg-slate-800'}`}
                          onClick={() => handleSettingChange({ layout })}
                        >
                          <ImageIcon size={14} />
                          <div className="w-6 h-1 bg-current rounded-full opacity-50"></div>
                        </button>
                      ))}
                    </div>
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="등장 효과 (In)">
                      <Select value={editingPreset?.animationIn || 'Fade In'} onChange={(e: any) => handleSettingChange({ animationIn: e.target.value })} options={['Fade In', 'Slide Up', 'Zoom In', 'Bounce']} />
                    </FormGroup>
                    <FormGroup label="퇴장 효과 (Out)">
                      <Select value={editingPreset?.animationOut || 'Fade Out'} onChange={(e: any) => handleSettingChange({ animationOut: e.target.value })} options={['Fade Out', 'Slide Down', 'Zoom Out']} />
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
                      value={editingPreset?.template || ''}
                      onChange={(e) => handleSettingChange({ template: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">사용 가능 변수: {'{닉네임}'}, {'{금액}'}</p>
                  </FormGroup>
                  
                  <FormGroup label="알림 노출 시간 (초)">
                    <Input type="number" value={editingPreset?.duration || 5} onChange={(e: any) => handleSettingChange({ duration: Number(e.target.value) })} />
                  </FormGroup>

                  <div className="h-px bg-slate-800 my-2"></div>

                  <FormGroup label="폰트 설정">
                    <Select value={editingPreset?.fontFamily || 'Pretendard'} onChange={(e: any) => handleSettingChange({ fontFamily: e.target.value })} options={['Pretendard', 'Noto Sans KR', 'Gmarket Sans', 'Maplestory']} />
                  </FormGroup>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="폰트 크기">
                      <div className="flex items-center gap-2">
                        <Input type="number" value={editingPreset?.fontSize || 36} onChange={(e: any) => handleSettingChange({ fontSize: Number(e.target.value) })} />
                        <span className="text-xs text-slate-500">px</span>
                      </div>
                    </FormGroup>
                    <FormGroup label="텍스트 정렬">
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-sm">
                        <button className="flex-1 py-1.5 flex justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><AlignLeft size={16} /></button>
                        <button className="flex-1 py-1.5 flex justify-center bg-slate-800 text-white transition-colors"><AlignCenter size={16} /></button>
                        <button className="flex-1 py-1.5 flex justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><AlignRight size={16} /></button>
                      </div>
                    </FormGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormGroup label="기본 컬러">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-slate-600 shrink-0" style={{ backgroundColor: editingPreset?.fontColor || '#ffffff' }}></div>
                        <Input value={editingPreset?.fontColor || '#ffffff'} onChange={(e: any) => handleSettingChange({ fontColor: e.target.value })} className="uppercase font-mono text-xs" />
                      </div>
                    </FormGroup>
                    <FormGroup label="강조 컬러 (닉네임/금액)">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-slate-600 shrink-0" style={{ backgroundColor: editingPreset?.highlightColor || '#18C9FF' }}></div>
                        <Input value={editingPreset?.highlightColor || '#18C9FF'} onChange={(e: any) => handleSettingChange({ highlightColor: e.target.value })} className="uppercase font-mono text-xs" />
                      </div>
                    </FormGroup>
                  </div>
                </div>
              </Accordion>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center min-h-full">
              <MousePointer2 size={48} className="mb-4 opacity-20" />
              <p className="text-sm">캔버스에서 위젯을 선택하거나<br/>왼쪽 패널에서 위젯을 선택하세요.</p>
            </div>
          )}
          </div>
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
            {widgets.filter(w => w.visible).map((widget, index) => {
              const previewSettings = getWidgetPreviewSettings(widget, selectedId === widget.id);
              return (
              <div
                key={widget.id}
                className={`absolute border-2 cursor-move flex flex-col items-center justify-center bg-slate-800/80 backdrop-blur-sm transition-colors ${selectedId === widget.id ? 'border-blue-500' : 'border-dashed border-slate-600 hover:border-slate-400'}`}
                style={{
                  left: `${(widget.x / 1920) * 100}%`,
                  top: `${(widget.y / 1080) * 100}%`,
                  width: `${(widget.width / 1920) * 100}%`,
                  height: `${(widget.height / 1080) * 100}%`,
                  zIndex: index + 10,
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
                        fontFamily: previewSettings.fontFamily || 'sans-serif',
                        color: previewSettings.fontColor || '#fff',
                        fontSize: 'clamp(12px, 2vw, 24px)'
                      }}
                    >
                      <span style={{ color: previewSettings.highlightColor || '#18C9FF' }}>도네이터</span>님이 {previewSettings.minAmount ? previewSettings.minAmount.toLocaleString() : '1,000'}원을 후원해 주셨어요!
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
            )})}
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
