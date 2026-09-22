import React from 'react';
import { ChevronLeft, ChevronRight, Info, Pin, Trash2, MoreVertical, Coins, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';
import type { ChatMsg, MyView, Role } from './types';
import { ROLE_LABEL, ROLE_TONE, userOf, ME } from './data';

/* ── 작은 조각 ── */
export function Chip({ children, tone = 'blue', title }: { children: React.ReactNode; tone?: 'blue' | 'rose' | 'slate' | 'amber' | 'emerald'; title?: string }) {
  const cls = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
  }[tone];
  return <span title={title} className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${cls}`}>{children}</span>;
}

/** 비활성이면 회색만 두지 않고 사유를 title로 (SOOP 반면교사 · YT #3) */
export function IconBtn({ children, title, onClick, active, disabled, disabledReason, badge }: {
  children: React.ReactNode; title: string; onClick?: () => void; active?: boolean; disabled?: boolean; disabledReason?: string; badge?: number | string;
}) {
  return (
    <button title={disabled && disabledReason ? `${title} — ${disabledReason}` : title} onClick={onClick} disabled={disabled} aria-pressed={active}
      className={`relative p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${active ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      {children}
      {badge !== undefined && badge !== 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">{badge}</span>}
    </button>
  );
}

export function RoleBadge({ role, top }: { role: Role; top?: boolean }) {
  return (
    <>
      {top && <span title="이 방송 탑 팬 (상위 3명)" className="inline-flex items-center gap-0.5 text-[10px] font-bold mr-1 px-1 py-px rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 align-middle"><Sparkles size={9} /> 탑</span>}
      {role !== 'viewer' && <span className={`text-[10px] font-bold mr-1 px-1 py-px rounded align-middle ${ROLE_TONE[role]}`}>{ROLE_LABEL[role]}</span>}
    </>
  );
}

/* ── 시트 셸 — 피드를 덮는 인패널 드릴인 (모달로 페이지를 덮지 않는다 · Kick) ── */
export function Sheet({ title, onBack, children, footer, sub }: { title: string; onBack: () => void; children: React.ReactNode; footer?: React.ReactNode; sub?: string }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white dark:bg-[#181a20]">
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button onClick={onBack} className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="뒤로"><ChevronLeft size={16} /></button>
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{title}</div>
          {sub && <div className="text-[11px] text-slate-500 truncate">{sub}</div>}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      {footer && <div className="border-t border-slate-200 dark:border-slate-800 p-2.5 shrink-0">{footer}</div>}
    </div>
  );
}

/** 섹션 헤더 — "내 화면" / "시청자에게 보이는" 을 반드시 갈라 쓴다 */
export function SectionHead({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="px-3.5 pt-3 pb-1 flex items-baseline gap-2">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{children}</span>
      {note && <span className="text-[10.5px] text-slate-400">{note}</span>}
    </div>
  );
}

/** 값 보유 항목 = `라벨 · 현재값 · >` — 패널을 열지 않아도 상태를 읽는다 (Kick §5) */
export function Row({ label, value, onClick, hint, danger, external }: { label: string; value?: React.ReactNode; onClick?: () => void; hint?: string; danger?: boolean; external?: boolean }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60">
      <span className={`text-[13px] font-medium ${danger ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>{label}</span>
      {hint && <span title={hint} className="text-slate-300 dark:text-slate-600 cursor-help"><Info size={12} /></span>}
      <span className="ml-auto flex items-center gap-1.5 text-[12px] text-slate-500 tabular-nums">{value}{external ? <span className="text-slate-400">↗</span> : <ChevronRight size={14} className="text-slate-400" />}</span>
    </button>
  );
}

/** 이진 설정 = 즉시 토글 (Kick §5 · 컨트롤 타입 일관) */
export function ToggleRow({ label, on, onChange, hint, sub }: { label: string; on: boolean; onChange: (v: boolean) => void; hint?: string; sub?: string }) {
  return (
    <label className="flex items-center gap-2 px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-800 dark:text-slate-100">{label}{hint && <span title={hint} className="text-slate-300 dark:text-slate-600 cursor-help"><Info size={12} /></span>}</span>
        {sub && <span className="block text-[11px] text-slate-500 mt-0.5">{sub}</span>}
      </span>
      <span className="ml-auto shrink-0">
        <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <span className="block w-9 h-5 rounded-full bg-slate-300 dark:bg-slate-600 peer-checked:bg-blue-500 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
      </span>
    </label>
  );
}

/** 수치 선택 = 라디오 목록 + 확인 (드릴다운) */
export function RadioList<T extends string | number>({ options, value, onChange, custom }: { options: { label: string; value: T }[]; value: T; onChange: (v: T) => void; custom?: React.ReactNode }) {
  return (
    <div className="py-1">
      {options.map((o) => (
        <label key={String(o.value)} className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
          <input type="radio" checked={value === o.value} onChange={() => onChange(o.value)} className="w-4 h-4 accent-blue-500" />
          <span className="text-[13px] text-slate-800 dark:text-slate-100">{o.label}</span>
        </label>
      ))}
      {custom}
    </div>
  );
}

export function Btn({ children, onClick, tone = 'gray', disabled, title, full }: { children: React.ReactNode; onClick?: () => void; tone?: 'gray' | 'blue' | 'red'; disabled?: boolean; title?: string; full?: boolean }) {
  const cls = { gray: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50', blue: 'bg-blue-500 hover:bg-blue-600 text-white', red: 'bg-rose-500 hover:bg-rose-600 text-white' }[tone];
  return <button onClick={onClick} disabled={disabled} title={title} className={`${full ? 'w-full' : ''} px-3.5 py-2 rounded-lg text-[13px] font-bold disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}>{children}</button>;
}

export function Counter({ n, max }: { n: number; max: number }) {
  return <span className={`text-[11px] tabular-nums ${n > max ? 'text-rose-500' : 'text-slate-400'}`}>{n}/{max}</span>;
}

/* ── 피드 조각 ── */
const fmtT = (ts: number) => new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

/** 새 메시지 구분선 — 못 본 대화의 시작점을 인라인으로 남긴다 (Kick §1-1) */
export function UnreadDivider() {
  return (
    <div className="flex items-center gap-2 my-1 select-none" role="separator" aria-label="새 메시지">
      <span className="flex-1 h-px bg-emerald-400" />
      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">새 메시지</span>
      <span className="flex-1 h-px bg-emerald-400" />
    </div>
  );
}

export function MsgRow({ m, view, top, hidden, onPin, onDelete, onMore, onNick, pinned }: {
  m: ChatMsg; view: MyView; top?: boolean; hidden?: boolean; pinned?: boolean;
  onPin: () => void; onDelete: () => void; onMore: (el: HTMLElement) => void; onNick: () => void;
}) {
  const u = userOf(m.uid);
  const mine = m.uid === ME.uid;
  const pad = view.spacing === 'tight' ? 'py-0.5' : view.spacing === 'loose' ? 'py-2' : 'py-1';
  const fs = `${(13 * view.fontPct) / 100}px`;

  if (m.type === 'sys' || m.type === 'modlog') {
    return <p className={`px-2 ${pad} text-[11.5px] text-slate-400 ${m.type === 'modlog' ? 'italic' : ''}`} style={{ fontSize: `${(11.5 * view.fontPct) / 100}px` }}>{m.text}</p>;
  }
  if (m.type === 'dono') {
    return (
      <div className={`mx-1 my-1 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-900/10 px-2.5 py-1.5`} style={{ fontSize: fs }}>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300"><Coins size={12} /> 후원 <span className="ml-auto tabular-nums">{(m.amount ?? 0).toLocaleString('ko-KR')}원</span></div>
        <div className="mt-0.5 leading-snug"><RoleBadge role={u.role} top={top} /><button onClick={onNick} className="font-bold hover:underline" style={{ color: u.color }}>{u.nick}</button><span className="text-slate-400 mx-1">·</span><span className="text-slate-800 dark:text-slate-100">{m.text}</span></div>
      </div>
    );
  }
  // 운영 · 경고 — 크리에이터 발화의 권위 레벨을 시각적으로 구분 (SOOP §2.9)
  const typeCls = m.type === 'warn' ? 'bg-rose-50 dark:bg-rose-900/15 border-l-2 border-rose-500' : m.type === 'notice' ? 'bg-blue-50 dark:bg-blue-900/15 border-l-2 border-blue-500' : mine ? 'bg-red-50/60 dark:bg-red-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60';
  return (
    <div className={`group/msg relative flex items-start gap-1.5 rounded-md px-2 ${pad} ${typeCls} ${hidden ? 'opacity-50' : ''}`} style={{ fontSize: fs }}>
      <div className="min-w-0 flex-1 pr-16 leading-snug break-words">
        {view.timestamps && <span className="text-[10px] text-slate-400 tabular-nums mr-1.5">{fmtT(m.ts)}</span>}
        {m.type === 'warn' && <span className="text-[10px] font-bold mr-1 px-1 py-px rounded bg-rose-500 text-white align-middle">경고</span>}
        {m.type === 'notice' && <span className="text-[10px] font-bold mr-1 px-1 py-px rounded bg-blue-500 text-white align-middle">운영</span>}
        {pinned && <Pin size={10} className="inline mr-1 text-blue-500 align-middle" />}
        <RoleBadge role={u.role} top={top} />
        <button onClick={onNick} className="font-bold hover:underline align-middle" style={{ color: u.color }}>{u.nick}</button>
        <span className="text-slate-400 mx-1">·</span>
        <span className="text-slate-800 dark:text-slate-200 align-middle">{m.text}</span>
        {m.original && <span title={`원문: ${m.original}`} className="ml-1 text-[10px] text-slate-400 cursor-help align-middle">(금칙어 치환)</span>}
        {hidden && <span title="이 사용자는 숨김 상태 — 다른 시청자에게 보이지 않고, 본인은 모릅니다" className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-slate-400 align-middle"><EyeOff size={10} /> 숨김</span>}
        {m.held && <span title={`자동 검토 승인됨 · ${m.held.reason}`} className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-emerald-600 align-middle"><ShieldAlert size={10} /> 승인</span>}
      </div>
      {/* hover 빠른 조치 — 되돌리기 쉬운 것(고정 · 삭제)만. 사람에 대한 처분은 ⋮ 뒤로 (Kick §10-10) */}
      {!mine && (
        <div className="absolute right-1.5 top-0.5 hidden group-hover/msg:flex group-focus-within/msg:flex items-center gap-0.5 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
          <button title={pinned ? '고정 해제' : '고정'} onClick={onPin} className={`p-1 ${pinned ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'}`}><Pin size={12} /></button>
          <button title="삭제" onClick={onDelete} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 size={12} /></button>
          <button title="더보기 — 채널로 이동 · 타임아웃 · 숨기기 · 차단" onClick={(e) => onMore(e.currentTarget)} className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white"><MoreVertical size={12} /></button>
        </div>
      )}
    </div>
  );
}
