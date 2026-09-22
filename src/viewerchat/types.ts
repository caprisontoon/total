// 라이브 채팅 패널 공용 타입

export type BadgeKind = 'sup' | 'sub' | 'fan' | 'mgr' | 'bj';
export type Badge = { c: BadgeKind; l: string };

export type ChatUser = {
  uid: string;
  nick: string;
  color: string;
  badge: Badge[];
};

/** 1 일반 / 2 팔로워 / 3 구독팬 / 9 매니저 */
export type Grade = 1 | 2 | 3 | 9;

export type BlindReason = '욕설/비속어' | '광고/의심' | '도배';

export type ChatLine =
  | { kind: 'msg'; id: string; uid: string; nick: string; color: string; badge: Badge[]; text: string; mine?: boolean; blind?: BlindReason }
  | { kind: 'sys'; id: string; text: string; join?: boolean }
  | { kind: 'dono'; id: string; uid: string; nick: string; color: string; badge: Badge[]; amount: number; currency: string; text: string };

export type Poll = {
  mode: 'vote' | 'bet';
  question: string;
  options: { label: string; votes: number }[];
  myPick: number | null;
  closed: boolean;
};

export type ChannelState = {
  lines: ChatLine[];
  notice: string | null;
  viewers: number;
  poll: Poll | null;
};

export type Channel = {
  id: string;
  name: string;
  /** 후원 재화명 */
  dono: string;
  /** 후원 금액 프리셋 */
  amts: number[];
  streamer: string;
  sub: string;
  viewers: number;
  notice: string;
  users: ChatUser[];
  /** 자동 생성 시뮬레이션에 쓰이는 문장 풀 */
  lines: string[];
  /** 초기 표시 메시지 */
  seed: { uid: string; text: string }[];
};

export type Judgement = { verdict: 'pass' } | { verdict: 'blind'; reason: BlindReason };
