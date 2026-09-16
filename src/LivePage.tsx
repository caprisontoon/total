import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Radio, BadgeCheck, Search as SearchIcon } from 'lucide-react';
import ViewerShell from './ViewerShell';
import { LIVES, CATEGORIES, formatViewers, type Live, type Platform } from './liveData';

// 전체 라이브 (시청 홈) — ⑦-7-3. 실제 투네이션 라이브 목록 디자인을 따른다.
// 플랫폼 탭: [전체] [투네이션] [유튜브] [치지직] [트위치] [기타]
// 카드를 클릭하면 채널 시청 페이지(/live/:id)로 이동한다.

type PlatformTab = '전체' | Platform;
const PLATFORM_TABS: PlatformTab[] = ['전체', '투네이션', '유튜브', '치지직', '트위치', '기타'];
const SORTS = ['시청자 높은순', '최근 시작순', '제목순'] as const;

// 플랫폼 배지 — 각 서비스의 브랜드 색을 쓰되, 색만으로 구분되지 않도록 항상 이름을 함께 둔다.
const PLATFORM_BADGE: Record<Platform, { label: string; cls: string }> = {
  '투네이션': { label: 'TOON', cls: 'bg-[#4a90f8] text-white' },
  '유튜브': { label: 'YouTube', cls: 'bg-[#ff0033] text-white' },
  '치지직': { label: '치지직', cls: 'bg-[#00ffa3] text-slate-900' },
  '트위치': { label: 'Twitch', cls: 'bg-[#9147ff] text-white' },
  '기타': { label: '기타', cls: 'bg-slate-700 text-white' },
};

export default function LivePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const favoritesOnly = params.get('tab') === 'favorites';

  const [tab, setTab] = useState<PlatformTab>('전체');
  const [cat, setCat] = useState('전체');
  const [sort, setSort] = useState<(typeof SORTS)[number]>('시청자 높은순');
  const [query, setQuery] = useState('');
  const [favs, setFavs] = useState<Set<string>>(new Set(['ym', 'vocal', 'kukshi', 'jadoo']));

  const toggleFav = (id: string) => setFavs((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const list: Live[] = useMemo(() => {
    let l = LIVES.filter((x) => x.status !== 'offline');
    if (favoritesOnly) l = LIVES.filter((x) => favs.has(x.id));
    if (tab !== '전체') l = l.filter((x) => x.platform === tab);
    if (cat !== '전체') l = l.filter((x) => x.category === cat);
    if (query.trim()) { const q = query.trim().toLowerCase(); l = l.filter((x) => x.title.toLowerCase().includes(q) || x.creator.toLowerCase().includes(q)); }
    if (sort === '시청자 높은순') l = [...l].sort((a, b) => b.viewers - a.viewers);
    if (sort === '최근 시작순') l = [...l].sort((a, b) => a.startedMinAgo - b.startedMinAgo);
    if (sort === '제목순') l = [...l].sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    return l;
  }, [tab, cat, sort, query, favoritesOnly, favs]);

  const counts = useMemo(() => {
    const on = LIVES.filter((x) => x.status !== 'offline');
    const c: Record<string, number> = { '전체': on.length };
    for (const p of PLATFORM_TABS.slice(1)) c[p] = on.filter((x) => x.platform === p).length;
    return c;
  }, []);

  return (
    <ViewerShell active={favoritesOnly ? 'favorites' : 'live'} search={query} onSearch={setQuery}>
      <div className="p-5 lg:p-8">
        {/* 제목 */}
        <div className="flex items-end justify-between gap-4 mb-4">
          <h2 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">
            {favoritesOnly ? '즐겨찾기' : '전체 라이브'}
          </h2>
          {/* 좁은 화면에서는 헤더 검색창이 숨으므로 목록 위에 검색창을 둔다 */}
          <div className="relative md:hidden w-40">
            <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="검색"
              className="pl-9 pr-3 py-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* 플랫폼 탭 */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 mb-5">
          {PLATFORM_TABS.map((t) => {
            const active = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                {t}
                <span className={`ml-1.5 text-[11px] tabular-nums ${active ? 'opacity-60' : 'text-slate-400'}`}>{counts[t] ?? 0}</span>
              </button>
            );
          })}
        </div>

        {/* 카테고리 + 정렬 */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  cat === c ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                {c}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[13px] text-slate-600 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {SORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* 카드 그리드 */}
        {list.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <Radio size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">조건에 맞는 라이브가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-6">
            {list.map((l) => (
              <React.Fragment key={l.id}>
                <LiveCard live={l} fav={favs.has(l.id)} onFav={() => toggleFav(l.id)} onOpen={() => navigate(`/live/${l.id}`)} />
              </React.Fragment>
            ))}
          </div>
        )}

        {/* 범례 */}
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
          <span className="font-bold text-slate-400">플랫폼 배지</span>
          {(Object.keys(PLATFORM_BADGE) as Platform[]).map((p) => (
            <span key={p} className="flex items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${PLATFORM_BADGE[p].cls}`}>{PLATFORM_BADGE[p].label}</span>
              {p === '투네이션' ? '투네이션 자체 송출 · 시청자 수 실측값' : `${p} 플레이어로 재생`}
            </span>
          ))}
        </div>
      </div>
    </ViewerShell>
  );
}

function LiveCard({ live, fav, onFav, onOpen }: { live: Live; fav: boolean; onFav: () => void; onOpen: () => void }) {
  const suspended = live.status === 'suspended';
  const badge = PLATFORM_BADGE[live.platform];
  return (
    <div className="group">
      {/* 즐겨찾기 버튼은 썸네일 버튼의 형제로 둔다 — button 중첩은 브라우저가 깨뜨린다 */}
      <div className={`relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br ${live.hue}`}>
        <button onClick={onOpen} className="absolute inset-0 w-full h-full text-left" aria-label={`${live.creator} · ${live.title} 시청하기`}>
          <span className="absolute inset-0 flex items-center justify-center text-white/20 text-5xl">▶</span>
        </button>

        {/* 시청자 수 — 실제 디자인의 좌상단 붉은 점 + 인원 필 */}
        <span className="pointer-events-none absolute top-2 left-2 flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[11px] font-bold px-1.5 py-[3px] rounded tabular-nums"
          title={live.platform === '투네이션' ? '실측 시청자 수' : '외부 플랫폼 제공 값'}>
          <span className={`w-1.5 h-1.5 rounded-full ${suspended ? 'bg-amber-400' : 'bg-red-500'}`} />
          {formatViewers(live.viewers)}명
        </span>

        {/* 즐겨찾기 */}
        <button onClick={onFav} title={fav ? '즐겨찾기 해제' : '즐겨찾기'}
          className={`absolute top-1.5 right-1.5 p-1 rounded transition-colors ${fav ? 'text-amber-400' : 'text-white/70 hover:text-amber-300'}`}>
          <Star size={16} className={fav ? 'fill-amber-400' : ''} />
        </button>

        {/* 플랫폼 배지 — 어떤 플랫폼 방송인지 썸네일에서 바로 알 수 있게 한다 */}
        <span className={`pointer-events-none absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-[2px] rounded ${badge.cls}`}>{badge.label}</span>

        {/* 일시중단 · 엑셀방송 */}
        <div className="pointer-events-none absolute bottom-1.5 right-1.5 flex items-center gap-1">
          {live.excel && <span className="bg-black/55 text-white text-[10px] font-bold px-1.5 py-[2px] rounded">엑셀방송</span>}
          {suspended && <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-[2px] rounded">일시중단</span>}
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-lg ring-0 group-hover:ring-2 ring-blue-500/70 transition-all" />
      </div>

      <button onClick={onOpen} className="flex items-start gap-2 mt-2 w-full text-left">
        <div className={`w-8 h-8 rounded-full shrink-0 bg-gradient-to-br ${live.hue} text-white flex items-center justify-center text-[10px] font-bold`}>
          {live.creator.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {live.title}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[12px] text-slate-500 truncate">{live.creator}</span>
            <BadgeCheck size={13} className="text-blue-500 shrink-0" aria-label="인증 채널" />
          </div>
        </div>
      </button>
    </div>
  );
}
