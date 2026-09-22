import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChannelTabs, ChatHeader, ControlBar, Toggle, NoticeBar, PollBox, MessageItem,
  SystemMessage, DonationCard, ScrollAnchor, Gate, GradeSelect, Toast,
} from './parts';
import { ProfileCardModal, ReportModal, BlockListModal, PollEditorModal, CashModal } from './modals';
import { CHANNELS, GRADES, findUser } from './channels';
import { useAutoScroll, useChatFeed, useSlowMode, nextId, SLOW_COOLDOWN } from './hooks';
import { loadStickers, stickerMap } from './emotes';
import type { ChatLine, ChatUser, Grade, Poll } from './types';

// 라이브 채팅 패널 — 채팅 프로토타입 이식본.
// 바깥 aside 컨테이너(폭/테두리/높이)는 ChannelPage가 그대로 들고 있고, 이 컴포넌트는 그 안을 채운다.
// 모달 · 토스트 · 팝아웃은 portal로 body에 붙여 aside 클리핑을 피한다.

const ME: ChatUser = { uid: 'me', nick: '김종윤', color: '#4655e6', badge: [{ c: 'sub', l: '구독 3' }] };

export default function LiveChat({ onHide }: { onHide?: () => void }) {
  /* 설정 토글 7개 */
  const [cleanbot, setCleanbot] = useState(true);
  const [slow, setSlow] = useState(false);
  const [freeze, setFreeze] = useState(false);
  const [mod, setMod] = useState(false);
  const [showJoins, setShowJoins] = useState(true);
  const [big, setBig] = useState(false);
  const [blockListOpen, setBlockListOpen] = useState(false);

  const [grade, setGrade] = useState<Grade>(3);
  const [input, setInput] = useState('');
  const [emoteOpen, setEmoteOpen] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [pollEditor, setPollEditor] = useState<Poll['mode'] | null>(null);
  const [profile, setProfile] = useState<ChatUser | null>(null);
  const [report, setReport] = useState<{ nick: string } | null>(null);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [popped, setPopped] = useState(false);
  const [toast, setToast] = useState('');

  const feed = useChatFeed({ cleanbot, showJoins });
  const { chId, setChId, channel, state, states, push, patch, pushJudged } = feed;
  const slowMode = useSlowMode(slow);
  const inputRef = useRef<HTMLInputElement>(null);

  /* 이모티콘은 무거워서 동적 로드 */
  const [map, setMap] = useState<Map<string, string> | null>(stickerMap());
  useEffect(() => { loadStickers().then(setMap); }, []);
  const [stickers, setStickers] = useState<{ name: string; src: string }[]>([]);
  useEffect(() => {
    if (!emoteOpen || stickers.length) return;
    import('./stickers').then((m) => setStickers(m.STICKERS));
  }, [emoteOpen, stickers.length]);

  const showToast = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast((cur) => (cur === m ? '' : cur)), 2200);
  }, []);

  /* 차단한 유저의 메시지는 숨긴다 */
  const lines = useMemo(
    () => state.lines.filter((l) => !('uid' in l && blocked.has(l.uid))),
    [state.lines, blocked],
  );
  const scroll = useAutoScroll(lines);

  /* c 키로 입력창 포커스 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* 게이트 판정 */
  const frozen = freeze && grade < 3;
  const cooling = slowMode.left > 0;
  const gateText = frozen
    ? '❄️ 채팅이 얼려졌습니다. 구독팬 이상만 참여할 수 있어요. (내 등급을 올려보세요)'
    : cooling
      ? `⏳ 저속모드: ${slowMode.left}초 후에 다시 보낼 수 있어요.`
      : null;

  const send = () => {
    const text = input.trim();
    if (!text || frozen || cooling) return;
    pushJudged(chId, { uid: ME.uid, nick: ME.nick, color: ME.color, badge: ME.badge, text, mine: true });
    setInput('');
    setEmoteOpen(false);
    slowMode.start();
  };

  /* 모더레이션 */
  const nickOf = useCallback(
    (uid: string) => CHANNELS.flatMap((c) => c.users).find((u) => u.uid === uid)?.nick ?? uid,
    [],
  );
  const blockUser = (uid: string, nick: string) => {
    setBlocked((b) => new Set(b).add(uid));
    setProfile(null);
    showToast(`${nick} 님을 차단했습니다`);
  };
  const removeLine = (id: string) => patch(chId, (s) => ({ ...s, lines: s.lines.filter((l) => l.id !== id) }));

  /* 투표 · 승부예측 */
  const startPoll = (mode: Poll['mode'], question: string, options: string[]) => {
    patch(chId, (s) => ({ ...s, poll: { mode, question, options: options.map((label) => ({ label, votes: 0 })), myPick: null, closed: false } }));
    setPollEditor(null);
    showToast(mode === 'vote' ? '투표를 시작했습니다' : '승부예측을 시작했습니다');
  };
  const pickPoll = (i: number) => patch(chId, (s) => {
    if (!s.poll || s.poll.closed) return s;
    const p = s.poll;
    const options = p.options.map((o, k) => {
      if (k === i && p.myPick !== i) return { ...o, votes: o.votes + 1 };
      if (k === p.myPick && p.myPick !== i) return { ...o, votes: Math.max(0, o.votes - 1) };
      return o;
    });
    return { ...s, poll: { ...p, options, myPick: i } };
  });
  const endPoll = () => {
    const p = state.poll;
    if (!p) return;
    const total = p.options.reduce((s, o) => s + o.votes, 0);
    const win = [...p.options].sort((a, b) => b.votes - a.votes)[0];
    const pct = total ? Math.round((win.votes / total) * 100) : 0;
    patch(chId, (s) => ({ ...s, poll: s.poll ? { ...s.poll, closed: true } : null }));
    push(chId, {
      kind: 'sys', id: nextId(),
      text: `${p.mode === 'vote' ? '🗳️ 투표' : '⚔️ 승부예측'} 결과 — "${win.label}" ${pct}% (총 ${total}표)`,
    });
  };

  /* 후원 */
  const sendDono = (amount: number, text: string) => {
    push(chId, { kind: 'dono', id: nextId(), uid: ME.uid, nick: ME.nick, color: ME.color, badge: ME.badge, amount, currency: channel.dono, text });
    setCashOpen(false);
    showToast(`${amount.toLocaleString('ko-KR')}원을 후원했습니다`);
  };

  const panel = (
    <div className="flex flex-col h-full min-h-0 bg-chat-panel text-chat-ink" style={{ ['--chat-cfont' as string]: big ? '17px' : '15px' }}>
      <ChannelTabs channels={CHANNELS} value={chId} onChange={setChId} viewersOf={(id) => states[id].viewers} />
      <ChatHeader streamer={channel.streamer} sub={channel.sub} viewers={state.viewers}
        popped={popped} onPopout={() => setPopped((v) => !v)} onHide={onHide} />

      <ControlBar>
        <Toggle label="클린봇" on={cleanbot} onClick={() => setCleanbot((v) => !v)} />
        <Toggle label="저속모드" on={slow} onClick={() => setSlow((v) => !v)} />
        <Toggle label="얼리기" on={freeze} onClick={() => setFreeze((v) => !v)} />
        <Toggle label="매니저" on={mod} danger onClick={() => setMod((v) => !v)} />
        <Toggle label="입장 표시" on={showJoins} onClick={() => setShowJoins((v) => !v)} />
        <Toggle label={`차단 ${blocked.size || ''}`.trim()} onClick={() => setBlockListOpen(true)} />
        <Toggle label="글자 크게" on={big} onClick={() => setBig((v) => !v)} />
      </ControlBar>

      {state.notice && (
        <NoticeBar notice={state.notice} canEdit={mod}
          onSave={(v) => patch(chId, (s) => ({ ...s, notice: v }))}
          onRemove={() => { patch(chId, (s) => ({ ...s, notice: null })); showToast('공지를 삭제했습니다'); }} />
      )}

      {state.poll && (
        <PollBox poll={state.poll} onPick={pickPoll} onEnd={endPoll}
          onClose={() => patch(chId, (s) => ({ ...s, poll: null }))} />
      )}

      {/* 메시지 리스트 — 패널에서 유일하게 스크롤되는 영역 */}
      <div className="relative flex-1 min-h-0">
        <div ref={scroll.ref} onScroll={scroll.onScroll} className="absolute inset-0 overflow-y-auto px-2 py-2 space-y-1">
          {lines.map((l) => (
            <React.Fragment key={l.id}>
              {l.kind === 'sys' ? <SystemMessage line={l} />
                : l.kind === 'dono' ? <DonationCard line={l} map={map} />
                : (
                  <MessageItem
                    line={l} map={map} mod={mod} revealed={revealed.has(l.id)}
                    onReveal={() => setRevealed((r) => new Set(r).add(l.id))}
                    onNick={() => { const u = findUser(channel, l.uid); if (u) setProfile(u); }}
                    onReport={() => setReport({ nick: l.nick })}
                    onNotice={() => { patch(chId, (s) => ({ ...s, notice: l.text })); showToast('메시지를 공지로 고정했습니다'); }}
                    onDelete={() => { removeLine(l.id); showToast('메시지를 삭제했습니다'); }}
                    onTimeout={() => { removeLine(l.id); showToast(`${l.nick} 님을 타임아웃했습니다`); }}
                  />
                )}
            </React.Fragment>
          ))}
        </div>
        {!scroll.atBottom && scroll.pending > 0 && (
          <ScrollAnchor count={scroll.pending} preview={lines[lines.length - 1] ?? null} onClick={scroll.toBottom} />
        )}
      </div>

      {/* 입력부 */}
      <div className="border-t border-chat-line p-2 shrink-0">
        {gateText && <Gate text={gateText} />}

        {emoteOpen && (
          <div className="mb-2 grid grid-cols-7 gap-1 rounded-lg bg-chat-panel-2 p-2 max-h-40 overflow-y-auto">
            {stickers.length === 0
              ? <span className="col-span-7 py-3 text-center text-[11px] text-chat-ink-3">이모티콘 불러오는 중…</span>
              : stickers.map((s) => (
                <button key={s.name} title={`:${s.name}:`} onClick={() => setInput((v) => `${v}:${s.name}:`)}
                  className="rounded hover:bg-chat-panel-3 p-0.5">
                  <img src={s.src} alt={s.name} className="w-full aspect-square" />
                </button>
              ))}
          </div>
        )}

        <div className="flex items-center gap-1">
          <button title="이모티콘" onClick={() => setEmoteOpen((v) => !v)}
            className={`shrink-0 rounded-md px-1.5 py-1 text-[15px] ${emoteOpen ? 'bg-chat-accent-soft' : 'hover:bg-chat-panel-2'}`}>😊</button>
          <button title={`${channel.dono} 후원`} onClick={() => setCashOpen(true)}
            className="shrink-0 rounded-md px-1.5 py-1 text-[15px] hover:bg-chat-panel-2">💰</button>
          <input
            ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            maxLength={100} disabled={frozen || cooling} placeholder="채팅 입력 (c)"
            className="min-w-0 flex-1 rounded-full border border-chat-line bg-chat-panel-2 px-3 py-1.5 text-[13px] text-chat-ink placeholder:text-chat-ink-3 focus:outline-none focus:border-chat-accent disabled:opacity-50" />
          <span className="shrink-0 w-11 text-right text-[10px] tabular-nums text-chat-ink-3">{input.length}/100</span>
          <button onClick={send} disabled={frozen || cooling || !input.trim()}
            className="shrink-0 rounded-md bg-chat-accent px-2.5 py-1.5 text-[12px] font-bold text-white hover:bg-chat-accent-2 disabled:opacity-40">보내기</button>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <GradeSelect value={grade} onChange={setGrade} options={GRADES} />
          <button onClick={() => setPollEditor('vote')} className="text-[11px] font-bold text-chat-ink-3 hover:text-chat-accent">🗳️ 투표</button>
          <button onClick={() => setPollEditor('bet')} className="text-[11px] font-bold text-chat-ink-3 hover:text-chat-accent">⚔️ 예측</button>
          <span className="ml-auto text-[10.5px] text-chat-ink-3">
            클린봇 {cleanbot ? 'ON' : 'OFF'} · 저속 {slow ? `ON(${SLOW_COOLDOWN}s)` : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {popped
        ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-chat-panel p-6 text-center">
            <p className="text-[12.5px] text-chat-ink-2">채팅을 별도 창으로 분리했습니다.</p>
            <button onClick={() => setPopped(false)} className="rounded-md bg-chat-accent px-3 py-1.5 text-[12px] font-bold text-white hover:bg-chat-accent-2">원위치로 복귀</button>
            {onHide && <button onClick={onHide} className="text-[11px] text-chat-ink-3 hover:text-chat-ink">채팅 숨기기</button>}
          </div>
        )
        : panel}

      {popped && <PopoutWindow onClose={() => setPopped(false)}>{panel}</PopoutWindow>}

      {profile && (
        <ProfileCardModal user={profile} onClose={() => setProfile(null)}
          onBlock={() => blockUser(profile.uid, profile.nick)}
          onReport={() => { setReport({ nick: profile.nick }); setProfile(null); }} />
      )}
      {report && (
        <ReportModal nick={report.nick} onClose={() => setReport(null)}
          onSubmit={(reason) => { setReport(null); showToast(`${report.nick} 님을 신고했습니다 (${reason})`); }} />
      )}
      {blockListOpen && (
        <BlockListModal blocked={[...blocked]} nickOf={nickOf} onClose={() => setBlockListOpen(false)}
          onUnblock={(uid) => { setBlocked((b) => { const n = new Set(b); n.delete(uid); return n; }); showToast(`${nickOf(uid)} 님의 차단을 해제했습니다`); }} />
      )}
      {pollEditor && (
        <PollEditorModal mode={pollEditor} onClose={() => setPollEditor(null)}
          onStart={(q, o) => startPoll(pollEditor, q, o)} />
      )}
      {cashOpen && (
        <CashModal currency={channel.dono} amounts={channel.amts} onClose={() => setCashOpen(false)} onSend={sendDono} />
      )}
      {toast && <Toast msg={toast} />}
    </>
  );
}

/* 채팅 팝업 — body에 붙는 드래그 가능한 플로팅 창 */
function PopoutWindow({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  // 원래 자리(우측 aside)를 덮으면 '원위치로 복귀' 버튼이 가려지므로 화면 가운데쯤에 띄운다.
  const [pos, setPos] = useState(() => ({
    x: Math.max(16, Math.round(window.innerWidth / 2) - 170),
    y: 80,
  }));
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      setPos({
        x: Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - 100),
        y: Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - 60),
      });
    };
    const up = () => { drag.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, []);

  return createPortal(
    <div className="fixed z-[60] w-[340px] h-[560px] flex flex-col rounded-chat border border-chat-line bg-chat-panel shadow-2xl overflow-hidden"
      style={{ left: pos.x, top: pos.y }}>
      <div onPointerDown={(e) => { drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }; }}
        className="flex cursor-move items-center gap-2 border-b border-chat-line bg-chat-panel-2 px-3 py-1.5">
        <span className="text-[11.5px] font-bold text-chat-ink-2">채팅 (분리됨)</span>
        <button onClick={onClose} className="ml-auto text-[12px] text-chat-ink-3 hover:text-chat-ink">✕</button>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>,
    document.body,
  );
}
