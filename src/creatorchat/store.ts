// 크리에이터 채팅 상태 — 페이지가 소유하고, 본창 · 팝업이 BroadcastChannel로 동기화한다.
// 시청자 피드는 시간 슬롯으로 결정적으로 생성해 창이 여럿이어도 같은 내용을 본다.
// 정책(금칙어 치환 · 자동 검토 보류 · 참여 자격 · 제재)은 메시지가 "들어오는 시점"에 적용한다.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMsg, LogEntry, LogKind, MyView, Poll, Policy, QnA, Sanction, SanctionKind } from './types';
import { DEFAULT_POLICY, DEFAULT_VIEW, ME, MOD_NICK, POOL, userOf } from './data';

const TICK_MS = 3000;
const MAX_MSGS = 300;
let seq = 0;
const nid = (p = 'm') => `${p}${Date.now().toString(36)}${(++seq).toString(36)}`;

/* ── 정책 적용 ── */
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function applyBanned(text: string, policy: Policy): { text: string; replaced: boolean } {
  if (!policy.bannedWords.length) return { text, replaced: false };
  const re = new RegExp(policy.bannedWords.map(escapeRe).join('|'), 'g');
  const out = text.replace(re, policy.replacement || '***');
  return { text: out, replaced: out !== text };
}
const isGibberish = (t: string) => /(.)\1{14,}/.test(t) || /^[ㄱ-ㅎㅏ-ㅣ]{12,}$/.test(t.replace(/\s/g, ''));
const hasLink = (t: string) => /(https?:\/\/|www\.|open\.kakao|\.com|\.kr)/i.test(t);

function judgeHold(text: string, kind: string | undefined, policy: Policy): ChatMsg['held'] | undefined {
  if (policy.autoReview === 'off') return undefined;
  if (kind === 'spam' || hasLink(text)) return { reason: '광고 · 링크 의심', level: 'basic' };
  if (kind === 'toxic') return { reason: '욕설 · 비속어', level: 'basic' };
  if (policy.autoReview === 'strict' && isGibberish(text)) return { reason: '도배 · 무의미 문자', level: 'strict' };
  return undefined;
}

/** 참여 자격 게이트 — 통과 못 하면 메시지가 아예 들어오지 않는다 */
function passesGate(uid: string, policy: Policy, now: number): boolean {
  const u = userOf(uid);
  if (u.role === 'mod') return true; // 매니저는 게이트 예외
  if (policy.participation === 'follower' && u.followedDays === undefined && u.role !== 'sub') return false;
  if (policy.participation === 'follower' && policy.followerMinMin > 0 && (u.followedDays ?? 0) * 1440 < policy.followerMinMin) return false;
  if (policy.participation === 'sub' && u.subMonths === undefined) return false;
  if (policy.accountAgeHours > 0) {
    const ageH = (now - new Date(u.joinedAt).getTime()) / 36e5;
    if (ageH < policy.accountAgeHours) return false;
  }
  return true;
}

const EMOTE_ONLY_RE = /^[\p{Emoji}\p{Emoji_Presentation}\s]+$/u;

function fromSlot(s: number, policy: Policy): ChatMsg | null {
  const p = POOL[((s % POOL.length) + POOL.length) % POOL.length];
  const ts = s * TICK_MS;
  if (p.kind === 'join') return { id: `f${s}`, uid: p.uid, ts, type: 'sys', text: `🔔 ${userOf(p.uid).nick} 님이 입장했습니다` };
  if (p.kind === 'sub') return { id: `f${s}`, uid: p.uid, ts, type: 'sys', text: `💜 ${userOf(p.uid).nick} 님이 ${userOf(p.uid).subMonths ?? 3}개월 구독했습니다!` };
  if (!passesGate(p.uid, policy, ts)) return null;
  if (policy.emoteOnly && p.kind !== 'dono' && !EMOTE_ONLY_RE.test(p.text)) return null;
  const { text, replaced } = applyBanned(p.text, policy);
  if (p.kind === 'dono') return { id: `f${s}`, uid: p.uid, ts, type: 'dono', text, amount: p.amount, original: replaced ? p.text : undefined };
  return { id: `f${s}`, uid: p.uid, ts, type: 'chat', text, original: replaced ? p.text : undefined, held: judgeHold(p.text, p.kind, policy) };
}

/* ── 창 간 동기화 스냅샷 (크리에이터가 만든 상태만) ── */
type Snap = {
  /** 로컬 행동마다 증가하는 리비전 — 새로 열린 창의 기본값 스냅샷이 기존 창을 덮어쓰지 못하게 한다 */
  rev: number;
  at: number;
  mine: ChatMsg[]; deleted: string[]; approved: string[]; pinnedId: string | null;
  sanctions: Sanction[]; policy: Policy; log: LogEntry[]; poll: Poll | null; qna: QnA;
  staff: { id: string; by: string; text: string; ts: number }[]; clearedBefore: number;
};

export function useCreatorChat(channelId: string, active: boolean) {
  const [feed, setFeed] = useState<ChatMsg[]>([]);
  const [mine, setMine] = useState<ChatMsg[]>([]);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [policy, setPolicyState] = useState<Policy>(DEFAULT_POLICY);
  const [view, setViewState] = useState<MyView>(DEFAULT_VIEW);
  const [log, setLog] = useState<LogEntry[]>(() => {
    const t = Date.now();
    return [
      { id: nid('l'), at: t - 18 * 60000, by: MOD_NICK, kind: '타임아웃', target: 'newbie_9921', detail: '5분 · 반복 도배' },
      { id: nid('l'), at: t - 12 * 60000, by: ME.nick, kind: '공지', target: '공지', detail: '켬 · "오늘 방송은 11시까지!…"' },
      { id: nid('l'), at: t - 6 * 60000, by: MOD_NICK, kind: '삭제', target: 'newbie_9921', detail: '"★무료★ 카톡 오픈채팅…"' },
    ];
  });
  const [poll, setPoll] = useState<Poll | null>(null);
  const [qna, setQna] = useState<QnA>({ open: false, questions: [] });
  const [staff, setStaff] = useState<Snap['staff']>([]);
  const [clearedBefore, setClearedBefore] = useState(0);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [rev, setRev] = useState(0);
  const revRef = useRef(0); revRef.current = rev;
  /** 로컬 행동 = 리비전 +1 (원격보다 항상 크게) */
  const bump = useCallback(() => setRev((r) => Math.max(r, revRef.current) + 1), []);

  const lastSlot = useRef(-1);
  const policyRef = useRef(policy); policyRef.current = policy;
  const bc = useRef<BroadcastChannel | null>(null);
  // 'hello'에 답할 때 마운트 시점 클로저가 아니라 지금 상태를 보내야 한다
  const snapRef = useRef<Snap | null>(null);

  /* 초기 채움 + 결정적 피드 */
  useEffect(() => {
    const now = Math.floor(Date.now() / TICK_MS);
    const seed: ChatMsg[] = [];
    for (let s = now - 9; s <= now; s++) { const m = fromSlot(s, policyRef.current); if (m) seed.push(m); }
    setFeed(seed); lastSlot.current = now;
  }, [channelId]);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      const slot = Math.floor(Date.now() / TICK_MS);
      if (slot <= lastSlot.current) return;
      const add: ChatMsg[] = [];
      for (let s = lastSlot.current + 1; s <= slot; s++) { const m = fromSlot(s, policyRef.current); if (m) add.push(m); }
      lastSlot.current = slot;
      if (add.length) setFeed((f) => [...f, ...add].slice(-MAX_MSGS));
      // 투표 진행 중이면 시청자가 표를 던진다
      setPoll((p) => (p && !p.closed ? { ...p, options: p.options.map((o, i) => ({ ...o, votes: o.votes + (Math.random() < (i === 0 ? 0.5 : 0.35) ? 1 : 0) })) } : p));
    }, 500);
    return () => clearInterval(t);
  }, [active]);

  /* Q&A가 열려 있으면 물음표 메시지를 질문 큐로 */
  useEffect(() => {
    if (!qna.open) return;
    const last = feed[feed.length - 1];
    if (last && last.type === 'chat' && !last.held && /\?|나요|까요/.test(last.text) && !qna.questions.some((q) => q.id === last.id)) {
      setQna((q) => ({ ...q, questions: [...q.questions, { id: last.id, uid: last.uid, text: last.text, answered: false }] }));
    }
  }, [feed, qna.open, qna.questions]);

  /* 동기화 — 크리에이터가 바꾼 상태를 스냅샷으로 보낸다 */
  const snap = useMemo<Snap>(() => ({
    rev, at: Date.now(), mine, deleted: [...deleted], approved: [...approved], pinnedId, sanctions, policy, log, poll, qna, staff, clearedBefore,
  }), [rev, mine, deleted, approved, pinnedId, sanctions, policy, log, poll, qna, staff, clearedBefore]);
  snapRef.current = snap;
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(`toon-creator-chat-${channelId}`);
    bc.current = ch;
    ch.onmessage = (e) => {
      const d = e.data as { type: string; snap?: Snap };
      if (d.type === 'hello') { if (snapRef.current) ch.postMessage({ type: 'snap', snap: snapRef.current }); return; }
      if (d.type !== 'snap' || !d.snap) return;
      const s = d.snap;
      // 집합형 — 새 항목이 없으면 같은 참조를 돌려 재렌더(→ 재전송 루프)를 막는다
      const mergeById = <T extends { id: string }>(cur: T[], inc: T[], sortKey: (t: T) => number) => {
        const ids = new Set(cur.map((x) => x.id)); const add = inc.filter((x) => !ids.has(x.id));
        return add.length ? [...cur, ...add].sort((a, b) => sortKey(a) - sortKey(b)) : cur;
      };
      const mergeSet = (cur: Set<string>, inc: string[]) => { const add = inc.filter((x) => !cur.has(x)); return add.length ? new Set([...cur, ...add]) : cur; };
      setMine((m) => mergeById(m, s.mine, (x) => x.ts));
      setDeleted((x) => mergeSet(x, s.deleted));
      setApproved((x) => mergeSet(x, s.approved));
      setSanctions((x) => mergeById(x, s.sanctions, (y) => y.at));
      setLog((x) => mergeById(x, s.log, (y) => y.at));
      setStaff((x) => mergeById(x, s.staff, (y) => y.ts));
      setClearedBefore((c) => Math.max(c, s.clearedBefore));
      // 객체형(정책 · 고정 · 투표 · Q&A) — 상대가 더 최신 리비전일 때만 받아들인다
      if (s.rev > revRef.current) {
        setPinnedId(s.pinnedId); setPolicyState(s.policy); setPoll(s.poll); setQna(s.qna);
        setRev(s.rev);
      }
    };
    ch.postMessage({ type: 'hello' });
    return () => { ch.close(); bc.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);
  useEffect(() => { bc.current?.postMessage({ type: 'snap', snap }); }, [snap]);

  /* 로그 */
  const addLog = useCallback((kind: LogKind, target: string, detail: string, by: string = ME.nick) => {
    setLog((l) => [...l, { id: nid('l'), at: Date.now(), by, kind, target, detail }].slice(-200));
  }, []);

  /* 크리에이터 행동 */
  const send = useCallback((text: string, type: 'chat' | 'notice' | 'warn' = 'chat', replyTo?: string) => {
    const m: ChatMsg = { id: nid('c'), uid: ME.uid, text, ts: Date.now(), type, replyTo };
    setMine((x) => [...x, m]); bump();
  }, [bump]);
  const remove = useCallback((m: ChatMsg) => {
    setDeleted((d) => new Set(d).add(m.id));
    if (pinnedId === m.id) setPinnedId(null);
    addLog('삭제', userOf(m.uid).nick, `"${m.text.slice(0, 30)}"`); bump();
  }, [addLog, pinnedId, bump]);
  const pin = useCallback((m: ChatMsg | null) => {
    setPinnedId(m ? m.id : null);
    if (m) addLog('고정', userOf(m.uid).nick, `"${m.text.slice(0, 30)}"`); else addLog('고정 해제', '—', '');
    bump();
  }, [addLog, bump]);
  const resolveHeld = useCallback((m: ChatMsg, approve: boolean) => {
    if (approve) { setApproved((a) => new Set(a).add(m.id)); addLog('보류 승인', userOf(m.uid).nick, `"${m.text.slice(0, 30)}"`); }
    else { setDeleted((d) => new Set(d).add(m.id)); addLog('보류 삭제', userOf(m.uid).nick, `${m.held?.reason ?? ''} · "${m.text.slice(0, 30)}"`); }
    bump();
  }, [addLog, bump]);
  const sanction = useCallback((uid: string, kind: SanctionKind, opts?: { sec?: number; reason?: string }) => {
    const s: Sanction = { id: nid('s'), uid, kind, until: opts?.sec ? Date.now() + opts.sec * 1000 : undefined, by: ME.nick, at: Date.now(), reason: opts?.reason };
    setSanctions((x) => [...x, s]);
    const kindLabel: Record<SanctionKind, LogKind> = { timeout: '타임아웃', hide: '숨기기', ban: '채팅금지', kick: '강제퇴장', blacklist: '블랙리스트', mute: '음소거', mod: '매니저' };
    const dur = opts?.sec ? (opts.sec >= 3600 ? `${opts.sec / 3600}시간` : opts.sec >= 60 ? `${opts.sec / 60}분` : `${opts.sec}초`) : '영구';
    addLog(kindLabel[kind], userOf(uid).nick, [kind === 'timeout' ? dur : '', opts?.reason ?? ''].filter(Boolean).join(' · '));
    bump();
    return s;
  }, [addLog, bump]);
  const unsanction = useCallback((id: string) => {
    setSanctions((x) => { const s = x.find((y) => y.id === id); if (s) addLog(s.kind === 'mod' ? '매니저' : '채팅 모드', userOf(s.uid).nick, `${s.kind} 해제`); return x.filter((y) => y.id !== id); });
    bump();
  }, [addLog, bump]);
  const setPolicy = useCallback((patch: Partial<Policy>, logDetail?: { kind: LogKind; detail: string }) => {
    setPolicyState((p) => ({ ...p, ...patch }));
    if (logDetail) addLog(logDetail.kind, '채팅', logDetail.detail);
    bump();
  }, [addLog, bump]);
  const setView = useCallback((patch: Partial<MyView>) => setViewState((v) => ({ ...v, ...patch })), []);
  const clear = useCallback(() => { setClearedBefore(Date.now()); addLog('초기화', '채팅', '전체 메시지 지움'); bump(); }, [addLog, bump]);
  const react = useCallback((emoji: string) => {
    const r = { id: nid('r'), emoji, x: 10 + Math.random() * 80 };
    setReactions((x) => [...x, r]);
    setTimeout(() => setReactions((x) => x.filter((y) => y.id !== r.id)), 1800);
  }, []);
  const startPoll = useCallback((question: string, options: string[]) => { setPoll({ question, options: options.map((label) => ({ label, votes: 0 })), closed: false }); addLog('투표', '투표', `시작 · "${question}"`); bump(); }, [addLog, bump]);
  const endPoll = useCallback(() => {
    setPoll((p) => {
      if (!p) return p;
      const total = p.options.reduce((a, o) => a + o.votes, 0);
      const win = [...p.options].sort((a, b) => b.votes - a.votes)[0];
      setMine((x) => [...x, { id: nid('c'), uid: ME.uid, ts: Date.now(), type: 'notice', text: `🗳️ 투표 결과 — "${win.label}" ${total ? Math.round((win.votes / total) * 100) : 0}% (총 ${total}표)` }]);
      addLog('투표', '투표', `종료 · "${p.question}"`);
      return { ...p, closed: true };
    });
    bump();
  }, [addLog, bump]);
  const toggleQna = useCallback((open: boolean) => { setQna((q) => (open ? { open: true, questions: q.questions } : { open: false, questions: q.questions.filter((x) => x.answered) })); bump(); }, [bump]);
  const answerQ = useCallback((id: string) => { setQna((q) => ({ ...q, questions: q.questions.map((x) => (x.id === id ? { ...x, answered: true } : x)) })); bump(); }, [bump]);
  const sendStaff = useCallback((text: string) => { setStaff((s) => [...s, { id: nid('st'), by: ME.nick, text, ts: Date.now() }]); bump(); }, [bump]);

  /* 파생 */
  const now = Date.now();
  const activeSanctions = useMemo(() => sanctions.filter((s) => !s.until || s.until > now), [sanctions, now]);
  const sanctionOf = useCallback((uid: string, kind?: SanctionKind) => activeSanctions.filter((s) => s.uid === uid && (!kind || s.kind === kind)), [activeSanctions]);
  const isSilenced = useCallback((uid: string) => activeSanctions.some((s) => s.uid === uid && ['timeout', 'ban', 'kick', 'blacklist'].includes(s.kind)), [activeSanctions]);

  const all = useMemo(() => [...feed, ...mine].filter((m) => m.ts >= clearedBefore).sort((a, b) => a.ts - b.ts), [feed, mine, clearedBefore]);
  const held = useMemo(() => all.filter((m) => m.held && !approved.has(m.id) && !deleted.has(m.id)), [all, approved, deleted]);
  /** 화면에 보이는 목록 — 삭제 · 보류 · 제재 · 음소거 · 입장 표시 · 필터 뷰를 적용 */
  const visible = useMemo(() => all.filter((m) => {
    if (deleted.has(m.id)) return false;
    if (m.held && !approved.has(m.id)) return false;
    if (m.type === 'sys' && m.text.startsWith('🔔') && !view.showJoins) return false;
    if (m.type === 'modlog' && !view.showModActivity) return false;
    if (m.uid !== ME.uid && isSilenced(m.uid)) return false;
    if (activeSanctions.some((s) => s.uid === m.uid && s.kind === 'mute')) return false;
    // '주요 채팅'은 저품질(반복 문자)까지 걸러 보여준다 — 라벨로 드러난 필터
    if (policy.view === 'filtered' && m.type === 'chat' && isGibberish(m.text) && !approved.has(m.id)) return false;
    return true;
  }), [all, deleted, approved, view.showJoins, view.showModActivity, isSilenced, activeSanctions, policy.view]);
  const pinned = useMemo(() => (pinnedId ? all.find((m) => m.id === pinnedId) ?? null : null), [all, pinnedId]);
  const gifts = useMemo(() => all.filter((m) => m.type === 'dono' && !deleted.has(m.id)), [all, deleted]);
  const participants = useMemo(() => {
    const seen = new Map<string, { uid: string; count: number; last: number }>();
    for (const m of all) if (m.uid !== ME.uid && m.type !== 'sys') { const e = seen.get(m.uid); seen.set(m.uid, { uid: m.uid, count: (e?.count ?? 0) + 1, last: m.ts }); }
    return [...seen.values()].sort((a, b) => b.last - a.last);
  }, [all]);
  /** 탑 팬 XP — 채팅 10 · 후원 1,000원당 10. 스트림 단위로 리셋 (YT §2-1) */
  const topFans = useMemo(() => {
    const xp = new Map<string, number>();
    for (const m of all) { if (m.uid === ME.uid || deleted.has(m.id)) continue; if (m.type === 'chat') xp.set(m.uid, (xp.get(m.uid) ?? 0) + 10); if (m.type === 'dono') xp.set(m.uid, (xp.get(m.uid) ?? 0) + Math.round((m.amount ?? 0) / 100)); }
    return [...xp.entries()].map(([uid, v]) => ({ uid, xp: v })).sort((a, b) => b.xp - a.xp);
  }, [all, deleted]);
  const top3 = useMemo(() => new Set(topFans.slice(0, 3).map((t) => t.uid)), [topFans]);
  const historyOf = useCallback((uid: string) => all.filter((m) => m.uid === uid && m.type !== 'sys'), [all]);
  const chatRate = participants.length ? Math.round((participants.length / 1204) * 1000) / 10 : 0;

  return {
    visible, held, pinned, gifts, participants, topFans, top3, log, policy, view, poll, qna, staff, reactions, sanctions: activeSanctions, allSanctions: sanctions, chatRate,
    send, remove, pin, resolveHeld, sanction, unsanction, sanctionOf, isSilenced, setPolicy, setView, clear, react, startPoll, endPoll, toggleQna, answerQ, sendStaff, historyOf,
    totalCount: all.length,
  };
}

export type CreatorChat = ReturnType<typeof useCreatorChat>;
