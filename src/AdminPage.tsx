import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, Settings, ArrowUp, Bell } from 'lucide-react';
import { AD, Toast } from './admin/ui';
import {
  LiveMonitor, ChannelAdmin, SessionAdmin, ReportAdmin, ChatAdmin, CategoryAdmin,
  InfraDashboard, GridAdmin, PolicyAdmin, StatsAdmin, NoticeAdmin, AuditAdmin,
} from './admin/screens';

// 투네이션 관리자페이지 — ⑨ 관리자 요구사항 정의서.
// 기존 투네이션 관리자의 UI(네이비 사이드바 · 파란 라벨 필터표 · 파란 헤더 데이터표)를 그대로 따르고,
// 9-2에 따라 '스트리밍' 메뉴 그룹으로 붙는 형태로 구성했다.

type Key =
  | 'live' | 'channel' | 'session' | 'report' | 'chat' | 'category'
  | 'infra' | 'grid' | 'policy' | 'stats' | 'notice' | 'audit';

const MENU: { key: Key; label: string; must: boolean }[] = [
  { key: 'live', label: '라이브 모니터링', must: true },
  { key: 'channel', label: '채널 관리', must: true },
  { key: 'session', label: '방송 회차 관리', must: true },
  { key: 'report', label: '신고 처리', must: true },
  { key: 'chat', label: '채팅 관리', must: false },
  { key: 'category', label: '카테고리 · 태그 관리', must: false },
  { key: 'infra', label: '인프라 대시보드', must: true },
  { key: 'grid', label: '그리드 관리', must: false },
  { key: 'policy', label: '운영 정책 설정', must: true },
  { key: 'stats', label: '통계', must: false },
  { key: 'notice', label: '공지 · 안내', must: false },
  { key: 'audit', label: '감사 로그', must: false },
];

// 9-2: 스트리밍 메뉴는 기존 관리자에 그룹으로 추가된다. 기존 그룹은 문맥을 위해 함께 표기한다.
const LEGACY_GROUPS = ['회원 관리', '후원 관리', '위젯 관리', '정산 관리', '고객문의', '통계 · 리포트', '운영 도구'];

const SCREENS: Record<Key, React.ComponentType<{ notify: (m: string) => void }>> = {
  live: LiveMonitor, channel: ChannelAdmin, session: SessionAdmin, report: ReportAdmin,
  chat: ChatAdmin, category: CategoryAdmin, infra: InfraDashboard, grid: GridAdmin,
  policy: PolicyAdmin, stats: StatsAdmin, notice: NoticeAdmin, audit: AuditAdmin,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const raw = params.get('menu') as Key | null;
  const active: Key = raw && raw in SCREENS ? raw : 'live';
  const [menuKw, setMenuKw] = useState('');
  const [openStreaming, setOpenStreaming] = useState(true);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState(30 * 60); // 자동 로그아웃까지 남은 시간(초)

  useEffect(() => { document.title = '투네이션 관리자페이지'; }, []);
  useEffect(() => {
    const t = setInterval(() => setSession((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? '' : cur)), 3200);
  };

  const filtered = useMemo(() => MENU.filter((m) => !menuKw || m.label.includes(menuKw)), [menuKw]);
  const Screen = SCREENS[active];
  const mm = String(Math.floor(session / 60)).padStart(2, '0');
  const ss = String(session % 60).padStart(2, '0');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: AD.page }}>
      {/* ── 사이드바 ── */}
      <aside className="w-[230px] shrink-0 flex flex-col overflow-hidden" style={{ background: AD.side }}>
        <div className="h-[52px] shrink-0 flex items-center px-4" style={{ background: AD.brand }}>
          <button onClick={() => setParams({ menu: 'live' })} className="text-white text-[15px] font-bold tracking-tight hover:opacity-90">
            투네이션 관리자페이지
          </button>
        </div>

        <div className="px-3 py-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              value={menuKw} onChange={(e) => setMenuKw(e.target.value)} placeholder="메뉴 검색"
              className="w-full pl-8 pr-2 py-1.5 rounded-[3px] text-[12.5px] text-white placeholder:text-white/45 focus:outline-none"
              style={{ background: AD.sideSearch }} />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto pb-6">
          {/* 스트리밍 그룹 — 이번 단계에서 추가되는 메뉴 */}
          <button onClick={() => setOpenStreaming(!openStreaming)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-white text-[13px] font-bold hover:bg-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" /> 스트리밍
            <ChevronDown size={14} className={`ml-auto transition-transform ${openStreaming ? '' : '-rotate-90'}`} />
          </button>
          {openStreaming && (
            <ul>
              {filtered.map((m) => (
                <li key={m.key}>
                  <button onClick={() => setParams({ menu: m.key })}
                    className={`w-full text-left pl-8 pr-3 py-2 text-[12.5px] flex items-center gap-1.5 transition-colors ${
                      active === m.key ? 'bg-white/20 text-white font-bold' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
                    {m.label}
                    {m.must && <span className="text-[10px] text-amber-300" title="1단계 필수">★</span>}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="pl-8 pr-3 py-2 text-[12px] text-white/50">검색 결과가 없습니다.</li>}
            </ul>
          )}

          {/* 기존 관리자 메뉴 그룹 (9-2 — 별도 시스템으로 분리하지 않음) */}
          <div className="mt-2 pt-2 border-t border-white/15">
            {LEGACY_GROUPS.map((g) => (
              <button key={g} onClick={() => notify('기존 관리자 메뉴입니다. 이 프로토타입에서는 스트리밍 그룹만 동작합니다.')}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-white/60 text-[13px] font-bold hover:bg-white/10 hover:text-white/80">
                <span className="w-1.5 h-1.5 rounded-full bg-white/35" /> {g}
                <ChevronDown size={14} className="ml-auto -rotate-90" />
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* ── 본문 ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[52px] shrink-0 bg-white border-b flex items-center gap-3 px-5" style={{ borderColor: AD.border }}>
          <span className="text-[13px] text-slate-500">
            스트리밍 <span className="text-slate-300 mx-1">›</span>
            <b className="text-slate-800">{MENU.find((m) => m.key === active)?.label}</b>
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[12.5px] text-slate-500">자동 로그아웃 <b className="text-slate-700">{mm}:{ss}</b></span>
            <button onClick={() => { setSession(30 * 60); notify('접속 시간을 30분 연장했습니다.'); }}
              className="px-2.5 py-1 text-[12px] text-slate-600 bg-white border border-slate-300 rounded-[3px] hover:bg-slate-50">연장</button>
            <button onClick={() => navigate('/dashboard')}
              className="px-2.5 py-1 text-[12px] text-slate-600 bg-white border border-slate-300 rounded-[3px] hover:bg-slate-50">로그아웃</button>
            <button onClick={() => notify('관리자 환경 설정은 준비 중입니다.')} className="p-1.5 text-slate-400 hover:text-slate-600" aria-label="환경 설정"><Settings size={17} /></button>
            <button onClick={() => setParams({ menu: 'report' })} className="relative p-1.5 text-slate-400 hover:text-slate-600" aria-label="알림">
              <Bell size={17} /><span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: AD.border }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: AD.thead }}>C</div>
              <span className="text-[12.5px] text-slate-700"><b>caprison</b> 님</span>
              <span className="px-1.5 py-0.5 text-[10.5px] font-bold rounded border border-red-200 bg-red-50 text-red-700">슈퍼관리자</span>
            </div>
          </div>
        </header>

        {/* relative: absolute/sr-only 자손이 문서 높이를 늘리지 않도록 가둠 */}
        <main id="admin-scroll" className="relative flex-1 overflow-y-auto p-6">
          <Screen notify={notify} />
          <div className="h-8" />
        </main>
      </div>

      <button onClick={() => document.getElementById('admin-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full text-white shadow-lg flex items-center justify-center hover:opacity-90"
        style={{ background: AD.thead }} aria-label="맨 위로">
        <ArrowUp size={20} />
      </button>

      {toast && <Toast msg={toast} />}
    </div>
  );
}
