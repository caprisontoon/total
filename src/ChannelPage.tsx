import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, RectangleHorizontal,
  MessageSquare, MessageSquareOff, Smile, Send, Flag, Ban, Star, Crown, Users, Wifi, WifiOff,
  Info, ChevronLeft, Share2, Lock, Check, Gauge, Zap, Activity, X, Bell, ExternalLink, Heart,
  PictureInPicture2, Headphones,
} from 'lucide-react';
import ViewerShell from './ViewerShell';
import { LIVES, getLive, formatViewers, formatElapsed, type LiveStatus } from './liveData';

// 채널 페이지 (시청) — ⑦-7-4 · 7-5. 자체 플레이어 + 채팅 + 그리드 설치 안내.
// 1단계 정책: 후원은 시청 화면 안이 아니라 기존 후원 페이지로 이동한다.

type Quality = 'auto' | '1080p' | '720p' | '480p' | '360p';
const QUALITIES: Quality[] = ['auto', '1080p', '720p', '480p', '360p'];
const QUALITY_LABEL: Record<Quality, string> = { auto: '자동 (ABR)', '1080p': '1080p', '720p': '720p', '480p': '480p', '360p': '360p' };
// 그리드 미설치 시 화질 상한 — 정책 미결(부록 B-5)이라 임시값. 720p 이상은 설치 필요.
const GRID_FREE_MAX_INDEX = QUALITIES.indexOf('480p');
const needsGrid = (q: Quality) => q !== 'auto' && QUALITIES.indexOf(q) < GRID_FREE_MAX_INDEX;

const EMOJIS = ['😀', '😂', '🔥', '👏', '❤️', '😮', '🎉', '👍', '😭', '🙏'];
type Msg = { id: number; user: string; text: string; color: string; badge?: string; mine?: boolean };
const SEED_CHAT: Msg[] = [
  { id: 1, user: '유저A', text: 'ㅋㅋㅋㅋ 오늘 텐션 미쳤다', color: '#38bdf8' },
  { id: 2, user: '유저B', text: '오늘도 화이팅!! 🔥', color: '#34d399', badge: '실버' },
  { id: 3, user: '유저C', text: '목표까지 얼마 남았어요?', color: '#fbbf24', badge: 'VIP' },
  { id: 4, user: '유저D', text: '대박 ㄷㄷ 👏👏', color: '#e879f9', badge: '골드' },
  { id: 5, user: '유저E', text: '방금 들어왔는데 뭐하는 중이에요?', color: '#38bdf8' },
  { id: 6, user: '유저F', text: 'ㅇㅈㅇㅈ', color: '#34d399', badge: '실버' },
];

export default function ChannelPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const live = getLive(channelId);

  if (!live) {
    return (
      <ViewerShell title="채널">
        <div className="py-32 text-center text-slate-500">
          <p className="mb-4">채널을 찾을 수 없습니다.</p>
          <button onClick={() => navigate('/live')} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-bold">전체 라이브로</button>
        </div>
      </ViewerShell>
    );
  }
  return <React.Fragment key={live.id}><Channel liveId={live.id} /></React.Fragment>;
}

function Channel({ liveId }: { liveId: string }) {
  const navigate = useNavigate();
  const live = getLive(liveId)!;
  const isToon = live.platform === '투네이션';

  // 방송 상태 (데모용 전환 포함)
  const [status, setStatus] = useState<LiveStatus>(live.status);
  const [reconnectLeft, setReconnectLeft] = useState(90);
  useEffect(() => {
    if (status !== 'suspended') { setReconnectLeft(90); return; }
    const t = setInterval(() => setReconnectLeft((s) => {
      if (s <= 1) { clearInterval(t); setStatus('offline'); return 0; } // 90초 경과 → 종료 · 오프라인 (④-4-3)
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [status]);

  // 플레이어
  const playerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [quality, setQuality] = useState<Quality>('auto');
  const [qualityOpen, setQualityOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [theater, setTheater] = useState(false);
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else playerRef.current?.requestFullscreen?.();
  };

  // 그리드
  const [gridInstalled, setGridInstalled] = useState(false);
  const [gridCap, setGridCap] = useState(5); // 업로드 대역폭 상한 (Mbps)
  const [gridModal, setGridModal] = useState(false);
  const effectiveQuality = useMemo(() => {
    if (quality === 'auto') return gridInstalled ? '1080p' : '480p';
    return quality;
  }, [quality, gridInstalled]);
  const pickQuality = (q: Quality) => {
    if (!gridInstalled && needsGrid(q)) { setQualityOpen(false); setGridModal(true); return; }
    setQuality(q); setQualityOpen(false);
  };

  // 채팅
  const [chatVisible, setChatVisible] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>(SEED_CHAT);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [input, setInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ block: 'end' }); }, [msgs]);
  const showToast = (t: string) => { setToast(t); setTimeout(() => setToast(null), 1800); };
  const send = () => {
    const t = input.trim(); if (!t) return;
    setMsgs((m) => [...m, { id: Date.now(), user: '김종윤', text: t, color: '#60a5fa', badge: '블랙 다이아', mine: true }]);
    setInput(''); setEmojiOpen(false);
  };
  const visibleMsgs = msgs.filter((m) => !blocked.has(m.user));

  const [fav, setFav] = useState(true);
  const others = LIVES.filter((l) => l.id !== live.id && l.status === 'live').slice(0, 4);
  const online = status !== 'offline';

  return (
    <ViewerShell active="live" hideChrome={theater} title={live.creator}>
      <div className={`${theater ? 'p-0' : 'max-w-[1600px] mx-auto p-4 lg:p-6'}`}>
        {!theater && (
          <button onClick={() => navigate('/live')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white mb-3">
            <ChevronLeft size={16} /> 전체 라이브
          </button>
        )}

        <div className={`flex ${theater ? 'h-screen' : ''} gap-0 lg:gap-5 flex-col lg:flex-row`}>
          {/* ===== 좌측: 플레이어 + 정보 ===== */}
          <div className="flex-1 min-w-0 flex flex-col">
            {online ? (
              <div ref={playerRef} className={`relative bg-black overflow-hidden group/player ${theater ? 'flex-1' : 'aspect-video rounded-xl'}`}>
                {/* 영상 영역 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${live.hue} ${status === 'suspended' ? 'opacity-40' : ''}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {!isToon ? (
                    <div className="text-center text-white/80 px-6">
                      <ExternalLink size={36} className="mx-auto mb-2 opacity-70" />
                      <div className="text-sm font-bold">{live.platform} 플레이어로 재생됩니다</div>
                      <div className="text-xs opacity-70 mt-1">외부 방송은 해당 플랫폼 임베드 플레이어를 사용합니다</div>
                    </div>
                  ) : (
                    <button onClick={() => setPlaying(!playing)} className="text-white/70 hover:text-white transition-colors">
                      {playing ? <Pause size={56} className="opacity-0 group-hover/player:opacity-100 transition-opacity" /> : <Play size={64} />}
                    </button>
                  )}
                </div>

                {/* 좌상단 상태 */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 text-white text-[11px] font-bold px-2 py-0.5 rounded ${status === 'suspended' ? 'bg-amber-500' : 'bg-red-600'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {status === 'suspended' ? '일시중단' : 'LIVE'}
                  </span>
                  <span className="flex items-center gap-1 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded tabular-nums"><Users size={11} /> {formatViewers(live.viewers)}</span>
                </div>
                {/* 우상단: 화질 · 그리드 */}
                {isToon && (
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded">{quality === 'auto' ? `자동 · ${effectiveQuality}` : effectiveQuality}</span>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${gridInstalled ? 'bg-emerald-500/90 text-white' : 'bg-black/60 text-white/80'}`}>
                      {gridInstalled ? <Wifi size={11} /> : <WifiOff size={11} />} {gridInstalled ? '그리드 동작 중' : '그리드 미설치'}
                    </span>
                  </div>
                )}

                {/* 재생 통계 (△ 8번 — 치지직에 없는 차별점) */}
                {statsOpen && isToon && (
                  <div className="absolute top-12 left-3 bg-black/75 text-white text-[11px] rounded-lg p-3 space-y-1 font-mono w-56">
                    <div className="flex justify-between"><span className="opacity-60">해상도</span><span>{effectiveQuality === '1080p' ? '1920×1080' : effectiveQuality === '720p' ? '1280×720' : effectiveQuality === '480p' ? '854×480' : '640×360'} · 60fps</span></div>
                    <div className="flex justify-between"><span className="opacity-60">비트레이트</span><span>{effectiveQuality === '1080p' ? '6,000' : effectiveQuality === '720p' ? '3,500' : '1,500'} kbps</span></div>
                    <div className="flex justify-between"><span className="opacity-60">수신 지연</span><span>2.1초</span></div>
                    <div className="flex justify-between"><span className="opacity-60">버퍼링</span><span>0회</span></div>
                    <div className="flex justify-between"><span className="opacity-60">전송 경로</span><span>{gridInstalled ? '그리드 P2P 42% · CDN 58%' : 'CDN 100%'}</span></div>
                    <button onClick={() => setStatsOpen(false)} className="absolute top-1.5 right-1.5 opacity-60 hover:opacity-100"><X size={12} /></button>
                  </div>
                )}

                {/* 일시중단 오버레이 — 재생 유지 + 안내 (④-4-3) */}
                {status === 'suspended' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/70 text-white rounded-xl px-6 py-5 text-center max-w-sm">
                      <WifiOff size={28} className="mx-auto mb-2 text-amber-400" />
                      <div className="font-bold">일시적으로 연결이 끊겼습니다</div>
                      <div className="text-xs opacity-80 mt-1">크리에이터의 재접속을 기다리고 있어요 · 채팅은 계속 이용할 수 있습니다</div>
                      <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden"><div className="h-full bg-amber-400 transition-all" style={{ width: `${(reconnectLeft / 90) * 100}%` }} /></div>
                      <div className="text-[11px] opacity-70 mt-1 tabular-nums">재접속 대기 {reconnectLeft}초</div>
                    </div>
                  </div>
                )}

                {/* 컨트롤 바 */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2 pt-8 flex items-center gap-2 text-white opacity-0 group-hover/player:opacity-100 focus-within:opacity-100 transition-opacity">
                  <IconBtn title={playing ? '일시정지' : '재생'} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={18} /> : <Play size={18} />}</IconBtn>
                  <div className="flex items-center gap-1.5 group/vol">
                    <IconBtn title={muted ? '음소거 해제' : '음소거'} onClick={() => setMuted(!muted)}>{muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}</IconBtn>
                    <input type="range" min={0} max={100} value={muted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }} className="w-0 group-hover/vol:w-20 transition-all accent-blue-500" />
                  </div>
                  <div className="flex-1" />
                  {isToon && (
                    <>
                      <div className="relative">
                        <button onClick={() => { setQualityOpen(!qualityOpen); setSettingsOpen(false); }} className="px-2 py-1 rounded text-[12px] font-semibold hover:bg-white/15">{quality === 'auto' ? `자동 ${effectiveQuality}` : effectiveQuality}</button>
                        {qualityOpen && (
                          <Menu onClose={() => setQualityOpen(false)} title="화질">
                            {QUALITIES.map((q) => {
                              const locked = !gridInstalled && needsGrid(q);
                              return (
                                <React.Fragment key={q}><MenuItem active={quality === q} onClick={() => pickQuality(q)}>
                                  <span>{QUALITY_LABEL[q]}</span>
                                  {locked ? <span className="flex items-center gap-1 text-[10px] text-amber-300"><Lock size={10} /> 그리드 필요</span> : quality === q ? <Check size={13} /> : null}
                                </MenuItem></React.Fragment>
                              );
                            })}
                            {!gridInstalled && <div className="px-3 pt-2 mt-1 border-t border-white/10 text-[10px] text-white/60">미설치 시 480p까지 시청 가능 (임시 상한)</div>}
                          </Menu>
                        )}
                      </div>
                      <div className="relative">
                        <IconBtn title="설정" onClick={() => { setSettingsOpen(!settingsOpen); setQualityOpen(false); }}><Settings size={18} /></IconBtn>
                        {settingsOpen && (
                          <Menu onClose={() => setSettingsOpen(false)} title="설정">
                            <MenuItem onClick={() => { setStatsOpen(!statsOpen); setSettingsOpen(false); }}><span className="flex items-center gap-2"><Activity size={13} /> 재생 통계</span>{statsOpen && <Check size={13} />}</MenuItem>
                            <MenuItem disabled><span className="flex items-center gap-2"><Zap size={13} /> 저지연 모드</span><span className="text-[10px] text-white/50">준비 중</span></MenuItem>
                            <MenuItem disabled><span className="flex items-center gap-2"><PictureInPicture2 size={13} /> 미니 플레이어</span><span className="text-[10px] text-white/50">준비 중</span></MenuItem>
                            <MenuItem disabled><span className="flex items-center gap-2"><Headphones size={13} /> 오디오 전용</span><span className="text-[10px] text-white/50">준비 중</span></MenuItem>
                            {gridInstalled && <MenuItem onClick={() => { setGridModal(true); setSettingsOpen(false); }}><span className="flex items-center gap-2"><Gauge size={13} /> 그리드 대역폭 상한</span><span className="text-[10px] text-white/70">{gridCap} Mbps</span></MenuItem>}
                          </Menu>
                        )}
                      </div>
                    </>
                  )}
                  {!chatVisible && <IconBtn title="채팅 표시" onClick={() => setChatVisible(true)}><MessageSquare size={18} /></IconBtn>}
                  <IconBtn title={theater ? '기본 화면' : '극장 모드'} onClick={() => setTheater(!theater)}><RectangleHorizontal size={18} /></IconBtn>
                  <IconBtn title={isFs ? '전체화면 종료' : '전체화면'} onClick={toggleFullscreen}>{isFs ? <Minimize size={18} /> : <Maximize size={18} />}</IconBtn>
                </div>
              </div>
            ) : (
              /* ===== 오프라인 ===== */
              <div className={`relative overflow-hidden bg-slate-900 text-white ${theater ? 'flex-1' : 'aspect-video rounded-xl'} flex items-center justify-center`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${live.hue} opacity-20 grayscale`} />
                <div className="relative text-center px-6 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 mx-auto flex items-center justify-center text-lg font-bold mb-3">{live.creator.slice(0, 2)}</div>
                  <div className="text-lg font-bold">지금은 방송 중이 아닙니다</div>
                  <div className="text-xs text-white/60 mt-1">즐겨찾기하면 방송 시작 알림을 받을 수 있어요</div>
                  <div className="mt-4 bg-white/10 rounded-lg p-3 text-left text-xs">
                    <div className="text-white/60 mb-1">최근 방송</div>
                    <div className="font-semibold truncate">{live.lastBroadcast.title}</div>
                    <div className="text-white/60 mt-0.5">{live.lastBroadcast.date} · 최고 {formatViewers(live.lastBroadcast.peak)}명 · {live.lastBroadcast.duration}</div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button onClick={() => setFav(!fav)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${fav ? 'bg-amber-400 text-slate-900' : 'bg-white/15 hover:bg-white/25'}`}><Star size={13} className={fav ? 'fill-slate-900' : ''} /> {fav ? '즐겨찾기 중' : '즐겨찾기'}</button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/15 hover:bg-white/25"><Bell size={13} /> 방송 시작 알림</button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== 방송 정보 ===== */}
            {!theater && (
              <div className="mt-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white shrink-0 flex items-center justify-center font-bold border-2 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]">{live.creator.slice(0, 2)}</div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{online ? live.title : live.lastBroadcast.title}</h2>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{live.creator}</span>
                        <span className="text-slate-300">·</span>
                        <span>{live.category}</span>
                        {online && <><span className="text-slate-300">·</span><span>{formatElapsed(live.startedMinAgo)}</span></>}
                        {live.excel && <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold">엑셀방송</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {live.tags.map((t) => <span key={t} className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">#{t}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button onClick={() => setFav(!fav)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold border transition-colors ${fav ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      <Heart size={15} className={fav ? 'fill-amber-500 text-amber-500' : ''} /> {fav ? '즐겨찾기 중' : '즐겨찾기'}
                    </button>
                    <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold bg-fuchsia-600 hover:bg-fuchsia-500 text-white"><Crown size={15} /> 멤버십</button>
                    <div className="relative group/don">
                      <button onClick={() => navigate('/creator')} className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25">
                        {live.creator}님에게 후원하기
                      </button>
                      <div className="absolute right-0 top-full mt-1.5 text-[11px] text-slate-500 whitespace-nowrap opacity-0 group-hover/don:opacity-100 transition-opacity">후원 페이지로 이동합니다</div>
                    </div>
                    <button title="공유" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"><Share2 size={16} /></button>
                    <button title="방송 신고" onClick={() => showToast('신고가 접수되었습니다. 검토 후 조치됩니다.')} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Flag size={16} /></button>
                  </div>
                </div>

                {/* 그리드 안내 · 상태 (자체 방송만) */}
                {isToon && online && (
                  gridInstalled ? (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-900/10 px-4 py-3">
                      <div className="flex items-start gap-3 text-sm">
                        <Wifi size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-bold text-emerald-700 dark:text-emerald-400">그리드 동작 중 — 고화질로 시청하고 있어요</div>
                          <div className="text-xs text-slate-500 mt-0.5">분산 전송 42% · 업로드 상한 {gridCap} Mbps · 언제든 조정 · 해제할 수 있습니다</div>
                        </div>
                      </div>
                      <button onClick={() => setGridModal(true)} className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0">설정 조정</button>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10 px-4 py-3">
                      <div className="flex items-start gap-3 text-sm">
                        <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100">고화질(720p 이상) 시청에는 그리드 설치가 필요합니다</div>
                          <div className="text-xs text-slate-500 mt-0.5">지금은 480p로 시청 중 · 설치하지 않아도 계속 시청할 수 있어요</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setGridModal(true)} className="px-3 py-1.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800">자세히</button>
                        <button onClick={() => setGridModal(true)} className="px-4 py-1.5 rounded-lg text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white">설치하기</button>
                      </div>
                    </div>
                  )
                )}

                {/* 데모 상태 전환 */}
                <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">데모</span> 방송 상태 전환:
                  {(['live', 'suspended', 'offline'] as LiveStatus[]).map((s) => (
                    <button key={s} onClick={() => setStatus(s)} className={`px-2 py-0.5 rounded ${status === s ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                      {s === 'live' ? '라이브' : s === 'suspended' ? '일시중단' : '오프라인'}
                    </button>
                  ))}
                </div>

                {/* 다른 라이브 */}
                <div className="mt-8">
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">다른 라이브 둘러보기</div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {others.map((o) => (
                      <button key={o.id} onClick={() => navigate(`/live/${o.id}`)} className="text-left group">
                        <div className={`relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br ${o.hue}`}>
                          <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded"><span className="w-1 h-1 rounded-full bg-white" />LIVE</span>
                          <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded tabular-nums">{formatViewers(o.viewers)}</span>
                          <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-blue-500/70 rounded-lg transition-all" />
                        </div>
                        <div className="text-xs font-semibold mt-1.5 truncate group-hover:text-blue-500">{o.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{o.creator}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== 우측: 채팅 ===== */}
          {chatVisible && (
            <aside className={`w-full lg:w-[340px] shrink-0 flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1d24] ${theater ? 'h-screen border-y-0 border-r-0' : 'rounded-xl mt-4 lg:mt-0 h-[520px] lg:h-auto lg:max-h-[calc(100vh-140px)] lg:sticky lg:top-0'}`}>
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"><MessageSquare size={15} /> 채팅 <span className="text-xs text-slate-400 font-medium tabular-nums">{formatViewers(live.viewers)}</span></div>
                <div className="flex items-center gap-1">
                  <button title="채팅 창 분리 (준비 중)" disabled className="p-1.5 rounded text-slate-300 cursor-not-allowed"><ExternalLink size={14} /></button>
                  <button title="채팅 숨기기" onClick={() => setChatVisible(false)} className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"><MessageSquareOff size={15} /></button>
                </div>
              </div>

              {!isToon ? (
                <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-slate-500">
                  <div>
                    <ExternalLink size={24} className="mx-auto mb-2 opacity-50" />
                    외부 방송의 채팅은 <b>{live.platform}</b>에서 제공됩니다.
                    <button className="block mx-auto mt-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">{live.platform}에서 채팅 열기</button>
                  </div>
                </div>
              ) : (
                <>
                  {status === 'suspended' && <div className="px-3 py-1.5 text-[11px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-b border-amber-100 dark:border-amber-900/30">연결이 끊긴 동안에도 채팅은 계속 이용할 수 있어요</div>}
                  {!online && <div className="px-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">방송이 시작되면 채팅이 활성화됩니다</div>}
                  <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                    {visibleMsgs.map((m) => (
                      <div key={m.id} className="group/msg relative flex items-start gap-1.5 text-[13px] leading-snug rounded px-1.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <div className="min-w-0 flex-1">
                          {m.badge && <span className="text-[10px] font-bold mr-1 px-1 py-px rounded" style={{ color: m.color, background: `${m.color}22` }}>{m.badge}</span>}
                          <b style={{ color: m.color }}>{m.user}</b>
                          <span className="text-slate-400 mx-1">·</span>
                          <span className="text-slate-800 dark:text-slate-200 break-words">{m.text}</span>
                        </div>
                        {!m.mine && (
                          <div className="absolute right-1 top-0.5 hidden group-hover/msg:flex items-center gap-0.5 bg-white dark:bg-slate-800 rounded shadow-sm border border-slate-200 dark:border-slate-700">
                            <button title="신고" onClick={() => showToast(`${m.user} 님의 메시지를 신고했습니다`)} className="p-1 text-slate-400 hover:text-red-500"><Flag size={12} /></button>
                            <button title="차단" onClick={() => { setBlocked((b) => new Set(b).add(m.user)); showToast(`${m.user} 님을 차단했습니다`); }} className="p-1 text-slate-400 hover:text-red-500"><Ban size={12} /></button>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 p-2">
                    {emojiOpen && (
                      <div className="grid grid-cols-10 gap-1 mb-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                        {EMOJIS.map((e) => <button key={e} onClick={() => setInput((v) => v + e)} className="text-lg hover:scale-125 transition-transform">{e}</button>)}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <button title="이모티콘" onClick={() => setEmojiOpen(!emojiOpen)} className={`p-2 rounded-lg ${emojiOpen ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}><Smile size={18} /></button>
                      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} disabled={!online} placeholder={online ? '채팅을 입력하세요' : '방송 중에만 채팅할 수 있어요'} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-3.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                      <button onClick={send} disabled={!online || !input.trim()} className="p-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40"><Send size={16} /></button>
                    </div>
                  </div>
                </>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* 토스트 */}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-full shadow-xl">{toast}</div>}

      {/* 그리드 설치 안내 (⑦-7-5) */}
      {gridModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setGridModal(false)}>
          <div className="bg-white dark:bg-[#181a20] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Wifi size={20} className="text-blue-500" /> {gridInstalled ? '그리드 설정' : '그리드로 고화질 시청하기'}</div>
              <button onClick={() => setGridModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
            </div>
            <div className="px-6 py-4 space-y-4 text-sm">
              {!gridInstalled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoTile title="무엇인가요" body="시청자끼리 영상 조각을 나눠 전달하는 P2P 분산 전송 모듈입니다." />
                  <InfoTile title="왜 필요한가요" body="국내 망 사용료 부담을 줄여 720p 이상 고화질을 안정적으로 제공합니다." />
                  <InfoTile title="무엇을 사용하나요" body="시청 중 PC의 업로드 대역폭과 소량의 CPU를 사용합니다." />
                </div>
              )}
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-900/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5"><Gauge size={15} className="text-amber-500" /> 업로드 대역폭 상한</div>
                  <span className="font-bold tabular-nums text-amber-700 dark:text-amber-300">{gridCap} Mbps</span>
                </div>
                <input type="range" min={1} max={20} value={gridCap} onChange={(e) => setGridCap(Number(e.target.value))} className="w-full accent-amber-500" />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1"><span>1 Mbps · 절약</span><span>20 Mbps · 최대 기여</span></div>
                <p className="text-xs text-slate-500 mt-2">그리드는 내 업로드 대역폭을 사용합니다. 공용 회선이나 데이터 제한이 있는 환경이라면 상한을 낮게 두세요. 설치 후 언제든 조정 · 해제할 수 있습니다.</p>
              </div>
              {gridInstalled && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-900/10 px-4 py-3">
                  <span className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400"><Check size={15} /> 동작 중 · 분산 전송 42%</span>
                  <button onClick={() => { setGridInstalled(false); setQuality('auto'); setGridModal(false); showToast('그리드를 해제했습니다. 480p로 시청합니다.'); }} className="text-xs font-bold text-slate-500 hover:text-red-500">그리드 해제</button>
                </div>
              )}
            </div>
            <div className="px-6 pb-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              {!gridInstalled ? (
                <>
                  <button onClick={() => setGridModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">나중에 · 480p로 계속 시청</button>
                  <button onClick={() => { setGridInstalled(true); setGridModal(false); showToast('그리드가 설치되었습니다. 고화질로 전환합니다.'); }} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white">설치하고 고화질로 시청</button>
                </>
              ) : (
                <button onClick={() => setGridModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white">확인</button>
              )}
            </div>
          </div>
        </div>
      )}
    </ViewerShell>
  );
}

/* ---------------- small parts ---------------- */
function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick?: () => void }) {
  return <button title={title} onClick={onClick} className="p-1.5 rounded hover:bg-white/15 transition-colors">{children}</button>;
}
function Menu({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute bottom-full right-0 mb-2 z-20 w-56 bg-black/90 backdrop-blur rounded-lg py-1.5 shadow-2xl border border-white/10">
        <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-white/50">{title}</div>
        {children}
      </div>
    </>
  );
}
function MenuItem({ children, active, disabled, onClick }: { children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`w-full flex items-center justify-between px-3 py-1.5 text-[12px] text-left ${disabled ? 'text-white/40 cursor-not-allowed' : active ? 'text-white bg-white/10' : 'text-white/85 hover:bg-white/10'}`}>
      {children}
    </button>
  );
}
function InfoTile({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{title}</div>
      <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{body}</div>
    </div>
  );
}
