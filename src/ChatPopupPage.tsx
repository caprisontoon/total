import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { CreatorChatPanel, useLiveChat, type ChatStatus, type ChatScope } from './liveChat';

// 방송 관리 화면에서 '새 창으로 분리'한 크리에이터 채팅 전용 창.
// 본창과는 BroadcastChannel로 보내기 · 삭제 · 차단이 동기화된다.
export default function ChatPopupPage() {
  const [params] = useSearchParams();
  const channelId = params.get('channel') || 'ym';
  const status = (params.get('status') as ChatStatus) || 'live';
  const slow = Number(params.get('slow') || 0);
  const scope = (params.get('scope') as ChatScope) || 'all';
  useEffect(() => { document.title = '실시간 채팅 — 투네이션 방송 관리'; }, []);
  const chat = useLiveChat(channelId, status !== 'offline' && scope !== 'off');

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#181a20] text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1f222a] shrink-0">
        <Radio size={14} className="text-blue-500" />
        <span className="text-xs font-bold">투네이션 방송 관리 · 채팅 창</span>
        <span className="ml-auto text-[10px] text-slate-400">본창과 실시간 동기화</span>
      </div>
      <div className="flex-1 min-h-0">
        <CreatorChatPanel chat={chat} status={status} viewers={1204} slow={slow} chatScope={scope} variant="popup" />
      </div>
    </div>
  );
}
