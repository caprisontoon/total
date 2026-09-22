// 이모티콘 35종.
//
// 프로토타입의 base64 data URI 원본은 이 세션에서 받아올 수 없었다
// (chat-demo-psi-two.vercel.app 이 egress 정책에 막혀 403).
// 그래서 이름 35종과 모듈 모양(STICKERS: {name, src}[])은 그대로 두고,
// 그림만 자체 생성 SVG 플레이스홀더로 채웠다.
// 실제 자산을 받으면 아래 STICKERS 배열의 src만 base64 data URI로 갈아끼우면 된다.
//
// 이 모듈은 LiveChat에서 동적 import(lazy)로만 불러온다 — 초기 번들을 막지 않기 위해서다.

export type Sticker = { name: string; src: string };

/** 프로토타입 순서 그대로 */
const NAMES = [
  '와아', '대박', '굿', '하트', 'ㅋㅋ', '최고', '물음', 'ㅠㅠ', '파티', '사랑',
  '반짝', '헐', 'ㅎㅎ', '잠', '노트북', '부탁', '가자', '화이팅', '하트2', 'ㅋㅋ2',
  '놀람', '커피', '하트3', '오케이', '따봉', '좋아', '안녕', '점점', '하트눈', '잘자',
  '확인', '감동', '가즈아', '힐링', '왕',
] as const;

// 이름마다 고정 색을 주려고 문자열 해시를 쓴다 (새로고침해도 같은 색).
function hue(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 360;
}

function draw(name: string): string {
  const h = hue(name);
  const bg = `hsl(${h} 72% 62%)`;
  const deep = `hsl(${h} 70% 40%)`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">` +
    `<rect width="64" height="64" rx="16" fill="${bg}"/>` +
    `<text x="32" y="33" text-anchor="middle" dominant-baseline="middle" ` +
    `font-family="Pretendard,AppleSDGothicNeo,'Malgun Gothic',sans-serif" font-size="${name.length > 3 ? 13 : name.length > 2 ? 16 : 20}" ` +
    `font-weight="700" fill="#fff">${name}</text>` +
    `<rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="${deep}" stroke-width="2"/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const STICKERS: Sticker[] = NAMES.map((name) => ({ name, src: draw(name) }));

export const STICKER_NAMES: readonly string[] = NAMES;
