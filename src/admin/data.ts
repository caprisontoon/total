// 관리자 페이지 목업 데이터 — ⑨ 관리자 요구사항 정의서 기준.
// 실서비스 연동 전 프로토타입용. 결정론적으로 생성해 새로고침해도 같은 값을 보여준다.

export type LiveStatus = '라이브' | '준비' | '일시중단';
export type ChannelStatus = '정상' | '정지' | '폐쇄';
export type EndReason = '정상' | '타임아웃' | '강제';

export interface LiveRow {
  id: string;
  cid: string;
  channel: string;
  title: string;
  category: string;
  status: LiveStatus;
  viewers: number;
  startedAt: string;   // HH:MM
  minutes: number;
  bitrate: number;     // kbps
  delay: number;       // ms
  reports: number;
  ghostIn?: number;    // 유령 방송 판정까지 남은 초
}

export interface ChannelRow {
  id: string;
  cid: string;
  name: string;
  owner: string;
  status: ChannelStatus;
  openedAt: string;
  lastLive: string;
  sessions: number;
  totalViews: number;
  reports: number;
  sanctions: number;
  streamKey: string;
  eligible: boolean;
  suspendUntil?: string;
  suspendReason?: string;
}

export interface SessionRow {
  id: string;
  cid: string;
  channel: string;
  title: string;
  category: string;
  start: string;       // YYYY-MM-DD HH:MM
  end: string;
  minutes: number;
  peak: number;
  avg: number;
  endReason: EndReason;
  suspends: { at: string; sec: number; rejoined: boolean }[];
  quality: { t: string; bitrate: number; delay: number }[];
  infoChanges: { at: string; field: string; before: string; after: string }[];
}

export interface ReportRow {
  id: string;
  kind: '방송' | '채팅';
  target: string;
  cid: string;
  channel: string;
  type: string;
  reason: string;
  reporter: string;
  at: string;
  state: '미처리' | '처리중' | '완료';
  stacked: number;     // 동일 대상 누적 신고
  weight: number;      // 유형 가중치
  evidence: string;
  action?: string;
  handler?: string;
  handledAt?: string;
}

export interface ChatLogRow {
  id: string;
  at: string;
  cid: string;
  channel: string;
  user: string;
  userId: string;
  message: string;
  deleted: boolean;
  flagged?: '도배' | '금칙어' | '반복';
}

export interface AuditRow {
  id: string;
  at: string;
  admin: string;
  grade: '모니터링' | '운영자' | '슈퍼관리자';
  action: string;
  target: string;
  reason: string;
  before?: string;
  after?: string;
}

const CATS = ['게임', '토크', '음악', '먹방', '스포츠', '학습', '버추얼'];
const NAMES = [
  'YM상사', '감자대장', '루미LUMI', '나이트오울', '삐약이', '코딩하는곰', '해피밀',
  '스톰브레이커', '달빛여우', '판다킹', '체리블라썸', '네온시티', '초코송이', '리버사이드',
  '하늘마루', '블루문', '피크닉', '고래사냥', '민트초코', '별빛정원',
];
const TITLES = [
  '[랭크] 오늘은 다이아 간다', '새벽 감성 토크방', '신곡 작업 라이브', '역대급 먹방 도전',
  '프로야구 같이봐요', '실시간 코딩 스터디', '버튜버 데뷔 첫 방송', '시청자 참여 게임',
  '잠 안 오는 사람 모여', '디아블로 정복기', '피아노 신청곡 받아요', '주말 마라톤 방송',
];

// 문자열 기반 결정론적 난수 (seed → 0..1)
function rnd(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}
const pick = <T,>(arr: T[], seed: string) => arr[Math.floor(rnd(seed) * arr.length)];
const range = (seed: string, min: number, max: number) => min + Math.floor(rnd(seed) * (max - min + 1));
const pad = (n: number) => String(n).padStart(2, '0');

export const TODAY = '2026-09-16';

/* ── ① 라이브 모니터링 ── */
export const LIVES: LiveRow[] = Array.from({ length: 24 }, (_, i) => {
  const s = `live${i}`;
  const status: LiveStatus = i === 3 || i === 11 ? '일시중단' : i === 7 || i === 18 ? '준비' : '라이브';
  const minutes = status === '준비' ? 0 : range(s + 'm', 4, 320);
  const h = range(s + 'h', 9, 22);
  return {
    id: `SES-${20260916}${pad(i + 1)}`,
    cid: `C${100230 + i * 7}`,
    channel: NAMES[i % NAMES.length],
    title: pick(TITLES, s + 't'),
    category: pick(CATS, s + 'c'),
    status,
    viewers: status === '준비' ? 0 : range(s + 'v', 3, 14200),
    startedAt: `${pad(h)}:${pad(range(s + 'mi', 0, 59))}`,
    minutes,
    bitrate: i === 5 ? 12800 : i === 14 ? 420 : range(s + 'b', 2400, 6800),
    delay: i === 9 ? 4200 : i === 2 ? 2600 : range(s + 'd', 90, 900),
    reports: i === 1 ? 14 : i === 6 ? 7 : range(s + 'r', 0, 3),
    ghostIn: status === '일시중단' ? range(s + 'g', 6, 74) : undefined,
  };
});

/* 이상 판정 — 색만 쓰지 않고 항상 사유 라벨을 함께 노출한다 */
export function anomalies(r: LiveRow): { label: string; tone: 'red' | 'amber' }[] {
  const out: { label: string; tone: 'red' | 'amber' }[] = [];
  if (r.bitrate > 8000) out.push({ label: '비트레이트 과다', tone: 'red' });
  if (r.bitrate < 800 && r.status === '라이브') out.push({ label: '저비트레이트', tone: 'amber' });
  if (r.delay >= 3000) out.push({ label: '수신 지연 급증', tone: 'red' });
  else if (r.delay >= 2000) out.push({ label: '수신 지연', tone: 'amber' });
  if (r.reports >= 10) out.push({ label: '신고 누적', tone: 'red' });
  else if (r.reports >= 5) out.push({ label: '신고 주의', tone: 'amber' });
  if (r.ghostIn !== undefined && r.ghostIn <= 30) out.push({ label: '유령 방송 임박', tone: 'red' });
  return out;
}

/* ── ② 채널 관리 ── */
export const CHANNELS: ChannelRow[] = NAMES.map((name, i) => {
  const s = `ch${i}`;
  const status: ChannelStatus = i === 4 ? '정지' : i === 13 ? '폐쇄' : '정상';
  return {
    id: `ch_${1000 + i}`,
    cid: `C${100230 + i * 7}`,
    name,
    owner: `user_${range(s + 'o', 10000, 99999)}`,
    status,
    openedAt: `2025-${pad(range(s + 'om', 1, 12))}-${pad(range(s + 'od', 1, 28))}`,
    lastLive: `2026-09-${pad(range(s + 'l', 1, 16))}`,
    sessions: range(s + 'se', 3, 480),
    totalViews: range(s + 'tv', 1200, 980000),
    reports: range(s + 'rp', 0, 22),
    sanctions: i === 4 ? 3 : range(s + 'sa', 0, 2),
    streamKey: `live_${range(s + 'k1', 100000000, 999999999)}_${range(s + 'k2', 1000000, 9999999)}`,
    eligible: i !== 13,
    suspendUntil: status === '정지' ? '2026-09-21' : undefined,
    suspendReason: status === '정지' ? '신고 누적 3회 · 정책 위반' : undefined,
  };
});

/* ── ③ 방송 회차 관리 ── */
export const SESSIONS: SessionRow[] = Array.from({ length: 32 }, (_, i) => {
  const s = `ses${i}`;
  const ch = NAMES[i % NAMES.length];
  const day = 16 - Math.floor(i / 3);
  const sh = range(s + 'h', 9, 21);
  const sm = range(s + 'mi', 0, 59);
  const minutes = range(s + 'm', 22, 350);
  // 종료 시각은 시작 + 방송 시간으로 계산한다 (따로 뽑으면 총 방송 시간과 어긋난다)
  const endTotal = sh * 60 + sm + minutes;
  const endReason: EndReason = i % 11 === 0 ? '강제' : i % 7 === 0 ? '타임아웃' : '정상';
  const sc = range(s + 'sc', 0, 3);
  const peak = range(s + 'p', 40, 18400);
  const title = pick(TITLES, s + 't');
  const category = pick(CATS, s + 'c');
  return {
    id: `SES-2026${pad(9)}${pad(day)}${pad(i + 1)}`,
    cid: `C${100230 + (i % NAMES.length) * 7}`,
    channel: ch,
    title,
    category,
    start: `2026-09-${pad(day)} ${pad(sh)}:${pad(sm)}`,
    end: `2026-09-${pad(day + Math.floor(endTotal / 1440))} ${pad(Math.floor(endTotal / 60) % 24)}:${pad(endTotal % 60)}`,
    minutes,
    peak,
    avg: Math.round(peak * (0.42 + rnd(s + 'a') * 0.3)),
    endReason,
    suspends: Array.from({ length: sc }, (_, j) => ({
      at: `${pad(sh + j + 1)}:${pad(range(s + 'sa' + j, 0, 59))}`,
      sec: range(s + 'ss' + j, 8, 130),
      rejoined: range(s + 'sr' + j, 0, 9) > 1,
    })),
    quality: Array.from({ length: 24 }, (_, j) => ({
      t: `${pad(sh + Math.floor(j / 4))}:${pad((j % 4) * 15)}`,
      bitrate: range(s + 'q' + j, 2200, 6400),
      delay: range(s + 'dl' + j, 80, 1800),
    })),
    infoChanges: Array.from({ length: range(s + 'ic', 0, 2) }, (_, j) => ({
      at: `${pad(sh + j)}:${pad(range(s + 'ica' + j, 0, 59))}`,
      field: j % 2 === 0 ? '제목' : '카테고리',
      before: j % 2 === 0 ? '방송 준비 중' : pick(CATS, s + 'b' + j),
      after: j % 2 === 0 ? title : category,
    })),
  };
});

/* ── ④ 신고 처리 ── */
const RTYPE_BROADCAST = ['음란·선정', '폭력·혐오', '저작권 침해', '사기·부정 유도', '미성년 유해'];
const RTYPE_CHAT = ['욕설·비방', '도배·스팸', '개인정보 노출', '광고·홍보'];
const WEIGHT: Record<string, number> = {
  '음란·선정': 5, '폭력·혐오': 5, '미성년 유해': 5, '사기·부정 유도': 4,
  '저작권 침해': 3, '개인정보 노출': 4, '욕설·비방': 2, '도배·스팸': 1, '광고·홍보': 1,
};
export const REPORTS: ReportRow[] = Array.from({ length: 28 }, (_, i) => {
  const s = `rep${i}`;
  const kind: '방송' | '채팅' = i % 3 === 0 ? '방송' : '채팅';
  const type = kind === '방송' ? pick(RTYPE_BROADCAST, s + 'ty') : pick(RTYPE_CHAT, s + 'ty');
  const state: ReportRow['state'] = i % 5 === 0 ? '완료' : i % 4 === 0 ? '처리중' : '미처리';
  const chIdx = i % NAMES.length;
  return {
    id: `RPT-${240900 + i}`,
    kind,
    target: kind === '방송' ? `SES-2026091${pad(i % 9)}` : `MSG-${90000 + i * 13}`,
    cid: `C${100230 + chIdx * 7}`,
    channel: NAMES[chIdx],
    type,
    reason: kind === '방송' ? '방송 중 부적절한 화면이 노출됩니다.' : '같은 문구를 반복해서 도배하고 있습니다.',
    reporter: `user_${range(s + 'u', 10000, 99999)}`,
    at: `2026-09-${pad(16 - (i % 4))} ${pad(range(s + 'h', 9, 23))}:${pad(range(s + 'm', 0, 59))}`,
    state,
    stacked: i === 1 ? 14 : i === 5 ? 9 : range(s + 'st', 1, 4),
    weight: WEIGHT[type] ?? 1,
    evidence: kind === '방송' ? '실시간 캡처 1건' : '메시지 원문 3건',
    action: state === '완료' ? pick(['경고', '채팅 제한 (24시간)', '기각'], s + 'ac') : undefined,
    handler: state === '완료' ? 'caprison' : undefined,
    handledAt: state === '완료' ? `2026-09-${pad(16 - (i % 4))} 18:20` : undefined,
  };
});
export const ESCALATION = [
  { step: 1, action: '경고', note: '자동 통지' },
  { step: 2, action: '채팅 제한 (24시간)', note: '서비스 단위' },
  { step: 3, action: '채널 정지 (7일)', note: '운영자 권한' },
  { step: 4, action: '채널 정지 (30일)', note: '운영자 권한' },
  { step: 5, action: '영구 정지', note: '슈퍼관리자 권한' },
];

/* ── ⑤ 채팅 관리 ── */
const MSGS = [
  '오늘 방송 진짜 재밌어요 ㅋㅋㅋ', '형 이거 어떻게 하는 거예요?', 'ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ',
  '★☆★ 무료 이벤트 참여하세요 ★☆★', '다음 곡 신청합니다', '화질이 좀 끊기는데 저만 그런가요',
  '후원 도착했습니다!', '이 채널 홍보 좀 그만하세요', '내일도 방송하시나요?', '와 방금 그거 뭐예요',
];
export const CHAT_LOGS: ChatLogRow[] = Array.from({ length: 30 }, (_, i) => {
  const s = `msg${i}`;
  const chIdx = i % NAMES.length;
  const msg = pick(MSGS, s + 'm');
  return {
    id: `MSG-${90000 + i * 13}`,
    at: `2026-09-16 ${pad(range(s + 'h', 18, 23))}:${pad(range(s + 'mi', 0, 59))}:${pad(range(s + 'se', 0, 59))}`,
    cid: `C${100230 + chIdx * 7}`,
    channel: NAMES[chIdx],
    user: `닉네임${range(s + 'n', 100, 999)}`,
    userId: `user_${range(s + 'u', 10000, 99999)}`,
    message: msg,
    deleted: i % 9 === 0,
    flagged: msg.includes('★') ? '광고' as never : i % 7 === 0 ? '도배' : undefined,
  };
});
export const BANNED_WORDS = ['씨X', '개XX', '도박사이트', '먹튀검증', '토토', '불법스포츠', '성인화상'];

/* ── ⑥ 카테고리 · 태그 ── */
export const CATEGORIES = CATS.map((name, i) => ({
  id: `cat_${i + 1}`, name, order: i + 1, visible: i !== 6,
  lives: range('cat' + i, 0, 38), icon: ['🎮', '💬', '🎵', '🍜', '⚽', '📚', '🩵'][i],
}));
export const TAGS = ['롤', '배그', '신규스트리머', '심야방송', '노래방', '먹방', '수다', '고인물', '초보환영', '광고']
  .map((t, i) => ({ name: t, uses: range('tag' + i, 12, 4200), banned: t === '광고' }));

/* ── ⑦ 인프라 대시보드 ── */
export const INFRA = {
  liveCount: 22, viewers: 48213, gridRatio: 61.4,
  ingest: { active: 22, authFail: 3, dropped: 5 },
  transcode: { channels: 22, queue: 1, failed: 0, load: 43 },
  cdn: { traffic: '18.4 Gbps', errorRate: 0.21, regions: [['수도권', 54], ['영남', 19], ['충청', 11], ['호남', 9], ['강원·제주', 7]] as [string, number][] },
  grid: { peers: 3921, ratioTrend: [48, 52, 55, 58, 57, 61, 63, 61, 59, 62, 64, 61], fallback: 12 },
  playback: { buffering: 1.8, error: 0.31, quality: [['1080p', 34], ['720p', 41], ['480p', 18], ['360p', 7]] as [string, number][] },
  alerts: [
    { level: '경고' as const, msg: '수신 지연 3,000ms 초과 채널 2개 (임계값 2,000ms)', at: '21:42' },
    { level: '주의' as const, msg: '그리드 분산 전송 비율 일시 하회 — 20:15 기준 58.6% (임계값 60%)', at: '20:15' },
  ],
};

/* ── ⑧ 그리드 관리 ── */
export const GRID_INSTALLS = { total: 128409, active: 3921, os: [['Windows', 82], ['macOS', 13], ['Linux', 5]] as [string, number][] };
export const GRID_VERSIONS = [
  { v: '1.4.2', share: 64, status: '최신' }, { v: '1.4.0', share: 21, status: '지원' },
  { v: '1.3.8', share: 11, status: '지원 종료 예정' }, { v: '1.2.x', share: 4, status: '강제 업데이트 대상' },
];
export const GRID_ISSUES = NAMES.slice(0, 6).map((n, i) => ({
  channel: n, fallback: range('gf' + i, 3, 88), complaints: range('gc' + i, 0, 14),
}));

/* ── ⑨ 운영 정책 설정 ── */
export interface Policy { key: string; label: string; value: string; unit: string; apply: '즉시' | '다음 방송부터'; doc: string; grade: '슈퍼관리자'; options?: string[] }
export const POLICIES: Policy[] = [
  { key: 'rejoin', label: '재접속 허용 시간', value: '90', unit: '초', apply: '다음 방송부터', doc: '④-4-3', grade: '슈퍼관리자' },
  { key: 'ghost', label: '유령 방송 판정 (영상 단위 미생성)', value: '30', unit: '초', apply: '즉시', doc: '④-4-4', grade: '슈퍼관리자' },
  { key: 'lowbr', label: '저비트레이트 알람 기준', value: '5', unit: '분', apply: '즉시', doc: '④-4-4', grade: '슈퍼관리자' },
  { key: 'maxbr', label: '원본 비트레이트 상한', value: '8000', unit: 'kbps', apply: '다음 방송부터', doc: '②', grade: '슈퍼관리자' },
  { key: 'nogrid', label: '그리드 미설치 시 화질 상한', value: '480p', unit: '', apply: '즉시', doc: '⑦-7-4', grade: '슈퍼관리자', options: ['360p', '480p', '720p', '제한 없음'] },
  { key: 'slow', label: '슬로우 모드 선택지', value: '0 / 3 / 5 / 10 / 30 / 60', unit: '초', apply: '즉시', doc: '⑥ · F-024', grade: '슈퍼관리자' },
  { key: 'suspend', label: '채널 정지 기간 옵션', value: '1 / 7 / 30 / 영구', unit: '일', apply: '즉시', doc: '9-3 ②', grade: '슈퍼관리자' },
  { key: 'steps', label: '신고 조치 단계', value: '5', unit: '단계', apply: '즉시', doc: '9-3 ④', grade: '슈퍼관리자' },
  { key: 'alarmDelay', label: '인프라 알람 임계값 · 수신 지연', value: '2000', unit: 'ms', apply: '즉시', doc: '9-3 ⑦', grade: '슈퍼관리자' },
  { key: 'alarmGrid', label: '인프라 알람 임계값 · 그리드 비율 하한', value: '60', unit: '%', apply: '즉시', doc: '9-3 ⑦', grade: '슈퍼관리자' },
];

/* ── ⑩ 통계 ── */
export const STAT_DAILY = Array.from({ length: 14 }, (_, i) => {
  const d = 3 + i, s = `st${i}`;
  return {
    date: `2026-09-${pad(d)}`,
    broadcasts: range(s + 'b', 12, 46),
    hours: range(s + 'h', 90, 420),
    uniqueViewers: range(s + 'u', 9000, 62000),
    watchHours: range(s + 'w', 2400, 21000),
    peakLive: range(s + 'p', 9, 31),
    peakViewers: range(s + 'pv', 3000, 24000),
  };
});
export const STAT_RANK = NAMES.slice(0, 10).map((n, i) => ({
  channel: n, cid: `C${100230 + i * 7}`,
  viewers: range('sr' + i, 4000, 98000), hours: range('sh' + i, 12, 260), reports: range('srp' + i, 0, 18),
})).sort((a, b) => b.viewers - a.viewers);

/* ── ⑪ 공지 · 안내 ── */
export const BANNERS = [
  { id: 'bn_1', title: '9/20(일) 02:00~04:00 스트리밍 서버 점검 안내', scope: '시청 · 스튜디오', from: '2026-09-16', to: '2026-09-20', on: true },
  { id: 'bn_2', title: '그리드 1.4.2 업데이트 배포 안내', scope: '시청', from: '2026-09-12', to: '2026-09-18', on: true },
  { id: 'bn_3', title: '추석 연휴 고객센터 운영 안내', scope: '스튜디오', from: '2026-09-25', to: '2026-10-02', on: false },
];
export const CREATOR_NOTICES = [
  { id: 'nt_1', title: '재접속 허용 시간 정책 변경 (60초 → 90초)', target: '전체 채널', sentAt: '2026-09-14 11:00', read: 412 },
  { id: 'nt_2', title: '스트림키 재발급 권장 안내', target: '선택 채널 12개', sentAt: '2026-09-09 16:30', read: 11 },
];

/* ── ⑫ 감사 로그 ── */
const AUDIT_ACTIONS = [
  ['강제 종료', '정책 위반'], ['채널 정지', '신고 누적 3회'], ['스트림키 재발급', '유출 의심'],
  ['스트림키 열람', '부정 사용 조사'], ['정책값 변경', '운영 정책 조정'], ['신고 조치', '경고 처리'],
  ['메시지 삭제', '광고 도배'],
];
export const AUDIT: AuditRow[] = Array.from({ length: 26 }, (_, i) => {
  const s = `au${i}`;
  const [action, reason] = AUDIT_ACTIONS[i % AUDIT_ACTIONS.length];
  const isPolicy = action === '정책값 변경';
  return {
    id: `AUD-${880000 + i}`,
    at: `2026-09-${pad(16 - (i % 6))} ${pad(range(s + 'h', 9, 23))}:${pad(range(s + 'm', 0, 59))}`,
    admin: pick(['caprison', 'ops_kim', 'ops_lee', 'super_park'], s + 'ad'),
    grade: isPolicy || action === '스트림키 열람' ? '슈퍼관리자' : '운영자',
    action,
    target: action === '메시지 삭제' ? `MSG-${90000 + i * 13}` : `${NAMES[i % NAMES.length]} (C${100230 + (i % NAMES.length) * 7})`,
    reason,
    before: isPolicy ? '60초' : undefined,
    after: isPolicy ? '90초' : undefined,
  };
});

export const fmt = (n: number) => n.toLocaleString('ko-KR');
export const dur = (min: number) => (min < 60 ? `${min}분` : `${Math.floor(min / 60)}시간 ${min % 60}분`);
