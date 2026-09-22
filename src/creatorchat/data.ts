import type { ChatUser, Policy, MyView, Role } from './types';

export const ME = { uid: 'creator', nick: 'YM상사', color: '#ef4444' } as const;
export const MOD_NICK = '매니저·지수';

export const ROLE_LABEL: Record<Role, string> = { viewer: '일반', follower: '팔로워', sub: '구독', fan: '팬클럽', mod: '매니저', creator: '크리에이터' };
export const ROLE_TONE: Record<Role, string> = {
  viewer: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
  follower: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  sub: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  fan: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  mod: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  creator: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300',
};

// 시청자 풀 — 가입일 · 팔로우 경과 · 구독 개월을 들고 있어 사용자 카드와 참여 자격 게이트에 쓰인다
export const USERS: ChatUser[] = [
  { uid: 'u1', nick: '방울토마토', color: '#e2569b', role: 'sub', joinedAt: '2024-03-12', followedDays: 410, subMonths: 7 },
  { uid: 'u2', nick: '가을하늘', color: '#0bab8a', role: 'fan', joinedAt: '2023-11-02', followedDays: 690 },
  { uid: 'u3', nick: '밤샘러', color: '#7b4dff', role: 'follower', joinedAt: '2025-06-20', followedDays: 88 },
  { uid: 'u4', nick: '지나가던1인', color: '#5a6472', role: 'viewer', joinedAt: '2026-09-16' },
  { uid: 'u5', nick: '열혈나나팬', color: '#e23b52', role: 'sub', joinedAt: '2022-08-01', followedDays: 1500, subMonths: 24 },
  { uid: 'u6', nick: '민트초코', color: '#d98a00', role: 'follower', joinedAt: '2025-12-30', followedDays: 12 },
  { uid: 'u7', nick: '출근중', color: '#4655e6', role: 'viewer', joinedAt: '2025-02-14' },
  { uid: 'u8', nick: '코딩하는곰', color: '#0e9f6e', role: 'follower', joinedAt: '2024-09-09', followedDays: 200 },
  { uid: 'u9', nick: '새벽감성', color: '#c026d3', role: 'sub', joinedAt: '2024-01-05', followedDays: 600, subMonths: 3 },
  { uid: 'u10', nick: 'newbie_9921', color: '#94a3b8', role: 'viewer', joinedAt: '2026-09-22' },
  { uid: 'mod1', nick: MOD_NICK, color: '#059669', role: 'mod', joinedAt: '2023-01-10', followedDays: 900, subMonths: 20 },
];
export const userOf = (uid: string): ChatUser => USERS.find((u) => u.uid === uid) ?? { uid, nick: uid, color: '#64748b', role: 'viewer', joinedAt: '—' };

// 결정적 피드 풀 — (uid, 텍스트, 종류). 슬롯 번호로 고르므로 창이 여럿이어도 같은 내용을 본다.
export type PoolItem = { uid: string; text: string; kind?: 'dono' | 'join' | 'sub' | 'spam' | 'toxic'; amount?: number };
export const POOL: PoolItem[] = [
  { uid: 'u1', text: 'ㅋㅋㅋㅋ 오늘 텐션 미쳤다' },
  { uid: 'u2', text: '오늘도 화이팅!! 🔥' },
  { uid: 'u3', text: '목표까지 얼마 남았어요?' },
  { uid: 'u4', text: '방금 들어왔는데 뭐하는 중이에요?' },
  { uid: 'u5', text: '대박 ㄷㄷ 👏👏' },
  { uid: 'u6', text: 'ㅇㅈㅇㅈ' },
  { uid: 'u7', text: '소리 살짝 작은 것 같아요' },
  { uid: 'u8', text: '노래 신청 가능한가요 🎵' },
  { uid: 'u1', text: '엑셀 판 열어주세요!!' },
  { uid: 'u9', text: '처음 왔는데 재밌네요' },
  { uid: 'u10', text: '★무료★ 카톡 오픈채팅 들어오면 선물 드려요 open.kakao.com/xxx', kind: 'spam' },
  { uid: 'u5', text: '후원 도착!', kind: 'dono', amount: 10000 },
  { uid: 'u2', text: '화질 좋다 ㄷㄷ 1080p 미쳤네' },
  { uid: 'u3', text: '오늘 몇 시까지 하세요?' },
  { uid: 'u4', text: '아 진짜 시발 왜 안 되냐', kind: 'toxic' },
  { uid: 'u6', text: '1등 누구야 지금' },
  { uid: 'u8', text: '👏👏👏' },
  { uid: 'u7', text: '님 방송 처음 보는데 목소리 좋으시네요' },
  { uid: 'u10', text: 'ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ' },
  { uid: 'u9', text: '구독 3개월 됐어요 축하해주세요', kind: 'sub' },
  { uid: 'u1', text: '이번 주 일정 어떻게 되나요' },
  { uid: 'u2', text: '엑셀방송 오늘 판 몇 개 도는지 궁금', kind: 'dono', amount: 50000 },
  { uid: 'u3', text: '@YM상사 아까 말한 곡 제목이 뭐였죠' },
  { uid: 'u10', text: '입장', kind: 'join' },
  { uid: 'u6', text: '오늘 컨디션 좋아보여요' },
  { uid: 'u5', text: '역시 갓상사' },
  { uid: 'u4', text: '광고 좀 그만 나오게 해주세요' },
  { uid: 'u8', text: '방금 그거 클립 따주세요' },
];

export const DEFAULT_POLICY: Policy = {
  view: 'filtered',
  participation: 'all',
  followerMinMin: 0,
  accountAgeHours: 0,
  slowSec: 0,
  emoteOnly: false,
  bannedWords: ['시발', '광고', '먹튀'],
  replacement: '사랑해요♡',
  autoReview: 'basic',
  notice: { on: true, text: '오늘 방송은 11시까지! 신청곡은 채팅으로 남겨주세요. 도배 · 광고는 바로 정리합니다.' },
  rules: { on: false, text: '1. 서로 존중하기\n2. 광고 · 링크 금지\n3. 스포일러는 미리 말하고' },
  showKickMsg: true,
  leaderboard: true,
};

export const DEFAULT_VIEW: MyView = {
  fontPct: 100, spacing: 'normal', timestamps: false, hoverPause: true, showJoins: false, showModActivity: false, quickEmotes: true,
};

export const QUICK_EMOTES = ['😀', '😂', '🔥', '👏', '❤️', '😮', '🎉', '👍', '😭', '🙏'];
export const REACTIONS = ['❤️', '😂', '🎉', '😮', '👏'];

export const TIMEOUT_OPTIONS: { label: string; sec: number }[] = [
  { label: '10초', sec: 10 }, { label: '1분', sec: 60 }, { label: '5분', sec: 300 }, { label: '10분', sec: 600 }, { label: '30분', sec: 1800 }, { label: '24시간', sec: 86400 },
];
export const SLOW_OPTIONS = [0, 1, 5, 15, 30, 45, 60, 120];
export const FOLLOWER_MIN_OPTIONS: { label: string; min: number }[] = [
  { label: '즉시', min: 0 }, { label: '6분', min: 6 }, { label: '1시간', min: 60 }, { label: '3시간', min: 180 }, { label: '5시간', min: 300 }, { label: '1일', min: 1440 },
];
export const ACCOUNT_AGE_OPTIONS: { label: string; hours: number }[] = [
  { label: '끔', hours: 0 }, { label: '1시간', hours: 1 }, { label: '12시간', hours: 12 }, { label: '1일', hours: 24 }, { label: '1주일', hours: 168 }, { label: '6개월', hours: 4380 },
];

export const NOTICE_MAX = 300;
export const RULES_MAX = 1000;
export const BANNED_MAX = 200;
export const REPLACEMENT_MAX = 5;

// 슬래시 명령어 — GUI와 완전 이중 경로 (Kick §4). 플랫폼 고유(kpp · og · raid · clip)는 뺐다.
export type Command = { name: string; args: string; desc: string };
export const COMMANDS: Command[] = [
  { name: 'ban', args: '<닉네임> [사유]', desc: '채팅에서 사용자 차단(블랙리스트)' },
  { name: 'unban', args: '<닉네임>', desc: '차단 해제' },
  { name: 'timeout', args: '<닉네임> <분> [사유]', desc: '사용자 타임아웃' },
  { name: 'hide', args: '<닉네임>', desc: '사용자 숨기기 — 본인은 모름' },
  { name: 'kick', args: '<닉네임>', desc: '강제퇴장 (이번 방송)' },
  { name: 'mod', args: '<닉네임>', desc: '매니저 임명' },
  { name: 'unmod', args: '<닉네임>', desc: '매니저 해임' },
  { name: 'user', args: '<닉네임>', desc: '사용자 카드 열기' },
  { name: 'clear', args: '', desc: '채팅 초기화' },
  { name: 'pin', args: '<메시지 일부>', desc: '메시지 고정' },
  { name: 'unpin', args: '', desc: '고정 해제' },
  { name: 'slow', args: '<on|off> [초]', desc: '슬로우 모드' },
  { name: 'followonly', args: '<on|off> [분]', desc: '팔로워 전용' },
  { name: 'subonly', args: '<on|off>', desc: '구독자 전용' },
  { name: 'emoteonly', args: '<on|off>', desc: '이모티콘 전용' },
  { name: 'notice', args: '<내용>', desc: '공지 설정 · 켜기' },
  { name: 'poll', args: '<질문> | <항목1> | <항목2> …', desc: '투표 시작' },
  { name: 'polldelete', args: '', desc: '투표 종료' },
  { name: 'qna', args: '<on|off>', desc: 'Q&A 세션' },
  { name: 'title', args: '<제목>', desc: '방송 제목 변경' },
];

// 자동 검토 카테고리 — 설명은 정책이 아니라 크리에이터의 1인칭 허용 선언 (Kick §7-2)
export const REVIEW_CATEGORIES: { key: string; label: string; firstPerson: string }[] = [
  { key: 'sexual', label: '성적인 표현', firstPerson: '제 채팅에서 성적인 표현은 보고 싶지 않습니다.' },
  { key: 'hate', label: '혐오 발언', firstPerson: '특정 집단을 향한 혐오 발언은 허용하지 않습니다.' },
  { key: 'harass', label: '괴롭힘', firstPerson: '다른 시청자를 괴롭히는 말은 제가 먼저 확인합니다.' },
  { key: 'spam', label: '광고 · 링크', firstPerson: '외부 링크와 홍보성 메시지는 제가 확인한 뒤 올립니다.' },
  { key: 'gibberish', label: '도배 · 무의미 문자', firstPerson: '반복 문자와 키보드 도배는 걸러도 괜찮습니다.' },
];

export const GUIDE_TEXT = '실시간 채팅에 오신 것을 환영합니다. 개인정보를 보호하고 커뮤니티 가이드를 지켜주세요.';
