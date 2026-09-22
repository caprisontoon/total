// ":이름:" 문법 ↔ 이모티콘 이미지 치환.
// 스티커 모듈은 무겁기 때문에(실제 자산은 base64 380KB 상당) 동적 import로만 읽는다.

import type { Sticker } from './stickers';

export type Token = { t: 'text'; v: string } | { t: 'emo'; name: string; src: string };

let cache: Map<string, string> | null = null;
let loading: Promise<Map<string, string>> | null = null;

/** 스티커를 한 번만 로드해 이름 → src 맵으로 캐시한다. */
export function loadStickers(): Promise<Map<string, string>> {
  if (cache) return Promise.resolve(cache);
  if (!loading) {
    loading = import('./stickers').then((m) => {
      cache = new Map(m.STICKERS.map((s: Sticker) => [s.name, s.src]));
      return cache;
    });
  }
  return loading;
}

/** 이미 로드됐다면 동기 접근 (렌더 경로에서 사용) */
export const stickerMap = () => cache;

const RE = /:([^:\s]{1,12}):/g;

/** 본문을 텍스트 · 이모티콘 토큰으로 쪼갠다. 맵이 아직 없으면 전부 텍스트로 둔다. */
export function tokenize(text: string, map: Map<string, string> | null): Token[] {
  if (!map) return [{ t: 'text', v: text }];
  const out: Token[] = [];
  let last = 0;
  RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE.exec(text))) {
    const src = map.get(m[1]);
    if (!src) continue;
    if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) });
    out.push({ t: 'emo', name: m[1], src });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) });
  return out.length ? out : [{ t: 'text', v: text }];
}

/** 미리보기(앵커) 등 순수 텍스트가 필요한 곳 */
export const stripEmotes = (text: string) => text.replace(/:([^:\s]{1,12}):/g, '$1');
