import React, { useState } from 'react';
import { Modal, Btn, Badges } from './parts';
import { REPORT_REASONS, BADGE_LABEL } from './channels';
import type { ChatUser, Grade, Poll } from './types';

const GRADE_LABEL: Record<Grade, string> = { 1: '일반', 2: '팔로워', 3: '구독팬', 9: '매니저' };

/* ── 프로필 카드 ── */
export function ProfileCardModal({ user, onClose, onBlock, onReport }: {
  user: ChatUser; onClose: () => void; onBlock: () => void; onReport: () => void;
}) {
  // 뱃지로 등급을 추정한다 (프로토타입과 동일)
  const grade: Grade = user.badge.some((b) => b.c === 'mgr') ? 9
    : user.badge.some((b) => b.c === 'sub' || b.c === 'bj') ? 3
    : user.badge.length ? 2 : 1;
  return (
    <Modal title="프로필" onClose={onClose}
      footer={<><Btn onClick={onReport}>🚩 신고</Btn><Btn tone="danger" onClick={onBlock}>🚫 차단</Btn></>}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full text-white flex items-center justify-center text-[14px] font-bold shrink-0" style={{ background: user.color }}>
          {user.nick.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center flex-wrap gap-1">
            <Badges badge={user.badge} />
            <span className="text-[14px] font-bold" style={{ color: user.color }}>{user.nick}</span>
          </div>
          <div className="text-[12px] text-chat-ink-3 mt-0.5">
            등급 {GRADE_LABEL[grade]}
            {user.badge.length > 0 && ` · ${user.badge.map((b) => BADGE_LABEL[b.c] ?? b.c).join(' · ')}`}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── 신고 ── */
export function ReportModal({ nick, onClose, onSubmit }: { nick: string; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  return (
    <Modal title={`${nick} 님 신고`} onClose={onClose}
      footer={<><Btn onClick={onClose}>취소</Btn><Btn tone="danger" onClick={() => onSubmit(reason)}>신고하기</Btn></>}>
      <p className="mb-2 text-[12px] text-chat-ink-2">신고 사유를 선택해주세요.</p>
      <div className="space-y-1">
        {REPORT_REASONS.map((r) => (
          <label key={r} className="flex items-center gap-2 rounded px-2 py-1.5 text-[12.5px] text-chat-ink cursor-pointer hover:bg-chat-panel-2">
            <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-chat-accent" />
            {r}
          </label>
        ))}
      </div>
    </Modal>
  );
}

/* ── 차단 목록 ── */
export function BlockListModal({ blocked, nickOf, onClose, onUnblock }: {
  blocked: string[]; nickOf: (uid: string) => string; onClose: () => void; onUnblock: (uid: string) => void;
}) {
  return (
    <Modal title="차단 목록" onClose={onClose} footer={<Btn onClick={onClose}>닫기</Btn>}>
      {blocked.length === 0 ? (
        <p className="py-6 text-center text-[12.5px] text-chat-ink-3">차단한 사용자가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-chat-line">
          {blocked.map((uid) => (
            <li key={uid} className="flex items-center gap-2 py-2">
              <span className="flex-1 min-w-0 truncate text-[12.5px] text-chat-ink">{nickOf(uid)}</span>
              <button onClick={() => onUnblock(uid)} className="shrink-0 rounded border border-chat-line px-2 py-0.5 text-[11px] font-bold text-chat-ink-2 hover:text-chat-accent">해제</button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

/* ── 투표 · 승부예측 에디터 ── */
export function PollEditorModal({ mode, onClose, onStart }: {
  mode: Poll['mode']; onClose: () => void; onStart: (question: string, options: string[]) => void;
}) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const valid = question.trim().length > 0 && options.filter((o) => o.trim()).length >= 2;

  const set = (i: number, v: string) => setOptions((o) => o.map((x, k) => (k === i ? v : x)));

  return (
    <Modal title={mode === 'vote' ? '투표 만들기' : '승부예측 만들기'} onClose={onClose}
      footer={<><Btn onClick={onClose}>취소</Btn>
        <Btn tone="accent" onClick={() => valid && onStart(question.trim(), options.map((o) => o.trim()).filter(Boolean))}>시작하기</Btn></>}>
      <label className="block mb-1 text-[12px] font-bold text-chat-ink-2">질문</label>
      <input value={question} onChange={(e) => setQuestion(e.target.value)}
        placeholder={mode === 'vote' ? '무엇을 물어볼까요?' : '어느 쪽이 이길까요?'}
        className="mb-3 w-full rounded border border-chat-line bg-chat-panel px-2 py-1.5 text-[12.5px] text-chat-ink focus:outline-none focus:border-chat-accent" />
      <label className="block mb-1 text-[12px] font-bold text-chat-ink-2">항목</label>
      <div className="space-y-1.5">
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input value={o} onChange={(e) => set(i, e.target.value)} placeholder={`항목 ${i + 1}`}
              className="flex-1 min-w-0 rounded border border-chat-line bg-chat-panel px-2 py-1.5 text-[12.5px] text-chat-ink focus:outline-none focus:border-chat-accent" />
            <button onClick={() => setOptions((x) => (x.length > 2 ? x.filter((_, k) => k !== i) : x))}
              disabled={options.length <= 2} title="항목 삭제"
              className="shrink-0 px-1.5 text-[12px] text-chat-ink-3 hover:text-chat-crit disabled:opacity-30">✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => setOptions((o) => [...o, ''])} disabled={options.length >= 6}
        className="mt-2 text-[12px] font-bold text-chat-accent disabled:opacity-40">＋ 항목 추가</button>
      {!valid && <p className="mt-2 text-[11px] text-chat-ink-3">질문과 항목 2개 이상을 입력하면 시작할 수 있어요.</p>}
    </Modal>
  );
}

/* ── 캐시 후원 ── */
export function CashModal({ currency, amounts, onClose, onSend }: {
  currency: string; amounts: number[]; onClose: () => void; onSend: (amount: number, text: string) => void;
}) {
  const [amount, setAmount] = useState(amounts[0]);
  const [text, setText] = useState('');
  const presets = [...amounts, 50000].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
  return (
    <Modal title={`${currency} 후원`} onClose={onClose}
      footer={<><Btn onClick={onClose}>취소</Btn><Btn tone="accent" onClick={() => onSend(amount, text.trim())}>후원하기</Btn></>}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {presets.map((a) => (
          <button key={a} onClick={() => setAmount(a)}
            className={`rounded-md border px-2.5 py-1.5 text-[12px] font-bold ${
              amount === a ? 'border-chat-accent bg-chat-accent-soft text-chat-accent' : 'border-chat-line text-chat-ink-2 hover:text-chat-ink'}`}>
            {a.toLocaleString('ko-KR')}원
          </button>
        ))}
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} maxLength={100}
        placeholder="후원 메시지 (선택) — :하트: 처럼 이모티콘도 쓸 수 있어요"
        className="w-full rounded border border-chat-line bg-chat-panel px-2 py-1.5 text-[12.5px] text-chat-ink focus:outline-none focus:border-chat-accent" />
    </Modal>
  );
}
