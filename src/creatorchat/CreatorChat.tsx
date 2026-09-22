import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Users, MoreVertical, ExternalLink, Pin, X, Megaphone, ShieldAlert, Smile, Plus, Heart, Send, WifiOff, ShieldOff, Vote, HelpCircle, Sparkles, ChevronUp, Info } from 'lucide-react';
import type { CreatorChat as Chat } from './store';
import type { ChatMsg, Sheet as SheetKind } from './types';
import { Chip, IconBtn, MsgRow, UnreadDivider } from './parts';
import { ME, USERS, QUICK_EMOTES, REACTIONS, COMMANDS, GUIDE_TEXT, userOf, FOLLOWER_MIN_OPTIONS } from './data';
import {
  MenuSheet, ToolsSheet, SettingsSheet, ActionsSheet, ParticipationSheet, AccountAgeSheet, SlowSheet, BannedSheet, AutoReviewSheet,
  NoticeSheet, RulesSheet, UserSheet, ParticipantsSheet, HeldSheet, LogSheet, TopFansSheet, StaffSheet, GiftsSheet, ManageSheet, PollEditorSheet, QnASheet,
} from './sheets';

// 크리에이터 채팅 패널 — 방송 관리 우측 컬럼과 분리 팝업이 같은 컴포넌트를 쓴다.
// 상시 노출은 헤더 4개 · 입력줄 4개로 억제하고 나머지는 시트(인패널 드릴인) 뒤에 둔다 (YT §10-1).

export type ChatStatus = 'offline' | 'preparing' | 'live' | 'suspended';
const EMOJIS = ['😀', '😂', '🤣', '😍', '🥹', '😎', '🤔', '😮', '😭', '🥳', '😴', '🙏', '👍', '👏', '🔥', '❤️', '💜', '💙', '✨', '🎉', '🎵', '🍜', '☕', '💰', '🎮', '📌', '⚡', '🌙', '☀️', '🍀'];

export default function CreatorChat({ chat, status, viewers, variant = 'inline', onPopout, onOpenBroadcastSettings }: {
  chat: Chat; status: ChatStatus; viewers: number; variant?: 'inline' | 'popup'; onPopout?: () => void; onOpenBroadcastSettings?: () => void;
}) {
  const online = status !== 'offline';
  const [sheet, setSheet] = useState<SheetKind>({ kind: 'none' });
  const [stack, setStack] = useState<SheetKind[]>([]);
  const go = useCallback((s: SheetKind) => { setStack((st) => (sheet.kind === 'none' ? st : [...st, sheet])); setSheet(s); }, [sheet]);
  const back = useCallback(() => { setStack((st) => { const prev = st[st.length - 1]; setSheet(prev ?? { kind: 'none' }); return st.slice(0, -1); }); }, []);
  const closeAll = () => { setSheet({ kind: 'none' }); setStack([]); };
  const [toastMsg, setToastMsg] = useState('');
  const toast = useCallback((m: string) => { setToastMsg(m); window.setTimeout(() => setToastMsg((c) => (c === m ? '' : c)), 2200); }, []);

  /* 입력 */
  const [input, setInput] = useState('');
  const [msgType, setMsgType] = useState<'chat' | 'notice' | 'warn'>('chat');
  const [replyTo, setReplyTo] = useState<ChatMsg | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [reactOpen, setReactOpen] = useState(false);
  const [viewMenu, setViewMenu] = useState(false);
  const [stripOpen, setStripOpen] = useState(true);
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [ctx, setCtx] = useState<{ m: ChatMsg; top: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const feedWrapRef = useRef<HTMLDivElement>(null);

  /* 스크롤 · 새 메시지 구분선 */
  const [atBottom, setAtBottom] = useState(true);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [unseen, setUnseen] = useState(0);
  const [dividerId, setDividerId] = useState<string | null>(null);
  const lastLenRef = useRef(0);
  const paused = !atBottom || (chat.view.hoverPause && hoverPaused);
  const pausedRef = useRef(paused); pausedRef.current = paused;
  useEffect(() => {
    const el = listRef.current; if (!el) return;
    // 스크롤 위치를 DOM에서 직접 다시 읽는다 — 상태가 한 렌더 늦을 수 있어서
    const domAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    const pausedNow = !domAtBottom || (chat.view.hoverPause && hoverPaused);
    const added = chat.visible.length - lastLenRef.current;
    if (added > 0) {
      if (pausedNow) {
        setUnseen((u) => u + added);
        // 못 본 첫 메시지 앞에 구분선 — 이미 있으면 유지 (Kick §1-1).
        // 단, 가리키던 메시지가 삭제 · 필터로 사라졌으면 새 경계로 옮긴다.
        const firstNew = chat.visible[chat.visible.length - added]?.id ?? null;
        setDividerId((d) => (d && chat.visible.some((m) => m.id === d) ? d : firstNew));
      } else { el.scrollTop = el.scrollHeight; setUnseen(0); }
    }
    lastLenRef.current = chat.visible.length;
  }, [chat.visible, paused, hoverPaused, chat.view.hoverPause]);
  const onScroll = () => { const el = listRef.current; if (!el) return; const b = el.scrollHeight - el.scrollTop - el.clientHeight < 40; setAtBottom(b); if (b) setUnseen(0); };
  const jump = () => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; setAtBottom(true); setUnseen(0); };

  /* c 키 포커스 (SOOP placeholder 규칙) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { const t = e.target as HTMLElement | null; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return; if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); inputRef.current?.focus(); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* 자동완성 — / 명령어 · @ 멘션 (Kick §3-2) */
  const ac = useMemo(() => {
    const m1 = input.match(/^\/(\w*)$/); if (m1) return { kind: 'cmd' as const, items: COMMANDS.filter((c) => c.name.startsWith(m1[1].toLowerCase())).slice(0, 8) };
    const m2 = input.match(/@([^\s@]*)$/); if (m2) return { kind: 'user' as const, items: USERS.filter((u) => u.nick.toLowerCase().includes(m2[1].toLowerCase())).slice(0, 6) };
    return null;
  }, [input]);

  /* 슬래시 명령 실행 — GUI와 이중 경로 */
  const findUser = (nick: string) => USERS.find((u) => u.nick === nick.replace(/^@/, ''));
  const runCommand = (line: string): boolean => {
    const [cmd, ...rest] = line.slice(1).trim().split(/\s+/); const arg = rest.join(' ');
    const onoff = (s: string) => s === 'on';
    switch (cmd) {
      case 'clear': chat.clear(); toast('채팅을 초기화했습니다'); return true;
      case 'unpin': chat.pin(null); toast('고정을 해제했습니다'); return true;
      case 'pin': { const m = [...chat.visible].reverse().find((x) => x.type === 'chat' && x.text.includes(arg)); if (m) { chat.pin(m); toast('메시지를 고정했습니다'); } else toast('일치하는 메시지가 없습니다'); return true; }
      case 'slow': { const [o, s] = rest; const v = onoff(o) ? Number(s || 5) : 0; chat.setPolicy({ slowSec: v }, { kind: '채팅 모드', detail: `/slow → ${v}초` }); toast(v ? `슬로우 모드 ${v}초` : '슬로우 모드 끔'); return true; }
      case 'followonly': { const [o, mnt] = rest; chat.setPolicy({ participation: onoff(o) ? 'follower' : 'all', followerMinMin: Number(mnt || 0) }, { kind: '채팅 모드', detail: `/followonly ${o}` }); toast(onoff(o) ? '팔로워 전용' : '전체 참여'); return true; }
      case 'subonly': chat.setPolicy({ participation: onoff(rest[0]) ? 'sub' : 'all' }, { kind: '채팅 모드', detail: `/subonly ${rest[0]}` }); toast(onoff(rest[0]) ? '구독자 전용' : '전체 참여'); return true;
      case 'emoteonly': chat.setPolicy({ emoteOnly: onoff(rest[0]) }, { kind: '채팅 모드', detail: `/emoteonly ${rest[0]}` }); toast(`이모티콘 전용 ${onoff(rest[0]) ? '켬' : '끔'}`); return true;
      case 'notice': chat.setPolicy({ notice: { on: true, text: arg } }, { kind: '공지', detail: `켬 · "${arg.slice(0, 20)}"` }); toast('공지를 올렸습니다'); return true;
      case 'poll': { const [q, ...o] = arg.split('|').map((s) => s.trim()).filter(Boolean); if (q && o.length >= 2) { chat.startPoll(q, o); toast('투표를 시작했습니다'); } else toast('형식: /poll 질문 | 항목1 | 항목2'); return true; }
      case 'polldelete': chat.endPoll(); toast('투표를 종료했습니다'); return true;
      case 'qna': chat.toggleQna(onoff(rest[0])); toast(`Q&A ${onoff(rest[0]) ? '시작' : '종료'}`); return true;
      case 'title': toast(`방송 제목을 "${arg}"로 바꿉니다 (방송 정보에 반영)`); onOpenBroadcastSettings?.(); return true;
      case 'user': { const u = findUser(rest[0] ?? ''); if (u) go({ kind: 'user', uid: u.uid }); else toast('사용자를 찾을 수 없습니다'); return true; }
      case 'ban': case 'unban': case 'timeout': case 'hide': case 'kick': case 'mod': case 'unmod': {
        const u = findUser(rest[0] ?? ''); if (!u) { toast('사용자를 찾을 수 없습니다'); return true; }
        if (cmd === 'unban' || cmd === 'unmod') { const s = chat.sanctionOf(u.uid, cmd === 'unban' ? 'blacklist' : 'mod')[0] ?? chat.sanctionOf(u.uid, 'ban')[0]; if (s) chat.unsanction(s.id); toast(`${u.nick} ${cmd === 'unban' ? '차단 해제' : '매니저 해임'}`); return true; }
        if (cmd === 'timeout') { const min = Number(rest[1] || 5); chat.sanction(u.uid, 'timeout', { sec: min * 60, reason: rest.slice(2).join(' ') || undefined }); toast(`${u.nick} 타임아웃 ${min}분`); return true; }
        const map = { ban: 'blacklist', hide: 'hide', kick: 'kick', mod: 'mod' } as const;
        chat.sanction(u.uid, map[cmd], { reason: rest.slice(1).join(' ') || undefined }); toast(`${u.nick} ${ { ban: '차단', hide: '숨김', kick: '강제퇴장', mod: '매니저 임명' }[cmd] }`); return true;
      }
      default: return false;
    }
  };
  const submit = () => {
    const t = input.trim(); if (!t) return;
    if (t.startsWith('/')) { if (!runCommand(t)) toast('알 수 없는 명령어입니다 — / 를 입력해 목록을 보세요'); setInput(''); return; }
    chat.send(t, msgType, replyTo?.id); setInput(''); setReplyTo(null); setEmojiOpen(false); setDividerId(null);
  };
  const pickAc = (v: string) => {
    if (ac?.kind === 'cmd') setInput(`/${v} `); else setInput(input.replace(/@[^\s@]*$/, `@${v} `));
    inputRef.current?.focus();
  };

  /* 헤더 값 */
  const p = chat.policy;
  const partShort = p.participation === 'all' ? '전체' : p.participation === 'sub' ? '구독자' : `팔로워${p.followerMinMin ? ` ${FOLLOWER_MIN_OPTIONS.find((o) => o.min === p.followerMinMin)?.label ?? ''}` : ''}`;
  const slowShort = p.slowSec ? (p.slowSec >= 60 ? `${p.slowSec / 60}분` : `${p.slowSec}초`) : '끔';
  const hiddenUids = useMemo(() => new Set(chat.sanctions.filter((s) => s.kind === 'hide').map((s) => s.uid)), [chat.sanctions]);

  /* 시트 렌더 */
  const sp = { chat, go, back, close: closeAll, toast, inline: variant === 'inline', onPopout };
  const sheetEl = (() => {
    switch (sheet.kind) {
      case 'menu': return <MenuSheet {...sp} />;
      case 'tools': return <ToolsSheet {...sp} />;
      case 'settings': return <SettingsSheet {...sp} />;
      case 'actions': return <ActionsSheet {...sp} />;
      case 'participation': return <ParticipationSheet {...sp} />;
      case 'accountAge': return <AccountAgeSheet {...sp} />;
      case 'slow': return <SlowSheet {...sp} />;
      case 'banned': return <BannedSheet {...sp} />;
      case 'autoReview': return <AutoReviewSheet {...sp} />;
      case 'notice': return <NoticeSheet {...sp} />;
      case 'rules': return <RulesSheet {...sp} />;
      case 'user': return <UserSheet {...sp} uid={sheet.uid} />;
      case 'participants': return <ParticipantsSheet {...sp} />;
      case 'held': return <HeldSheet {...sp} />;
      case 'log': return <LogSheet {...sp} />;
      case 'topfans': return <TopFansSheet {...sp} />;
      case 'staff': return <StaffSheet {...sp} />;
      case 'gifts': return <GiftsSheet {...sp} />;
      case 'manage': return <ManageSheet {...sp} />;
      case 'pollEditor': return <PollEditorSheet {...sp} />;
      case 'qna': return <QnASheet {...sp} />;
      default: return null;
    }
  })();

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-[#181a20] text-slate-800 dark:text-slate-200">
      {/* ── 헤더 : 표시 모드 · 시청자 · 참가자 · 메뉴 · 분리 ── */}
      <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="relative">
          {/* 필터가 켜져 있다는 사실을 라벨로 상시 노출 (YT §1-1) */}
          <button onClick={() => setViewMenu((v) => !v)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[13px] font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
            {p.view === 'filtered' ? '주요 채팅' : '실시간 채팅'} <ChevronDown size={13} className="text-slate-400" />
          </button>
          {viewMenu && (
            <div className="absolute left-0 top-full mt-1 z-30 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-1" onMouseLeave={() => setViewMenu(false)}>
              {([['filtered', '주요 채팅', '스팸일 수 있는 메시지 등 일부가 표시되지 않을 수 있습니다.'], ['all', '실시간 채팅', '모든 메시지가 표시됩니다.']] as const).map(([v, l, d]) => (
                <button key={v} onClick={() => { chat.setPolicy({ view: v }); setViewMenu(false); }} className={`w-full text-left rounded-md px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 ${p.view === v ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                  <div className="text-[13px] font-bold">{l}</div><div className="text-[11px] text-slate-500">{d}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {online && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === 'suspended' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />}
        {online && <span className="flex items-center gap-1 text-xs text-slate-500 tabular-nums"><Users size={11} /> {viewers.toLocaleString()}</span>}
        <div className="ml-auto flex items-center gap-0.5">
          {p.leaderboard && <button onClick={() => go({ kind: 'topfans' })} className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100" title="탑 팬 리더보드"><Sparkles size={11} /> 탑 팬</button>}
          <IconBtn title="참가자" onClick={() => go({ kind: 'participants' })} badge={chat.participants.length}><Users size={15} /></IconBtn>
          {/* ⋮ 은 어디서 눌러도 메뉴로 — 다른 시트 위에서 누르면 그 시트를 버리고 메뉴를 연다 */}
          <IconBtn title="채팅 메뉴" onClick={() => { if (sheet.kind === 'menu') closeAll(); else { setStack([]); setSheet({ kind: 'menu' }); } }} active={sheet.kind !== 'none'} badge={chat.held.length || undefined}><MoreVertical size={15} /></IconBtn>
          {variant === 'inline' && onPopout && <IconBtn title="새 창에서 채팅 열기" onClick={onPopout}><ExternalLink size={15} /></IconBtn>}
        </div>
      </div>

      {/* 상태 배너 */}
      {status === 'suspended' && <div className="px-3 py-1.5 text-[11px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-b border-amber-100 dark:border-amber-900/30 flex items-center gap-1.5 shrink-0"><WifiOff size={12} /> 연결이 끊긴 동안에도 채팅은 계속됩니다 — 시청자에게 상황을 알려주세요</div>}
      {status === 'preparing' && <div className="px-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800 shrink-0">신호 수신 중 · 곧 라이브 목록에 노출됩니다</div>}

      {/* ── 본문 (시트가 이 영역을 덮는다 — 헤더는 남긴다) ── */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        {/* 상단 고정 영역: 고정 메시지 · 공지 · 보류 · 투표 · Q&A */}
        {online && (
          <div className="shrink-0 border-b border-slate-100 dark:border-slate-800 empty:hidden">
            {chat.pinned && (
              <div className="flex items-start gap-2 px-3 py-1.5 bg-blue-50/70 dark:bg-blue-900/15 text-[12px]">
                <Pin size={12} className="mt-0.5 text-blue-500 shrink-0" />
                <span className="min-w-0 flex-1 truncate"><b style={{ color: userOf(chat.pinned.uid).color }}>{userOf(chat.pinned.uid).nick}</b><span className="text-slate-400 mx-1">·</span>{chat.pinned.text}</span>
                <button onClick={() => { chat.pin(null); toast('고정을 해제했습니다'); }} className="text-slate-400 hover:text-slate-700" title="고정 해제"><X size={12} /></button>
              </div>
            )}
            {p.notice.on && p.notice.text && (
              <div className="flex items-start gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[12px]">
                <Megaphone size={12} className="mt-0.5 text-slate-500 shrink-0" />
                <span className={`min-w-0 flex-1 text-slate-700 dark:text-slate-200 ${noticeOpen ? 'whitespace-pre-wrap break-words' : 'truncate'}`}>{p.notice.text}</span>
                <button onClick={() => setNoticeOpen((v) => !v)} className="text-slate-400 hover:text-slate-700" title={noticeOpen ? '공지 접기' : '공지 펼치기'}>{noticeOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</button>
              </div>
            )}
            {chat.held.length > 0 && (
              <button onClick={() => go({ kind: 'held' })} className="w-full flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/15 text-[12px] text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/25">
                <ShieldAlert size={12} className="shrink-0" /> <b>보류 {chat.held.length}건</b> — 자동 검토가 붙잡아 둔 메시지 <span className="ml-auto font-bold">검토 →</span>
              </button>
            )}
            {chat.poll && !chat.poll.closed && (
              <button onClick={() => go({ kind: 'pollEditor' })} className="w-full flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 dark:bg-blue-900/15 text-[12px] text-blue-800 dark:text-blue-300 hover:bg-blue-100/70">
                <Vote size={12} className="shrink-0" /> <span className="truncate">🗳️ {chat.poll.question}</span> <span className="ml-auto tabular-nums shrink-0">{chat.poll.options.reduce((a, o) => a + o.votes, 0)}표</span>
              </button>
            )}
            {chat.qna.open && (
              <button onClick={() => go({ kind: 'qna' })} className="w-full flex items-center gap-2 px-3 py-1.5 bg-violet-50/60 dark:bg-violet-900/15 text-[12px] text-violet-800 dark:text-violet-300 hover:bg-violet-100/70">
                <HelpCircle size={12} className="shrink-0" /> Q&A 진행 중 <span className="ml-auto tabular-nums">질문 {chat.qna.questions.filter((q) => !q.answered).length}개 대기</span>
              </button>
            )}
          </div>
        )}

        {/* 피드 */}
        <div ref={feedWrapRef} className="relative flex-1 min-h-0" onMouseEnter={() => setHoverPaused(true)} onMouseLeave={() => setHoverPaused(false)}>
          {!online ? (
            <div className="h-full flex items-center justify-center p-6 text-center text-slate-400">
              <div><Users size={28} className="mx-auto mb-2 opacity-40" /><div className="text-sm font-semibold text-slate-500">방송이 시작되면 시청자 채팅이 여기에 표시됩니다</div><div className="text-xs mt-1">그동안 ⋮ 메뉴에서 공지 · 규칙 · 금칙어를 먼저 준비해 두세요</div></div>
            </div>
          ) : (
            <>
              <div ref={listRef} onScroll={onScroll} className="h-full overflow-y-auto px-1.5 py-1.5">
                {chat.visible.map((m) => (
                  <React.Fragment key={m.id}>
                    {dividerId === m.id && <UnreadDivider />}
                    <MsgRow m={m} view={chat.view} top={p.leaderboard && chat.top3.has(m.uid)} hidden={hiddenUids.has(m.uid)} pinned={chat.pinned?.id === m.id}
                      onPin={() => { if (chat.pinned?.id === m.id) { chat.pin(null); toast('고정 해제'); } else { chat.pin(m); toast('상단에 고정했습니다'); } }}
                      onDelete={() => { chat.remove(m); toast('삭제했습니다'); }}
                      onMore={(el) => { const wrap = feedWrapRef.current?.getBoundingClientRect(); const r = el.getBoundingClientRect(); setCtx({ m, top: wrap ? Math.min(r.bottom - wrap.top + 4, wrap.height - 200) : 40 }); }}
                      onNick={() => go({ kind: 'user', uid: m.uid })} />
                  </React.Fragment>
                ))}
              </div>
              {/* 리액션 오버레이 (YT §2-2) */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {chat.reactions.map((r) => <span key={r.id} className="absolute bottom-2 text-xl animate-[floatUp_1.8s_ease-out_forwards]" style={{ left: `${r.x}%` }}>{r.emoji}</span>)}
              </div>
              {(unseen > 0 || (paused && !atBottom)) && (
                <button onClick={jump} className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11.5px] font-semibold shadow-lg">{unseen > 0 ? `새 메시지 ${unseen}개 ↓` : '최신으로 ↓'}</button>
              )}
              {/* 메시지 ⋮ — 사람에 대한 처분은 여기서 (YT §4-1 순서: 확인 먼저) */}
              {ctx && (
                <div className="absolute right-2 z-30 w-52 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-1 text-[12.5px]" style={{ top: ctx.top }} onMouseLeave={() => setCtx(null)}>
                  <div className="px-2.5 py-1 text-[11px] text-slate-400 truncate"><b style={{ color: userOf(ctx.m.uid).color }}>{userOf(ctx.m.uid).nick}</b> · {ctx.m.text}</div>
                  {[
                    ['채널로 이동 ↗', () => toast(`${userOf(ctx.m.uid).nick} 님 채널을 새 탭으로 엽니다`)],
                    ['답장', () => { setReplyTo(ctx.m); inputRef.current?.focus(); }],
                    ['사용자 카드', () => go({ kind: 'user', uid: ctx.m.uid })],
                    ['타임아웃 5분', () => { chat.sanction(ctx.m.uid, 'timeout', { sec: 300 }); toast(`${userOf(ctx.m.uid).nick} 타임아웃 5분`); }],
                    ['숨기기 (본인은 모름)', () => { chat.sanction(ctx.m.uid, 'hide'); toast('숨김 — 다른 시청자에게 보이지 않습니다'); }],
                    ['음소거 (내 화면만)', () => { chat.sanction(ctx.m.uid, 'mute'); toast('내 화면에서만 가렸습니다'); }],
                  ].map(([l, fn]) => <button key={l as string} onClick={() => { (fn as () => void)(); setCtx(null); }} className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">{l as string}</button>)}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── 채널 조치 스트립 — 현재값 상시 노출, 누르면 해당 드릴인 (Kick §5) ── */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800">
          <button onClick={() => setStripOpen((v) => !v)} className="w-full flex items-center gap-1.5 px-3 py-1 text-[10.5px] text-slate-400 hover:text-slate-600">
            채널 조치 {stripOpen ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
            {!stripOpen && <span className="ml-auto truncate">{partShort} · 슬로우 {slowShort} · 금칙어 {p.bannedWords.length}</span>}
          </button>
          {stripOpen && (
            <div className="flex flex-wrap gap-1 px-2.5 pb-2">
              <StripChip label="참여" value={partShort} onClick={() => go({ kind: 'participation' })} on={p.participation !== 'all'} />
              <StripChip label="슬로우" value={slowShort} onClick={() => go({ kind: 'slow' })} on={p.slowSec > 0} />
              <StripChip label="이모티콘만" value={p.emoteOnly ? '켬' : '끔'} onClick={() => { chat.setPolicy({ emoteOnly: !p.emoteOnly }, { kind: '채팅 모드', detail: `이모티콘 전용 ${!p.emoteOnly ? '켬' : '끔'}` }); toast(`이모티콘 전용 ${!p.emoteOnly ? '켬' : '끔'}`); }} on={p.emoteOnly} toggle />
              <StripChip label="금칙어" value={`${p.bannedWords.length}`} onClick={() => go({ kind: 'banned' })} on={p.bannedWords.length > 0} />
              <StripChip label="검토" value={p.autoReview === 'off' ? '끔' : p.autoReview === 'basic' ? '기본' : '엄격'} onClick={() => go({ kind: 'autoReview' })} on={p.autoReview !== 'off'} />
              <StripChip label="전체" value="›" onClick={() => go({ kind: 'actions' })} />
            </div>
          )}
        </div>

        {/* ── 입력 ── */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 p-2">
          {replyTo && (
            <div className="mb-1.5 flex items-center gap-1.5 rounded-md bg-slate-50 dark:bg-slate-800/60 px-2 py-1 text-[11.5px]"><span className="text-slate-400">↩ 답장</span><b style={{ color: userOf(replyTo.uid).color }}>{userOf(replyTo.uid).nick}</b><span className="truncate text-slate-500">{replyTo.text}</span><button onClick={() => setReplyTo(null)} className="ml-auto text-slate-400"><X size={12} /></button></div>
          )}
          {chat.view.quickEmotes && online && (
            <div className="mb-1.5 flex items-center gap-0.5 overflow-x-auto">{QUICK_EMOTES.map((e) => <button key={e} onClick={() => setInput((v) => v + e)} className="shrink-0 w-7 h-7 rounded-md text-[15px] hover:bg-slate-100 dark:hover:bg-slate-800">{e}</button>)}</div>
          )}
          {emojiOpen && (
            <div className="mb-1.5 grid grid-cols-10 gap-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 p-1.5 max-h-28 overflow-y-auto">{EMOJIS.map((e) => <button key={e} onClick={() => setInput((v) => v + e)} className="h-7 rounded text-[15px] hover:bg-white dark:hover:bg-slate-700">{e}</button>)}</div>
          )}
          {ac && ac.items.length > 0 && (
            <div className="mb-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-1 max-h-44 overflow-y-auto">
              {ac.kind === 'cmd'
                ? ac.items.map((c) => <button key={c.name} onClick={() => pickAc(c.name)} className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 text-[12px]"><span className="font-mono font-bold text-slate-800 dark:text-slate-100">/{c.name}</span> <span className="font-mono text-slate-400">{c.args}</span><span className="block text-[11px] text-slate-500">{c.desc}</span></button>)
                : ac.items.map((u) => <button key={u.uid} onClick={() => pickAc(u.nick)} className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 text-[12px] flex items-center gap-2"><span className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: u.color }}>{u.nick.slice(0, 1)}</span><b style={{ color: u.color }}>@{u.nick}</b></button>)}
            </div>
          )}
          {ac && ac.items.length === 0 && <div className="mb-1.5 px-2.5 py-1.5 text-[11.5px] text-slate-400">{ac.kind === 'cmd' ? '일치하는 명령어가 없습니다' : '일치하는 사용자가 없습니다'}</div>}
          <div className="flex items-center gap-1">
            {/* 운영 · 경고 — 메시지 권위 레벨 (SOOP §2.9) */}
            <div className="flex rounded-md bg-slate-100 dark:bg-slate-800 p-0.5 shrink-0" role="radiogroup" aria-label="메시지 종류">
              {(['chat', 'notice', 'warn'] as const).map((t) => <button key={t} role="radio" aria-checked={msgType === t} onClick={() => setMsgType(t)} title={t === 'chat' ? '일반 채팅' : t === 'notice' ? '운영 메시지 — 파란 띠로 구분' : '경고 메시지 — 빨간 띠로 구분'} className={`px-1.5 py-1 rounded text-[10.5px] font-bold ${msgType === t ? (t === 'warn' ? 'bg-rose-500 text-white' : t === 'notice' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm') : 'text-slate-500'}`}>{t === 'chat' ? '일반' : t === 'notice' ? '운영' : '경고'}</button>)}
            </div>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setReplyTo(null); setEmojiOpen(false); } }}
              disabled={!online} placeholder={online ? '채팅 입력 (c) · /명령어 · @멘션' : '방송 중에만 채팅할 수 있어요'}
              className="min-w-0 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
            <IconBtn title="이모티콘" onClick={() => setEmojiOpen((v) => !v)} active={emojiOpen} disabled={!online} disabledReason="방송 중에만"><Smile size={16} /></IconBtn>
            <IconBtn title="시청자와 소통하기 — 투표 · Q&A · 공지" onClick={() => go({ kind: 'tools' })} disabled={!online} disabledReason="방송 중에만"><Plus size={16} /></IconBtn>
            <div className="relative" onMouseEnter={() => setReactOpen(true)} onMouseLeave={() => setReactOpen(false)}>
              <IconBtn title="리액션 — 글자 없이 한 번에" disabled={!online} disabledReason="방송 중에만" onClick={() => chat.react('❤️')}><Heart size={16} /></IconBtn>
              {reactOpen && online && <div className="absolute bottom-full right-0 mb-1 flex flex-col gap-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-1">{REACTIONS.map((e) => <button key={e} onClick={() => chat.react(e)} className="w-8 h-8 rounded text-[16px] hover:bg-slate-100 dark:hover:bg-slate-700">{e}</button>)}</div>}
            </div>
            <button onClick={submit} disabled={!online || !input.trim()} className={`shrink-0 p-2 rounded-lg text-white disabled:opacity-40 ${msgType === 'warn' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-500 hover:bg-blue-600'}`} title="보내기 (Enter)"><Send size={15} /></button>
          </div>
          {/* 커뮤니티 가이드 — 닫기 없는 상시 고지 (YT §1-2) */}
          <p className="mt-1.5 flex items-start gap-1 text-[10.5px] text-slate-400 leading-snug"><Info size={10} className="mt-px shrink-0" /> {GUIDE_TEXT}</p>
        </div>

        {sheetEl}
      </div>

      {toastMsg && <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 rounded-full bg-slate-900 px-3.5 py-1.5 text-[12px] text-white shadow-xl whitespace-nowrap">{toastMsg}</div>}
      <style>{`@keyframes floatUp{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(-140px);opacity:0}}`}</style>
    </div>
  );
}

function StripChip({ label, value, onClick, on, toggle }: { label: string; value: string; onClick: () => void; on?: boolean; toggle?: boolean }) {
  return (
    <button onClick={onClick} title={toggle ? `${label} 즉시 전환` : `${label} 설정 열기`} className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] ${on ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
      <span className="font-medium">{label}</span><span className={`font-bold tabular-nums ${on ? '' : 'text-slate-700 dark:text-slate-300'}`}>{value}</span>
    </button>
  );
}

export { Chip };
