// 크리에이터 채팅 패널 — 공용 타입.
// 기준: Kick 스트리밍 대시보드 · YouTube 라이브 관제실 · SOOP 방송관리 채팅 분석(2026-09-22).

export type Role = 'viewer' | 'follower' | 'sub' | 'fan' | 'mod' | 'creator';

export type ChatUser = {
  uid: string;
  nick: string;
  color: string;
  role: Role;
  /** 가입일 — 사용자 카드에서 "이 사람이 문제인가"를 판단할 근거 (Kick §6) */
  joinedAt: string;
  /** 팔로우 후 경과일. 미팔로우면 undefined */
  followedDays?: number;
  /** 구독 개월. 미구독이면 undefined */
  subMonths?: number;
};

export type MsgType = 'chat' | 'notice' | 'warn' | 'sys' | 'dono' | 'modlog';

export type ChatMsg = {
  id: string;
  uid: string;
  text: string;
  ts: number;
  type: MsgType;
  /** 자동 검토에 걸려 보류된 메시지 — 시청자에게 안 보이고, 크리에이터가 승인/삭제를 결정 (YT §4-5) */
  held?: { reason: string; level: 'basic' | 'strict' };
  /** 금칙어 치환이 일어난 원문 (SOOP §2.10) */
  original?: string;
  /** 후원 금액 (type === 'dono') */
  amount?: number;
  /** 답장 대상 */
  replyTo?: string;
};

export type Participation = 'all' | 'follower' | 'sub';

export type Policy = {
  /** 주요 채팅(필터) / 실시간 채팅(전부) — 라벨로 드러난 필터 (YT §1-1) */
  view: 'filtered' | 'all';
  participation: Participation;
  /** 팔로워 전용일 때 팔로우 후 최소 경과(분). 0 = 즉시 */
  followerMinMin: number;
  /** 계정 연령 최소(시간). 0 = 끔 */
  accountAgeHours: number;
  /** 슬로우 모드(초). 0 = 끔. 매니저 · 구독자는 예외 (YT §5) */
  slowSec: number;
  emoteOnly: boolean;
  /** 금칙어 — 차단이 아니라 치환 (SOOP §2.10). 2~5자, 최대 200개 */
  bannedWords: string[];
  replacement: string;
  /** 자동 검토 — 삭제가 아니라 보류 (YT §4-5) */
  autoReview: 'off' | 'basic' | 'strict';
  /** 공지 · 규칙 — 노출 토글과 본문 분리 (SOOP §2.4 · 2.5) */
  notice: { on: boolean; text: string };
  rules: { on: boolean; text: string };
  /** 시청자 전체에 영향 — 강제퇴장 메시지 노출 */
  showKickMsg: boolean;
  leaderboard: boolean;
};

/** 내 화면에만 영향 — 시청자에게 보이는 설정과 섹션을 분리한다 (SOOP 반면교사) */
export type MyView = {
  fontPct: 75 | 100 | 125 | 150 | 175 | 200 | 300;
  spacing: 'tight' | 'normal' | 'loose';
  timestamps: boolean;
  hoverPause: boolean;
  showJoins: boolean;
  showModActivity: boolean;
  quickEmotes: boolean;
};

export type SanctionKind = 'timeout' | 'hide' | 'ban' | 'kick' | 'blacklist' | 'mute' | 'mod';

export type Sanction = {
  id: string;
  uid: string;
  kind: SanctionKind;
  /** 만료 시각(ms). 영구면 undefined */
  until?: number;
  by: string;
  at: number;
  reason?: string;
};

export type LogKind =
  | '삭제' | '고정' | '고정 해제' | '타임아웃' | '숨기기' | '채팅금지' | '강제퇴장' | '블랙리스트' | '매니저'
  | '음소거' | '보류 승인' | '보류 삭제' | '채팅 모드' | '공지' | '규칙' | '금칙어' | '자동 검토' | '투표' | '초기화';

export type LogEntry = { id: string; at: number; by: string; kind: LogKind; target: string; detail: string };

export type Poll = { question: string; options: { label: string; votes: number }[]; closed: boolean };
export type QnA = { open: boolean; questions: { id: string; uid: string; text: string; answered: boolean }[] };

export type Sheet =
  | { kind: 'none' }
  | { kind: 'menu' }
  | { kind: 'tools' }
  | { kind: 'settings' }
  | { kind: 'actions' }
  | { kind: 'participation' } | { kind: 'accountAge' } | { kind: 'slow' } | { kind: 'banned' } | { kind: 'autoReview' }
  | { kind: 'notice' } | { kind: 'rules' }
  | { kind: 'user'; uid: string }
  | { kind: 'participants' }
  | { kind: 'held' }
  | { kind: 'log' }
  | { kind: 'topfans' }
  | { kind: 'staff' }
  | { kind: 'gifts' }
  | { kind: 'manage' }
  | { kind: 'pollEditor' } | { kind: 'qna' };
