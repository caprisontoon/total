import React from 'react';

// 투네이션 관리자페이지 UI 키트 — 기존 관리자 화면의 시각 언어를 그대로 따른다.
// 파란 라벨 셀 필터표 · 파란 헤더 데이터표 · 컬러 액션 필 · 사각 페이지네이션.

export const AD = {
  brand: '#22356b',      // 사이드바 상단 브랜드 바
  side: '#33549f',       // 사이드바 본문
  sideSearch: '#1c2f63',
  page: '#eef1f8',       // 본문 배경
  label: '#a7bfe8',      // 필터 라벨 셀
  border: '#c5d4ea',
  thead: '#4a7fd4',      // 데이터표 헤더
  tborder: '#c9d6ea',
  link: '#1a6ad4',
  search: '#4a4a4a',     // 검색 버튼
};

/* ── 페이지 머리 ── */
export function PageHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-5">
      <h1 className="flex items-center gap-2 text-[22px] font-bold text-slate-800">
        <span className="w-5 h-5 rounded-full border-2 border-slate-400 text-slate-400 text-[12px] font-bold flex items-center justify-center shrink-0">i</span>
        {title}
      </h1>
      <p className="text-[13px] text-slate-500 mt-1 ml-7">{desc}</p>
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-[4px] shadow-sm p-6 ${className}`}>{children}</div>;
}

/* ── 필터표: 좌측 파란 라벨 셀 + 우측 입력 ── */
export function FilterTable({ rows }: { rows: { label: string; content: React.ReactNode }[] }) {
  return (
    <table className="w-full border-collapse" style={{ border: `1px solid ${AD.border}` }}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <th className="w-[150px] text-left px-4 py-2.5 text-[13px] font-bold text-slate-800 align-middle"
                style={{ background: AD.label, border: `1px solid ${AD.border}` }}>{r.label}</th>
            <td className="px-3 py-2 align-middle" style={{ border: `1px solid ${AD.border}` }}>{r.content}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SearchButton({ onClick, children = '검색' }: { onClick?: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex justify-center my-5">
      <button onClick={onClick} className="px-10 py-2.5 text-[13px] font-bold text-white rounded-[3px] hover:opacity-90 transition-opacity" style={{ background: AD.search }}>{children}</button>
    </div>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void; key?: React.Key }) {
  return (
    <label className="inline-flex items-center gap-1.5 mr-5 text-[13px] text-slate-700 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={onChange} className="w-[15px] h-[15px] accent-[#4a7fd4] cursor-pointer" />
      {label}
    </label>
  );
}
export function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void; key?: React.Key }) {
  return (
    <label className="inline-flex items-center gap-1.5 mr-5 text-[13px] text-slate-700 cursor-pointer select-none">
      <input type="radio" checked={checked} onChange={onChange} className="w-[15px] h-[15px] accent-[#4a7fd4] cursor-pointer" />
      {label}
    </label>
  );
}
export const inputCls = 'border border-slate-300 rounded-[3px] px-3 py-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-[#4a7fd4]';
export function Select({ value, onChange, options, className = '' }: { value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} bg-white ${className}`}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

/* ── 데이터표 ── */
export function TableTools({ children }: { children?: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-2 mb-2">{children}</div>;
}
export function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-600 bg-white border border-slate-300 rounded-[3px] hover:bg-slate-50">{children}</button>
  );
}

export function DataTable({ head, children, empty }: { head: (string | { t: string; w?: string })[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ border: `1px solid ${AD.tborder}` }}>
        <thead>
          <tr>
            {head.map((h, i) => {
              const t = typeof h === 'string' ? h : h.t;
              const w = typeof h === 'string' ? undefined : h.w;
              return <th key={i} style={{ background: AD.thead, border: `1px solid ${AD.tborder}`, width: w }}
                className="px-2.5 py-2 text-[13px] font-bold text-white whitespace-nowrap">{t}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {empty ? <tr><td colSpan={head.length} className="py-10 text-center text-[13px] text-slate-400" style={{ border: `1px solid ${AD.tborder}` }}>조회된 데이터가 없습니다.</td></tr> : children}
        </tbody>
      </table>
    </div>
  );
}
export function Td({ children, className = '', center, colSpan }: { children?: React.ReactNode; className?: string; center?: boolean; colSpan?: number; key?: React.Key }) {
  return <td colSpan={colSpan} style={{ border: `1px solid ${AD.tborder}` }} className={`px-2.5 py-2 text-[13px] text-slate-700 ${center ? 'text-center' : ''} ${className}`}>{children}</td>;
}
export function LinkCell({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="underline hover:no-underline font-medium" style={{ color: AD.link }}>{children}</button>;
}

const PILL: Record<string, string> = {
  pink: 'bg-[#ef5c8a] hover:bg-[#e14b7c]', blue: 'bg-[#3b7dd8] hover:bg-[#3370c8]',
  teal: 'bg-[#20c4a8] hover:bg-[#1cb199]', gray: 'bg-[#8b95a8] hover:bg-[#7c869a]',
  red: 'bg-[#e04747] hover:bg-[#cf3b3b]', amber: 'bg-[#e8952f] hover:bg-[#d78524]',
};
export function Pill({ children, tone = 'blue', onClick, disabled }: { children: React.ReactNode; tone?: keyof typeof PILL | string; onClick?: () => void; disabled?: boolean; key?: React.Key }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-2.5 py-1 text-[12px] font-bold text-white rounded-[3px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${PILL[tone] ?? PILL.blue}`}>
      {children}
    </button>
  );
}

/* 상태 배지 — 색만으로 의미를 전달하지 않도록 항상 라벨을 함께 둔다 */
export function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'green' | 'red' | 'amber' | 'blue' | 'slate'; key?: React.Key }) {
  const m = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200', red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200', blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  }[tone];
  return <span className={`inline-block px-1.5 py-0.5 text-[11px] font-bold rounded border ${m}`}>{children}</span>;
}

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages = Array.from({ length: Math.max(1, total) }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button onClick={() => onChange(Math.max(1, page - 1))} className="w-8 h-8 border border-slate-300 rounded-[3px] bg-white text-slate-500 hover:bg-slate-50 text-[13px]">‹</button>
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-8 h-8 border rounded-[3px] text-[13px] ${p === page ? 'border-[#4a7fd4] text-[#4a7fd4] font-bold bg-white' : 'border-slate-300 text-slate-500 bg-white hover:bg-slate-50'}`}>{p}</button>
      ))}
      <button onClick={() => onChange(Math.min(total, page + 1))} className="w-8 h-8 border border-slate-300 rounded-[3px] bg-white text-slate-500 hover:bg-slate-50 text-[13px]">›</button>
    </div>
  );
}

/* ── 모달 ── */
export function Modal({ title, children, onClose, footer, wide }: { title: string; children: React.ReactNode; onClose: () => void; footer?: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className={`bg-white rounded-[4px] shadow-2xl w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 text-white rounded-t-[4px]" style={{ background: AD.thead }}>
          <h3 className="text-[15px] font-bold">{title}</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">✕</button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
export function ModalBtn({ children, tone = 'gray', onClick }: { children: React.ReactNode; tone?: 'gray' | 'blue' | 'red'; onClick?: () => void }) {
  const m = { gray: 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50', blue: 'bg-[#4a7fd4] text-white hover:bg-[#3f70c0]', red: 'bg-[#e04747] text-white hover:bg-[#cf3b3b]' }[tone];
  return <button onClick={onClick} className={`px-5 py-2 text-[13px] font-bold rounded-[3px] ${m}`}>{children}</button>;
}

/* 상세 정보 표 (모달 내부) */
export function InfoTable({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <table className="w-full border-collapse" style={{ border: `1px solid ${AD.border}` }}>
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={i}>
            <th className="w-[130px] text-left px-3 py-2 text-[12.5px] font-bold text-slate-700 align-top" style={{ background: '#eaf0fa', border: `1px solid ${AD.border}` }}>{k}</th>
            <td className="px-3 py-2 text-[13px] text-slate-700" style={{ border: `1px solid ${AD.border}` }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Toast({ msg }: { msg: string }) {
  return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-[13px] px-4 py-2.5 rounded shadow-xl">{msg}</div>;
}
