import React, { useState } from 'react';
import {
  Radio, Video, Bell, LayoutGrid, Trophy, Palette, Users, Grid3x3, Settings as SettingsIcon,
  Plus, Minus, ChevronUp, Lock, Trash2, Eye, Copy,
  Gamepad2, Camera, Image as ImageIcon, MessageSquare, Mic, Volume2, Music,
  Gift, Target, Sliders, ListTodo, HelpCircle, Palette as PaletteIcon,
  Play, Circle, Save, Wifi, Cpu, Activity, RefreshCw, Wand2, Crown, PiggyBank,
  ArrowLeftRight, Power, QrCode, Box,
} from 'lucide-react';

// 방송용 데스크탑 — OBS / 스트림랩스 데스크탑을 분석해 투네이션에 맞춘 송출 프로그램 UI.
// OBS 코어(장면·소스·믹서·스튜디오 모드·송출 상태) + 투네이션 강점(후원 이벤트·엑셀방송 랭킹·인터랙션·멀티 송출).
// 실제 기능은 없으며 좌측 모듈/씬/소스를 클릭하면 화면이 전환됩니다.

const ACCENT = '#18C9FF';

type Rail = 'editor' | 'widgets' | 'alerts' | 'excel' | 'themes' | 'crew' | 'apps' | 'settings';
const RAIL: { id: Rail; label: string; icon: any }[] = [
  { id: 'editor', label: '편집기', icon: Video },
  { id: 'widgets', label: '후원 위젯', icon: LayoutGrid },
  { id: 'alerts', label: '알림 설정', icon: Bell },
  { id: 'excel', label: '엑셀방송', icon: Trophy },
  { id: 'themes', label: '테마', icon: Palette },
  { id: 'crew', label: '크루·멤버십', icon: Users },
  { id: 'apps', label: '앱', icon: Grid3x3 },
  { id: 'settings', label: '설정', icon: SettingsIcon },
];

const SCENES = ['🎮 게임 방송', '⏳ 잠시 후 시작', '💬 토크 / 캠', '🏁 방송 종료'];
const SOURCES = [
  { name: '게임 캡처', icon: Gamepad2 },
  { name: '웹캠 (C920)', icon: Camera },
  { name: '통합 알림창', icon: Bell },
  { name: '엑셀 랭킹판', icon: Trophy },
  { name: '채팅박스', icon: MessageSquare },
  { name: '배경 이미지', icon: ImageIcon },
];
const MIXERS = [
  { name: '마이크', level: 74, icon: Mic },
  { name: '데스크탑', level: 48, icon: Volume2 },
  { name: '게임', level: 86, icon: Music },
];
const PLATFORMS = [
  { name: '투네이션', on: true, color: ACCENT, kbps: '6000' },
  { name: '치지직', on: true, color: '#00FFA3', kbps: '6000' },
  { name: '유튜브', on: true, color: '#FF4E45', kbps: '8000' },
  { name: '트위치', on: false, color: '#9147FF', kbps: '—' },
];
const EVENTS = [
  { u: '유저C', t: '룰렛 5,000원', d: '"벌칙 3번" 당첨', hot: true },
  { u: '유저A', t: '미니후원 1,000원', d: '오늘도 화이팅!' },
  { u: '유저P', t: '멤버십 가입', d: '골드 등급' },
  { u: '유저K', t: '투표 참여 3,000원', d: '치킨에 투표' },
];
const WIDGET_LIST = [
  { n: '통합 알림창', i: Bell }, { n: '채팅박스', i: MessageSquare }, { n: '후원 QR', i: QrCode },
  { n: '후원목표', i: Target }, { n: '후원누적', i: PiggyBank }, { n: '후원랭킹', i: Trophy },
  { n: '룰렛', i: Target }, { n: '투표', i: HelpCircle }, { n: '퀘스트', i: ListTodo },
  { n: '위시리스트', i: Gift }, { n: '럭키박스', i: Box }, { n: '플레이', i: Gamepad2 },
];

export default function BroadcastDesktopPage() {
  const [rail, setRail] = useState<Rail>('editor');
  const [scene, setScene] = useState(0);
  const [source, setSource] = useState(2);
  const [live, setLive] = useState(true);
  const [studio, setStudio] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-[#0d0f13] text-slate-200 text-[13px] select-none overflow-hidden" style={{ fontFamily: 'Pretendard, system-ui, sans-serif' }}>
      {/* Title bar */}
      <div className="flex items-center justify-between h-9 px-3 bg-[#0a0c0f] border-b border-black/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold" style={{ color: ACCENT }}>
            <Radio size={15} /> 투네이션 Studio
          </div>
          <nav className="hidden lg:flex items-center gap-3 text-[12px] text-slate-500">
            {['파일', '편집', '보기', '장면 컬렉션', '도구', '도움말'].map((m) => (
              <button key={m} className="hover:text-white transition-colors">{m}</button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/40 rounded-md p-0.5">
            <button className="px-3 py-1 rounded text-[12px] font-semibold text-white" style={{ background: ACCENT, color: '#062631' }}>방송</button>
            <button onClick={() => window.open('/desktop/watch', 'watchDesktop', 'width=1360,height=860')} className="px-3 py-1 rounded text-[12px] text-slate-400 hover:text-white">시청</button>
          </div>
          <WinControls />
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left rail */}
        <div className="w-[68px] bg-[#0a0c0f] border-r border-black/50 flex flex-col items-center py-3 gap-1 shrink-0">
          {RAIL.map((r) => {
            const Icon = r.icon; const active = rail === r.id;
            return (
              <button key={r.id} onClick={() => setRail(r.id)}
                className={`w-[60px] py-2 flex flex-col items-center gap-1 rounded-lg transition-colors ${active ? 'text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
                style={active ? { background: 'rgba(24,201,255,0.15)', color: ACCENT } : undefined}>
                <Icon size={18} /><span className="text-[10px]">{r.label}</span>
              </button>
            );
          })}
          <div className="mt-auto flex flex-col items-center gap-0.5 text-emerald-400">
            <Wifi size={15} /><span className="text-[9px]">그리드</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          {rail === 'editor' && <Editor {...{ scene, setScene, source, setSource, live, setLive, studio, setStudio }} />}
          {rail === 'widgets' && <WidgetsView />}
          {rail === 'alerts' && <AlertsView />}
          {rail === 'excel' && <ExcelView />}
          {rail === 'themes' && <ThemesView />}
          {rail === 'crew' && <CrewView />}
          {rail === 'apps' && <AppsView />}
          {rail === 'settings' && <SettingsView />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Editor ---------------- */
function Editor({ scene, setScene, source, setSource, live, setLive, studio, setStudio }: any) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col p-3 gap-3">
          {/* Preview area */}
          <div className="flex-1 min-h-0 flex gap-3">
            {studio && (
              <Canvas label="편집 미리보기" tag="PREVIEW" scene={SCENES[scene]} muted />
            )}
            {studio && (
              <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"><ArrowLeftRight size={18} /></button>
                <span className="text-[10px] text-slate-500">전환</span>
              </div>
            )}
            <Canvas label="송출 화면" tag={live ? 'LIVE' : 'OFF'} scene={SCENES[scene]} live={live} accent />
          </div>

          {/* Docks */}
          <div className="grid grid-cols-4 gap-3 h-48 shrink-0">
            <Dock title="장면">
              {SCENES.map((s, i) => (
                <React.Fragment key={s}><Row active={scene === i} onClick={() => setScene(i)}>{s}</Row></React.Fragment>
              ))}
              <DockFooter />
            </Dock>
            <Dock title="소스">
              {SOURCES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <React.Fragment key={s.name}><Row active={source === i} onClick={() => setSource(i)}>
                    <Icon size={13} className="shrink-0 opacity-80" /><span className="truncate flex-1">{s.name}</span><Eye size={12} className="opacity-50" />
                  </Row></React.Fragment>
                );
              })}
              <DockFooter />
            </Dock>
            <Dock title="오디오 믹서">
              <div className="space-y-2.5 px-1 pt-1">
                {MIXERS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.name}>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1.5"><Icon size={12} /> {m.name}</span>
                        <span className="tabular-nums">{m.level - 100}dB</span>
                      </div>
                      <Meter level={m.level} />
                    </div>
                  );
                })}
              </div>
            </Dock>
            <Dock title="장면 전환">
              <div className="p-1 space-y-1.5">
                <select className="w-full bg-black/30 border border-slate-700 rounded px-2 py-1.5 text-[12px]"><option>페이드</option><option>컷</option><option>슬라이드</option></select>
                <div className="flex items-center justify-between text-[11px] text-slate-400"><span>지속</span><span>300ms</span></div>
                <button onClick={() => setStudio(!studio)} className={`w-full py-1.5 rounded text-[12px] font-medium transition-colors ${studio ? 'text-white' : 'bg-white/5 text-slate-300'}`} style={studio ? { background: ACCENT, color: '#062631' } : undefined}>
                  스튜디오 모드 {studio ? 'ON' : 'OFF'}
                </button>
              </div>
            </Dock>
          </div>
        </div>

        {/* Right Toonation panels */}
        <div className="w-[300px] shrink-0 border-l border-slate-800 flex flex-col bg-[#0f1217]">
          <div className="flex-1 min-h-0 flex flex-col border-b border-slate-800">
            <PanelHeader icon={Activity} title="실시간 후원 이벤트" />
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
              {EVENTS.map((e, i) => (
                <div key={i} className={`rounded-lg px-2.5 py-1.5 border ${e.hot ? 'border-amber-500/40 bg-amber-500/10' : 'border-slate-800 bg-white/[0.03]'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold" style={{ color: e.hot ? '#fbbf24' : ACCENT }}>{e.u} · {e.t}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{e.d}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 px-3 py-2 border-t border-slate-800">
              <MiniBtn>스킵</MiniBtn><MiniBtn>다시 재생</MiniBtn><MiniBtn>일시정지</MiniBtn>
            </div>
          </div>

          <div className="border-b border-slate-800">
            <PanelHeader icon={Trophy} title="엑셀방송 랭킹 제어" />
            <div className="px-3 py-2 space-y-2">
              <div className="flex gap-1">
                {['방송', '일', '주', '월', '누적'].map((t, i) => (
                  <button key={t} className={`flex-1 py-1 rounded text-[11px] ${i === 0 ? 'text-white' : 'bg-white/5 text-slate-400'}`} style={i === 0 ? { background: ACCENT, color: '#062631' } : undefined}>{t}</button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <MiniBtn>노출 ON</MiniBtn><MiniBtn>초기화</MiniBtn><MiniBtn>수동 보정</MiniBtn>
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1"><span>목표 게이지</span><span>82만 / 300만</span></div>
                <Meter level={27} accent />
              </div>
            </div>
          </div>

          <div>
            <PanelHeader icon={Sliders} title="인터랙션 즉시 실행" />
            <div className="grid grid-cols-2 gap-1.5 px-3 py-2">
              {[{ n: '룰렛', i: Target }, { n: '투표', i: HelpCircle }, { n: '퀘스트', i: ListTodo }, { n: '목표', i: Target }].map((w) => {
                const Icon = w.i;
                return (
                  <button key={w.n} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-lg px-2 py-1.5 text-[12px] transition-colors">
                    <Icon size={13} style={{ color: ACCENT }} /> {w.n}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status / controls */}
      <div className="h-12 shrink-0 border-t border-slate-800 bg-[#0a0c0f] flex items-center justify-between px-4">
        <div className="flex items-center gap-4 text-[12px]">
          <span className={`flex items-center gap-1.5 font-semibold ${live ? 'text-red-400' : 'text-slate-500'}`}>
            <Circle size={9} className={live ? 'fill-red-500 text-red-500' : ''} /> {live ? '방송 중' : '대기'}
          </span>
          <span className="text-slate-300 tabular-nums">01:24:07</span>
          {/* multi-platform */}
          <div className="hidden md:flex items-center gap-2">
            {PLATFORMS.map((p) => (
              <span key={p.name} className="flex items-center gap-1 text-[11px]" style={{ color: p.on ? p.color : '#64748b' }}>
                <Circle size={7} className="fill-current" /> {p.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Stat icon={Wifi} label="6000kbps" /><Stat icon={RefreshCw} label="드랍 0.0%" /><Stat icon={Cpu} label="CPU 22%" /><Stat icon={Activity} label="60fps" />
          <button onClick={() => setLive(!live)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] font-bold text-white transition-colors ml-2" style={{ background: live ? '#dc2626' : ACCENT, color: live ? '#fff' : '#062631' }}>
            <Power size={13} /> {live ? '방송 종료' : '방송 시작'}
          </button>
          <CtrlBtn icon={Circle}>녹화</CtrlBtn><CtrlBtn icon={Save}>리플레이</CtrlBtn>
        </div>
      </div>
    </div>
  );
}

function Canvas({ label, tag, scene, live, muted, accent }: any) {
  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-slate-500">{label}</span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: tag === 'LIVE' ? '#dc2626' : accent ? 'rgba(24,201,255,0.2)' : 'rgba(255,255,255,0.08)', color: tag === 'LIVE' ? '#fff' : accent ? ACCENT : '#94a3b8' }}>{tag}</span>
      </div>
      <div className="flex-1 min-h-0 bg-black rounded-lg border border-slate-800 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900" />
        <div className="relative text-center">
          <div className="text-5xl mb-1 opacity-40">🎮</div>
          <div className="text-slate-500 text-[11px]">{scene} · 1920×1080</div>
        </div>
        {muted && <div className="absolute inset-6 border-2 rounded" style={{ borderColor: 'rgba(255,255,255,0.25)' }} />}
      </div>
    </div>
  );
}

/* ---------------- Rail views ---------------- */
function WidgetsView() {
  return (
    <Shell title="후원 위젯" subtitle="URL 없이 소스 목록에서 바로 추가하는 투네이션 위젯 (스트림랩스 방식 + 투네이션 위젯셋)">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {WIDGET_LIST.map((w) => {
          const Icon = w.i;
          return (
            <div key={w.n} className="rounded-xl border border-slate-800 bg-[#0f1217] p-4 flex flex-col items-center gap-2 hover:border-cyan-400/40 transition-colors">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(24,201,255,0.12)', color: ACCENT }}><Icon size={22} /></div>
              <span className="text-[13px]">{w.n}</span>
              <button className="text-[11px] px-3 py-1 rounded text-white flex items-center gap-1" style={{ background: ACCENT, color: '#062631' }}><Plus size={11} /> 소스 추가</button>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function AlertsView() {
  const list = ['텍스트 후원', '음성 후원', '영상 후원', '룰렛 후원', '그림 후원', '멤버십 가입', '팔로우'];
  const [sel, setSel] = useState(0);
  return (
    <Shell title="알림 설정" subtitle="후원 종류별 알림 연출을 설정합니다">
      <div className="flex gap-4">
        <div className="w-44 shrink-0 space-y-1">
          {list.map((a, i) => (
            <button key={a} onClick={() => setSel(i)} className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${sel === i ? 'text-white' : 'bg-[#0f1217] hover:bg-white/5 text-slate-300'}`} style={sel === i ? { background: ACCENT, color: '#062631' } : undefined}>{a}</button>
          ))}
        </div>
        <div className="flex-1 space-y-4 max-w-lg">
          <div className="h-40 rounded-xl border border-slate-800 bg-black flex items-center justify-center">
            <div className="text-center"><div className="text-3xl mb-1">🎉</div><div className="font-bold" style={{ color: ACCENT }}>유저C 님이 5,000원 후원!</div></div>
          </div>
          <Field label="알림 지속 시간"><Range value={60} /></Field>
          <Field label="사운드 볼륨"><Range value={80} /></Field>
          <Field label="최소 후원 금액"><input defaultValue="1,000" className="bg-[#0f1217] border border-slate-700 rounded px-3 py-1.5 text-[13px] w-32" /><span className="text-slate-500 text-[12px] ml-2">원</span></Field>
        </div>
      </div>
    </Shell>
  );
}

function ExcelView() {
  const rows = [
    { r: 1, u: '유저C', amt: 820000, badge: 'VIP' }, { r: 2, u: '유저A', amt: 510000, badge: '골드' },
    { r: 3, u: '유저F', amt: 300000, badge: '실버' }, { r: 4, u: '유저K', amt: 185000, badge: '' },
    { r: 5, u: '유저P', amt: 120000, badge: '' },
  ];
  return (
    <Shell title="엑셀방송 관리" subtitle="후원 순위표를 플랫폼이 자동 집계 · 노출 · 제어 (투네이션 고유 강점)">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0f1217] p-4">
          <div className="text-[13px] font-semibold mb-3">랭킹 기준 · 제어</div>
          <div className="flex gap-1.5 mb-3">
            {['방송', '일', '주', '월', '누적'].map((t, i) => (
              <button key={t} className={`px-3 py-1 rounded text-[12px] ${i === 0 ? 'text-white' : 'bg-white/5 text-slate-400'}`} style={i === 0 ? { background: ACCENT, color: '#062631' } : undefined}>{t}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            <MiniBtn>화면 노출 ON</MiniBtn><MiniBtn>순위 초기화</MiniBtn><MiniBtn>수동 보정</MiniBtn><MiniBtn>내보내기</MiniBtn>
          </div>
          <div className="text-[13px] font-semibold mb-2">목표 게이지</div>
          <div className="flex items-center justify-between text-[12px] text-slate-400 mb-1"><span>오늘 목표</span><span>82만 / 300만원</span></div>
          <Meter level={27} accent />
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1217] p-4">
          <div className="text-[13px] font-semibold mb-3">실시간 후원 순위</div>
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div key={r.r} className="flex items-center gap-2 text-[13px] px-2 py-1.5 rounded-lg bg-white/[0.03]">
                <span className="w-5 text-center font-bold" style={{ color: r.r <= 3 ? '#fbbf24' : '#64748b' }}>{r.r}</span>
                <span className="flex-1 truncate">{r.u} {r.badge && <b className="text-[10px]" style={{ color: ACCENT }}>◆{r.badge}</b>}</span>
                <span className="tabular-nums text-slate-300">{r.amt.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ThemesView() {
  const themes = ['네온 시티', '미니멀 화이트', '레트로 8비트', '사이버펑크', '파스텔', '다크 골드'];
  const grads = ['from-fuchsia-600 to-indigo-700', 'from-slate-200 to-slate-400', 'from-lime-500 to-emerald-700', 'from-cyan-500 to-purple-700', 'from-pink-300 to-sky-400', 'from-amber-500 to-yellow-700'];
  return (
    <Shell title="테마 · 오버레이 프리셋" subtitle="원클릭으로 방송 화면 전체 테마를 적용">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((t, i) => (
          <div key={t} className="group rounded-xl overflow-hidden border border-slate-800 bg-[#0f1217] hover:border-cyan-400/40 transition-colors">
            <div className={`h-32 bg-gradient-to-br ${grads[i]} flex items-center justify-center`}><span className="text-white/90 font-bold drop-shadow">{t}</span></div>
            <div className="p-3 flex items-center justify-between"><span className="text-[13px]">{t}</span><button className="text-[11px] px-2.5 py-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: ACCENT, color: '#062631' }}>적용</button></div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function CrewView() {
  return (
    <Shell title="크루 · 멤버십" subtitle="크루 후원 랭킹과 멤버십 · 친밀도 관리">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0f1217] p-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold mb-3"><Users size={15} style={{ color: ACCENT }} /> 크루 후원 현황</div>
          {['별빛크루 · 1,240만', '달빛길드 · 980만', '새벽크루 · 620만'].map((c, i) => (
            <div key={c} className="flex items-center gap-2 py-1.5 text-[13px]"><span className="w-5 font-bold" style={{ color: i === 0 ? '#fbbf24' : '#64748b' }}>{i + 1}</span><span className="flex-1">{c.split(' · ')[0]}</span><span className="text-slate-400 tabular-nums">{c.split(' · ')[1]}</span></div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f1217] p-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold mb-3"><Crown size={15} style={{ color: ACCENT }} /> 멤버십 등급</div>
          {[['VIP', 24, '#e879f9'], ['골드', 108, '#fbbf24'], ['실버', 341, '#cbd5e1']].map(([n, c, col]) => (
            <div key={n as string} className="flex items-center justify-between py-1.5 text-[13px]"><span style={{ color: col as string }}>◆ {n}</span><span className="text-slate-400">{c}명</span></div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function AppsView() {
  const apps = ['자동 최적화 마법사', '클라우드 설정 백업', '다중 송출', '리플레이 하이라이터', '스포티파이 위젯', '그리드 P2P'];
  return (
    <Shell title="앱" subtitle="방송을 확장하는 앱과 플러그인">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {apps.map((a, i) => (
          <div key={a} className="rounded-xl border border-slate-800 bg-[#0f1217] p-4 flex items-center gap-3 hover:border-cyan-400/40 transition-colors">
            <div className="p-2.5 rounded-lg" style={{ background: 'rgba(24,201,255,0.12)', color: ACCENT }}><Wand2 size={20} /></div>
            <div className="flex-1 min-w-0"><div className="text-[13px] font-medium truncate">{a}</div><div className="text-[11px] text-slate-500">{i % 2 ? '무료' : 'PRO'}</div></div>
            <button className="text-[11px] px-2.5 py-1 rounded text-white" style={{ background: ACCENT, color: '#062631' }}>설치</button>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function SettingsView() {
  const [cat, setCat] = useState('출력');
  const cats = ['일반', '방송', '출력', '오디오', '비디오', '단축키', '고급'];
  return (
    <Shell title="설정" subtitle="OBS 성능 기준의 송출 · 출력 설정">
      <div className="flex gap-4">
        <div className="w-36 shrink-0 space-y-1">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${cat === c ? 'text-white' : 'bg-[#0f1217] hover:bg-white/5 text-slate-300'}`} style={cat === c ? { background: ACCENT, color: '#062631' } : undefined}>{c}</button>
          ))}
        </div>
        <div className="flex-1 space-y-4 max-w-lg">
          <Field label="송출 서버"><Select options={['rtmp://live.toonation.com/app', '자동 (권장)']} /></Field>
          <Field label="스트림 키"><input type="password" defaultValue="tn_live_a1b2c3d4" className="bg-[#0f1217] border border-slate-700 rounded px-3 py-1.5 text-[13px] flex-1" /><button className="ml-2 text-[12px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 flex items-center gap-1"><Copy size={12} /> 복사</button></Field>
          <Field label="비트레이트"><Select options={['6000 kbps', '8000 kbps', '4500 kbps']} /></Field>
          <Field label="인코더"><Select options={['NVENC H.264 (하드웨어)', 'x264 (소프트웨어)']} /></Field>
          <Field label="해상도 · FPS"><Select options={['1920×1080 · 60fps', '1280×720 · 60fps']} /></Field>
          <div className="flex items-center justify-between bg-[#0f1217] border border-slate-800 rounded-lg px-3 py-2.5"><span className="flex items-center gap-2 text-[13px]"><Wifi size={14} className="text-emerald-400" /> 그리드(P2P) 송출 분산</span><span className="text-[11px] text-emerald-400">사용 중</span></div>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- shared ---------------- */
function WinControls() {
  return <div className="flex items-center gap-2 text-slate-500"><span className="w-3 h-0.5 bg-slate-500" /><span className="w-2.5 h-2.5 border border-slate-500" /><span className="hover:text-red-400 cursor-pointer">✕</span></div>;
}
function Dock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-[#0f1217] border border-slate-800 rounded-lg overflow-hidden">
      <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 bg-black/20">{title}</div>
      <div className="flex-1 overflow-y-auto p-1.5">{children}</div>
    </div>
  );
}
function Row({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] text-left transition-colors ${active ? 'text-white' : 'hover:bg-white/5 text-slate-300'}`} style={active ? { background: ACCENT, color: '#062631' } : undefined}>{children}</button>
  );
}
function DockFooter() {
  return <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-800 text-slate-500">{[Plus, Minus, ChevronUp, SettingsIcon, Lock, Trash2].map((Icon, i) => <button key={i} className="p-1 rounded hover:bg-white/5 hover:text-slate-200"><Icon size={13} /></button>)}</div>;
}
function PanelHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 text-[12px] font-semibold text-slate-300"><Icon size={14} style={{ color: ACCENT }} /> {title}</div>;
}
function Meter({ level, accent }: { level: number; accent?: boolean }) {
  return <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${level}%`, background: accent ? ACCENT : level > 85 ? 'linear-gradient(90deg,#10b981,#fbbf24,#ef4444)' : 'linear-gradient(90deg,#10b981,#34d399)' }} /></div>;
}
function MiniBtn({ children }: { children: React.ReactNode }) {
  return <button className="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">{children}</button>;
}
function Stat({ icon: Icon, label }: { icon: any; label: string }) {
  return <span className="hidden md:flex items-center gap-1 text-slate-400 text-[11px]"><Icon size={12} /> {label}</span>;
}
function CtrlBtn({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">{children}</button>;
}
function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto p-6"><h1 className="text-lg font-bold text-white">{title}</h1><p className="text-[12px] text-slate-500 mb-5">{subtitle}</p>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-[12px] text-slate-400 mb-1.5">{label}</div><div className="flex items-center">{children}</div></div>;
}
function Select({ options }: { options: string[] }) {
  return <select className="bg-[#0f1217] border border-slate-700 rounded px-3 py-1.5 text-[13px] w-full max-w-sm text-slate-200">{options.map((o) => <option key={o}>{o}</option>)}</select>;
}
function Range({ value }: { value: number }) {
  return <div className="flex items-center gap-3 w-full max-w-sm"><div className="flex-1 h-1.5 rounded-full bg-slate-700"><div className="h-full rounded-full" style={{ width: `${value}%`, background: ACCENT }} /></div><span className="text-[12px] text-slate-500 tabular-nums w-8">{value}%</span></div>;
}
