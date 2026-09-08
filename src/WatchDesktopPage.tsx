import React, { useState } from 'react';
import {
  Radio, Star, Search, Gamepad2, Wallet, Wifi, Bell, User, Heart, Users,
  Trophy, Gift, Target, Sliders, Maximize, Settings as SettingsIcon, Volume2,
  ChevronLeft, Plus, Send, Smile, Play, Coins, Crown,
} from 'lucide-react';

// 시청용 데스크탑 — 도우인 PC 앱 스타일 시청 프로그램 UI 프로토타입.
// 실제 재생/후원 기능은 없으며, 좌측 메뉴와 라이브 카드를 클릭하면 화면이 전환됩니다.

type Nav = 'live' | 'favorites' | 'explore' | 'play' | 'me';

const NAV: { id: Nav; label: string; icon: any }[] = [
  { id: 'live', label: '라이브', icon: Radio },
  { id: 'favorites', label: '즐겨찾기', icon: Star },
  { id: 'explore', label: '탐색', icon: Search },
  { id: 'play', label: '플레이', icon: Gamepad2 },
  { id: 'me', label: '내 정보', icon: User },
];

type Live = { title: string; creator: string; viewers: number; platform: 'TOON' | '유튜브' | '트위치'; cat: string; hue: string };
const LIVES: Live[] = [
  { title: '엑셀 방송 | 오늘 목표 300만원!', creator: '별빛크루', viewers: 1204, platform: 'TOON', cat: '토크', hue: 'from-fuchsia-600 to-indigo-700' },
  { title: '롤 챌린저 도전기 랭크 올리기', creator: '게임왕TV', viewers: 892, platform: '유튜브', cat: '게임', hue: 'from-emerald-600 to-teal-800' },
  { title: '심야 감성 토크 & 사연 읽기', creator: '밤하늘', viewers: 455, platform: 'TOON', cat: '토크', hue: 'from-sky-600 to-blue-800' },
  { title: '발로란트 5인 파티 모집', creator: '타격감', viewers: 310, platform: '트위치', cat: '게임', hue: 'from-rose-600 to-pink-800' },
  { title: '노래방송 신청곡 받아요 🎵', creator: '보컬여신', viewers: 678, platform: 'TOON', cat: '음악', hue: 'from-amber-500 to-orange-700' },
  { title: '주식 리딩 라이브 (실시간)', creator: '차트마스터', viewers: 240, platform: '유튜브', cat: '금융', hue: 'from-lime-600 to-green-800' },
  { title: '그림 그리기 커미션 작업방', creator: '아트린', viewers: 156, platform: 'TOON', cat: '아트', hue: 'from-violet-600 to-purple-800' },
  { title: '먹방 | 매운거 챌린지 🔥', creator: '푸드파이터', viewers: 523, platform: '트위치', cat: '먹방', hue: 'from-red-600 to-rose-800' },
];

const PLATFORM_TABS = ['전체', '★ 투네이션', '유튜브', '트위치'] as const;
const CATS = ['전체', '게임', '토크', '음악', '먹방', '아트', '금융'];

const CHAT = [
  { u: '유저A', m: 'ㅋㅋㅋㅋ', c: 'text-sky-400' },
  { u: '유저B', m: '화이팅!!', c: 'text-emerald-400' },
  { u: '유저C', m: '룰렛 5,000원 → "벌칙 3번" 당첨', c: 'text-amber-400', d: true },
  { u: '유저D', m: '대박 ㄷㄷ', c: 'text-fuchsia-400' },
  { u: '유저E', m: '오늘 목표 갈수있어요?', c: 'text-sky-400' },
  { u: '유저F', m: 'ㅇㅈㅇㅈ', c: 'text-emerald-400' },
];

const RANK = [
  { r: 1, u: '유저C', amt: 82000, badge: 'VIP', bc: 'text-fuchsia-400' },
  { r: 2, u: '유저A', amt: 51000, badge: '골드', bc: 'text-amber-400' },
  { r: 3, u: '유저F', amt: 30000, badge: '실버', bc: 'text-slate-300' },
  { r: 4, u: '유저K', amt: 18500, badge: '', bc: '' },
  { r: 5, u: '유저P', amt: 12000, badge: '', bc: '' },
];

export default function WatchDesktopPage() {
  const [nav, setNav] = useState<Nav>('live');
  const [room, setRoom] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-screen bg-[#0f1013] text-slate-200 text-sm select-none overflow-hidden">
      {/* ===== Title bar ===== */}
      <div className="flex items-center justify-between h-11 px-4 bg-[#16171c] border-b border-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold"><Radio size={16} /> 투네이션</div>
          <div className="flex items-center bg-black/30 rounded-md p-0.5">
            <button className="px-3 py-1 rounded text-[12px] font-semibold bg-blue-600 text-white">시청</button>
            <button
              onClick={() => window.open('/desktop/broadcast', 'broadcastDesktop', 'width=1280,height=800')}
              className="px-3 py-1 rounded text-[12px] text-slate-400 hover:text-white transition-colors"
            >방송</button>
          </div>
        </div>
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="flex items-center gap-2 w-full bg-black/30 border border-slate-700/60 rounded-full px-3 py-1.5">
            <Search size={14} className="text-slate-500" />
            <input placeholder="라이브 · 크리에이터 검색" className="bg-transparent outline-none text-[13px] flex-1 placeholder:text-slate-600" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-slate-400 hover:text-white">
            <Bell size={17} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">3</span>
          </button>
          <span className="flex items-center gap-1.5 text-[12px] text-amber-300"><Coins size={14} /> 50,000</span>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 flex items-center justify-center text-white text-[11px] font-bold">투</div>
          <div className="flex items-center gap-2 text-slate-500 ml-2">
            <span className="w-3 h-0.5 bg-slate-500" /><span className="w-2.5 h-2.5 border border-slate-500" /><span className="hover:text-red-400 cursor-pointer">✕</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* ===== Sidebar ===== */}
        <div className="w-20 bg-[#16171c] border-r border-black/40 flex flex-col items-center py-3 gap-1 shrink-0">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = nav === n.id && room === null;
            return (
              <button key={n.id}
                onClick={() => { setNav(n.id); setRoom(null); }}
                className={`w-16 py-2.5 flex flex-col items-center gap-1 rounded-xl transition-colors ${active ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                <Icon size={20} />
                <span className="text-[11px]">{n.label}</span>
              </button>
            );
          })}
          <div className="mt-auto flex flex-col items-center gap-1 text-emerald-400 pt-2">
            <Wifi size={16} /><span className="text-[9px] text-center leading-tight">그리드<br />동작 중</span>
          </div>
        </div>

        {/* ===== Main ===== */}
        <div className="flex-1 min-w-0 flex flex-col">
          {room !== null ? (
            <LiveRoom live={LIVES[room]} onBack={() => setRoom(null)} onPick={setRoom} />
          ) : nav === 'live' ? (
            <LiveGrid onOpen={setRoom} />
          ) : nav === 'favorites' ? (
            <Favorites onOpen={setRoom} />
          ) : nav === 'explore' ? (
            <Explore />
          ) : nav === 'play' ? (
            <PlayHub />
          ) : (
            <MeView />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Live grid (home) ---------------- */
function LiveGrid({ onOpen }: { onOpen: (i: number) => void }) {
  const [ptab, setPtab] = useState(0);
  const [cat, setCat] = useState(0);
  return (
    <div className="flex-1 overflow-y-auto">
      {/* tabs */}
      <div className="sticky top-0 z-10 bg-[#0f1013]/95 backdrop-blur px-6 pt-5 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2 mb-3">
          {PLATFORM_TABS.map((t, i) => (
            <button key={t} onClick={() => setPtab(i)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${ptab === i ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
          <div className="ml-auto">
            <select className="bg-white/5 border border-slate-700 rounded-md px-2.5 py-1.5 text-[12px] text-slate-300">
              <option>시청자 높은순</option><option>최신순</option><option>후원 많은순</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATS.map((c, i) => (
            <button key={c} onClick={() => setCat(i)}
              className={`px-2.5 py-1 rounded-md text-[12px] transition-colors ${cat === i ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* cards */}
      <div className="p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {LIVES.map((l, i) => <React.Fragment key={i}><LiveCard live={l} onClick={() => onOpen(i)} /></React.Fragment>)}
      </div>
      <p className="text-center text-[11px] text-slate-600 pb-6">※ TOON 배지 = 투네이션 자체 송출 (후원 인터랙션 지원)</p>
    </div>
  );
}

function LiveCard({ live, onClick }: { live: Live; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left group">
      <div className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${live.hue}`}>
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-4xl">▶</div>
        <span className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {live.viewers.toLocaleString()}
        </span>
        <PlatformBadge p={live.platform} />
        <span className="absolute bottom-2 left-2 bg-black/50 text-white/80 text-[10px] px-1.5 py-0.5 rounded">{live.cat}</span>
        <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-blue-400/70 rounded-xl transition-all" />
      </div>
      <div className="flex items-start gap-2 mt-2">
        <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0 flex items-center justify-center text-[11px]">{live.creator[0]}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium truncate group-hover:text-blue-400 transition-colors">{live.title}</div>
          <div className="text-[11px] text-slate-500 truncate">{live.creator}</div>
        </div>
        <Star size={14} className="text-slate-600 hover:text-amber-400 shrink-0 mt-0.5" />
      </div>
    </button>
  );
}

function PlatformBadge({ p }: { p: Live['platform'] }) {
  const map = { 'TOON': 'bg-red-600', '유튜브': 'bg-red-500/90', '트위치': 'bg-purple-600' } as const;
  return <span className={`absolute top-2 right-2 ${map[p]} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>{p}</span>;
}

/* ---------------- Live room (3-panel) ---------------- */
function LiveRoom({ live, onBack, onPick }: { live: Live; onBack: () => void; onPick: (i: number) => void }) {
  const donateBtns = ['후원하기', '퀘스트', '룰렛', '투표', '위시리스트'];
  const [rankTab, setRankTab] = useState(0);
  return (
    <div className="flex flex-1 min-h-0">
      {/* center */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 shrink-0">
          <button onClick={onBack} className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-white"><ChevronLeft size={16} /> 목록</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* video */}
          <div className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${live.hue} flex items-center justify-center`}>
            <div className="text-white/40 text-6xl">▶</div>
            <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE
            </span>
            {/* player controls */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center gap-3 text-white/90">
              <Play size={16} /> <Volume2 size={16} />
              <div className="flex-1 h-1 rounded-full bg-white/30"><div className="h-full w-2/3 rounded-full bg-blue-400" /></div>
              <span className="text-[11px]">1080p</span><SettingsIcon size={15} />
              <button onClick={() => window.open('/desktop/watch', 'watchPopout', 'width=900,height=560')} className="flex items-center gap-1 text-[11px] hover:text-blue-300"><Plus size={13} /> 새 창</button>
              <Maximize size={15} />
            </div>
          </div>
          {/* info */}
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">{live.creator[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold truncate">{live.title}</div>
              <div className="text-[12px] text-slate-500 flex items-center gap-2">
                <span className="flex items-center gap-1"><Users size={12} /> {live.viewers.toLocaleString()}명</span> · {live.creator}
              </div>
            </div>
            <button className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"><Star size={14} /> 즐겨찾기</button>
            <button className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white"><Crown size={14} /> 멤버십</button>
          </div>
          {/* donation buttons */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {donateBtns.map((b, i) => (
              <button key={b} className={`px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${i === 0 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-200'}`}>{b}</button>
            ))}
          </div>
          {/* multi watch */}
          <div className="mt-4">
            <div className="text-[12px] text-slate-500 mb-2">다중 시청</div>
            <div className="flex items-center gap-2">
              {LIVES.slice(0, 4).map((l, i) => (
                <button key={i} onClick={() => onPick(i)}
                  className={`relative w-28 aspect-video rounded-lg overflow-hidden bg-gradient-to-br ${l.hue} ${LIVES[i] === live ? 'ring-2 ring-blue-400' : ''}`}>
                  <span className="absolute bottom-1 left-1 text-[9px] text-white/90 bg-black/50 px-1 rounded">{l.creator}</span>
                </button>
              ))}
              <button className="w-28 aspect-video rounded-lg border border-dashed border-slate-700 text-slate-500 flex items-center justify-center hover:border-blue-500 hover:text-blue-400"><Plus size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* right: chat + ranking */}
      <div className="w-80 shrink-0 border-l border-slate-800 flex flex-col bg-[#131418]">
        {/* chat */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="px-3 py-2 border-b border-slate-800 text-[12px] font-semibold text-slate-300 flex items-center gap-2"><span>💬</span> 채팅</div>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
            {CHAT.map((c, i) => (
              <div key={i} className="text-[12px] leading-snug">
                {c.d ? (
                  <span className="block bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1 text-amber-300"><b>★ {c.u}</b> {c.m}</span>
                ) : (
                  <span><b className={c.c}>{c.u}</b> <span className="text-slate-300">{c.m}</span></span>
                )}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-slate-800 flex items-center gap-2">
            <Smile size={16} className="text-slate-500" />
            <input placeholder="채팅 입력" className="flex-1 bg-black/30 rounded-full px-3 py-1.5 text-[12px] outline-none placeholder:text-slate-600" />
            <button className="text-blue-400"><Send size={16} /></button>
          </div>
        </div>

        {/* ranking */}
        <div className="border-t border-slate-800">
          <div className="px-3 py-2 flex items-center gap-2 text-[12px] font-semibold text-slate-300"><Trophy size={14} className="text-amber-400" /> 후원 랭킹</div>
          <div className="flex gap-1 px-3 pb-2">
            {['방송', '일', '주', '월', '누적'].map((t, i) => (
              <button key={t} onClick={() => setRankTab(i)} className={`px-2 py-0.5 rounded text-[11px] ${rankTab === i ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>{t}</button>
            ))}
          </div>
          <div className="px-3 pb-2 space-y-1">
            {RANK.map((r) => (
              <div key={r.r} className="flex items-center gap-2 text-[12px]">
                <span className={`w-4 text-center font-bold ${r.r <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>{r.r}</span>
                <span className="flex-1 truncate">{r.u} {r.badge && <b className={`text-[10px] ${r.bc}`}>◆{r.badge}</b>}</span>
                <span className="tabular-nums text-slate-300">{r.amt.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mx-3 mb-3 mt-1 rounded-lg bg-white/5 p-2.5">
            <div className="flex items-center justify-between text-[12px]"><span className="text-slate-400">내 순위</span><span className="font-semibold">7위 · 12,000원</span></div>
            <div className="text-[11px] text-slate-500 mt-0.5">6위까지 3,500원 남음</div>
            <button className="w-full mt-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold">후원하기</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Favorites ---------------- */
function Favorites({ onOpen }: { onOpen: (i: number) => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-bold text-white mb-1">즐겨찾기</h1>
      <p className="text-[12px] text-slate-500 mb-4">팔로우한 크리에이터의 라이브</p>
      <div className="space-y-2">
        {LIVES.slice(0, 5).map((l, i) => (
          <button key={i} onClick={() => onOpen(i)} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[#16171c] hover:bg-white/5 transition-colors text-left">
            <div className={`w-24 aspect-video rounded-lg bg-gradient-to-br ${l.hue} shrink-0 relative`}>
              <span className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 text-[9px] px-1 rounded"><span className="w-1 h-1 rounded-full bg-red-500" />LIVE</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate">{l.title}</div>
              <div className="text-[12px] text-slate-500">{l.creator} · {l.viewers.toLocaleString()}명 시청</div>
            </div>
            <PlatformPill p={l.platform} />
          </button>
        ))}
      </div>
    </div>
  );
}
function PlatformPill({ p }: { p: Live['platform'] }) {
  const map = { 'TOON': 'bg-red-600', '유튜브': 'bg-red-500/80', '트위치': 'bg-purple-600' } as const;
  return <span className={`${map[p]} text-white text-[10px] font-bold px-2 py-0.5 rounded shrink-0`}>{p}</span>;
}

/* ---------------- Explore ---------------- */
function Explore() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-bold text-white mb-4">탐색</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATS.slice(1).concat(['스포츠', '보이스', '코딩']).map((c, i) => (
          <div key={c} className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${LIVES[i % LIVES.length].hue} p-4 flex flex-col justify-end hover:scale-[1.02] transition-transform cursor-pointer`}>
            <div className="text-white font-bold text-[15px]">{c}</div>
            <div className="text-white/70 text-[11px]">{(Math.random() * 900 + 100 | 0)}개 라이브</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Play hub ---------------- */
function PlayHub() {
  const games = [
    { n: '룰렛', i: Target }, { n: '투표', i: Sliders }, { n: '퀘스트', i: Trophy },
    { n: '위시리스트', i: Gift }, { n: '럭키박스', i: Gift }, { n: '그림 맞히기', i: Heart },
  ];
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-bold text-white mb-1">플레이</h1>
      <p className="text-[12px] text-slate-500 mb-4">후원으로 방송에 개입하는 인터랙션</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {games.map((g) => {
          const Icon = g.i;
          return (
            <div key={g.n} className="rounded-xl border border-slate-800 bg-[#16171c] p-5 flex flex-col items-center gap-2 hover:border-blue-500/50 transition-colors">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 text-blue-300"><Icon size={24} /></div>
              <span className="text-[13px]">{g.n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Me ---------------- */
function MeView() {
  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold">투</div>
        <div>
          <div className="text-lg font-bold text-white">투네이션 유저</div>
          <div className="text-[12px] text-slate-500">@toon_user · 골드 등급</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ l: '보유 캐시', v: '50,000', i: Coins }, { l: '이번달 후원', v: '128,000', i: Gift }, { l: '팔로잉', v: '24', i: Users }].map((s) => {
          const Icon = s.i;
          return (
            <div key={s.l} className="rounded-xl bg-[#16171c] border border-slate-800 p-4">
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-1"><Icon size={13} /> {s.l}</div>
              <div className="text-lg font-bold text-white tabular-nums">{s.v}</div>
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        {['충전하기', '후원 내역', '멤버십 관리', '그리드 설정', '앱 설정'].map((m) => (
          <button key={m} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#16171c] hover:bg-white/5 text-[13px] transition-colors">
            {m} <ChevronLeft size={15} className="rotate-180 text-slate-600" />
          </button>
        ))}
      </div>
    </div>
  );
}
