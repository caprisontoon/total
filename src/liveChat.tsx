import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, ExternalLink, Settings, Smile, Send, Trash2, Ban, Users, WifiOff, ShieldOff } from 'lucide-react';

// 크리에이터용 실시간 채팅 — 방송 관리 화면(본창)과 분리된 팝업 창이 같은 컴포넌트를 쓴다.
// · 시청자 메시지 피드: 시간 슬롯 기반 결정적 생성 → 여러 창이 동기화 없이도 같은 내용을 본다.
// · 크리에이터 행동(보내기 · 삭제 · 차단): BroadcastChannel로 창 간 실시간 동기화.

export type ChatStatus = 'offline' | 'preparing' | 'live' | 'suspended';
export type ChatScope = 'all' | 'follower' | 'off';
export type ChatMsg = { id: string; user: string; text: string; color: string; badge?: string; role?: 'creator'; ts: number };

const TICK_MS = 3500;
const POOL: Omit<ChatMsg, 'id' | 'ts'>[] = [
  { user: '유저A', text: 'ㅋㅋㅋㅋ 오늘 텐션 미쳤다', color: '#38bdf8' },
  { user: '유저B', text: '오늘도 화이팅!! 🔥', color: '#34d399', badge: '실버' },
  { user: '유저C', text: '목표까지 얼마 남았어요?', color: '#fbbf24', badge: 'VIP' },
  { user: '유저D', text: '대박 ㄷㄷ 👏👏', color: '#e879f9', badge: '골드' },
  { user: '유저E', text: '방금 들어왔는데 뭐하는 중이에요?', color: '#38bdf8' },
  { user: '유저F', text: 'ㅇㅈㅇㅈ', color: '#34d399', badge: '실버' },
  { user: '유저G', text: '소리 살짝 작은 것 같아요', color: '#f472b6' },
  { user: '유저H', text: '노래 신청 가능한가요 🎵', color: '#a78bfa', badge: '골드' },
  { user: '유저I', text: '1등 누구야 지금', color: '#fb923c' },
  { user: '유저J', text: '화질 좋다 ㄷㄷ 1080p 미쳤네', color: '#22d3ee', badge: 'VIP' },
  { user: '유저K', text: '오늘 몇 시까지 하세요?', color: '#38bdf8' },
  { user: '유저L', text: '👏👏👏', color: '#34d399' },
  { user: '유저M', text: '엑셀 판 열어주세요!!', color: '#fbbf24', badge: '실버' },
  { user: '유저N', text: '처음 왔는데 재밌네요', color: '#e879f9' },
  { user: '유저O', text: 'ㅋㅋㅋㅋㅋㅋㅋ', color: '#f472b6', badge: '골드' },
  { user: '유저P', text: '후원했어요 확인 부탁~', color: '#a78bfa' },
];
const fromSlot = (s: number): ChatMsg => { const p = POOL[((s % POOL.length) + POOL.length) % POOL.length]; return { ...p, id: `f-${s}`, ts: s * TICK_MS }; };

export function useLiveChat(channelId: string, active: boolean) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const lastSlot = useRef(-1);
  const bc = useRef<BroadcastChannel | null>(null);

  // 최근 7개 슬롯으로 초기 채움
  useEffect(() => {
    const now = Math.floor(Date.now() / TICK_MS);
    const seed: ChatMsg[] = []; for (let s = now - 6; s <= now; s++) seed.push(fromSlot(s));
    setMsgs(seed); lastSlot.current = now;
  }, [channelId]);

  // 결정적 피드 (라이브 · 일시중단 · 준비 중일 때만 흐름)
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      const slot = Math.floor(Date.now() / TICK_MS);
      if (slot > lastSlot.current) {
        const add: ChatMsg[] = []; for (let s = lastSlot.current + 1; s <= slot; s++) add.push(fromSlot(s));
        lastSlot.current = slot; setMsgs((m) => [...m, ...add].slice(-200));
      }
    }, 500);
    return () => clearInterval(t);
  }, [active]);

  // 창 간 동기화
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(`toon-creator-chat-${channelId}`);
    bc.current = ch;
    ch.onmessage = (e) => {
      const { type, payload } = e.data || {};
      if (type === 'send') setMsgs((m) => (m.some((x) => x.id === payload.id) ? m : [...m, payload]));
      if (type === 'delete') setDeleted((d) => new Set(d).add(payload));
      if (type === 'block') setBlocked((b) => new Set(b).add(payload));
    };
    return () => { ch.close(); bc.current = null; };
  }, [channelId]);

  const post = (type: string, payload: unknown) => bc.current?.postMessage({ type, payload });
  const send = (text: string) => { const m: ChatMsg = { id: `c-${Date.now()}`, user: 'YM상사', text, color: '#ef4444', badge: '크리에이터', role: 'creator', ts: Date.now() }; setMsgs((x) => [...x, m]); post('send', m); };
  const remove = (id: string) => { setDeleted((d) => new Set(d).add(id)); post('delete', id); };
  const block = (user: string) => { setBlocked((b) => new Set(b).add(user)); post('block', user); };
  return { msgs: msgs.filter((m) => !deleted.has(m.id) && !blocked.has(m.user)), send, remove, block, blockedCount: blocked.size };
}

const EMOJIS = ['😀', '😂', '🔥', '👏', '❤️', '😮', '🎉', '👍', '😭', '🙏'];

export type LiveChat = ReturnType<typeof useLiveChat>;

// 표시 전용 — 채팅 상태(chat)는 호출부가 소유한다.
// 본창은 페이지 레벨에서 useLiveChat을 유지하므로, 채팅을 새 창으로 분리해 패널이 사라져도
// 구독이 끊기지 않고 팝업에서 보낸 메시지가 그대로 누적된다.
export function CreatorChatPanel({ chat, status, viewers, slow, chatScope, variant = 'inline', onPopout, onOpenSettings }: {
  chat: LiveChat; status: ChatStatus; viewers: number; slow: number; chatScope: ChatScope; variant?: 'inline' | 'popup'; onPopout?: () => void; onOpenSettings?: () => void;
}) {
  const online = status !== 'offline';
  const active = online && chatScope !== 'off';
  const { msgs, send, remove, block, blockedCount } = chat;
  const [input, setInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const [unseen, setUnseen] = useState(0);

  useEffect(() => {
    const el = listRef.current; if (!el) return;
    if (autoScroll) { el.scrollTop = el.scrollHeight; setUnseen(0); } else setUnseen((u) => u + 1);
  }, [msgs.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const onScroll = () => { const el = listRef.current; if (!el) return; const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40; setAutoScroll(nearBottom); if (nearBottom) setUnseen(0); };
  const jumpBottom = () => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; setAutoScroll(true); setUnseen(0); };
  const submit = () => { const t = input.trim(); if (!t) return; send(t); setInput(''); setEmojiOpen(false); };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-[#181a20]">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare size={15} className="text-slate-500 shrink-0" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">실시간 채팅</span>
          {online && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === 'suspended' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />}
          {online && <span className="flex items-center gap-1 text-xs text-slate-500 tabular-nums shrink-0"><Users size={11} /> {viewers.toLocaleString()}</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {chatScope === 'follower' && <Chip>팔로워만</Chip>}
          {chatScope === 'off' && <Chip tone="rose">채팅 꺼짐</Chip>}
          {slow > 0 && chatScope !== 'off' && <Chip>슬로우 {slow}초</Chip>}
          {blockedCount > 0 && <Chip tone="slate">차단 {blockedCount}</Chip>}
          {onOpenSettings && <IconBtn title="채팅 설정" onClick={onOpenSettings}><Settings size={15} /></IconBtn>}
          {variant === 'inline' && onPopout && <IconBtn title="새 창으로 분리" onClick={onPopout}><ExternalLink size={15} /></IconBtn>}
        </div>
      </div>

      {/* 상태 배너 */}
      {status === 'suspended' && <div className="px-3.5 py-1.5 text-[11px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-b border-amber-100 dark:border-amber-900/30 flex items-center gap-1.5 shrink-0"><WifiOff size={12} /> 연결이 끊긴 동안에도 채팅은 계속됩니다 — 시청자에게 상황을 알려주세요</div>}
      {status === 'preparing' && <div className="px-3.5 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800 shrink-0">신호 수신 중 · 곧 라이브 목록에 노출됩니다</div>}
      {online && chatScope === 'off' && <div className="px-3.5 py-1.5 text-[11px] bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-300 border-b border-rose-100 dark:border-rose-900/30 flex items-center gap-1.5 shrink-0"><ShieldOff size={12} /> 채팅 사용 안 함 — 시청자는 채팅할 수 없어요</div>}

      {/* 목록 */}
      <div className="relative flex-1 min-h-0">
        {!online ? (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <div className="text-slate-400">
              <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
              <div className="text-sm font-semibold text-slate-500">방송이 시작되면 시청자 채팅이 여기에 표시됩니다</div>
              <div className="text-xs mt-1">송출 프로그램에서 방송을 시작해 보세요</div>
            </div>
          </div>
        ) : (
          <>
            <div ref={listRef} onScroll={onScroll} className="h-full overflow-y-auto px-3 py-2 space-y-0.5">
              {msgs.map((m) => (
                <div key={m.id} className={`group/msg relative flex items-start gap-1.5 text-[13px] leading-snug rounded-md px-2 py-1 ${m.role === 'creator' ? 'bg-red-50/70 dark:bg-red-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
                  <div className="min-w-0 flex-1 pr-14">
                    {m.badge && <span className="text-[10px] font-bold mr-1 px-1 py-px rounded" style={{ color: m.color, background: `${m.color}22` }}>{m.badge}</span>}
                    <b style={{ color: m.color }}>{m.user}</b>
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="text-slate-800 dark:text-slate-200 break-words">{m.text}</span>
                  </div>
                  {m.role !== 'creator' && (
                    <div className="absolute right-1.5 top-0.5 hidden group-hover/msg:flex items-center gap-0.5 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                      <button title="메시지 삭제" onClick={() => remove(m.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                      <button title="이 채널에서 차단" onClick={() => block(m.user)} className="p-1 text-slate-400 hover:text-red-500"><Ban size={12} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!autoScroll && unseen > 0 && (
              <button onClick={jumpBottom} className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-lg">새 메시지 {unseen}개 ↓</button>
            )}
          </>
        )}
      </div>

      {/* 입력 */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-2 shrink-0">
        {emojiOpen && (
          <div className="grid grid-cols-10 gap-1 mb-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            {EMOJIS.map((e) => <button key={e} onClick={() => setInput((v) => v + e)} className="text-lg hover:scale-125 transition-transform">{e}</button>)}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <button title="이모티콘" onClick={() => setEmojiOpen(!emojiOpen)} disabled={!active} className={`p-2 rounded-lg disabled:opacity-40 ${emojiOpen ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}><Smile size={18} /></button>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} disabled={!active} placeholder={!online ? '방송 중에만 채팅할 수 있어요' : chatScope === 'off' ? '채팅이 꺼져 있어요' : '크리에이터로 채팅 보내기'} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-3.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
          <button onClick={submit} disabled={!active || !input.trim()} className="p-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40"><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function Chip({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'rose' | 'slate' }) {
  const cls = tone === 'rose' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : tone === 'slate' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${cls}`}>{children}</span>;
}
function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick?: () => void }) {
  return <button title={title} onClick={onClick} className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{children}</button>;
}
