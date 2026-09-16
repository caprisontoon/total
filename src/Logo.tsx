import React from 'react';

// 투네이션 로고 — 심볼(+ · 밝은 링 · 진한 링)을 벡터로 재현한 컴포넌트.
// 원본 로고 파일(SVG/PNG)을 받으면 LogoMark 내부만 교체하면 전 화면에 반영된다.
//   · LogoMark : 심볼 전용 (정사각 버튼 등 좁은 자리)
//   · Logo     : 심볼 + toonation 워드마크

const BLUE = '#4a90f8';       // 플러스 · 오른쪽 링
const BLUE_LIGHT = '#afcffc'; // 가운데 링

export function LogoMark({ className = '', title = '투네이션' }: { className?: string; title?: string }) {
  // 가운데 밝은 링은 오른쪽 링이 겹치는 부분을 잘라내 사이에 여백을 둔다(마스크).
  const id = React.useId();
  return (
    <svg viewBox="0 0 770 310" className={className} role="img" aria-label={title} fill="none">
      <defs>
        {/* maskUnits 기본값(objectBoundingBox)은 링을 팔각형으로 잘라낸다 — userSpaceOnUse 필수 */}
        <mask id={`${id}-cut`} maskUnits="userSpaceOnUse" x="0" y="0" width="770" height="310">
          <rect width="770" height="310" fill="#fff" />
          <circle cx="635" cy="155" r="140" fill="#000" />
        </mask>
      </defs>
      {/* 플러스 — 끝이 완전히 둥근 두 막대 */}
      <rect x="10" y="95" width="264" height="90" rx="45" fill={BLUE} />
      <rect x="97" y="8" width="90" height="264" rx="45" fill={BLUE} />
      {/* 가운데 밝은 링 */}
      <circle cx="400" cy="155" r="93.5" stroke={BLUE_LIGHT} strokeWidth="63" mask={`url(#${id}-cut)`} />
      {/* 오른쪽 진한 링 */}
      <circle cx="635" cy="155" r="93.5" stroke={BLUE} strokeWidth="63" />
    </svg>
  );
}

// 심볼 + 워드마크. 워드마크는 앱 폰트를 그대로 쓰므로 다크 모드에서 자동으로 흰색이 된다.
export function Logo({ className = '', markClassName = 'h-6 w-auto', wordClassName = '' }: { className?: string; markClassName?: string; wordClassName?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${wordClassName}`}>toonation</span>
    </span>
  );
}

export default Logo;
