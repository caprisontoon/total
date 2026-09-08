import React, { useState } from 'react';
import {
  Video, Monitor, Bell, LayoutGrid, Palette, Store, Settings as SettingsIcon,
  Plus, Minus, Eye, EyeOff, Lock, Copy, ChevronUp, Trash2,
  Mic, Volume2, Music, Gamepad2, Camera, Image as ImageIcon, MessageSquare,
  Gift, Target, Trophy, Sliders, Play, Circle, Save, Wifi, Cpu, RefreshCw,
  Wand2, Users, Radio,
} from 'lucide-react';

// 방송용 데스크탑 — 스트림랩스/OBS 스타일 송출 프로그램 UI 프로토타입.
// 실제 송출 기능은 없으며, 좌측 메뉴/씬/소스를 클릭하면 화면이 전환됩니다.

type Rail = 'editor' | 'themes' | 'alertbox' | 'widgets' | 'appstore' | 'settings';

const RAIL: { id: Rail; label: string; icon: any }[] = [
  { id: 'editor', label: '편집기', icon: Video },
  { id: 'themes', label: '테마', icon: Palette },
  { id: 'alertbox', label: '알림 상자', icon: Bell },
  { id: 'widgets', label: '위젯', icon: LayoutGrid },
  { id: 'appstore', label: '앱 스토어', icon: Store },
  { id: 'settings', label: '설정', icon: SettingsIcon },
];

const SCENES = ['🎮 게임 방송', '⏳ 잠시 후 시작', '💬 토크 / 캠', '🏁 방송 종료'];

const SOURCES: { name: string; icon: any; type: string }[] = [
  { name: '게임 캡처', icon: Gamepad2, type: '게임' },
  { name: '웹캠 (Logitech C920)', icon: Camera, type: '영상 캡처 장치' },
  { name: '통합 알림창', icon: Bell, type: '브라우저' },
  { name: '후원 랭킹', icon: Trophy, type: '브라우저' },
  { name: '배경 이미지', icon: ImageIcon, type: '이미지' },
  { name: '채팅박스', icon: MessageSquare, type: '브라우저' },
];

const MIXERS: { name: string; level: number; icon: any }[] = [
  { name: '마이크 / Aux', level: 72, icon: Mic },
  { name: '데스크탑 오디오', level: 45, icon: Volume2 },
  { name: '게임 사운드', level: 88, icon: Music },
];

const CHAT = [
  { user: '유저A', msg: 'ㅋㅋㅋㅋ 이번판 각이다', color: 'text-sky-400' },
  { user: '유저B', msg: '오늘도 화이팅!', color: 'text-emerald-400' },
  { user: '유저C', msg: '룰렛 5,000원 → "벌칙 3번" 당첨', color: 'text-amber-400', donation: true },
  { user: '유저D', msg: '대박 ㄷㄷ', color: 'text-fuchsia-400' },
  { user: '유저E', msg: '방송 언제 끝나요?', color: 'text-sky-400' },
];

const THEMES = ['네온 시티', '미니멀 화이트', '레트로 8비트', '사이버펑크', '파스텔 구름', '다크 골드'];

const WIDGET_LIST = [
  { name: '통합 알림창', icon: Bell }, { name: '채팅박스', icon: MessageSquare },
  { name: '후원 랭킹', icon: Trophy }, { name: '룰렛', icon: Target },
  { name: '목표 게이지', icon: Target }, { name: '최근 후원', icon: Gift },
  { name: '투표', icon: Sliders }, { name: '이벤트 리스트', icon: LayoutGrid },
];

const SETTINGS_CATS = ['일반', '방송', '출력', '오디오', '비디오', '단축키', '고급'];

export default function BroadcastDesktopPage() {
  const [rail, setRail] = useState<Rail>('editor');
  const [activeScene, setActiveScene] = useState(0);
  const [activeSource, setActiveSource] = useState(0);
  const [live, setLive] = useState(true);
  const [settingsCat, setSettingsCat] = useState('출력');

  return (
    <div className="flex flex-col h-screen bg-[#15171c] text-slate-200 text-sm select-none overflow-hidden">
      {/* ===== Title bar ===== */}
      <div className="flex items-center justify-between h-9 px-3 bg-[#0f1115] border-b border-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <Radio size={15} />
            <span>투네이션 Studio</span>
          </div>
          <nav className="hidden md:flex items-center gap-3 text-[12px] text-slate-400">
            {['파일', '편집', '보기', '장면 컬렉션', '프로필', '도구', '도움말'].map((m) => (
              <button key={m} className="hover:text-white transition-colors">{m}</button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {/* mode tabs */}
          <div className="flex items-center bg-black/30 rounded-md p-0.5">
            <button
              onClick={() => window.open('/desktop/watch', 'watchDesktop', 'width=1280,height=800')}
              className="px-3 py-1 rounded text-[12px] text-slate-400 hover:text-white transition-colors"
            >시청</button>
            <button className="px-3 py-1 rounded text-[12px] font-semibold bg-blue-600 text-white">방송</button>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-3 h-0.5 bg-slate-500" />
            <span className="w-2.5 h-2.5 border border-slate-500" />
            <span className="text-slate-500 hover:text-red-400 cursor-pointer">✕</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* ===== Left rail ===== */}
        <div className="w-16 bg-[#0f1115] border-r border-black/40 flex flex-col items-center py-3 gap-1 shrink-0">
          {RAIL.map((r) => {
            const Icon = r.icon;
            const active = rail === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRail(r.id)}
                className={`w-14 py-2 flex flex-col items-center gap-1 rounded-lg transition-colors ${active ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
              >
                <Icon size={18} />
                <span className="text-[10px]">{r.label}</span>
              </button>
            );
          })}
          <div className="mt-auto flex flex-col items-center gap-1 text-emerald-400">
            <Wifi size={16} />
            <span className="text-[9px]">그리드 ON</span>
          </div>
        </div>

        {/* ===== Main ===== */}
        <div className="flex-1 min-w-0 flex flex-col">
          {rail === 'editor' && (
            <Editor
              live={live} setLive={setLive}
              activeScene={activeScene} setActiveScene={setActiveScene}
              activeSource={activeSource} setActiveSource={setActiveSource}
            />
          )}
          {rail === 'themes' && <Themes />}
          {rail === 'alertbox' && <AlertBox />}
          {rail === 'widgets' && <Widgets />}
          {rail === 'appstore' && <AppStore />}
          {rail === 'settings' && <SettingsView cat={settingsCat} setCat={setSettingsCat} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Editor (OBS/Streamlabs main) ---------------- */
function Editor({ live, setLive, activeScene, setActiveScene, activeSource, setActiveSource }: any) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-1 min-h-0">
        {/* Preview + docks */}
        <div className="flex-1 min-w-0 flex flex-col p-3 gap-3">
          {/* Preview */}
          <div className="flex-1 min-h-0 bg-black rounded-lg border border-slate-800 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900" />
            <div className="relative text-center">
              <div className="text-slate-600 text-6xl mb-2">🎮</div>
              <div className="text-slate-500 text-xs">{SCENES[activeScene]} · 미리보기 1920×1080</div>
            </div>
            {/* selected source bounding box */}
            <div className="absolute inset-8 border-2 border-red-500/70 rounded pointer-events-none">
              <span className="absolute -top-5 left-0 text-[10px] text-red-400">{SOURCES[activeSource].name}</span>
            </div>
            {live && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                <Circle size={8} className="fill-white" /> LIVE
              </div>
            )}
          </div>

          {/* Docks row */}
          <div className="grid grid-cols-3 gap-3 h-52 shrink-0">
            {/* Scenes */}
            <Dock title="장면 (Scenes)">
              {SCENES.map((s, i) => (
                <button
                  key={s} onClick={() => setActiveScene(i)}
                  className={`w-full text-left px-2 py-1.5 rounded text-[12px] transition-colors ${activeScene === i ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-300'}`}
                >{s}</button>
              ))}
              <DockFooter />
            </Dock>

            {/* Sources */}
            <Dock title="소스 (Sources)">
              {SOURCES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.name} onClick={() => setActiveSource(i)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] transition-colors ${activeSource === i ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-300'}`}
                  >
                    <Icon size={13} className="shrink-0 opacity-80" />
                    <span className="truncate flex-1 text-left">{s.name}</span>
                    <Eye size={12} className="opacity-60" />
                  </button>
                );
              })}
              <DockFooter />
            </Dock>

            {/* Audio mixer */}
            <Dock title="오디오 믹서 (Audio Mixer)">
              <div className="space-y-3 px-1 pt-1">
                {MIXERS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.name}>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1.5"><Icon size={12} /> {m.name}</span>
                        <span className="tabular-nums">{m.level - 100} dB</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.level > 85 ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                          style={{ width: `${m.level}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Dock>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 shrink-0 border-l border-slate-800 flex flex-col bg-[#12141a]">
          {/* Chat */}
          <div className="flex-1 min-h-0 flex flex-col border-b border-slate-800">
            <PanelHeader icon={MessageSquare} title="채팅" badge="1,204명" />
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
              {CHAT.map((c, i) => (
                <div key={i} className="text-[12px] leading-snug">
                  {c.donation ? (
                    <span className="block bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1 text-amber-300">
                      <b>★ {c.user}</b> {c.msg}
                    </span>
                  ) : (
                    <span><b className={c.color}>{c.user}</b> <span className="text-slate-300">{c.msg}</span></span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Donation alert */}
          <div className="border-b border-slate-800">
            <PanelHeader icon={Gift} title="후원 알림" />
            <div className="px-3 py-2">
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-2.5">
                <div className="text-[12px] text-blue-300 font-semibold">유저C 님 5,000원 후원!</div>
                <div className="text-[11px] text-slate-400 mt-0.5">"오늘 방송 재밌어요 ㅎㅎ"</div>
                <div className="flex gap-1.5 mt-2">
                  <MiniBtn>스킵</MiniBtn><MiniBtn>다시 재생</MiniBtn>
                </div>
              </div>
            </div>
          </div>

          {/* Widget & ranking control */}
          <div>
            <PanelHeader icon={Sliders} title="위젯 · 랭킹 제어" />
            <div className="px-3 py-2 space-y-1.5">
              {[
                { name: '룰렛', icon: Target, action: '실행' },
                { name: '투표', icon: Sliders, action: '시작' },
                { name: '후원 랭킹', icon: Trophy, action: '전환' },
                { name: '목표 게이지', icon: Target, action: '설정' },
              ].map((w) => {
                const Icon = w.icon;
                return (
                  <div key={w.name} className="flex items-center justify-between bg-white/5 rounded-lg px-2.5 py-1.5">
                    <span className="flex items-center gap-2 text-[12px]"><Icon size={13} className="text-slate-400" /> {w.name}</span>
                    <button className="text-[11px] px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors">{w.action}</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status / control bar */}
      <div className="h-12 shrink-0 border-t border-slate-800 bg-[#0f1115] flex items-center justify-between px-4">
        <div className="flex items-center gap-4 text-[12px]">
          <span className={`flex items-center gap-1.5 font-semibold ${live ? 'text-red-400' : 'text-slate-500'}`}>
            <Circle size={9} className={live ? 'fill-red-500 text-red-500' : ''} /> {live ? '방송 중' : '대기'}
          </span>
          <span className="text-slate-400 tabular-nums">01:24:07</span>
          <Stat icon={Wifi} label="6000 kbps" />
          <Stat icon={RefreshCw} label="드랍 0.0%" />
          <Stat icon={Cpu} label="CPU 22%" />
          <Stat icon={Users} label="1,204명" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLive(!live)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] font-semibold text-white transition-colors ${live ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
          >
            <Play size={13} /> {live ? '방송 종료' : '방송 시작'}
          </button>
          <CtrlBtn icon={Circle}>녹화</CtrlBtn>
          <CtrlBtn icon={Save}>리플레이</CtrlBtn>
          <CtrlBtn icon={SettingsIcon}>설정</CtrlBtn>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Themes ---------------- */
function Themes() {
  return (
    <ViewShell title="테마 · 오버레이 프리셋" subtitle="원클릭으로 방송 화면 테마를 적용하세요 (스트림랩스 스타일)">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {THEMES.map((t, i) => (
          <div key={t} className="group rounded-xl overflow-hidden border border-slate-800 bg-[#12141a] hover:border-blue-500/50 transition-colors">
            <div className={`h-32 bg-gradient-to-br ${['from-fuchsia-600 to-indigo-700', 'from-slate-200 to-slate-400', 'from-lime-500 to-emerald-700', 'from-cyan-500 to-purple-700', 'from-pink-300 to-sky-400', 'from-amber-500 to-yellow-700'][i]} flex items-center justify-center`}>
              <span className="text-white/90 font-bold drop-shadow">{t}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-[13px] font-medium">{t}</span>
              <button className="text-[11px] px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">적용</button>
            </div>
          </div>
        ))}
      </div>
    </ViewShell>
  );
}

/* ---------------- Alert Box ---------------- */
function AlertBox() {
  const alerts = ['후원 알림', '팔로우 알림', '멤버십 가입', '룰렛 당첨', '목표 달성'];
  const [sel, setSel] = useState(0);
  return (
    <ViewShell title="알림 상자 (Alert Box)" subtitle="후원 · 팔로우 등 이벤트별 알림 연출을 설정합니다">
      <div className="flex gap-4">
        <div className="w-48 shrink-0 space-y-1">
          {alerts.map((a, i) => (
            <button key={a} onClick={() => setSel(i)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${sel === i ? 'bg-blue-600 text-white' : 'bg-[#12141a] hover:bg-white/5 text-slate-300'}`}>
              {a}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-40 rounded-xl border border-slate-800 bg-black flex items-center justify-center">
            <div className="text-center animate-pulse">
              <div className="text-3xl mb-1">🎉</div>
              <div className="text-blue-300 font-bold">유저C 님이 5,000원 후원!</div>
            </div>
          </div>
          <Field label="알림 지속 시간"><Range value={60} /></Field>
          <Field label="사운드 볼륨"><Range value={80} /></Field>
          <Field label="최소 후원 금액">
            <input defaultValue="1,000" className="bg-[#12141a] border border-slate-700 rounded px-3 py-1.5 text-[13px] w-32" />
            <span className="text-slate-500 text-[12px] ml-2">원</span>
          </Field>
        </div>
      </div>
    </ViewShell>
  );
}

/* ---------------- Widgets ---------------- */
function Widgets() {
  return (
    <ViewShell title="위젯" subtitle="소스 목록에서 바로 추가할 수 있는 방송 위젯 (URL 개념 불필요)">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {WIDGET_LIST.map((w) => {
          const Icon = w.icon;
          return (
            <div key={w.name} className="rounded-xl border border-slate-800 bg-[#12141a] p-4 flex flex-col items-center gap-2 hover:border-blue-500/50 transition-colors">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400"><Icon size={22} /></div>
              <span className="text-[13px]">{w.name}</span>
              <button className="mt-1 text-[11px] px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"><Plus size={11} /> 소스 추가</button>
            </div>
          );
        })}
      </div>
    </ViewShell>
  );
}

/* ---------------- App store ---------------- */
function AppStore() {
  const apps = ['자동 최적화 마법사', '클라우드 설정 백업', '다중 송출', '하이라이터', '스팀 통합', '스포티파이 위젯'];
  return (
    <ViewShell title="앱 스토어" subtitle="방송을 확장하는 앱과 플러그인">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {apps.map((a, i) => (
          <div key={a} className="rounded-xl border border-slate-800 bg-[#12141a] p-4 flex items-center gap-3 hover:border-blue-500/50 transition-colors">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 text-blue-300"><Wand2 size={20} /></div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate">{a}</div>
              <div className="text-[11px] text-slate-500">{i % 2 ? '무료' : 'PRO'}</div>
            </div>
            <button className="text-[11px] px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white">설치</button>
          </div>
        ))}
      </div>
    </ViewShell>
  );
}

/* ---------------- Settings ---------------- */
function SettingsView({ cat, setCat }: { cat: string; setCat: (c: string) => void }) {
  return (
    <ViewShell title="설정" subtitle="OBS 성능 기준의 송출 · 출력 설정">
      <div className="flex gap-4">
        <div className="w-40 shrink-0 space-y-1">
          {SETTINGS_CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${cat === c ? 'bg-blue-600 text-white' : 'bg-[#12141a] hover:bg-white/5 text-slate-300'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-4 max-w-lg">
          <Field label="송출 서버"><Select options={['rtmp://live.toonation.com/app', '자동 (권장)']} /></Field>
          <Field label="스트림 키">
            <input type="password" defaultValue="tn_live_a1b2c3d4e5" className="bg-[#12141a] border border-slate-700 rounded px-3 py-1.5 text-[13px] flex-1" />
            <button className="ml-2 text-[12px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 flex items-center gap-1"><Copy size={12} /> 복사</button>
          </Field>
          <Field label="비디오 비트레이트"><Select options={['6000 kbps', '8000 kbps', '4500 kbps']} /></Field>
          <Field label="인코더"><Select options={['NVENC H.264 (하드웨어)', 'x264 (소프트웨어)']} /></Field>
          <Field label="해상도 · FPS"><Select options={['1920×1080 · 60fps', '1280×720 · 60fps']} /></Field>
          <div className="flex items-center justify-between bg-[#12141a] border border-slate-800 rounded-lg px-3 py-2.5">
            <span className="flex items-center gap-2 text-[13px]"><Wifi size={14} className="text-emerald-400" /> 그리드(P2P) 송출 분산</span>
            <span className="text-[11px] text-emerald-400">사용 중</span>
          </div>
        </div>
      </div>
    </ViewShell>
  );
}

/* ---------------- shared bits ---------------- */
function Dock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-[#12141a] border border-slate-800 rounded-lg overflow-hidden">
      <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 bg-black/20">{title}</div>
      <div className="flex-1 overflow-y-auto p-1.5">{children}</div>
    </div>
  );
}
function DockFooter() {
  return (
    <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-800 text-slate-500">
      {[Plus, Minus, ChevronUp, SettingsIcon, Lock, Trash2].map((Icon, i) => (
        <button key={i} className="p-1 rounded hover:bg-white/5 hover:text-slate-200"><Icon size={13} /></button>
      ))}
    </div>
  );
}
function PanelHeader({ icon: Icon, title, badge }: { icon: any; title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
      <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-300"><Icon size={14} /> {title}</span>
      {badge && <span className="text-[11px] text-slate-500">{badge}</span>}
    </div>
  );
}
function MiniBtn({ children }: { children: React.ReactNode }) {
  return <button className="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300">{children}</button>;
}
function Stat({ icon: Icon, label }: { icon: any; label: string }) {
  return <span className="flex items-center gap-1 text-slate-400"><Icon size={12} /> {label}</span>;
}
function CtrlBtn({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
      <Icon size={13} /> {children}
    </button>
  );
}
function ViewShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-lg font-bold text-white">{title}</h1>
      <p className="text-[12px] text-slate-500 mb-5">{subtitle}</p>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[12px] text-slate-400 mb-1.5">{label}</div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}
function Select({ options }: { options: string[] }) {
  return (
    <select className="bg-[#12141a] border border-slate-700 rounded px-3 py-1.5 text-[13px] w-full max-w-sm text-slate-200">
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
function Range({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3 w-full max-w-sm">
      <div className="flex-1 h-1.5 rounded-full bg-slate-700"><div className="h-full rounded-full bg-blue-500" style={{ width: `${value}%` }} /></div>
      <span className="text-[12px] text-slate-500 tabular-nums w-8">{value}%</span>
    </div>
  );
}
