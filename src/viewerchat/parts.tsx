import React from 'react';
import { createPortal } from 'react-dom';
import type { Badge, ChatLine, Grade, Poll } from './types';
import { BADGE_LABEL, donoTier, won } from './channels';
import { tokenize, stripEmotes, type Token } from './emotes';

/* ── 뱃지 ── */
const BADGE_VAR: Record<Badge['c'], string> = {
  sup: 'var(--chat-sup)', sub: 'var(--chat-sub)', fan: 'var(--chat-fan)',
  mgr: 'var(--chat-mgr)', bj: 'var(--chat-bj)',
};

export function Badges({ badge }: { badge: Badge[] }) {
  if (!badge.length) return null;
  return (
    <>
      {badge.map((b, i) => (
        <span key={i} title={BADGE_LABEL[b.c] ?? b.c}
          className="inline-block align-middle mr-1 px-1 py-px rounded text-[10px] font-bold leading-[1.4] text-white"
          style={{ background: BADGE_VAR[b.c] }}>
          {b.l}
        </span>
      ))}
    </>
  );
}

/* ── 본문 (이모티콘 치환) ── */
export function Body({ text, map }: { text: string; map: Map<string, string> | null }) {
  const tokens: Token[] = tokenize(text, map);
  return (
    <>
      {tokens.map((t, i) =>
        t.t === 'text'
          ? <span key={i}>{t.v}</span>
          : <img key={i} src={t.src} alt={t.name} title={t.name} className="inline-block align-middle mx-0.5 w-[22px] h-[22px]" />,
      )}
    </>
  );
}

/* ── 채널 탭 ── */
export function ChannelTabs({ channels, value, onChange, viewersOf }: {
  channels: { id: string; name: string }[]; value: string;
  onChange: (id: string) => void; viewersOf: (id: string) => number;
}) {
  return (
    <div className="flex items-stretch border-b border-chat-line shrink-0">
      {channels.map((c) => {
        const on = c.id === value;
        return (
          <button key={c.id} onClick={() => onChange(c.id)}
            className={`flex-1 px-2 py-2 text-[12px] font-bold border-b-2 transition-colors ${
              on ? 'border-chat-accent text-chat-accent bg-chat-accent-soft' : 'border-transparent text-chat-ink-3 hover:text-chat-ink-2 hover:bg-chat-panel-2'}`}>
            <span className="block truncate">{c.name}</span>
            <span className="block text-[10px] font-medium tabular-nums opacity-80">{viewersOf(c.id).toLocaleString('ko-KR')}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── 스트리머 헤더 ── */
export function ChatHeader({ streamer, sub, viewers, onPopout, popped, onHide }: {
  streamer: string; sub: string; viewers: number; onPopout: () => void; popped: boolean; onHide?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-chat-line shrink-0">
      <div className="w-8 h-8 rounded-full shrink-0 bg-chat-accent text-white flex items-center justify-center text-[11px] font-bold">
        {streamer.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-chat-ink truncate">{streamer}</span>
          <span className="shrink-0 px-1 py-px rounded text-[9px] font-bold text-white" style={{ background: 'var(--chat-crit)' }}>LIVE</span>
        </div>
        <div className="text-[11px] text-chat-ink-3 truncate">{sub}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[11px] font-bold text-chat-ink-2 tabular-nums">{viewers.toLocaleString('ko-KR')}</div>
        <div className="flex items-center gap-1.5">
          <button onClick={onPopout} className="text-[10px] text-chat-ink-3 hover:text-chat-accent">
            {popped ? '복귀' : '채팅 팝업'}
          </button>
          {onHide && (
            <button onClick={onHide} title="채팅 숨기기" className="text-[10px] text-chat-ink-3 hover:text-chat-accent">숨기기</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 토글 7개 ── */
export function Toggle({ label, on, onClick, danger }: { label: string; on?: boolean; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} aria-pressed={on}
      className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors ${
        on
          ? danger
            ? 'text-white border-transparent'
            : 'bg-chat-accent-soft border-chat-accent text-chat-accent'
          : 'bg-chat-panel-2 border-chat-line text-chat-ink-3 hover:text-chat-ink-2'
      }`}
      style={on && danger ? { background: 'var(--chat-crit)' } : undefined}>
      {label}
    </button>
  );
}

export function ControlBar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1 px-2.5 py-2 border-b border-chat-line shrink-0">{children}</div>;
}

/* ── 고정 공지 ── */
export function NoticeBar({ notice, canEdit, onSave, onRemove }: {
  notice: string; canEdit: boolean; onSave: (v: string) => void; onRemove: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(notice);
  React.useEffect(() => { setDraft(notice); }, [notice]);

  return (
    <div className="flex items-start gap-1.5 px-2.5 py-2 border-b border-chat-line bg-chat-accent-soft shrink-0">
      <span className="text-[12px] leading-5 shrink-0">📢</span>
      {editing ? (
        <>
          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { onSave(draft); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
            className="flex-1 min-w-0 bg-chat-panel border border-chat-line rounded px-1.5 py-0.5 text-[12px] text-chat-ink focus:outline-none" />
          <button onClick={() => { onSave(draft); setEditing(false); }} className="shrink-0 text-[11px] font-bold text-chat-accent">저장</button>
        </>
      ) : (
        <>
          <p className="flex-1 min-w-0 text-[12px] leading-5 text-chat-ink break-words">{notice}</p>
          {canEdit && (
            <div className="flex shrink-0 gap-1">
              <button title="공지 수정" onClick={() => setEditing(true)} className="text-[11px] hover:opacity-70">✏️</button>
              <button title="공지 삭제" onClick={onRemove} className="text-[11px] text-chat-ink-3 hover:text-chat-crit">✕</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── 투표 · 승부예측 진행 패널 ── */
export function PollBox({ poll, onPick, onClose, onEnd }: {
  poll: Poll; onPick: (i: number) => void; onClose: () => void; onEnd: () => void;
}) {
  const total = poll.options.reduce((s, o) => s + o.votes, 0);
  return (
    <div className="px-2.5 py-2 border-b border-chat-line bg-chat-panel-2 shrink-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[12px] font-bold text-chat-ink">{poll.mode === 'vote' ? '🗳️ 투표' : '⚔️ 승부예측'}</span>
        <span className="text-[11px] text-chat-ink-3">{poll.closed ? '종료' : '진행중'} · 총 {total}표</span>
        <button onClick={onClose} className="ml-auto text-[11px] text-chat-ink-3 hover:text-chat-crit" title="닫기">✕</button>
      </div>
      <p className="text-[12px] font-bold text-chat-ink mb-1.5 break-words">{poll.question}</p>
      <div className="space-y-1">
        {poll.options.map((o, i) => {
          const pct = total ? Math.round((o.votes / total) * 100) : 0;
          const picked = poll.myPick === i;
          return (
            <button key={i} disabled={poll.closed} onClick={() => onPick(i)}
              className={`relative block w-full text-left rounded-md overflow-hidden border px-2 py-1.5 text-[12px] disabled:cursor-default ${
                picked ? 'border-chat-accent' : 'border-chat-line'}`}>
              <span className="absolute inset-y-0 left-0 bg-chat-accent-soft transition-all" style={{ width: `${pct}%` }} />
              <span className="relative flex items-center gap-2">
                <span className="flex-1 min-w-0 truncate font-bold text-chat-ink">{picked ? '✓ ' : ''}{o.label}</span>
                <span className="shrink-0 tabular-nums text-chat-ink-2">{pct}% · {o.votes}표</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[11px] text-chat-ink-3">
          {poll.closed ? '결과가 채팅에 발표되었습니다' : poll.mode === 'vote' ? '항목을 선택해 참여' : '응원할 쪽을 선택하세요'}
        </span>
        {!poll.closed && <button onClick={onEnd} className="ml-auto text-[11px] font-bold text-chat-accent">종료 · 결과</button>}
      </div>
    </div>
  );
}

/* ── 메시지 ── */
export function MessageItem({ line, map, mod, revealed, onReveal, onReport, onNotice, onDelete, onTimeout, onNick }: {
  line: Extract<ChatLine, { kind: 'msg' }>;
  map: Map<string, string> | null;
  mod: boolean;
  revealed: boolean;
  onReveal: () => void;
  onReport: () => void;
  onNotice: () => void;
  onDelete: () => void;
  onTimeout: () => void;
  onNick: () => void;
}) {
  const blinded = !!line.blind && !revealed;
  return (
    <div className="group/msg relative rounded px-1.5 py-[3px] hover:bg-chat-panel-2">
      {blinded ? (
        <div className="flex items-center gap-1.5 rounded px-1.5 py-1 bg-chat-blind-bg">
          <span className="text-[12px] text-chat-blind">클린봇이 가린 메시지 ({line.blind})</span>
          <button onClick={onReveal} className="text-[11px] font-bold text-chat-accent hover:underline">보기</button>
        </div>
      ) : (
        <p className="leading-[1.45] break-words" style={{ fontSize: 'var(--chat-cfont)' }}>
          <Badges badge={line.badge} />
          <button onClick={onNick} className="font-bold hover:underline align-middle" style={{ color: line.color }}>{line.nick}</button>
          <span className="text-chat-ink-3 mx-1">·</span>
          <span className="text-chat-ink align-middle"><Body text={line.text} map={map} /></span>
          {line.blind && <span className="ml-1 text-[10px] text-chat-ink-3">(클린봇 차단 · 나만 보는 중)</span>}
        </p>
      )}
      {!line.mine && (
        <div className="absolute right-1 -top-1 hidden group-hover/msg:flex items-center gap-0.5 rounded border border-chat-line bg-chat-panel shadow-sm">
          <ToolBtn label="🚩 신고" onClick={onReport} />
          {mod && <ToolBtn label="공지" onClick={onNotice} />}
          {mod && <ToolBtn label="삭제" onClick={onDelete} />}
          {mod && <ToolBtn label="타임아웃" onClick={onTimeout} />}
        </div>
      )}
    </div>
  );
}

function ToolBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="px-1.5 py-0.5 text-[10px] font-bold text-chat-ink-2 hover:text-chat-accent whitespace-nowrap">{label}</button>;
}

export function SystemMessage({ line }: { line: Extract<ChatLine, { kind: 'sys' }> }) {
  return (
    <p className="rounded px-2 py-1 text-[11.5px] text-chat-sys bg-chat-sys-bg">{line.text}</p>
  );
}

/* ── 후원 카드 ── */
const DON_VAR = { 1: 'var(--chat-don-a)', 2: 'var(--chat-don-b)', 3: 'var(--chat-don-c)', 4: 'var(--chat-don-d)' } as const;

export function DonationCard({ line, map }: { line: Extract<ChatLine, { kind: 'dono' }>; map: Map<string, string> | null }) {
  const tier = donoTier(line.amount);
  const color = DON_VAR[tier];
  return (
    <div className="rounded-lg overflow-hidden border" style={{ borderColor: color }}>
      <div className="flex items-center gap-1.5 px-2 py-1 text-white" style={{ background: color }}>
        <span className="text-[11px] font-bold">후원</span>
        <span className="text-[10px] opacity-90">{line.currency}</span>
        <span className="ml-auto text-[11px] font-bold tabular-nums">{won(line.amount)}</span>
      </div>
      <div className="px-2 py-1.5 bg-chat-panel-2">
        <div className="flex items-center gap-1 mb-0.5">
          <Badges badge={line.badge} />
          <span className="text-[12px] font-bold" style={{ color: line.color }}>{line.nick}</span>
        </div>
        {line.text && (
          <p className="text-[12.5px] text-chat-ink break-words"><Body text={line.text} map={map} /></p>
        )}
      </div>
    </div>
  );
}

/* ── 새 메시지 앵커 ── */
export function ScrollAnchor({ count, preview, onClick }: { count: number; preview: ChatLine | null; onClick: () => void }) {
  const label = !preview ? '새 메시지'
    : preview.kind === 'msg' ? `${preview.nick}: ${stripEmotes(preview.text)}`
    : preview.kind === 'dono' ? `${preview.nick} 님의 후원`
    : preview.text;
  return (
    <button onClick={onClick}
      className="absolute left-2 right-2 bottom-2 flex items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-bold text-white shadow-lg bg-chat-accent hover:bg-chat-accent-2">
      <span className="shrink-0 rounded-full bg-white/25 px-1.5 tabular-nums">+{count}</span>
      <span className="flex-1 min-w-0 truncate text-left font-medium">{label}</span>
      <span className="shrink-0">▼</span>
    </button>
  );
}

/* ── 게이트 · 입력부 ── */
export function Gate({ text }: { text: string }) {
  return <p className="mb-1.5 rounded-md px-2 py-1 text-[11.5px] bg-chat-panel-3 text-chat-ink-2">{text}</p>;
}

export function GradeSelect({ value, onChange, options }: { value: Grade; onChange: (g: Grade) => void; options: { v: Grade; l: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value) as Grade)}
      aria-label="내 등급"
      className="rounded border border-chat-line bg-chat-panel px-1.5 py-0.5 text-[11px] text-chat-ink-2 focus:outline-none">
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

/* ── 토스트 (portal) ── */
export function Toast({ msg }: { msg: string }) {
  return createPortal(
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] text-white shadow-xl">{msg}</div>,
    document.body,
  );
}

/* ── 모달 셸 (portal) ── */
export function Modal({ title, children, onClose, footer }: {
  title: string; children: React.ReactNode; onClose: () => void; footer?: React.ReactNode;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-chat bg-chat-panel shadow-2xl border border-chat-line" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-chat-line">
          <h3 className="text-[13px] font-bold text-chat-ink">{title}</h3>
          <button onClick={onClose} className="text-chat-ink-3 hover:text-chat-ink">✕</button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-4 py-2.5 border-t border-chat-line">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Btn({ children, onClick, tone = 'gray' }: { children: React.ReactNode; onClick?: () => void; tone?: 'gray' | 'accent' | 'danger' }) {
  const cls = {
    gray: 'bg-chat-panel-2 border border-chat-line text-chat-ink-2 hover:text-chat-ink',
    accent: 'bg-chat-accent border border-transparent text-white hover:bg-chat-accent-2',
    danger: 'border border-transparent text-white',
  }[tone];
  return (
    <button onClick={onClick} className={`rounded-md px-3 py-1.5 text-[12px] font-bold ${cls}`}
      style={tone === 'danger' ? { background: 'var(--chat-crit)' } : undefined}>
      {children}
    </button>
  );
}
