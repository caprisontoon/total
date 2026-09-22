// 클린봇 — 프로토타입의 클라이언트 판정 파이프라인을 그대로 옮긴 것.
// normalize → toJamo → dictScore / spamScore / 광고 패턴 → judge
// 서버 호출 없이 클라이언트에서만 판정하며, 결과는 블라인드(개인 해제 가능)다.

import type { Judgement, BlindReason } from './types';

/* ── 1. normalize — 공백·특수문자 제거 + LEET 치환 ── */
const LEET: Record<string, string> = {
  '0': 'ㅇ', '1': 'l', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's',
  '|': 'l', '!': 'i', '+': 't', 'ㅇ0': 'ㅇ',
};

export function normalize(raw: string): string {
  let s = raw.toLowerCase();
  // 결합 문자 분리 후 발음 구별 기호 제거
  s = s.normalize('NFKC');
  s = s.replace(/[\s​-‏﻿]/g, '');
  s = s.split('').map((ch) => LEET[ch] ?? ch).join('');
  // 한글 · 영문 · 숫자만 남긴다
  s = s.replace(/[^가-힣ㄱ-ㆎa-z0-9]/g, '');
  return s;
}

/* ── 2. toJamo — 한글 자모 분해 (초성 변형 우회 탐지) ── */
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

export function toJamo(s: string): string {
  let out = '';
  for (const ch of s) {
    const code = ch.charCodeAt(0) - 0xac00;
    if (code >= 0 && code <= 11171) {
      out += CHO[Math.floor(code / 588)] + JUNG[Math.floor((code % 588) / 28)] + JONG[code % 28];
    } else {
      out += ch;
    }
  }
  return out;
}

/* ── 3. dictScore — 금칙어 사전 + ALLOW 예외 ── */
// 자모 단위로도 매칭하므로 '시1발', 'ㅅㅂ' 같은 변형도 걸린다.
const DICT = [
  '시발', '씨발', '씨빨', '시바', '개새끼', '새끼', '병신', '븅신', '지랄', '좆', '좃',
  '니미', '엠창', '창녀', '걸레년', '미친놈', '미친년', '또라이', '꺼져', '죽어라',
  '엿먹어', '개같은', '호구새끼', '등신', '찌질이', 'africa', '섹스', '야동',
];
// 사전에 걸리지만 정상적으로 쓰이는 말은 예외로 둔다.
const ALLOW = ['시바견', '시바이누', '새끼손가락', '새끼발가락', '개새김', '좆같이좋다'];

const DICT_JAMO = DICT.map(toJamo);

export function dictScore(norm: string): number {
  for (const a of ALLOW) {
    if (norm.includes(normalize(a))) return 0;
  }
  const jamo = toJamo(norm);
  let hits = 0;
  for (let i = 0; i < DICT.length; i++) {
    if (norm.includes(DICT[i]) || jamo.includes(DICT_JAMO[i])) hits++;
  }
  return hits;
}

/* ── 4. spamScore — 직전 메시지 중복 · 문자 반복 · 연속 발화 ── */
export type SpamMemory = {
  /** 최근 메시지 본문 (정규화) */
  recent: string[];
  /** uid → 연속 발화 횟수 */
  userReg: Record<string, number>;
  /** 마지막으로 말한 uid */
  lastUid: string | null;
};

export const newSpamMemory = (): SpamMemory => ({ recent: [], userReg: {}, lastUid: null });

export function spamScore(norm: string, uid: string, mem: SpamMemory): number {
  let score = 0;

  // 직전 메시지들과 완전히 같은 내용
  if (mem.recent.includes(norm)) score += 2;

  // 같은 문자 5회 이상 반복 (ㅋㅋㅋ 류는 흔하므로 임계를 높게 둔다)
  if (/(.)\1{5,}/.test(norm)) score += 1;
  // 같은 토막 3회 이상 반복
  if (/(.{2,6})\1{2,}/.test(norm)) score += 2;

  // 동일 유저 연속 발화
  const streak = mem.lastUid === uid ? (mem.userReg[uid] ?? 0) + 1 : 1;
  if (streak >= 4) score += 2;
  else if (streak >= 3) score += 1;

  return score;
}

export function rememberSpam(norm: string, uid: string, mem: SpamMemory): SpamMemory {
  const recent = [...mem.recent, norm].slice(-6);
  const streak = mem.lastUid === uid ? (mem.userReg[uid] ?? 0) + 1 : 1;
  return { recent, userReg: { ...mem.userReg, [uid]: streak }, lastUid: uid };
}

/* ── 5. 광고 / 연락처 패턴 ── */
const AD_PATTERNS: RegExp[] = [
  /카톡|카카오톡|오픈채팅|오픈카톡|텔레|텔레그램|디코|디스코드추가/,
  /010[-.]?\d{3,4}[-.]?\d{4}/,
  /(https?:\/\/|www\.)[a-z0-9]/i,
  /[a-z0-9-]+\.(com|net|co\.kr|kr|io|me|tv|xyz|top|vip)\b/i,
  /토토|먹튀|카지노|바카라|슬롯|배팅|사설|꽁머니|입플|환전/,
  /선입금|계좌번호|무료체험|수익보장|고수익|부업/,
];

export function adScore(raw: string, norm: string): number {
  let score = 0;
  for (const re of AD_PATTERNS) {
    if (re.test(raw) || re.test(norm)) score += 2;
  }
  return score;
}

/* ── 6. judge ── */
export function judge(raw: string, uid: string, mem: SpamMemory): Judgement {
  const norm = normalize(raw);
  if (!norm) return { verdict: 'pass' };

  const dict = dictScore(norm);
  const ad = adScore(raw, norm);
  const spam = spamScore(norm, uid, mem);

  // 우선순위: 욕설 > 광고 > 도배
  let reason: BlindReason | null = null;
  if (dict >= 1) reason = '욕설/비속어';
  else if (ad >= 2) reason = '광고/의심';
  else if (spam >= 2) reason = '도배';

  return reason ? { verdict: 'blind', reason } : { verdict: 'pass' };
}
