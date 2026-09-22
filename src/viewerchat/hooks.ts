// 라이브 채팅 훅 — 피드 시뮬레이션 / 자동 스크롤 / 저속모드 쿨다운.
// 실서비스 연동 시 useChatFeed만 소켓·API로 갈아끼우면 된다.

import { useCallback, useEffect, useRef, useState } from 'react';
import { CHANNELS, findUser } from './channels';
import { judge, newSpamMemory, rememberSpam, type SpamMemory } from './cleanbot';
import type { ChannelState, ChatLine, Channel } from './types';

/** 리스트 상한 — 넘으면 오래된 메시지부터 잘라낸다 (프로토타입 trim) */
const MAX_LINES = 200;
export const SLOW_COOLDOWN = 5;

let seq = 0;
export const nextId = () => `l${++seq}`;

function seedState(ch: Channel): ChannelState {
  return {
    lines: ch.seed.map((s) => {
      const u = findUser(ch, s.uid)!;
      return { kind: 'msg', id: nextId(), uid: u.uid, nick: u.nick, color: u.color, badge: u.badge, text: s.text } as ChatLine;
    }),
    notice: ch.notice,
    viewers: ch.viewers,
    poll: null,
  };
}

export type FeedOptions = {
  cleanbot: boolean;
  showJoins: boolean;
};

/**
 * 채널별 상태를 모두 들고 있다가 탭 전환 시 복원한다.
 * 자동 메시지 생성(simTick)과 시청자수 증감(bumpViewers)도 여기서 돈다.
 */
export function useChatFeed(opts: FeedOptions) {
  const [chId, setChId] = useState(CHANNELS[0].id);
  const [states, setStates] = useState<Record<string, ChannelState>>(() =>
    Object.fromEntries(CHANNELS.map((c) => [c.id, seedState(c)])),
  );
  const memRef = useRef<Record<string, SpamMemory>>(
    Object.fromEntries(CHANNELS.map((c) => [c.id, newSpamMemory()])),
  );
  // 인터벌 콜백이 옛 옵션을 붙잡지 않도록 최신 값을 ref로 들고 간다.
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const chIdRef = useRef(chId);
  chIdRef.current = chId;

  const channel = CHANNELS.find((c) => c.id === chId)!;
  const state = states[chId];

  const push = useCallback((id: string, line: ChatLine) => {
    setStates((prev) => {
      const s = prev[id];
      const lines = [...s.lines, line];
      return { ...prev, [id]: { ...s, lines: lines.length > MAX_LINES ? lines.slice(-MAX_LINES) : lines } };
    });
  }, []);

  const patch = useCallback((id: string, fn: (s: ChannelState) => ChannelState) => {
    setStates((prev) => ({ ...prev, [id]: fn(prev[id]) }));
  }, []);

  /** 클린봇 판정을 거쳐 메시지를 넣는다. 판정은 채널별 스팸 메모리를 사용한다. */
  const pushJudged = useCallback((id: string, base: Omit<Extract<ChatLine, { kind: 'msg' }>, 'kind' | 'id' | 'blind'>) => {
    const mem = memRef.current[id];
    const verdict = optsRef.current.cleanbot ? judge(base.text, base.uid, mem) : ({ verdict: 'pass' } as const);
    memRef.current[id] = rememberSpam(base.text, base.uid, mem);
    push(id, { kind: 'msg', id: nextId(), ...base, blind: verdict.verdict === 'blind' ? verdict.reason : undefined });
  }, [push]);

  /* 자동 메시지 (simTick) — 모든 채널이 계속 돌아 탭 전환 시에도 대화가 이어져 있다.
     보고 있는 채널에 더 자주 넣어야 프로토타입처럼 대화가 살아 있게 보인다. */
  useEffect(() => {
    const t = setInterval(() => {
      const active = CHANNELS.find((c) => c.id === chIdRef.current) ?? CHANNELS[0];
      const ch = Math.random() < 0.6 ? active : CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
      const roll = Math.random();
      // 입장 · 구독 알림이 실제로 눈에 띄도록 비중을 잡았다 (프로토타입의 피드 밀도에 맞춤)
      if (roll < 0.18 && optsRef.current.showJoins) {
        const u = ch.users[Math.floor(Math.random() * ch.users.length)];
        push(ch.id, { kind: 'sys', id: nextId(), text: `🔔 ${u.nick} 님이 입장하였습니다`, join: true });
      } else if (roll >= 0.18 && roll < 0.24) {
        const u = ch.users[Math.floor(Math.random() * ch.users.length)];
        push(ch.id, { kind: 'sys', id: nextId(), text: `💜 ${u.nick} 님이 3개월 구독했습니다!` });
      } else {
        const u = ch.users[Math.floor(Math.random() * ch.users.length)];
        const text = ch.lines[Math.floor(Math.random() * ch.lines.length)];
        const mem = memRef.current[ch.id];
        const v = optsRef.current.cleanbot ? judge(text, u.uid, mem) : ({ verdict: 'pass' } as const);
        memRef.current[ch.id] = rememberSpam(text, u.uid, mem);
        push(ch.id, {
          kind: 'msg', id: nextId(), uid: u.uid, nick: u.nick, color: u.color, badge: u.badge, text,
          blind: v.verdict === 'blind' ? v.reason : undefined,
        });
      }
    }, 1100);
    return () => clearInterval(t);
  }, [push]);

  /* 시청자수 증감 (bumpViewers) */
  useEffect(() => {
    const t = setInterval(() => {
      setStates((prev) => {
        const next = { ...prev };
        for (const c of CHANNELS) {
          const d = Math.round((Math.random() - 0.45) * Math.max(3, c.viewers * 0.004));
          next[c.id] = { ...next[c.id], viewers: Math.max(1, next[c.id].viewers + d) };
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return { chId, setChId, channel, state, states, push, patch, pushJudged };
}

/** 하단 고정 / 앵커 노출 판정 */
export function useAutoScroll(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [pending, setPending] = useState(0);
  const atBottomRef = useRef(true);
  atBottomRef.current = atBottom;

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setAtBottom(bottom);
    if (bottom) setPending(0);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (atBottomRef.current) {
      el.scrollTop = el.scrollHeight;
      setPending(0);
    } else {
      setPending((n) => n + 1);
    }
    // dep(메시지 배열)이 바뀔 때만 동작한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);

  const toBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setAtBottom(true);
    setPending(0);
  }, []);

  return { ref, atBottom, pending, onScroll, toBottom };
}

/** 저속모드 5초 쿨다운 */
export function useSlowMode(enabled: boolean) {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  useEffect(() => { if (!enabled) setLeft(0); }, [enabled]);

  return { left, start: () => { if (enabled) setLeft(SLOW_COOLDOWN); } };
}
