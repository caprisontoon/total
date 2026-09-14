import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Users, Radio, Info, ArrowUpDown, Search as SearchIcon } from 'lucide-react';
import ViewerShell from './ViewerShell';
import { LIVES, CATEGORIES, formatViewers, formatElapsed, type Live, type Platform } from './liveData';

// 전체 라이브 (시청 홈) — ⑦-7-3. 차세대 라이브 목록에 '투네이션' 탭을 추가한 화면.
// 카드를 클릭하면 채널 시청 페이지(/live/:id)로 이동한다.

type PlatformTab = '전체' | Platform;
const PLATFORM_TABS: PlatformTab[] = ['전체', '투네이션', '유튜브', '트위치', '기타']; // 투네이션 = 전체 다음 첫 자리
const SORTS = ['시청자 높은순', '최근 시작순', '제목순'] as const;

const PLATFORM_STYLE: Record<Platform, string> = {
  '투네이션': 'bg-red-600 text-white',
  '유튜브': 'bg-white/90 text-red-600',
  '트위치': 'bg-[#9147FF] text-white',
  '기타': 'bg-slate-700 text-white',
};

export default function LivePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const favoritesOnly = params.get('tab') === 'favorites';

  const [tab, setTab] = useState<PlatformTab>('전체');
  const [cat, setCat] = useState('전체');
  const [sort, setSort] = useState<(typeof SORTS)[number]>('시청자 높은순');
  const [query, setQuery] = useState('');
  const [favs, setFavs] = useState<Set<string>>(new Set(['ym', 'vocal']));

  const toggleFav = (id: string) => setFavs((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const list = useMemo(() => {
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
    <ViewerShell active={favoritesOnly ? 'favorites' : 'live'} title={favoritesOnly ? '즐겨찾기' : '전체 라이브'}>
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* 상단 요약 */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{favoritesOnly ? '즐겨찾기한 크리에이터' : '지금 라이브 중'}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {favoritesOnly ? '즐겨찾기한 채널의 방송 상태입니다.' : <>총 <b className="text-slate-800 dark:text-slate-200">{counts['전체']}</b>개 방송 · 투네이션 자체 송출 <b className="text-red-500">{counts['투네이션']}</b>개</>}
            </p>
          </div>
          <div className="relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="제목 · 크리에이터 검색" className="pl-9 pr-4 py-2 w-full lg:w-72 bg-slate-100 dark:bg-slate-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* 플랫폼 탭 */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 mb-3">
          {PLATFORM_TABS.map((t) => {
            const active = tab === t;
            const isToon = t === '투네이션';
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  active ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                {isToon && <Radio size={14} className={active ? 'text-red-400' : 'text-red-500'} />}
                {t}
                <span className={`text-[11px] tabular-nums ${active ? 'opacity-70' : 'text-slate-400'}`}>{counts[t]}</span>
              </button>
            );
          })}
        </div>

        {/* 카테고리 + 정렬 */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${cat === c ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                {c}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <ArrowUpDown size={14} />
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SORTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>

        {/* 카드 그리드 */}
        {list.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <Radio size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">조건에 맞는 라이브가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {list.map((l) => (
              <React.Fragment key={l.id}>
                <LiveCard live={l} fav={favs.has(l.id)} onFav={() => toggleFav(l.id)} onOpen={() => navigate(`/live/${l.id}`)} />
              </React.Fragment>
            ))}
          </div>
        )}

        {/* 범례 */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
          <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">TOON</span> 투네이션 자체 송출 — 시청자 수는 실측값</span>
          <span className="flex items-center gap-1.5"><Info size={13} /> 유튜브 · 트위치 · 기타는 해당 플랫폼 플레이어로 재생됩니다</span>
        </div>
      </div>
    </ViewerShell>
  );
}

function LiveCard({ live, fav, onFav, onOpen }: { live: Live; fav: boolean; onFav: () => void; onOpen: () => void }) {
  const offline = live.status === 'offline';
  const suspended = live.status === 'suspended';
  return (
    <div className="group text-left">
      <button onClick={onOpen} className="block w-full text-left">
        <div className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${live.hue} ${offline ? 'grayscale opacity-70' : ''}`}>
          <div className="absolute inset-0 flex items-center justify-center text-white/25 text-5xl">▶</div>
          {/* 상태 · 시청자 */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            {offline ? (
              <span className="bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">오프라인</span>
            ) : (
              <>
                <span className={`flex items-center gap-1 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ${suspended ? 'bg-amber-500' : 'bg-red-600'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {suspended ? '일시중단' : 'LIVE'}
                </span>
                <span className="flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums" title={live.platform === '투네이션' ? '실측 시청자 수' : '외부 플랫폼 제공 값'}>
                  <Users size={10} /> {formatViewers(live.viewers)}
                </span>
              </>
            )}
          </div>
          {/* 플랫폼 배지 */}
          <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${PLATFORM_STYLE[live.platform]}`}>
            {live.platform === '투네이션' ? 'TOON' : live.platform}
          </span>
          {/* 카테고리 · 엑셀 */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <span className="bg-black/50 text-white/90 text-[10px] px-1.5 py-0.5 rounded">{live.category}</span>
            {live.excel && <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">엑셀방송</span>}
          </div>
          <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-2 ring-blue-500/70 transition-all" />
        </div>
      </button>
      <div className="flex items-start gap-2.5 mt-2.5">
        <div className="w-9 h-9 rounded-full bg-slate-800 text-white shrink-0 flex items-center justify-center text-xs font-bold">{live.creator.slice(0, 2)}</div>
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{live.title}</div>
          <div className="text-xs text-slate-500 mt-0.5 truncate">{live.creator} · {offline ? `마지막 방송 ${live.lastBroadcast.date}` : formatElapsed(live.startedMinAgo)}</div>
        </button>
        <button onClick={onFav} title={fav ? '즐겨찾기 해제' : '즐겨찾기'} className={`shrink-0 mt-0.5 p-1 rounded-md transition-colors ${fav ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}>
          <Star size={16} className={fav ? 'fill-amber-400' : ''} />
        </button>
      </div>
    </div>
  );
}
