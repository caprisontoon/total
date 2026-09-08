import React, { useState } from 'react';
import {
  Radio, Home, Star, Compass, Gamepad2, User, Search, Bell, Coins, Wifi,
  Users, Trophy, Crown, Heart, Gift, Target, HelpCircle, ListTodo, Palette, Box,
  Play, Volume2, Maximize, Settings as SettingsIcon, Plus, Send, Smile, ChevronLeft,
  MessageSquare, Sparkles, Coins as CoinsIcon,
} from 'lucide-react';

// 시청용 데스크탑 — 도우인 시청용 PC 앱을 분석해 투네이션에 맞춘 시청 프로그램 UI.
// 도우인 라이브룸 구조 + 투네이션 강점(인터랙션 후원 퀵바 · 엑셀 랭킹판 · 멤버십/친밀도).
// 실제 기능은 없으며 좌측 메뉴/라이브 카드를 클릭하면 화면이 전환됩니다.

const ACCENT = '#18C9FF';

type Nav = 'home' | 'follow' | 'explore' | 'play' | 'me';
const NAV: { id: Nav; label: string; icon: any }[] = [
  { id: 'home', label: '라이브', icon: Home },
  { id: 'follow', label: '팔로우', icon: Star },
  { id: 'explore', label: '탐색', icon: Compass },
  { id: 'play', label: '플레이', icon: Gamepad2 },
  { id: 'me', label: '마이', icon: User },
];

type Live = { title: string; creator: string; viewers: number; platform: '투네이션' | '치지직' | '유튜브' | '트위치'; cat: string; excel?: boolean; hue: string };
const LIVES: Live[] = [
  { title: '엑셀 방송 | 오늘 목표 300만원 가보자!', creator: '별빛크루', viewers: 1204, platform: '투네이션', cat: '토크', excel: true, hue: 'from-fuchsia-600 to-indigo-700' },
  { title: '롤 챌린저 랭크 올리기 🎮', creator: '게임왕TV', viewers: 892, platform: '치지직', cat: '게임', hue: 'from-emerald-600 to-teal-800' },
  { title: '심야 감성 토크 & 사연', creator: '밤하늘', viewers: 455, platform: '투네이션', cat: '토크', excel: true, hue: 'from-sky-600 to-blue-800' },
  { title: '발로란트 5인 파티 모집', creator: '타격감', viewers: 310, platform: '트위치', cat: '게임', hue: 'from-rose-600 to-pink-800' },
  { title: '노래방송 신청곡 받아요 🎵', creator: '보컬여신', viewers: 678, platform: '투네이션', cat: '음악', hue: 'from-amber-500 to-orange-700' },
  { title: '주식 리딩 실시간', creator: '차트마스터', viewers: 240, platform: '유튜브', cat: '금융', hue: 'from-lime-600 to-green-800' },
  { title: '그림 커미션 작업방', creator: '아트린', viewers: 156, platform: '투네이션', cat: '아트', hue: 'from-violet-600 to-purple-800' },
  { title: '먹방 | 매운거 챌린지 🔥', creator: '푸드파이터', viewers: 523, platform: '치지직', cat: '먹방', excel: true, hue: 'from-red-600 to-rose-800' },
];

const PLATFORM_TABS = ['전체', '투네이션', '치지직', '유튜브', '트위치'];
const CATS = ['전체', '게임', '토크', '음악', '먹방', '아트', '금융'];

const CHAT = [
  { u: '유저A', m: 'ㅋㅋㅋㅋ', c: '#38bdf8', badge: '' },
  { u: '유저B', m: '오늘도 화이팅!', c: '#34d399', badge: '실버' },
  { u: '유저C', m: '룰렛 5,000원 → "벌칙 3번" 당첨', c: '#fbbf24', badge: 'VIP', d: true },
  { u: '유저D', m: '대박 ㄷㄷ', c: '#e879f9', badge: '골드' },
  { u: '유저E', m: '목표까지 얼마 안남음', c: '#38bdf8', badge: '' },
  { u: '유저F', m: 'ㅇㅈㅇㅈ', c: '#34d399', badge: '실버' },
];
const RANK = [
  { r: 1, u: '유저C', amt: 82000, badge: 'VIP', bc: '#e879f9' },
  { r: 2, u: '유저A', amt: 51000, badge: '골드', bc: '#fbbf24' },
  { r: 3, u: '유저F', amt: 30000, badge: '실버', bc: '#cbd5e1' },
  { r: 4, u: '유저K', amt: 18500, badge: '', bc: '' },
];
// 투네이션 인터랙션 후원 (퀵바)
const INTERACTIONS = [
  { n: '룰렛', i: Target }, { n: '투표', i: HelpCircle }, { n: '퀘스트', i: ListTodo },
  { n: '위시', i: Gift }, { n: '미니', i: Coins }, { n: '그림', i: Palette },
  { n: '럭키박스', i: Box }, { n: '플레이', i: Gamepad2 },
];

export default function WatchDesktopPage() {
  const [nav, setNav] = useState<Nav>('home');
  const [room, setRoom] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-screen bg-[#0b0c10] text-slate-200 text-[13px] select-none overflow-hidden" style={{ fontFamily: 'Pretendard, system-ui, sans-serif' }}>
      {/* Title bar */}
      <div className="flex items-center justify-between h-11 px-4 bg-[#121319] border-b border-black/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold" style={{ color: ACCENT }}><Radio size={16} /> 투네이션</div>
          <div className="flex items-center bg-black/40 rounded-md p-0.5">
            <button className="px-3 py-1 rounded text-[12px] font-semibold" style={{ background: ACCENT, color: '#062631' }}>시청</button>
            <button onClick={() => window.open('/desktop/broadcast', 'broadcastDesktop', 'width=1360,height=860')} className="px-3 py-1 rounded text-[12px] text-slate-400 hover:text-white">방송</button>
          </div>
        </div>
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="flex items-center gap-2 w-full bg-black/40 border border-slate-700/60 rounded-full px-3 py-1.5">
            <Search size={14} className="text-slate-500" /><input placeholder="라이브 · 크리에이터 검색" className="bg-transparent outline-none text-[13px] flex-1 placeholder:text-slate-600" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-slate-400 hover:text-white"><Bell size={17} /><span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">3</span></button>
          <span className="flex items-center gap-1.5 text-[12px]" style={{ color: ACCENT }}><Coins size={14} /> 50,000</span>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-[#062631]" style={{ background: ACCENT }}>투</div>
          <div className="flex items-center gap-2 text-slate-500 ml-1"><span className="w-3 h-0.5 bg-slate-500" /><span className="w-2.5 h-2.5 border border-slate-500" /><span className="hover:text-red-400 cursor-pointer">✕</span></div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-[80px] bg-[#121319] border-r border-black/50 flex flex-col items-center py-3 gap-1 shrink-0">
          {NAV.map((n) => {
            const Icon = n.icon; const active = nav === n.id && room === null;
            return (
              <button key={n.id} onClick={() => { setNav(n.id); setRoom(null); }}
                className={`w-16 py-2.5 flex flex-col items-center gap-1 rounded-xl transition-colors ${active ? 'text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
                style={active ? { background: 'rgba(24,201,255,0.15)', color: ACCENT } : undefined}>
                <Icon size={20} /><span className="text-[11px]">{n.label}</span>
              </button>
            );
          })}
          <div className="mt-auto flex flex-col items-center gap-0.5 text-emerald-400 pt-2"><Wifi size={16} /><span className="text-[9px] text-center leading-tight">그리드<br />동작</span></div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          {room !== null ? <LiveRoom live={LIVES[room]} onBack={() => setRoom(null)} onPick={setRoom} />
            : nav === 'home' ? <HomeGrid onOpen={setRoom} />
            : nav === 'follow' ? <FollowList onOpen={setRoom} />
            : nav === 'explore' ? <ExploreView />
            : nav === 'play' ? <PlayView />
            : <MeView />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Home grid ---------------- */
function HomeGrid({ onOpen }: { onOpen: (i: number) => void }) {
  const [pt, setPt] = useState(0);
  const [ct, setCt] = useState(0);
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[#0b0c10]/95 backdrop-blur px-6 pt-5 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2 mb-3">
          {PLATFORM_TABS.map((t, i) => (
            <button key={t} onClick={() => setPt(i)} className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${pt === i ? 'text-[#062631]' : 'bg-white/5 text-slate-400 hover:text-white'}`} style={pt === i ? { background: ACCENT } : undefined}>{t}</button>
          ))}
          <select className="ml-auto bg-white/5 border border-slate-700 rounded-md px-2.5 py-1.5 text-[12px] text-slate-300"><option>시청자 높은순</option><option>후원 많은순</option><option>최신순</option></select>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATS.map((c, i) => (
            <button key={c} onClick={() => setCt(i)} className={`px-2.5 py-1 rounded-md text-[12px] transition-colors ${ct === i ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{c}</button>
          ))}
        </div>
      </div>
      <div className="p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {LIVES.map((l, i) => <React.Fragment key={i}><Card live={l} onClick={() => onOpen(i)} /></React.Fragment>)}
      </div>
    </div>
  );
}

function Card({ live, onClick }: { live: Live; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left group">
      <div className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${live.hue}`}>
        <div className="absolute inset-0 flex items-center justify-center text-white/25 text-4xl">▶</div>
        <span className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {live.viewers.toLocaleString()}</span>
        <PlatformBadge p={live.platform} />
        {live.excel && <span className="absolute bottom-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded text-[#062631]" style={{ background: ACCENT }}>엑셀방송</span>}
        <div className="absolute inset-0 ring-0 group-hover:ring-2 rounded-xl transition-all" style={{ boxShadow: 'inset 0 0 0 0' }} />
      </div>
      <div className="flex items-start gap-2 mt-2">
        <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0 flex items-center justify-center text-[11px]">{live.creator[0]}</div>
        <div className="min-w-0 flex-1"><div className="text-[13px] font-medium truncate group-hover:text-white transition-colors">{live.title}</div><div className="text-[11px] text-slate-500 truncate">{live.creator} · {live.cat}</div></div>
        <Star size={14} className="text-slate-600 hover:text-amber-400 shrink-0 mt-0.5" />
      </div>
    </button>
  );
}
function PlatformBadge({ p }: { p: Live['platform'] }) {
  const map: Record<string, string> = { '투네이션': ACCENT, '치지직': '#00FFA3', '유튜브': '#FF4E45', '트위치': '#9147FF' };
  const dark = p === '투네이션' || p === '치지직';
  return <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: map[p], color: dark ? '#062631' : '#fff' }}>{p}</span>;
}

/* ---------------- Live room ---------------- */
function LiveRoom({ live, onBack, onPick }: { live: Live; onBack: () => void; onPick: (i: number) => void }) {
  const [tab, setTab] = useState(0);
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
            <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE</span>
            {live.excel && <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded text-[#062631]" style={{ background: ACCENT }}>엑셀방송</span>}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center gap-3 text-white/90">
              <Play size={16} /><Volume2 size={16} />
              <div className="flex-1 h-1 rounded-full bg-white/30"><div className="h-full w-2/3 rounded-full" style={{ background: ACCENT }} /></div>
              <span className="text-[11px]">1080p</span><SettingsIcon size={15} />
              <button onClick={() => window.open('/desktop/watch', 'watchPopout', 'width=960,height=600')} className="flex items-center gap-1 text-[11px] hover:text-cyan-300"><Plus size={13} /> 새 창</button>
              <Maximize size={15} />
            </div>
          </div>
          {/* info */}
          <div className="flex items-center gap-3 mt-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">{live.creator[0]}</div>
            <div className="flex-1 min-w-0"><div className="text-[14px] font-semibold truncate">{live.title}</div><div className="text-[12px] text-slate-500 flex items-center gap-2"><span className="flex items-center gap-1"><Users size={12} /> {live.viewers.toLocaleString()}명</span> · {live.creator}</div></div>
            <button className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"><Star size={14} /> 팔로우</button>
            <button className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg text-[#062631] font-semibold" style={{ background: ACCENT }}><Crown size={14} /> 멤버십</button>
          </div>

          {/* 인터랙션 후원 퀵바 (투네이션 핵심) */}
          <div className="mt-3 rounded-xl border border-slate-800 bg-[#121319] p-3">
            <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-2"><Sparkles size={13} style={{ color: ACCENT }} /> 인터랙션 후원 — 방송에 직접 개입</div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {INTERACTIONS.map((it) => {
                const Icon = it.i;
                return (
                  <button key={it.n} className="flex flex-col items-center gap-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Icon size={18} style={{ color: ACCENT }} /><span className="text-[11px]">{it.n}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* multi view */}
          <div className="mt-4">
            <div className="text-[12px] text-slate-500 mb-2">다중 시청</div>
            <div className="flex items-center gap-2">
              {LIVES.slice(0, 4).map((l, i) => (
                <button key={i} onClick={() => onPick(i)} className={`relative w-28 aspect-video rounded-lg overflow-hidden bg-gradient-to-br ${l.hue}`} style={LIVES[i] === live ? { boxShadow: `0 0 0 2px ${ACCENT}` } : undefined}>
                  <span className="absolute bottom-1 left-1 text-[9px] text-white/90 bg-black/50 px-1 rounded">{l.creator}</span>
                </button>
              ))}
              <button className="w-28 aspect-video rounded-lg border border-dashed border-slate-700 text-slate-500 flex items-center justify-center hover:text-cyan-400"><Plus size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* right */}
      <div className="w-80 shrink-0 border-l border-slate-800 flex flex-col bg-[#101117]">
        {/* chat */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="px-3 py-2 border-b border-slate-800 text-[12px] font-semibold text-slate-300 flex items-center gap-2"><MessageSquare size={14} /> 채팅</div>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
            {CHAT.map((c, i) => (
              <div key={i} className="text-[12px] leading-snug">
                {c.d ? (
                  <span className="block rounded px-2 py-1" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fcd34d' }}><b>★ {c.u}</b> {c.m}</span>
                ) : (
                  <span>{c.badge && <b className="text-[10px] mr-1" style={{ color: c.c }}>◆{c.badge}</b>}<b style={{ color: c.c }}>{c.u}</b> <span className="text-slate-300">{c.m}</span></span>
                )}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-slate-800 flex items-center gap-2">
            <Smile size={16} className="text-slate-500" /><input placeholder="채팅 입력" className="flex-1 bg-black/30 rounded-full px-3 py-1.5 text-[12px] outline-none placeholder:text-slate-600" /><button style={{ color: ACCENT }}><Send size={16} /></button>
          </div>
        </div>
        {/* ranking (엑셀) */}
        <div className="border-t border-slate-800">
          <div className="px-3 py-2 flex items-center gap-2 text-[12px] font-semibold text-slate-300"><Trophy size={14} className="text-amber-400" /> 엑셀방송 랭킹</div>
          <div className="flex gap-1 px-3 pb-2">
            {['방송', '일', '주', '월', '누적'].map((t, i) => (
              <button key={t} onClick={() => setTab(i)} className={`px-2 py-0.5 rounded text-[11px] ${tab === i ? 'text-[#062631]' : 'bg-white/5 text-slate-400'}`} style={tab === i ? { background: ACCENT } : undefined}>{t}</button>
            ))}
          </div>
          <div className="px-3 pb-2 space-y-1">
            {RANK.map((r) => (
              <div key={r.r} className="flex items-center gap-2 text-[12px]">
                <span className="w-4 text-center font-bold" style={{ color: r.r <= 3 ? '#fbbf24' : '#64748b' }}>{r.r}</span>
                <span className="flex-1 truncate">{r.u} {r.badge && <b className="text-[10px]" style={{ color: r.bc }}>◆{r.badge}</b>}</span>
                <span className="tabular-nums text-slate-300">{r.amt.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mx-3 mb-3 mt-1 rounded-lg bg-white/5 p-2.5">
            <div className="flex items-center justify-between text-[12px]"><span className="text-slate-400">내 순위</span><span className="font-semibold">7위 · 12,000원</span></div>
            <div className="text-[11px] text-slate-500 mt-0.5 mb-2">6위까지 3,500원 남음</div>
            <button className="w-full py-1.5 rounded-lg text-[#062631] text-[12px] font-bold" style={{ background: ACCENT }}>후원하기</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Follow ---------------- */
function FollowList({ onOpen }: { onOpen: (i: number) => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-bold text-white mb-1">팔로우</h1>
      <p className="text-[12px] text-slate-500 mb-4">팔로우한 크리에이터의 라이브</p>
      <div className="space-y-2">
        {LIVES.slice(0, 5).map((l, i) => (
          <button key={i} onClick={() => onOpen(i)} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[#121319] hover:bg-white/5 transition-colors text-left">
            <div className={`w-24 aspect-video rounded-lg bg-gradient-to-br ${l.hue} shrink-0 relative`}><span className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 text-[9px] px-1 rounded"><span className="w-1 h-1 rounded-full bg-red-500" />LIVE</span></div>
            <div className="flex-1 min-w-0"><div className="text-[13px] font-medium truncate">{l.title}</div><div className="text-[12px] text-slate-500">{l.creator} · {l.viewers.toLocaleString()}명</div></div>
            <PlatformPill p={l.platform} />
          </button>
        ))}
      </div>
    </div>
  );
}
function PlatformPill({ p }: { p: Live['platform'] }) {
  const map: Record<string, string> = { '투네이션': ACCENT, '치지직': '#00FFA3', '유튜브': '#FF4E45', '트위치': '#9147FF' };
  const dark = p === '투네이션' || p === '치지직';
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0" style={{ background: map[p], color: dark ? '#062631' : '#fff' }}>{p}</span>;
}

/* ---------------- Explore ---------------- */
function ExploreView() {
  const cats = CATS.slice(1).concat(['스포츠', '보이스', '코딩']);
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-bold text-white mb-4">탐색</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cats.map((c, i) => (
          <div key={c} className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${LIVES[i % LIVES.length].hue} p-4 flex flex-col justify-end hover:scale-[1.02] transition-transform cursor-pointer`}>
            <div className="text-white font-bold text-[15px]">{c}</div><div className="text-white/70 text-[11px]">{(i * 137 % 800 + 120)}개 라이브</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Play ---------------- */
function PlayView() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-bold text-white mb-1">플레이</h1>
      <p className="text-[12px] text-slate-500 mb-4">후원으로 방송에 개입하는 투네이션 인터랙션</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {INTERACTIONS.map((g) => {
          const Icon = g.i;
          return (
            <div key={g.n} className="rounded-xl border border-slate-800 bg-[#121319] p-5 flex flex-col items-center gap-2 hover:border-cyan-400/40 transition-colors">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(24,201,255,0.12)', color: ACCENT }}><Icon size={24} /></div><span className="text-[13px]">{g.n}</span>
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
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-[#062631]" style={{ background: ACCENT }}>투</div>
        <div><div className="text-lg font-bold text-white">투네이션 유저</div><div className="text-[12px] text-slate-500">@toon_user · 골드 등급 · 친밀도 Lv.12</div></div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ l: '보유 캐시', v: '50,000', i: CoinsIcon }, { l: '이번달 후원', v: '128,000', i: Gift }, { l: '팔로잉', v: '24', i: Users }].map((s) => {
          const Icon = s.i;
          return <div key={s.l} className="rounded-xl bg-[#121319] border border-slate-800 p-4"><div className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-1"><Icon size={13} /> {s.l}</div><div className="text-lg font-bold text-white tabular-nums">{s.v}</div></div>;
        })}
      </div>
      <div className="space-y-2">
        {['충전하기', '후원 내역', '멤버십 · 친밀도', '그리드 설정', '앱 설정'].map((m) => (
          <button key={m} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#121319] hover:bg-white/5 text-[13px] transition-colors">{m} <ChevronLeft size={15} className="rotate-180 text-slate-600" /></button>
        ))}
      </div>
    </div>
  );
}
