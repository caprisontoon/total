import React, { useMemo, useRef, useState } from 'react';
import {
  Calendar, Download, Info, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, ExternalLink, Coins, Sparkles,
  AlertTriangle, ShieldAlert, WifiOff, Activity, Gauge, Users, Clock, Radio, MessageSquare,
  Tag, Type, LayoutGrid, RotateCcw, TrendingUp, X,
} from 'lucide-react';

// 방송 분석 — 「방송 분석 기능정의서」 17개 항목 기준. 와이어프레임 대신 UX를 새로 설계했다.
// 설계 의도
//  · 목록↔상세를 세로로 쌓지 않고 2단 마스터–디테일로: 행을 눌러도 목록이 시야에서 사라지지 않는다.
//  · 일시중단은 숫자만이 아니라 "언제 끊겼는지"를 시청자 추이 위에 구간으로 겹쳐 보여준다
//    (재접속 유예 90초가 실제로 어떻게 작동했는지 확인하는 유일한 자리).
//  · 지표 정의(중복 제거 · 시간 가중 · 일시중단 포함)를 타일마다 붙여 관리자 통계와의 정의 혼선을 줄인다.
//
// 색 규칙(데이터 시각화 가이드 검증 완료)
//  · 시청자 추이 = 단일 시리즈 → 카테고리 슬롯 1 (#2a78d6 light / #3987e5 dark). 단일 시리즈라 범례 없음.
//  · 종료 사유 · 일시중단 = 상태색 → 반드시 아이콘 + 라벨과 함께. 색만으로 의미를 전달하지 않는다.

const SERIES = '#2a78d6';
const SERIES_DARK = '#3987e5';

type EndReason = 'normal' | 'timeout' | 'forced';
const END_META: Record<EndReason, { label: string; icon: any; cls: string; desc: string }> = {
  normal:  { label: '정상',      icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', desc: '송출 프로그램에서 정상 종료' },
  timeout: { label: '타임아웃',  icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',      desc: '재접속 허용 시간 90초 초과로 자동 종료' },
  forced:  { label: '강제 종료', icon: ShieldAlert,   cls: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',              desc: '운영자 조치로 종료' },
};

type Suspend = { atMin: number; durSec: number; recovered: boolean };
type InfoChange = { atMin: number; field: '제목' | '카테고리' | '태그'; before: string; after: string };
// 후원 이벤트 — 회차 경과 시간(atMin) 기준. 벤치마킹 §5-1 "어떤 순간이 후원을 만들었는가"의 축.
// 다시보기 딥링크는 2단계지만, 경과 시간축과 후원 시각을 잇는 필드는 지금 확보해야 소급이 된다(§10-5).
type Donation = { atMin: number; amount: number; nick: string; kind: '일반' | '영상' | '룰렛' | '미션' };
type Session = {
  id: string; startedAt: string; title: string; category: string; durationMin: number;
  peak: number; avg: number; unique: number; chats: number; end: EndReason; endNote?: string;
  bitrate: number; latency: number; suspends: Suspend[]; changes: InfoChange[]; donations: Donation[]; seed: number;
};

const SESSIONS: Session[] = [
  { id: 's12', startedAt: '2026-09-16 20:03', title: '오늘도 겜방 ㅎㅎ', category: '게임', durationMin: 134, peak: 1502, avg: 612, unique: 3801, chats: 340, end: 'normal', bitrate: 6000, latency: 2.1, seed: 7, donations: [{ atMin: 18, amount: 5000, nick: '방울토마토', kind: '일반' }, { atMin: 61, amount: 10000, nick: '가을하늘', kind: '일반' }, { atMin: 64, amount: 30000, nick: '열혈나나팬', kind: '영상' }, { atMin: 66, amount: 5000, nick: '민트초코', kind: '일반' }, { atMin: 67, amount: 20000, nick: '출근중', kind: '룰렛' }, { atMin: 90, amount: 3000, nick: '밤샘러', kind: '일반' }, { atMin: 121, amount: 50000, nick: '열혈나나팬', kind: '미션' }],
    suspends: [{ atMin: 42, durSec: 38, recovered: true }, { atMin: 97, durSec: 34, recovered: true }],
    changes: [{ atMin: 0, field: '제목', before: '—', after: '오늘도 겜방 ㅎㅎ' }, { atMin: 63, field: '카테고리', before: '토크', after: '게임' }, { atMin: 88, field: '태그', before: '#겜방', after: '#겜방 #신작' }] },
  { id: 's11', startedAt: '2026-09-15 19:55', title: '신작 첫인상', category: '게임', durationMin: 108, peak: 1204, avg: 540, unique: 2910, chats: 285, end: 'normal', bitrate: 5800, latency: 2.3, seed: 3, donations: [{ atMin: 12, amount: 5000, nick: '해방촌주민', kind: '일반' }, { atMin: 44, amount: 10000, nick: '사진사', kind: '일반' }, { atMin: 46, amount: 10000, nick: '자두사랑', kind: '영상' }, { atMin: 95, amount: 5000, nick: '퇴근길', kind: '일반' }],
    suspends: [{ atMin: 70, durSec: 52, recovered: true }],
    changes: [{ atMin: 0, field: '제목', before: '—', after: '신작 첫인상' }] },
  { id: 's10', startedAt: '2026-09-14 21:10', title: '저스트채팅', category: '토크', durationMin: 41, peak: 455, avg: 210, unique: 980, chats: 120, end: 'timeout', endNote: '재접속 허용 시간 90초를 초과해 자동 종료되었습니다.', bitrate: 4200, latency: 3.4, seed: 11, donations: [{ atMin: 9, amount: 3000, nick: '여행덕후', kind: '일반' }],
    suspends: [{ atMin: 22, durSec: 47, recovered: true }, { atMin: 39, durSec: 90, recovered: false }],
    changes: [{ atMin: 0, field: '제목', before: '—', after: '저스트채팅' }] },
  { id: 's09', startedAt: '2026-09-13 20:00', title: '노래 방송', category: '음악', durationMin: 182, peak: 892, avg: 430, unique: 2240, chats: 410, end: 'normal', bitrate: 6000, latency: 2.0, seed: 5, donations: [{ atMin: 30, amount: 10000, nick: '건반요정', kind: '일반' }, { atMin: 74, amount: 5000, nick: '항공권사냥꾼', kind: '일반' }, { atMin: 118, amount: 20000, nick: '배낭러', kind: '영상' }, { atMin: 122, amount: 50000, nick: '유럽가고싶다', kind: '미션' }, { atMin: 125, amount: 10000, nick: '대기중', kind: '일반' }, { atMin: 160, amount: 5000, nick: '여행덕후', kind: '일반' }],
    suspends: [], changes: [{ atMin: 0, field: '제목', before: '—', after: '노래 방송' }, { atMin: 120, field: '태그', before: '#노래', after: '#노래 #신청곡' }] },
  { id: 's08', startedAt: '2026-09-12 19:30', title: '그림 방송', category: '아트', durationMin: 75, peak: 310, avg: 180, unique: 640, chats: 88, end: 'forced', endNote: '운영자 조치 — 정책 위반 신고 접수에 따른 강제 종료', bitrate: 5200, latency: 2.8, seed: 2, donations: [],
    suspends: [{ atMin: 31, durSec: 25, recovered: true }],
    changes: [{ atMin: 0, field: '제목', before: '—', after: '그림 방송' }] },
  { id: 's07', startedAt: '2026-09-10 20:20', title: '엑셀 방송 시즌 오픈', category: '토크', durationMin: 156, peak: 1310, avg: 588, unique: 3120, chats: 512, end: 'normal', bitrate: 6000, latency: 1.9, seed: 13, donations: [{ atMin: 5, amount: 10000, nick: '방울토마토', kind: '일반' }, { atMin: 40, amount: 30000, nick: '열혈나나팬', kind: '룰렛' }, { atMin: 41, amount: 10000, nick: '가을하늘', kind: '일반' }, { atMin: 43, amount: 100000, nick: '코디요정', kind: '미션' }, { atMin: 44, amount: 5000, nick: '지나가던1인', kind: '일반' }, { atMin: 110, amount: 20000, nick: '민트초코', kind: '영상' }, { atMin: 140, amount: 5000, nick: '출근중', kind: '일반' }],
    suspends: [{ atMin: 88, durSec: 41, recovered: true }],
    changes: [{ atMin: 0, field: '제목', before: '—', after: '엑셀 방송 시즌 오픈' }] },
  { id: 's06', startedAt: '2026-09-08 21:00', title: '심야 토크', category: '토크', durationMin: 96, peak: 640, avg: 305, unique: 1480, chats: 196, end: 'normal', bitrate: 5600, latency: 2.4, seed: 8, donations: [{ atMin: 50, amount: 5000, nick: '밤샘러', kind: '일반' }, { atMin: 80, amount: 10000, nick: '가을하늘', kind: '일반' }],
    suspends: [], changes: [{ atMin: 0, field: '제목', before: '—', after: '심야 토크' }] },
  { id: 's05', startedAt: '2026-09-05 19:40', title: '먹방 챌린지', category: '먹방', durationMin: 63, peak: 720, avg: 350, unique: 1620, chats: 240, end: 'normal', bitrate: 5900, latency: 2.2, seed: 4, donations: [{ atMin: 20, amount: 10000, nick: '하나', kind: '일반' }, { atMin: 22, amount: 5000, nick: '카밀마녀', kind: '일반' }, { atMin: 55, amount: 30000, nick: '깨꿈온', kind: '영상' }],
    suspends: [{ atMin: 25, durSec: 30, recovered: true }],
    changes: [{ atMin: 0, field: '제목', before: '—', after: '먹방 챌린지' }] },
];

const PRESETS = [{ d: 7, label: '최근 7일' }, { d: 30, label: '최근 30일' }, { d: 90, label: '최근 90일' }];

// 회차 목록 열 정의 (#17 · KICK 패턴) — 열마다 1줄 정의 + 집계 기준. 용어집은 헤더에서 링크한다.
const COL_DEFS: Record<string, string> = {
  '방송 일시': '서버가 첫 영상 단위를 받은 시각(KST). 송출 프로그램에서 시작을 누른 시각과 몇 초 차이가 날 수 있어요.',
  '제목': '회차 종료 시점의 제목입니다. 방송 중 바꾼 이력은 상세의 "방송 정보 변경"에서 볼 수 있어요.',
  '시간': '시작부터 종료까지의 총 시간. 일시중단(재접속 대기) 구간도 포함합니다.',
  '최고': '회차 중 가장 많았던 동시 시청자 수. 1분 단위 표본의 최댓값입니다.',
  '평균': '동시 시청자의 시간 가중 평균. 일시중단 구간은 0이 아니라 집계에서 빼고 계산합니다.',
  '누적': '회차 동안 한 번 이상 접속한 고유 시청자 수. 같은 사람이 여러 번 들어와도 1로 셉니다.',
  '채팅': '회차 동안 전송된 채팅 메시지 수. 삭제 · 블라인드된 메시지도 포함합니다.',
  '후원': '회차 경과 시간 안에 들어온 후원의 합계(원). 회차 종료 후 들어온 후원은 다음 회차가 아니라 "회차 외"로 집계됩니다.',
  '종료': '정상 · 타임아웃(재접속 90초 초과) · 강제(운영자 조치) 중 하나. 종료 사유는 방송 관리자 감사 로그와 같은 값입니다.',
};
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
const donoSum = (s: Session) => s.donations.reduce((a, d) => a + d.amount, 0);
const INTERVALS = [1, 5, 10]; // 표시 간격(분) — 기능정의서 [협의] 항목

const fmtDur = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const fmtSec = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`);
const nf = (n: number) => n.toLocaleString('ko-KR');

// 회차별 시청자 추이 — seed 기반 결정적 생성(일시중단 구간은 0)
function buildSeries(s: Session, intervalMin: number) {
  const pts: { t: number; v: number | null }[] = [];
  let r = s.seed * 9301 + 49297;
  const rand = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  for (let t = 0; t <= s.durationMin; t += intervalMin) {
    const p = t / s.durationMin;
    const shape = Math.sin(Math.PI * Math.min(1, p * 1.15)) ** 0.65;          // 완만한 상승→피크→하강
    const wobble = 0.9 + rand() * 0.2;
    const down = s.suspends.some((x) => t >= x.atMin && t < x.atMin + x.durSec / 60 + intervalMin);
    pts.push({ t, v: down ? null : Math.max(0, Math.round(s.peak * shape * wobble)) });
  }
  const live = pts.filter((p) => p.v !== null) as { t: number; v: number }[];
  if (live.length) { const i = live.reduce((a, b) => (b.v > a.v ? b : a)); i.v = s.peak; }
  return pts;
}

export default function BroadcastAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [customOpen, setCustomOpen] = useState(false);
  const [from, setFrom] = useState('2026-08-17');
  const [to, setTo] = useState('2026-09-16');
  const [sortKey, setSortKey] = useState<'date' | 'viewers' | 'duration' | 'dono'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedId, setSelectedId] = useState(SESSIONS[0].id);
  const [interval, setIntervalMin] = useState(5);
  const [toast, setToast] = useState<string | null>(null);
  const say = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2000); };

  // 기간 필터 (데모: 최근 N일 = 앞에서 N/15 회차 정도)
  const inRange = useMemo(() => SESSIONS.slice(0, days === 7 ? 3 : days === 30 ? 6 : SESSIONS.length), [days]);

  const rows = useMemo(() => {
    const c = [...inRange];
    c.sort((a, b) => {
      const v = sortKey === 'date' ? a.startedAt.localeCompare(b.startedAt) : sortKey === 'viewers' ? a.peak - b.peak : sortKey === 'dono' ? donoSum(a) - donoSum(b) : a.durationMin - b.durationMin;
      return sortDir === 'asc' ? v : -v;
    });
    return c;
  }, [inRange, sortKey, sortDir]);

  // ① 기간 요약 — 정의는 타일 툴팁에 함께 표기
  const sum = useMemo(() => ({
    count: inRange.length,
    totalMin: inRange.reduce((a, s) => a + s.durationMin, 0),
    dono: inRange.reduce((a, s) => a + donoSum(s), 0),
    donoCount: inRange.reduce((a, s) => a + s.donations.length, 0),
    peak: inRange.length ? Math.max(...inRange.map((s) => s.peak)) : 0,
    avg: Math.round(inRange.reduce((a, s) => a + s.avg * s.durationMin, 0) / Math.max(1, inRange.reduce((a, s) => a + s.durationMin, 0))),
    unique: inRange.reduce((a, s) => a + s.unique, 0),
    watchMin: inRange.reduce((a, s) => a + Math.round(s.avg * s.durationMin), 0),
  }), [inRange]);

  const sel = SESSIONS.find((s) => s.id === selectedId) ?? rows[0];
  const toggleSort = (k: typeof sortKey) => { if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); else { setSortKey(k); setSortDir('desc'); } };

  const exportCsv = () => {
    const head = ['방송 일시', '제목', '카테고리', '방송 시간', '최고 동시 시청자', '평균 동시 시청자', '누적 시청자', '채팅 수', '후원 합계(원)', '후원 건수', '종료 사유'];
    const body = rows.map((s) => [s.startedAt, `"${s.title.replace(/"/g, '""')}"`, s.category, fmtDur(s.durationMin), s.peak, s.avg, s.unique, s.chats, donoSum(s), s.donations.length, END_META[s.end].label]);
    const csv = '﻿' + [head, ...body].map((r) => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    // 앵커를 DOM에 붙여야 download 속성(파일명)이 적용된다.
    // 파일명은 ASCII — 한글 파일명은 일부 브라우저에서 무시돼 확장자 없는 'download'로 저장된다(내용은 한글 유지).
    const a = document.createElement('a');
    a.href = url; a.download = `toonation-broadcast-analytics_${from}_${to}.csv`; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    say(`회차 ${rows.length}건을 CSV로 내보냈습니다`);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* ═══ 헤더: 기간 · 조회 · 내보내기 ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">방송 분석</h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <Info size={12} /> 회차 종료 후 <b className="text-slate-600 dark:text-slate-300">일배치(매일 06:00 KST)로 확정된 값</b>입니다. 방송 중 실시간 수치와는 다를 수 있어요.
            <span className="text-slate-300 dark:text-slate-600">·</span>
            {/* 지표 ⓘ + 용어집 2단 체계 (#17) — 정의서는 이미 있으므로 링크만 잇는다 */}
            <a href="#" onClick={(e) => { e.preventDefault(); say('용어 정의서(스트리밍플랫폼_의사결정로그_용어정의서)로 이동합니다'); }} className="inline-flex items-center gap-0.5 font-semibold text-blue-600 dark:text-blue-400 hover:underline">지표 용어집 <ExternalLink size={11} /></a>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {PRESETS.map((p) => (
              <button key={p.d} onClick={() => { setDays(p.d); setCustomOpen(false); }} className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${days === p.d && !customOpen ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>{p.label}</button>
            ))}
            <button onClick={() => setCustomOpen(!customOpen)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${customOpen ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}><Calendar size={13} /> 직접 지정</button>
          </div>
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"><Download size={15} /> CSV 내보내기</button>
        </div>
      </div>

      {customOpen && (
        <div className="flex items-center gap-2 flex-wrap mb-5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181a20]">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
          <span className="text-slate-400">~</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
          <button onClick={() => say('조회했습니다')} className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold">조회</button>
          <span className="text-xs text-slate-400 ml-auto">최대 조회 범위는 정책 확정 후 적용됩니다</span>
        </div>
      )}

      {/* ═══ ① 기간 요약 ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        <Kpi icon={Radio} label="진행한 방송" value={nf(sum.count)} unit="회" hint="기간 내 종료된 회차 수입니다. 리허설 · 준비 상태에서 끝난 건은 제외됩니다." />
        <Kpi icon={Clock} label="총 방송 시간" value={fmtDur(sum.totalMin)} hint="기간 내 회차 방송 시간의 합계입니다. 일시중단 구간도 포함해 계산합니다." />
        <Kpi icon={TrendingUp} label="최고 동시 시청자" value={nf(sum.peak)} unit="명" hint="기간 내 회차별 최고값 중 가장 큰 값입니다." accent />
        <Kpi icon={Users} label="평균 동시 시청자" value={nf(sum.avg)} unit="명" hint="시간 가중 평균입니다. 긴 방송의 값이 더 크게 반영됩니다." />
        <Kpi icon={Users} label="누적 시청자" value={nf(sum.unique)} unit="명" hint="기간 내 중복을 제거한 시청자 수입니다. 회차 간 중복 제거 여부는 정책 확정 후 적용됩니다." />
        <Kpi icon={Clock} label="총 시청 시간" value={fmtDur(sum.watchMin)} hint="기간 내 전체 시청자의 시청 시간을 모두 더한 값입니다." />
        {/* 투네이션만 가진 축(§5) — 시청자 지표 옆에 후원을 같은 셸로 둔다 */}
        <Kpi icon={Coins} label="방송 중 후원" value={sum.count ? won(sum.dono) : '—'} unit={sum.count ? `${sum.donoCount}건` : undefined} small hint="회차 경과 시간 안에 들어온 후원의 합계입니다. 방송 밖 후원은 후원 관리에서 따로 집계돼요. 정산 금액과는 수수료 차이가 있습니다." />
      </div>

      {/* ═══ ② 회차 목록  |  ③ 회차 상세 (마스터–디테일) ═══ */}
      {/* 후원 열이 늘어 목록에 조금 더 폭을 준다 (9열이 1500px에서 잘리지 않는 최소 비율) */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,1fr)] gap-5 items-start">
        {/* 목록 */}
        <section className="bg-white dark:bg-[#181a20] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">회차 목록 <span className="text-slate-400 font-medium">{rows.length}건</span></h3>
            <span className="text-[11px] text-slate-400">행을 클릭하면 오른쪽에 상세가 표시됩니다</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <Th onClick={() => toggleSort('date')} active={sortKey === 'date'} dir={sortDir} className="text-left pl-4" hint={COL_DEFS['방송 일시']}>방송 일시</Th>
                  <ThPlain className="text-left" hint={COL_DEFS['제목']}>제목</ThPlain>
                  <Th onClick={() => toggleSort('duration')} active={sortKey === 'duration'} dir={sortDir} hint={COL_DEFS['시간']}>시간</Th>
                  <Th onClick={() => toggleSort('viewers')} active={sortKey === 'viewers'} dir={sortDir} hint={COL_DEFS['최고']}>최고</Th>
                  <ThPlain hint={COL_DEFS['평균']}>평균</ThPlain>
                  <ThPlain hint={COL_DEFS['누적']}>누적</ThPlain>
                  <ThPlain hint={COL_DEFS['채팅']}>채팅</ThPlain>
                  <Th onClick={() => toggleSort('dono')} active={sortKey === 'dono'} dir={sortDir} hint={COL_DEFS['후원']}>후원</Th>
                  <ThPlain className="text-left pr-3" hint={COL_DEFS['종료']}>종료</ThPlain>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const on = s.id === sel?.id; const M = END_META[s.end]; const I = M.icon;
                  return (
                    <tr key={s.id} onClick={() => setSelectedId(s.id)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(s.id); } }}
                      className={`cursor-pointer border-b border-slate-50 dark:border-slate-800/60 last:border-0 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${on ? 'bg-blue-50/70 dark:bg-blue-900/15' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                      <td className="py-2.5 pl-4 pr-2 relative whitespace-nowrap">
                        {on && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-500" />}
                        <span className="text-slate-700 dark:text-slate-200 tabular-nums text-[13px]">{s.startedAt.slice(5)}</span>
                      </td>
                      <td className="py-2.5 px-1.5 max-w-[100px]"><span className={`truncate block text-[13px] ${on ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{s.title}</span></td>
                      <td className="py-2.5 px-1.5 text-right tabular-nums text-slate-600 dark:text-slate-300 text-[13px]">{fmtDur(s.durationMin)}</td>
                      <td className="py-2.5 px-1.5 text-right tabular-nums font-semibold text-slate-800 dark:text-slate-100 text-[13px]">{nf(s.peak)}</td>
                      <td className="py-2.5 px-1.5 text-right tabular-nums text-slate-600 dark:text-slate-300 text-[13px]">{nf(s.avg)}</td>
                      <td className="py-2.5 px-1.5 text-right tabular-nums text-slate-600 dark:text-slate-300 text-[13px]">{nf(s.unique)}</td>
                      <td className="py-2.5 px-1.5 text-right tabular-nums text-slate-500 text-[13px]">{nf(s.chats)}</td>
                      <td className={`py-2.5 px-1.5 text-right tabular-nums text-[13px] whitespace-nowrap ${donoSum(s) ? 'font-semibold text-violet-700 dark:text-violet-300' : 'text-slate-400'}`}>{donoSum(s) ? won(donoSum(s)) : '0원'}</td>
                      <td className="py-2.5 px-1.5 pr-3">
                        <span title={M.desc} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap ${M.cls}`}><I size={11} /> {M.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 상세 */}
        {sel && <React.Fragment key={sel.id}><SessionDetail s={sel} interval={interval} setInterval={setIntervalMin} /></React.Fragment>}
      </div>

      {toast && <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-full shadow-xl">{toast}</div>}
    </div>
  );
}

/* ═══════════ ③ 회차 상세 ═══════════ */
function SessionDetail({ s, interval, setInterval }: { s: Session; interval: number; setInterval: (n: number) => void }) {
  const M = END_META[s.end]; const EndIcon = M.icon;
  const [showDono, setShowDono] = useState(true);
  const totalSuspendSec = s.suspends.reduce((a, x) => a + x.durSec, 0);
  const failed = s.suspends.filter((x) => !x.recovered).length;

  return (
    <section className="bg-white dark:bg-[#181a20] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm xl:sticky xl:top-4">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-slate-400 tabular-nums">{s.startedAt} · {fmtDur(s.durationMin)} 방송</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">{s.title}</h3>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold shrink-0 ${M.cls}`}><EndIcon size={12} /> {M.label}</span>
        </div>
        {s.endNote && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">{s.endNote}</p>}
      </div>

      <div className="p-5 space-y-5">
        {/* 시청자 추이 + 일시중단 구간 오버레이 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">시청자 추이</h4>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {INTERVALS.map((m) => (
                <button key={m} onClick={() => setInterval(m)} className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${interval === m ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>{m}분</button>
              ))}
            </div>
          </div>
          <ViewerChart s={s} interval={interval} showDono={showDono} />
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
            {s.suspends.length > 0 && (
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-amber-200 dark:bg-amber-500/30 border border-amber-400/60" /> 일시중단 구간</span>
            )}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={showDono} onChange={(e) => setShowDono(e.target.checked)} className="w-3.5 h-3.5 accent-violet-600" />
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-600 dark:bg-violet-400" /> 후원 시점 표시 <span className="text-slate-400">({s.donations.length}건)</span>
            </label>
          </div>
        </div>

        {/* 후원 타임라인 — "어떤 순간이 후원을 만들었는가"(벤치마킹 §5-1). 4사 중 이 축을 가진 곳이 없다. */}
        <DonationTimeline s={s} interval={interval} />

        {/* 일시중단 이력 */}
        <div className={`rounded-xl border p-4 ${failed ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'}`}>
          <div className="flex items-center gap-1.5 mb-3">
            <WifiOff size={14} className={failed ? 'text-amber-600' : 'text-slate-500'} />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">일시중단 이력</h4>
            <span className="ml-auto text-[11px] text-slate-500">재접속 허용 90초</span>
          </div>
          {s.suspends.length === 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400"><CheckCircle2 size={14} /> 끊김 없이 진행된 회차입니다</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Mini label="발생 횟수" value={`${s.suspends.length}회`} />
                <Mini label="총 중단 시간" value={fmtSec(totalSuspendSec)} />
                <Mini label="재접속" value={failed ? `${s.suspends.length - failed}/${s.suspends.length} 성공` : '전부 성공'} tone={failed ? 'amber' : 'emerald'} />
              </div>
              <ul className="space-y-1.5">
                {s.suspends.map((x, i) => (
                  <li key={i} className="flex items-center gap-2 text-[12px]">
                    <span className="tabular-nums text-slate-500 w-14 shrink-0">{fmtDur(x.atMin)}</span>
                    <span className="tabular-nums text-slate-700 dark:text-slate-200 w-16 shrink-0">{fmtSec(x.durSec)}</span>
                    <span className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><span className={`block h-full rounded-full ${x.recovered ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (x.durSec / 90) * 100)}%` }} /></span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold shrink-0 ${x.recovered ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                      {x.recovered ? <><RotateCcw size={11} /> 재접속</> : <><AlertTriangle size={11} /> 미복귀</>}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* 송출 품질 */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">송출 품질 <span className="text-[11px] font-medium text-slate-400">회차 평균</span></h4>
          <div className="grid grid-cols-2 gap-3">
            <Mini icon={Activity} label="평균 비트레이트" value={`${nf(s.bitrate)} kbps`} />
            <Mini icon={Gauge} label="평균 수신 지연" value={`${s.latency.toFixed(1)}초`} />
          </div>
        </div>

        {/* 방송 정보 이력 */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">방송 정보 이력</h4>
          {s.changes.length <= 1 ? (
            <p className="text-xs text-slate-500">회차 중 변경 내역이 없습니다.</p>
          ) : (
            <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-1.5 space-y-3">
              {s.changes.map((c, i) => {
                const Icon = c.field === '제목' ? Type : c.field === '카테고리' ? LayoutGrid : Tag;
                return (
                  <li key={i} className="pl-4 relative">
                    <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 tabular-nums"><Icon size={11} /> {fmtDur(c.atMin)} · {c.field}</div>
                    <div className="text-[13px] text-slate-700 dark:text-slate-200 mt-0.5">
                      {c.before !== '—' && <><span className="line-through text-slate-400">{c.before}</span> <span className="text-slate-400">→</span> </>}
                      <b>{c.after}</b>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════ 시청자 추이 차트 (단일 시리즈 · 범례 없음 · 크로스헤어 툴팁) ═══════════ */
function ViewerChart({ s, interval, showDono }: { s: Session; interval: number; showDono: boolean }) {
  const pts = useMemo(() => buildSeries(s, interval), [s, interval]);
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const W = 560, H = 190, PL = 44, PR = 12, PT = 14, PB = 26;
  const maxV = Math.max(...pts.map((p) => p.v ?? 0));
  const yMax = Math.ceil(maxV / 250) * 250 || 250;
  const x = (t: number) => PL + (t / s.durationMin) * (W - PL - PR);
  const y = (v: number) => PT + (1 - v / yMax) * (H - PT - PB);

  // 일시중단으로 끊긴 구간은 선을 잇지 않는다 (null 구간 분리)
  const segments: { t: number; v: number }[][] = [];
  let cur: { t: number; v: number }[] = [];
  for (const p of pts) { if (p.v === null) { if (cur.length) segments.push(cur); cur = []; } else cur.push({ t: p.t, v: p.v }); }
  if (cur.length) segments.push(cur);

  const peak = pts.reduce((a, p) => ((p.v ?? -1) > (a?.v ?? -1) ? p : a), pts[0]) as { t: number; v: number };
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(yMax * f));
  const xTicks = Array.from({ length: 5 }, (_, i) => Math.round((s.durationMin / 4) * i));

  const onMove = (e: React.MouseEvent) => {
    const r = wrapRef.current?.getBoundingClientRect(); if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    const t = ((px - PL) / (W - PL - PR)) * s.durationMin;
    const near = pts.reduce((a, p) => (Math.abs(p.t - t) < Math.abs(a.t - t) ? p : a), pts[0]);
    setHover(near.t);
  };
  const hp = hover !== null ? pts.find((p) => p.t === hover) : null;
  const inSuspend = hp ? s.suspends.find((x) => hp.t >= x.atMin && hp.t < x.atMin + x.durSec / 60 + interval) : undefined;
  // 호버 시점의 표본 구간(±interval/2) 안에 들어온 후원
  const hpDonos = hp && showDono ? s.donations.filter((d) => Math.abs(d.atMin - hp.t) <= interval / 2) : [];
  // 후원 시점의 시청자 값 — 마커를 선 위에 얹기 위해 가장 가까운 표본을 찾는다
  const vAt = (t: number) => { const near = pts.reduce((a, p) => (Math.abs(p.t - t) < Math.abs(a.t - t) ? p : a), pts[0]); return near.v; };
  const donoR = (amt: number) => (amt >= 50000 ? 6 : amt >= 10000 ? 4.5 : 3.5);

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)} className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#15171c] p-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={`${s.title} 회차의 시간대별 동시 시청자 추이`}>
        {/* 그리드 — 실선 헤어라인, 배경보다 한 단계만 진하게 */}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" />
            <text x={PL - 7} y={y(v) + 3.5} textAnchor="end" className="fill-slate-400 text-[9px]" style={{ fontVariantNumeric: 'tabular-nums' }}>{v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}</text>
          </g>
        ))}
        {/* 일시중단 구간 밴드 (상태색 · 라벨 동반) */}
        {s.suspends.map((sp, i) => {
          const a = x(sp.atMin), b = x(Math.min(s.durationMin, sp.atMin + sp.durSec / 60 + interval));
          return (
            <g key={i}>
              <rect x={a} y={PT} width={Math.max(3, b - a)} height={H - PT - PB} className="fill-amber-200/70 dark:fill-amber-500/25" />
              <line x1={a} x2={a} y1={PT} y2={H - PB} className="stroke-amber-500" strokeWidth="1" />
            </g>
          );
        })}
        {/* 라인 — 2px, 단일 시리즈 */}
        {segments.map((seg, i) => (
          <path key={i} d={seg.map((p, j) => `${j ? 'L' : 'M'}${x(p.t)},${y(p.v)}`).join(' ')} fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="stroke-[#2a78d6] dark:stroke-[#3987e5]" />
        ))}
        {/* 후원 마커 — 시청자 선 위에 후원 시점을 얹는다. 크기는 금액대(1만 · 5만 기준) */}
        {showDono && s.donations.map((d, i) => {
          const v = vAt(d.atMin);
          const cy = v === null ? H - PB - 6 : y(v);
          return (
            <g key={i}>
              <line x1={x(d.atMin)} x2={x(d.atMin)} y1={cy} y2={H - PB} className="stroke-violet-400/60 dark:stroke-violet-400/40" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx={x(d.atMin)} cy={cy} r={donoR(d.amount)} className="fill-violet-600 dark:fill-violet-400 stroke-white dark:stroke-[#15171c]" strokeWidth="1.5" />
            </g>
          );
        })}
        {/* 피크만 선택적으로 직접 라벨 */}
        <circle cx={x(peak.t)} cy={y(peak.v)} r="4" className="fill-[#2a78d6] dark:fill-[#3987e5] stroke-white dark:stroke-[#15171c]" strokeWidth="2" />
        <text x={x(peak.t)} y={y(peak.v) - 9} textAnchor="middle" className="fill-slate-700 dark:fill-slate-200 text-[10px] font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{nf(peak.v)}</text>
        {/* 축 */}
        <line x1={PL} x2={W - PR} y1={H - PB} y2={H - PB} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />
        {xTicks.map((t) => <text key={t} x={x(t)} y={H - PB + 14} textAnchor="middle" className="fill-slate-400 text-[9px]" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDur(t)}</text>)}
        {/* 크로스헤어 */}
        {hp && (
          <g>
            <line x1={x(hp.t)} x2={x(hp.t)} y1={PT} y2={H - PB} className="stroke-slate-400" strokeWidth="1" strokeOpacity="0.7" />
            {hp.v !== null && <circle cx={x(hp.t)} cy={y(hp.v)} r="4.5" className="fill-[#2a78d6] dark:fill-[#3987e5] stroke-white dark:stroke-[#15171c]" strokeWidth="2" />}
          </g>
        )}
      </svg>
      {/* 툴팁 */}
      {hp && (
        <div className="absolute pointer-events-none bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap" style={{ left: `calc(${(x(hp.t) / W) * 100}% + 8px)`, top: 8, transform: x(hp.t) > W * 0.72 ? 'translateX(calc(-100% - 16px))' : undefined }}>
          <div className="tabular-nums opacity-70">{fmtDur(hp.t)}</div>
          {inSuspend ? <div className="flex items-center gap-1 font-bold text-amber-300"><WifiOff size={11} /> 일시중단 {fmtSec(inSuspend.durSec)}</div>
            : <div className="font-bold tabular-nums">{nf(hp.v ?? 0)}명 시청</div>}
          {hpDonos.length > 0 && (
            <div className="mt-1 pt-1 border-t border-white/15 space-y-0.5">
              {hpDonos.slice(0, 3).map((d, i) => <div key={i} className="flex items-center gap-1.5 text-violet-200"><Coins size={10} /> {d.nick} <b className="tabular-nums">{won(d.amount)}</b> <span className="opacity-60">{d.kind}</span></div>)}
              {hpDonos.length > 3 && <div className="opacity-60">외 {hpDonos.length - 3}건</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════ 작은 조각 ═══════════ */
function Kpi({ icon: Icon, label, value, unit, hint, accent, small }: { icon: any; label: string; value: string; unit?: string; hint: string; accent?: boolean; small?: boolean }) {
  return (
    <div className={`group relative rounded-xl border p-4 ${accent ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a20]'}`}>
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1.5">
        <Icon size={12} /> <span className="truncate">{label}</span>
        <span title={hint} className="ml-auto shrink-0 cursor-help text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"><Info size={12} /></span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`${small ? 'text-[18px]' : 'text-[22px]'} leading-none font-black text-slate-900 dark:text-white whitespace-nowrap`}>{value}</span>
        {unit && <span className="text-[11px] text-slate-400 font-semibold">{unit}</span>}
      </div>
      <div className="absolute left-2 right-2 top-full z-20 mt-1 hidden group-hover:block bg-slate-900 text-white text-[11px] leading-relaxed rounded-lg px-2.5 py-2 shadow-xl">{hint}</div>
    </div>
  );
}
/* ═══════════ 후원 타임라인 — 회차 경과 시간축 × 후원 ═══════════
   질문: "어떤 순간이 후원을 만들었는가". 10분 창으로 가장 몰린 구간을 찍고, 그 시점의 시청자와 방송 정보 변경을 같이 보여준다.
   다시보기 딥링크는 1단계 제외라 비활성 — 사유를 라벨에 내장한다(YT 패턴 #4). */
function DonationTimeline({ s, interval }: { s: Session; interval: number }) {
  const total = donoSum(s);
  const pts = useMemo(() => buildSeries(s, interval), [s, interval]);
  const viewersAt = (t: number) => { const near = pts.reduce((a, p) => (Math.abs(p.t - t) < Math.abs(a.t - t) ? p : a), pts[0]); return near.v ?? 0; };

  // 10분 슬라이딩 창에서 합계가 가장 큰 구간
  const WIN = 10;
  const hot = useMemo(() => {
    let best: { from: number; sum: number; count: number } | null = null;
    for (let from = 0; from <= s.durationMin; from += 1) {
      const inWin = s.donations.filter((d) => d.atMin >= from && d.atMin < from + WIN);
      const sum = inWin.reduce((a, d) => a + d.amount, 0);
      if (inWin.length && (!best || sum > best.sum)) best = { from, sum, count: inWin.length };
    }
    return best;
  }, [s]);
  const hotChange = hot ? s.changes.find((c) => c.atMin > 0 && c.atMin >= hot.from - 5 && c.atMin < hot.from + WIN) : undefined;
  const hotShare = hot && total ? Math.round((hot.sum / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-violet-200 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-900/10 p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <Coins size={14} className="text-violet-600 dark:text-violet-400" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">후원 타임라인</h4>
        <span className="ml-auto text-[11px] text-slate-500">회차 경과 시간 기준</span>
      </div>

      {s.donations.length === 0 ? (
        /* 빈 상태에도 "무엇이 뜨는지"를 말한다 (#6) */
        <div className="text-sm text-slate-500">이 회차에는 방송 중 후원이 없었습니다. 후원이 들어오면 시청자 추이 위에 시점이 표시되고, 가장 몰린 구간을 여기서 알려드려요.</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <Mini label="후원 합계" value={won(total)} />
            <Mini label="후원 건수" value={`${s.donations.length}건`} />
            <Mini label="가장 몰린 10분" value={hot ? `${fmtDur(hot.from)}~${fmtDur(Math.min(s.durationMin, hot.from + WIN))}` : '—'} tone="emerald" />
          </div>

          {hot && (
            <div className="mb-3 flex items-start gap-2 rounded-lg bg-white dark:bg-slate-800/60 border border-violet-200/70 dark:border-violet-900/40 px-3 py-2.5 text-[12.5px] text-slate-700 dark:text-slate-200 leading-relaxed">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-400" />
              <div>
                <b className="text-slate-900 dark:text-white">{fmtDur(hot.from)} 전후 10분</b>에 후원 <b>{hot.count}건 · {won(hot.sum)}</b>이 들어왔어요 — 이 회차 후원의 <b>{hotShare}%</b>. 그때 시청자는 <b className="tabular-nums">{nf(viewersAt(hot.from + WIN / 2))}명</b>이었습니다.
                {hotChange && <span className="block mt-1 text-slate-500">직전에 <b className="text-slate-700 dark:text-slate-200">{hotChange.field}</b>을(를) "{hotChange.after}"로 바꿨습니다 ({fmtDur(hotChange.atMin)}). 그 변화와 겹치는지 살펴볼 만해요.</span>}
              </div>
            </div>
          )}

          <ul className="divide-y divide-violet-100 dark:divide-violet-900/30 max-h-52 overflow-y-auto">
            {[...s.donations].sort((a, b) => a.atMin - b.atMin).map((d, i) => {
              const inHot = hot && d.atMin >= hot.from && d.atMin < hot.from + WIN;
              return (
                <li key={i} className={`flex items-center gap-2 py-1.5 text-[12px] ${inHot ? 'font-semibold' : ''}`}>
                  <span className="tabular-nums text-slate-500 w-12 shrink-0">{fmtDur(d.atMin)}</span>
                  <span className={`shrink-0 px-1 py-px rounded text-[10px] font-bold ${d.kind === '일반' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'}`}>{d.kind}</span>
                  <span className="flex-1 min-w-0 truncate text-slate-700 dark:text-slate-200">{d.nick}</span>
                  <span className="tabular-nums text-slate-900 dark:text-white shrink-0">{won(d.amount)}</span>
                  <span className="tabular-nums text-slate-400 w-14 text-right shrink-0" title="이 시점 동시 시청자">{nf(viewersAt(d.atMin))}명</span>
                  {/* 비활성 사유를 라벨에 내장 (#4) — 기능의 존재는 알리고 오작동은 막는다 */}
                  <button disabled title="다시보기는 2단계에서 제공됩니다. 회차 경과 시간은 지금부터 기록되므로 그때 이 시점으로 바로 이동할 수 있어요."
                    className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 border border-dashed border-slate-300 dark:border-slate-600 cursor-not-allowed">
                    다시보기 · 2단계
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function Th({ children, onClick, active, dir, className = '', hint }: { children: React.ReactNode; onClick: () => void; active: boolean; dir: 'asc' | 'desc'; className?: string; hint?: string }) {
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th className={`py-2 px-1.5 font-semibold ${className || 'text-right'}`} title={hint}>
      <button onClick={onClick} className={`inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 ${active ? 'text-slate-800 dark:text-slate-100' : ''}`}>
        {children} <Icon size={11} className={active ? '' : 'opacity-40'} />
      </button>
      {hint && <ColHint text={hint} />}
    </th>
  );
}
function ThPlain({ children, className = '', hint }: { children: React.ReactNode; className?: string; hint?: string }) {
  return (
    <th className={`py-2 px-1.5 font-semibold ${className || 'text-right'}`} title={hint}>
      <span className="inline-flex items-center gap-1">{children}{hint && <ColHint text={hint} />}</span>
    </th>
  );
}
// 열 정의 ⓘ (#17) — 클릭하지 않아도 title로, 호버하면 풍선으로. 정렬 버튼과 겹치지 않게 별도 요소로 둔다.
function ColHint({ text }: { text: string }) {
  return (
    <span className="group/hint relative inline-flex align-middle ml-0.5 cursor-help text-slate-300 dark:text-slate-600 hover:text-slate-500">
      <Info size={11} />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full z-30 mt-1.5 hidden group-hover/hint:block w-56 whitespace-normal text-left font-normal bg-slate-900 text-white text-[11px] leading-relaxed rounded-lg px-2.5 py-2 shadow-xl">{text}</span>
    </span>
  );
}
function Mini({ icon: Icon, label, value, tone }: { icon?: any; label: string; value: string; tone?: 'amber' | 'emerald' }) {
  const t = tone === 'amber' ? 'text-amber-700 dark:text-amber-400' : tone === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white';
  return (
    <div className="rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">{Icon && <Icon size={11} />} {label}</div>
      <div className={`text-[13px] font-bold tabular-nums ${t}`}>{value}</div>
    </div>
  );
}
