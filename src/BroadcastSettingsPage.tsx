import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatorChat from './creatorchat/CreatorChat';
import { useCreatorChat } from './creatorchat/store';
import {
  Copy, Check, Eye, EyeOff, RefreshCw, Info, ExternalLink, Upload, Plus, X, Radio, Activity,
  Wifi, Monitor, Clock, Users, AlertTriangle, ShieldAlert, Link2, MessageSquare, Gauge,
  ChevronDown, ChevronUp, Image as ImageIcon, RotateCcw, Save, CircleDot, Tv,
} from 'lucide-react';

// 방송 설정 — 1단계 웹 스트리밍 "⑥ 방송 설정 화면 기획서"의 필수 기능(6-5 매트릭스 O 항목)만으로 재설계.
// 핵심 전제: 1단계는 별도 '방송 시작' 버튼이 없고 송출 프로그램의 스트림 수신 시점에 자동 시작된다(④-4-2).
// 따라서 이 화면은 ① 송출 프로그램 연결(진입 장벽) ② 시청자에게 보일 정보 ③ 채팅·옵션 ④ "잘 되고 있나" 확인 에 집중한다.

type StreamState = 'offline' | 'preparing' | 'live' | 'suspended';
type Program = 'obs' | 'streamlabs' | 'other';

const SERVER_URL = 'rtmp://live.toonation.com/app';
const CHANNEL_NAME = 'YM상사';
const CATEGORIES = ['게임', '토크', '음악', '먹방', '아트', '금융', '스포츠', '교육', '기타'];
const SLOW_MODES = [0, 3, 5, 10, 30, 60]; // 치지직 허용값 참조 (F-024) — 정책 확정 전
const MAX_TAGS = 5;      // [조사] — 트위치 5개 참조 (F-037)
const MAX_TITLE = 100;   // [조사]
const KEY_REVEAL_SEC = 10;

const PROGRAMS: { id: Program; name: string; steps: string[] }[] = [
  { id: 'obs', name: 'OBS Studio', steps: ['OBS 실행 → 우측 하단 설정(⚙) → 방송', "서비스에서 '사용자 지정...' 선택", '서버 칸에 아래 서버 주소를 붙여넣기', '스트림 키 칸에 아래 스트림키를 붙여넣기 → 확인', "'방송 시작' 클릭 — 투네이션이 신호를 받으면 자동으로 라이브가 시작됩니다"] },
  { id: 'streamlabs', name: '스트림랩스', steps: ['스트림랩스 실행 → 설정 → Stream', "Stream Type을 'Custom Ingest'로 선택", 'URL 칸에 서버 주소, Stream Key 칸에 스트림키 입력 → Done', "'Go Live' 클릭 — 신호 수신 시 자동으로 라이브 시작"] },
  { id: 'other', name: '기타 (RTMP)', steps: ['프로그램의 송출(RTMP) 설정을 엽니다', '서버 URL에 서버 주소, 스트림키에 스트림키를 입력합니다', '권장: 1920×1080 · 60fps · 6,000 kbps (원본 상한은 정책 확정 후 안내)', '송출을 시작하면 자동으로 라이브가 시작됩니다'] },
];

const genKey = () => 'live_' + Array.from({ length: 24 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');

// 권장 인코딩 설정 (벤치마킹 #19 · KICK 유일 패턴) — 읽기 전용 2열 표 + 필드별 복사.
// 값은 ②번 개발자 회신(화질 단계 · 비트레이트 상한) 전 잠정값이다.
const ENCODING: { k: string; v: string; note?: string }[] = [
  { k: '해상도', v: '1920x1080' },
  { k: '프레임레이트', v: '60fps', note: '30fps도 지원' },
  { k: '레이트 제어', v: 'CBR', note: '고정 비트레이트' },
  { k: '비트레이트', v: '6000 kbps', note: '상한은 정책 확정 후 안내' },
  { k: '키프레임 간격', v: '2초', note: '0(자동)은 권장하지 않음' },
  { k: '인코더', v: 'x264 / NVENC (H.264)' },
  { k: '오디오', v: '160 kbps · 48 kHz · 스테레오' },
];

// 기술 수치의 자연어 번역 (#13) — 비개발 크리에이터가 대다수라 수치와 판정을 함께 준다.
type Quality = 'good' | 'fair' | 'bad' | 'none';
const QUALITY_META: Record<Quality, { label: string; cls: string; desc: string }> = {
  good: { label: '매우 좋음', cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50', desc: '비트레이트와 수신 지연이 모두 권장 범위입니다. 그대로 방송하세요.' },
  fair: { label: '보통', cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50', desc: '시청자 일부에게 화질 저하가 보일 수 있습니다. 송출 상태에서 수치를 확인해 보세요.' },
  bad: { label: '불안정', cls: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50', desc: '끊김 · 화질 저하가 발생하고 있습니다. 송출 상태에서 원인을 확인하세요.' },
  none: { label: '측정 전', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700', desc: '아직 송출 신호를 받지 못해 판정할 수 없습니다.' },
};
function judgeQuality(state: StreamState, bitrate: number, delaySec: number): Quality {
  if (state === 'offline') return 'none';
  if (state === 'suspended') return 'bad';
  if (state === 'preparing') return 'fair';
  if (bitrate >= 4500 && delaySec < 2.5) return 'good';
  if (bitrate >= 2500 && delaySec < 4) return 'fair';
  return 'bad';
}

// 송출 상태 지표 정의 (#17) — 집계 기준까지 밝혀 관리자 통계와의 혼선을 줄인다.
const STATUS_DEFS: Record<string, string> = {
  상태: '서버가 판단한 현재 방송 상태입니다. 송출 프로그램의 표시와 최대 몇 초 차이가 날 수 있어요.',
  비트레이트: '서버가 실제로 수신한 초당 데이터량(kbps)입니다. 송출 프로그램이 보내는 설정값이 아니라 도착한 값입니다.',
  '해상도 · fps': '수신한 영상 원본의 해상도와 프레임레이트입니다. 시청자는 화질 단계에 따라 더 낮은 값으로 볼 수 있어요.',
  '수신 지연': '송출 프로그램에서 서버까지 도달하는 데 걸린 시간입니다. 시청자가 보는 지연과는 다릅니다.',
  시청자: '지금 이 방송을 보고 있는 동시 시청자 수입니다. 중복 접속은 제외하고 셉니다.',
  '방송 시간': '이번 회차가 시작된 뒤 지난 시간입니다. 일시중단 구간도 포함합니다.',
};

type Form = { title: string; category: string; tags: string[]; thumb: string | null; chat: 'all' | 'follower' | 'off'; slow: number; age: 'all' | 'restricted'; hidden: boolean };
const INITIAL_FORM: Form = { title: '', category: '토크', tags: ['엑셀방송'], thumb: null, chat: 'all', slow: 0, age: 'all', hidden: false };

export default function BroadcastSettingsPage() {
  const navigate = useNavigate();

  // ── 송출 상태 (데모 전환 포함) ──
  const [state, setState] = useState<StreamState>('live');
  const [elapsed, setElapsed] = useState(84 * 60 + 7);
  const [reconnectLeft, setReconnectLeft] = useState(90);
  const [hist, setHist] = useState<number[]>(() => Array.from({ length: 36 }, () => 5800 + Math.round(Math.random() * 400)));
  // 데모: 회선 상태 시나리오 — 자연어 판정 칩(#13)이 3단계 모두 보이도록 비트레이트 · 지연을 흔든다
  const [netDemo, setNetDemo] = useState<'good' | 'fair' | 'bad'>('good');
  const NET = { good: { base: 5600, jitter: 600, delay: 2.1 }, fair: { base: 2900, jitter: 900, delay: 3.4 }, bad: { base: 1200, jitter: 1400, delay: 5.8 } }[netDemo];
  const viewers = state === 'live' ? 1204 : state === 'suspended' ? 1180 : 0;
  const isOnAir = state !== 'offline';

  useEffect(() => {
    const t = setInterval(() => {
      if (state === 'live') { setElapsed((s) => s + 1); setHist((h) => [...h.slice(1), Math.max(300, NET.base + Math.round((Math.random() - 0.3) * NET.jitter))]); }
      else if (state === 'suspended') { setElapsed((s) => s + 1); setHist((h) => [...h.slice(1), 0]); setReconnectLeft((s) => (s <= 1 ? 0 : s - 1)); }
      else if (state === 'preparing') { setHist((h) => [...h.slice(1), 2000 + Math.round(Math.random() * 3000)]); }
      else { setHist((h) => [...h.slice(1), 0]); }
    }, 1000);
    return () => clearInterval(t);
  }, [state, NET.base, NET.jitter]);
  useEffect(() => { if (state !== 'suspended') setReconnectLeft(90); if (state === 'offline') setHist(Array(36).fill(0)); }, [state]);
  useEffect(() => { if (state === 'suspended' && reconnectLeft === 0) { setState('offline'); setElapsed(0); } }, [reconnectLeft, state]); // 90초 경과 → 종료 (④-4-3)

  // ── 스트림키 ──
  const [streamKey, setStreamKey] = useState(genKey);
  const [revealed, setRevealed] = useState(false);
  const [revealLeft, setRevealLeft] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [reissueOpen, setReissueOpen] = useState(false);
  const [program, setProgram] = useState<Program>('obs');
  const [guideOpen, setGuideOpen] = useState(false);
  useEffect(() => {
    if (!revealed) return;
    setRevealLeft(KEY_REVEAL_SEC);
    const t = setInterval(() => setRevealLeft((s) => { if (s <= 1) { clearInterval(t); setRevealed(false); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [revealed]);
  const copy = (what: string, text: string) => { navigator.clipboard?.writeText(text).catch(() => {}); setCopied(what); setTimeout(() => setCopied(null), 1500); };
  const reissue = () => { setStreamKey(genKey()); setReissueOpen(false); setRevealed(true); toast('새 스트림키가 발급되었습니다. 기존 키는 즉시 무효화됐어요.'); };

  // OBS 프로필 다운로드 (#12 · KICK 유일 패턴) — 서버 · 키 · 권장 인코딩을 한 파일로.
  // 값을 읽고 옮겨 적게 하는 대신 파일 하나로 자동 적용시켜 진입 장벽을 낮춘다.
  const downloadObsProfile = () => {
    const profile = {
      name: `Toonation - ${CHANNEL_NAME}`,
      stream: { service: 'Custom', server: SERVER_URL, key: streamKey },
      output: { mode: 'Advanced', encoder: 'x264', rate_control: 'CBR', bitrate: 6000, keyint_sec: 2, preset: 'veryfast', profile: 'high' },
      video: { base: '1920x1080', output: '1920x1080', fps: 60 },
      audio: { bitrate: 160, sample_rate: 48000, channels: 'Stereo' },
      generated_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // 앵커를 DOM에 붙여야 download 속성이 적용된다. 파일명은 ASCII(한글 파일명은 일부 브라우저가 무시).
    const a = document.createElement('a');
    a.href = url; a.download = 'toonation-obs-profile.json'; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    toast('OBS 프로필을 내려받았습니다. 스트림키가 포함돼 있으니 파일을 공유하지 마세요.');
  };

  // ── 방송 정보 · 옵션 (더티 추적) ──
  const [form, setForm] = useState<Form>(INITIAL_FORM);
  const [saved, setSaved] = useState<Form>(INITIAL_FORM);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [tagInput, setTagInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const dirtyCount = useMemo(() => (Object.keys(form) as (keyof Form)[]).filter((k) => JSON.stringify(form[k]) !== JSON.stringify(saved[k])).length, [form, saved]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => { setSaved(form); setLastSavedAt(new Date()); toast(isOnAir ? '저장됨 · 방송 중이라 즉시 반영됩니다' : '저장됨 · 다음 방송에도 유지됩니다'); };
  const revert = () => setForm(saved);
  const addTag = () => { const t = tagInput.trim().replace(/^#/, ''); if (t && !form.tags.includes(t) && form.tags.length < MAX_TAGS) set('tags', [...form.tags, t]); setTagInput(''); };
  const onThumb = (f?: File) => { if (!f) return; const url = URL.createObjectURL(f); set('thumb', url); };

  // ── 토스트 · 섹션 이동 ──
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toast = (m: string) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2000); };
  const secRefs = { connect: useRef<HTMLDivElement>(null), info: useRef<HTMLDivElement>(null), options: useRef<HTMLDivElement>(null), status: useRef<HTMLDivElement>(null) };
  const jump = (k: keyof typeof secRefs) => secRefs[k].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const fmtTime = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const curBitrate = hist[hist.length - 1];
  const delaySec = state === 'live' ? NET.delay : 0;
  const quality = judgeQuality(state, curBitrate, delaySec);
  const displayTitle = form.title.trim() || CHANNEL_NAME;
  const canReissue = state === 'offline';

  // 채팅 상태는 페이지가 소유 — 새 창으로 분리해 패널이 언마운트돼도 구독이 유지된다
  const chat = useCreatorChat('ym', state !== 'offline' && form.chat !== 'off');
  // 방송 정보(3. 채팅 · 옵션)에 저장한 참여 범위 · 슬로우가 채팅 정책의 기본값이 된다.
  // 방송 중 채팅 패널의 '채널 조치'에서 바꾼 값은 이번 방송에만 적용되는 즉시 조정.
  useEffect(() => {
    if (saved.chat === 'off') return;
    chat.setPolicy({ participation: saved.chat === 'follower' ? 'follower' : 'all', slowSec: saved.slow });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved.chat, saved.slow]);

  // ── 우측 컬럼: 미리보기 접기(방송 중 기본 접힘 → 채팅에 공간) · 채팅 팝업 분리 ──
  const [previewOpen, setPreviewOpen] = useState(state === 'offline');
  useEffect(() => { setPreviewOpen(state === 'offline'); }, [state]);
  const popupRef = useRef<Window | null>(null);
  const [poppedOut, setPoppedOut] = useState(false);
  const popoutChat = () => {
    const url = `/broadcast-settings/chat?channel=ym&status=${state}`;
    const w = window.open(url, 'toonCreatorChat', 'width=440,height=820,resizable=yes');
    if (!w) { toast('팝업이 차단되었어요. 브라우저에서 팝업을 허용한 뒤 다시 시도해 주세요.'); return; }
    popupRef.current = w; setPoppedOut(true);
  };
  const restoreChat = () => { popupRef.current?.close(); popupRef.current = null; setPoppedOut(false); };
  useEffect(() => {
    if (!poppedOut) return;
    const t = setInterval(() => { if (popupRef.current?.closed) { popupRef.current = null; setPoppedOut(false); } }, 800);
    return () => clearInterval(t);
  }, [poppedOut]);

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* ═══════════ 상태 히어로 ═══════════ */}
      <StatusHero state={state} elapsed={fmtTime(elapsed)} viewers={viewers} bitrate={curBitrate} reconnectLeft={reconnectLeft} quality={quality}
        onOpenChannel={() => navigate('/live/ym')} onGuide={() => { setGuideOpen(true); jump('connect'); }} onDiagnose={() => jump('status')}
        setState={setState} netDemo={netDemo} setNetDemo={setNetDemo} />

      {/* 섹션 내비 */}
      <div className="sticky top-0 z-20 -mx-4 lg:-mx-8 px-4 lg:px-8 py-2 mt-5 bg-gray-50/90 dark:bg-[#0f1115]/90 backdrop-blur border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto">
        {([['connect', '연결', Link2], ['info', '방송 정보', Tv], ['options', '채팅 · 옵션', MessageSquare], ['status', '송출 상태', Activity]] as const).map(([k, label, Icon]) => (
          <button key={k} onClick={() => jump(k)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm whitespace-nowrap transition-all">
            <Icon size={14} /> {label}
          </button>
        ))}
        <div className="ml-auto text-xs text-slate-400 whitespace-nowrap hidden sm:block">{lastSavedAt ? `마지막 저장 ${lastSavedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` : '저장된 변경 없음'}</div>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        {/* ═══════════ 좌측: 설정 흐름 ═══════════ */}
        <div className="space-y-6 min-w-0">

          {/* ── 1. 연결 ── */}
          <Card ref={secRefs.connect} step="1" title="송출 프로그램 연결" desc="서버 주소와 스트림키를 송출 프로그램에 한 번만 입력하면, 이후엔 프로그램에서 방송을 시작할 때 자동으로 라이브가 됩니다.">
            {/* 프로그램 선택 */}
            <div className="flex items-center gap-1.5 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
              {PROGRAMS.map((p) => (
                <button key={p.id} onClick={() => setProgram(p.id)} className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${program === p.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>{p.name}</button>
              ))}
            </div>

            <div className="space-y-3">
              <KV label="서버 주소" hint="고정값">
                <Mono>{SERVER_URL}</Mono>
                <Act onClick={() => copy('server', SERVER_URL)} icon={copied === 'server' ? Check : Copy} active={copied === 'server'}>{copied === 'server' ? '복사됨' : '복사'}</Act>
              </KV>
              <KV label="스트림키" hint={revealed ? `${revealLeft}초 후 자동 숨김` : '기본 숨김'}>
                <Mono>{revealed ? streamKey : '•'.repeat(28)}</Mono>
                <Act onClick={() => setRevealed(!revealed)} icon={revealed ? EyeOff : Eye}>{revealed ? '숨기기' : '표시'}</Act>
                <Act onClick={() => copy('key', streamKey)} icon={copied === 'key' ? Check : Copy} active={copied === 'key'} title="키를 화면에 노출하지 않고 복사합니다">{copied === 'key' ? '복사됨' : '복사'}</Act>
                <Act onClick={() => setReissueOpen(true)} icon={RefreshCw} disabled={!canReissue} title={canReissue ? '기존 키는 즉시 무효화됩니다' : '방송 중(준비 · 일시중단 포함)에는 재발급할 수 없어요'}>재발급</Act>
              </KV>
            </div>

            {!canReissue && (
              <p className="mt-3 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400"><AlertTriangle size={13} className="mt-0.5 shrink-0" /> 진행 중인 방송이 끊기기 때문에 방송 중에는 스트림키를 재발급할 수 없습니다. 종료 후 다시 시도해 주세요.</p>
            )}

            {/* 유출 경고 */}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
              <ShieldAlert size={15} className="text-rose-500 mt-px shrink-0" />
              <span><b className="text-slate-800 dark:text-slate-100">가장 흔한 유출 경로는 방송 중 설정창 노출입니다.</b> 송출 프로그램 설정 화면이 방송에 그대로 나가면 키가 유출돼요. 노출됐다면 방송 종료 후 즉시 재발급하세요. 같은 키로 두 곳에서 동시에 송출하면 나중 연결은 거부됩니다.</span>
            </div>

            {/* 권장 인코딩 설정 (#19) — 읽기 전용 2열 표 + 필드별 복사. OBS 프로필(#12)의 선행 단계 */}
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"><Gauge size={15} className="text-blue-500" /> 권장 인코딩 설정</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">아래 값을 송출 프로그램 출력 설정에 그대로 넣으면 됩니다. 값을 옮겨 적기 번거로우면 프로필 파일로 한 번에 적용하세요.</div>
                </div>
                <button onClick={downloadObsProfile} className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-bold text-white bg-blue-500 hover:bg-blue-600">
                  <Upload size={14} className="rotate-180" /> OBS 프로필 다운로드
                </button>
              </div>
              <table className="w-full text-[13px]">
                <tbody>
                  {ENCODING.map((row) => (
                    <tr key={row.k} className="border-t border-slate-100 dark:border-slate-800">
                      <th className="w-32 text-left px-4 py-2 font-semibold text-slate-600 dark:text-slate-300">{row.k}</th>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-slate-800 dark:text-slate-100">{row.v}</code>
                          {row.note && <span className="text-[11px] text-slate-400">{row.note}</span>}
                        </div>
                      </td>
                      <td className="w-20 pr-3 py-1.5 text-right">
                        <button onClick={() => copy(`enc-${row.k}`, row.v)} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold ${copied === `enc-${row.k}` ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                          {copied === `enc-${row.k}` ? <><Check size={11} /> 복사됨</> : <><Copy size={11} /> 복사</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5">
                <Info size={12} className="mt-px shrink-0" /> 프로필 파일에는 스트림키가 포함됩니다. OBS에서 프로필 → 가져오기로 불러온 뒤 파일은 삭제하세요. 비트레이트 상한은 정책 확정 후 바뀔 수 있어요.
              </p>
            </div>

            {/* 인라인 가이드 */}
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button onClick={() => setGuideOpen(!guideOpen)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="flex items-center gap-2"><Info size={15} className="text-blue-500" /> {PROGRAMS.find((p) => p.id === program)!.name} 설정 가이드</span>
                {guideOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {guideOpen && (
                <ol className="px-4 py-3 space-y-2.5">
                  {PROGRAMS.find((p) => p.id === program)!.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-px">{i + 1}</span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="w-6 shrink-0" /><span>연결이 되면 위 상태 카드가 <b>신호 수신 → LIVE</b>로 바뀝니다. 바뀌지 않으면 서버 주소·스트림키를 다시 확인해 주세요. <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 dark:text-blue-400 font-semibold inline-flex items-center gap-0.5 hover:underline">전체 가이드 <ExternalLink size={11} /></a></span>
                  </li>
                </ol>
              )}
            </div>
          </Card>

          {/* ── 2. 방송 정보 ── */}
          <Card ref={secRefs.info} step="2" title="방송 정보" desc="라이브 목록과 채널 페이지에 표시됩니다. 방송 중에도 바꿀 수 있고, 저장하면 즉시 반영돼요." badge={isOnAir ? '방송 중 변경 가능' : undefined}>
            <div className="space-y-5">
              <Field label="제목" right={<span className={`text-xs tabular-nums ${form.title.length > MAX_TITLE ? 'text-red-500' : 'text-slate-400'}`}>{form.title.length}/{MAX_TITLE}</span>}>
                <input value={form.title} onChange={(e) => set('title', e.target.value.slice(0, MAX_TITLE))} placeholder={`미입력 시 채널명(${CHANNEL_NAME})으로 표시됩니다`} className={inputCls} />
              </Field>
              <Field label="카테고리" right={<span className="text-xs text-slate-400">하나만 선택</span>}>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => set('category', c)} className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${form.category === c ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{c}</button>
                  ))}
                </div>
              </Field>
              <Field label="태그" right={<span className="text-xs text-slate-400 tabular-nums">{form.tags.length}/{MAX_TAGS}</span>}>
                <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-blue-500">
                  {form.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">#{t}<button onClick={() => set('tags', form.tags.filter((x) => x !== t))} className="hover:text-red-500 rounded-full"><X size={12} /></button></span>
                  ))}
                  {form.tags.length < MAX_TAGS && (
                    <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }} onBlur={addTag} placeholder={form.tags.length ? '태그 추가' : '태그 입력 후 Enter'} className="flex-1 min-w-[120px] bg-transparent text-sm px-1 py-1 outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
                  )}
                </div>
              </Field>
              <Field label="썸네일">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => fileRef.current?.click()} className={`relative w-full sm:w-56 aspect-video rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors ${form.thumb ? 'border-transparent' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'}`}>
                    {form.thumb ? <img src={form.thumb} alt="" className="w-full h-full object-cover" /> : <div className="text-center"><Upload size={20} className="mx-auto mb-1" /><div className="text-xs font-semibold">이미지 업로드</div></div>}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onThumb(e.target.files?.[0])} />
                  <div className="text-xs text-slate-500 space-y-1.5 self-center">
                    <p className="flex items-center gap-1.5"><ImageIcon size={13} /> 권장 1280×720 (16:9) · JPG/PNG</p>
                    <p className="flex items-center gap-1.5"><Monitor size={13} /> 미설정 시 방송 화면을 자동 캡처해 사용합니다</p>
                    {form.thumb && <button onClick={() => set('thumb', null)} className="text-red-500 font-semibold hover:underline">자동 캡처로 되돌리기</button>}
                  </div>
                </div>
              </Field>
            </div>
          </Card>

          {/* ── 3. 채팅 · 옵션 ── */}
          <Card ref={secRefs.options} step="3" title="채팅 · 시청 옵션" desc="채팅 운영 방식과 시청 조건을 정합니다.">
            <div className="space-y-5">
              <Field label="채팅 참여">
                <Segmented value={form.chat} onChange={(v) => set('chat', v as Form['chat'])} options={[['all', '전체'], ['follower', '팔로워만'], ['off', '사용 안 함']]} />
              </Field>
              <Field label="슬로우 모드" right={<span className="text-xs text-slate-400">연속 채팅 간격</span>}>
                <div className={`flex flex-wrap gap-1.5 ${form.chat === 'off' ? 'opacity-40 pointer-events-none' : ''}`}>
                  {SLOW_MODES.map((s) => (
                    <button key={s} onClick={() => set('slow', s)} className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${form.slow === s ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{s === 0 ? '사용 안 함' : `${s}초`}</button>
                  ))}
                </div>
              </Field>
              <Field label="연령 제한" right={<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600">정책 확정 전</span>}>
                <Segmented value={form.age} onChange={(v) => set('age', v as Form['age'])} options={[['all', '전체 이용가'], ['restricted', '연령 제한']]} />
              </Field>
              {/* 방송숨김 (#11 · SOOP F-053) — 리허설을 별도 모드가 아니라 방송 속성 한 줄로. 트레이드오프는 상시 문장으로(#3) */}
              <Field label="테스트 송출" right={form.hidden ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 dark:bg-white text-white dark:text-slate-900">숨김 중</span> : undefined}>
                <label className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${form.hidden ? 'border-slate-800 dark:border-white bg-slate-50 dark:bg-slate-800/60' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                  <input type="checkbox" checked={form.hidden} onChange={(e) => set('hidden', e.target.checked)} className="mt-0.5 w-4 h-4 accent-slate-800 dark:accent-white" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">방송숨김</span>
                    <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">테스트 방송 시 사용하는 기능입니다. 시청자가 보는 라이브 목록에 노출되지 않으며 즐겨찾기 알림을 보내지 않습니다. 채널 주소로 직접 들어온 사람은 볼 수 있어요.</span>
                    {form.hidden && <span className="block text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-semibold">저장 후 다음 방송을 시작하면 적용됩니다. 진행 중인 방송에는 영향이 없어요.</span>}
                  </span>
                </label>
              </Field>
              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                <Wifi size={15} className="text-emerald-500 mt-px shrink-0" />
                <span><b className="text-slate-800 dark:text-slate-100">고화질 시청 안내</b> — 시청자가 720p 이상으로 보려면 그리드(P2P 분산 전송) 설치가 필요합니다. 크리에이터가 설정하는 값은 아니며, 시청 화면에서 자동으로 안내됩니다.</span>
              </div>
            </div>
          </Card>

          {/* ── 4. 송출 상태 ── */}
          <Card ref={secRefs.status} step="4" title="송출 상태" desc="서버가 실제로 수신한 값입니다. 송출 프로그램이 보여주는 수치와 다를 수 있어요.">
            {/* 연결 상태 판정 (#13) — 수치는 그대로 두고 판정을 함께 준다 */}
            <div className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${QUALITY_META[quality].cls}`}>
              <Wifi size={16} className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-bold">연결 상태 · {QUALITY_META[quality].label}</div>
                <div className="text-xs opacity-90 mt-0.5">{QUALITY_META[quality].desc}</div>
                {quality === 'bad' && state === 'live' && (
                  <ul className="mt-2 text-xs space-y-1 list-disc pl-4 opacity-90">
                    <li>송출 프로그램의 비트레이트를 <b>권장값(6,000 kbps) 이하로 낮추거나</b>, 네트워크 상태를 확인하세요.</li>
                    <li>유선 연결로 바꾸거나 같은 회선의 다른 업로드(클라우드 동기화 등)를 멈춰 보세요.</li>
                  </ul>
                )}
              </div>
            </div>
            {/* '아직 집계 전'은 — · '집계했더니 0'은 0 (#18) — 오프라인은 측정값 자체가 없으므로 — */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Tile icon={Radio} label="상태" value={STATE_META[state].label} tone={STATE_META[state].tone} hint={STATUS_DEFS['상태']} />
              <Tile icon={Activity} label="비트레이트" value={isOnAir ? `${curBitrate.toLocaleString()} kbps` : '—'} hint={STATUS_DEFS['비트레이트']}
                sub={state === 'live' ? (quality === 'good' ? '권장 범위' : quality === 'fair' ? '권장보다 낮음' : '불안정') : undefined}
                subTone={quality === 'good' ? 'emerald' : quality === 'fair' ? 'amber' : 'red'} />
              <Tile icon={Monitor} label="해상도 · fps" value={isOnAir ? '1920×1080 · 60' : '—'} hint={STATUS_DEFS['해상도 · fps']} />
              <Tile icon={Gauge} label="수신 지연" value={state === 'live' ? `${delaySec.toFixed(1)}초` : '—'} hint={STATUS_DEFS['수신 지연']}
                sub={state === 'live' ? (delaySec < 2.5 ? '권장 범위' : delaySec < 4 ? '다소 높음' : '높음') : undefined}
                subTone={delaySec < 2.5 ? 'emerald' : delaySec < 4 ? 'amber' : 'red'} />
              <Tile icon={Users} label="시청자" value={isOnAir ? `${viewers.toLocaleString()}명` : '—'} hint={STATUS_DEFS['시청자']} />
              <Tile icon={Clock} label="방송 시간" value={isOnAir ? fmtTime(elapsed) : '—'} hint={STATUS_DEFS['방송 시간']} />
            </div>
            {/* 비트레이트 히스토리 */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5"><span>최근 비트레이트 (kbps · 36초)</span><span className="tabular-nums">{isOnAir ? `${curBitrate.toLocaleString()}` : '—'}</span></div>
              <div className="h-14 flex items-end gap-[3px] px-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 py-1.5">
                {hist.map((v, i) => (
                  <div key={i} className={`flex-1 rounded-sm transition-all ${v === 0 ? 'bg-slate-300 dark:bg-slate-600' : v < 4000 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ height: `${Math.max(4, (v / 7000) * 100)}%` }} />
                ))}
              </div>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500"><Info size={13} className="mt-px shrink-0" /> 드랍 프레임 · CPU 부하는 송출 프로그램(OBS 등) 측 지표라 여기서는 수집되지 않습니다. 해당 값은 프로그램의 통계 창에서 확인하세요.</p>
          </Card>

          {/* 저장 바 (더티일 때만) */}
          {dirtyCount > 0 && (
            <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3.5 shadow-2xl">
              <div className="flex items-center gap-2 text-sm"><CircleDot size={15} className="text-amber-400" /> 저장하지 않은 변경 <b>{dirtyCount}</b>개{isOnAir && <span className="opacity-60">· 저장 시 방송에 즉시 반영</span>}</div>
              <div className="flex items-center gap-2">
                <button onClick={revert} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 dark:hover:bg-slate-900/10"><RotateCcw size={14} /> 되돌리기</button>
                <button onClick={save} className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white"><Save size={14} /> 저장</button>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ 우측: 실시간 채팅 + 시청자 시점 미리보기 ═══════════ */}
        <aside className="flex flex-col gap-4 min-h-0 xl:sticky xl:top-14 xl:h-[calc(100vh-10.5rem)]">
          {/* 미리보기 — 방송 중엔 접혀서 채팅에 공간을 준다 */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a20] shadow-sm overflow-hidden shrink-0">
            <button onClick={() => setPreviewOpen(!previewOpen)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">시청자에게 보이는 모습</span>
              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400">{!previewOpen && <span className="truncate max-w-[140px] text-slate-500 font-medium">{displayTitle}</span>}{previewOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
            </button>
            {previewOpen && (
              <div className="px-4 pb-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-800">
                  {form.thumb ? <img src={form.thumb} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60"><Monitor size={22} /><span className="text-[10px] mt-1">자동 캡처</span></div>}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    {isOnAir ? (
                      <>
                        <span className={`flex items-center gap-1 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ${state === 'suspended' ? 'bg-amber-500' : state === 'preparing' ? 'bg-slate-600' : 'bg-red-600'}`}><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {state === 'suspended' ? '일시중단' : state === 'preparing' ? '준비 중' : 'LIVE'}</span>
                        {viewers > 0 && <span className="flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums"><Users size={10} /> {viewers.toLocaleString()}</span>}
                      </>
                    ) : <span className="bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">오프라인</span>}
                  </div>
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">TOON</span>
                  {/* 방송숨김이면 미리보기 자체가 "목록에 없다"는 걸 보여준다 */}
                  {form.hidden && (
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/85 text-white text-[10.5px] px-2.5 py-1.5 flex items-center gap-1.5">
                      <EyeOff size={11} /> 라이브 목록 미노출 · 즐겨찾기 알림 없음 (테스트 송출)
                    </div>
                  )}
                  <span className={`absolute left-2 bg-black/50 text-white/90 text-[10px] px-1.5 py-0.5 rounded ${form.hidden ? 'bottom-9' : 'bottom-2'}`}>{form.category}</span>
                  {form.age === 'restricted' && <span className={`absolute right-2 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ${form.hidden ? 'bottom-9' : 'bottom-2'}`}>19</span>}
                </div>
                <div className="flex items-start gap-2.5 mt-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white shrink-0 flex items-center justify-center text-xs font-bold">YM</div>
                  <div className="min-w-0">
                    <div className={`text-[13.5px] font-bold leading-snug line-clamp-2 ${form.title.trim() ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic'}`}>{displayTitle}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{CHANNEL_NAME} · {form.tags.length ? form.tags.map((t) => `#${t}`).join(' ') : '태그 없음'}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                  <Row2 k="채팅" v={form.chat === 'all' ? '전체' : form.chat === 'follower' ? '팔로워만' : '사용 안 함'} />
                  <Row2 k="슬로우 모드" v={form.chat === 'off' ? '—' : form.slow === 0 ? '사용 안 함' : `${form.slow}초`} />
                  <Row2 k="저장 상태" v={dirtyCount ? `변경 ${dirtyCount}개 미저장` : '모두 저장됨'} tone={dirtyCount ? 'amber' : 'emerald'} />
                </div>
              </div>
            )}
          </div>

          {/* 실시간 채팅 — 크리에이터가 방송 중 채팅을 확인 · 관리. 새 창으로 분리 가능 */}
          <div className="flex-1 min-h-[420px] xl:min-h-0 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {poppedOut ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center bg-slate-50 dark:bg-slate-800/40">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-blue-500"><ExternalLink size={22} /></div>
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">채팅이 별도 창에서 열려 있어요</div>
                  <div className="text-xs text-slate-500 mt-1">두 창은 실시간으로 동기화됩니다. 팝업을 닫으면 여기로 돌아옵니다.</div>
                  <div className="text-xs text-slate-400 mt-1.5 tabular-nums">분리 중에도 수신 중 · 메시지 {chat.totalCount}개{chat.held.length ? ` · 보류 ${chat.held.length}건` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => popupRef.current?.focus()} className="px-3.5 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50">채팅 창으로 이동</button>
                  <button onClick={restoreChat} className="px-3.5 py-2 rounded-lg text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white">여기로 다시 가져오기</button>
                </div>
              </div>
            ) : (
              <CreatorChat chat={chat} status={state} viewers={viewers} onPopout={popoutChat} onOpenBroadcastSettings={() => jump('info')} />
            )}
          </div>
        </aside>
      </div>

      {/* 토스트 */}
      {toastMsg && <div className="fixed bottom-28 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-full shadow-xl">{toastMsg}</div>}

      {/* 재발급 확인 */}
      {reissueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setReissueOpen(false)}>
          <div className="bg-white dark:bg-[#181a20] rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500"><AlertTriangle size={20} /></div><h3 className="text-lg font-bold text-slate-900 dark:text-white">스트림키를 재발급할까요?</h3></div>
            {/* 파괴적 액션 앞에 복구 경로 먼저 (#15 · YouTube 패턴) — 첫 문장은 경고가 아니라 "그래도 방송할 수 있다" */}
            <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed"><b>새 스트림키는 바로 발급되며</b>, 송출 프로그램에 다시 입력하면 그대로 방송할 수 있습니다.</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">대신 <b>기존 키는 즉시 무효화</b>됩니다. 이미 내려받은 OBS 프로필이 있다면 새 키로 다시 내려받아 주세요.</p>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setReissueOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">취소</button>
              <button onClick={reissue} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600">재발급</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════ 상태 히어로 ═══════════ */
const STATE_META: Record<StreamState, { label: string; tone: 'slate' | 'amber' | 'red' | 'emerald' }> = {
  offline: { label: '오프라인', tone: 'slate' }, preparing: { label: '준비 중', tone: 'amber' }, live: { label: '라이브', tone: 'red' }, suspended: { label: '일시중단', tone: 'amber' },
};

function StatusHero({ state, elapsed, viewers, bitrate, reconnectLeft, quality, onOpenChannel, onGuide, onDiagnose, setState, netDemo, setNetDemo }: {
  state: StreamState; elapsed: string; viewers: number; bitrate: number; reconnectLeft: number; quality: Quality;
  onOpenChannel: () => void; onGuide: () => void; onDiagnose: () => void; setState: (s: StreamState) => void;
  netDemo: 'good' | 'fair' | 'bad'; setNetDemo: (q: 'good' | 'fair' | 'bad') => void;
}) {
  const cfg = {
    offline: { ring: 'from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-800/40', dot: 'bg-slate-400', title: '송출 신호 대기 중', sub: '송출 프로그램에서 방송을 시작하면 자동으로 라이브가 됩니다. 별도의 시작 버튼은 없어요.' },
    preparing: { ring: 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10', dot: 'bg-amber-500 animate-pulse', title: '신호 수신 · 준비 중', sub: '첫 영상이 만들어지는 중입니다. 잠시 후 라이브 목록에 노출돼요.' },
    live: { ring: 'from-red-100 to-rose-50 dark:from-red-900/30 dark:to-red-900/10', dot: 'bg-red-500 animate-pulse', title: 'LIVE', sub: '정상 송출 중입니다. 방송 정보는 방송 중에도 변경할 수 있어요.' },
    suspended: { ring: 'from-amber-100 to-orange-50 dark:from-amber-900/30 dark:to-amber-900/10', dot: 'bg-amber-500 animate-pulse', title: '연결 끊김 · 재접속 대기', sub: '90초 안에 다시 연결되면 같은 방송으로 이어집니다. 시청자 화면은 유지되고 채팅도 계속돼요.' },
  }[state];
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br ${cfg.ring} p-5 lg:p-6`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center shrink-0">
            <Radio size={24} className={state === 'live' ? 'text-red-500' : state === 'offline' ? 'text-slate-400' : 'text-amber-500'} />
            <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${cfg.dot}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{cfg.title}</h2>
              {state !== 'offline' && <span className="font-mono text-sm lg:text-base font-bold text-slate-700 dark:text-slate-200 tabular-nums">{elapsed}</span>}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{cfg.sub}</p>
            {state === 'suspended' && (
              <div className="mt-3 max-w-sm"><div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden"><div className="h-full bg-amber-500 transition-all" style={{ width: `${(reconnectLeft / 90) * 100}%` }} /></div><div className="text-xs text-amber-700 dark:text-amber-300 mt-1 tabular-nums font-semibold">재접속 대기 {reconnectLeft}초 · 초과 시 방송이 종료됩니다</div></div>
            )}
            {state === 'live' && (
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200"><Users size={14} /> <b className="tabular-nums">{viewers.toLocaleString()}</b>명 시청</span>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200"><Activity size={14} /> <b className="tabular-nums">{bitrate.toLocaleString()}</b> kbps</span>
                {/* 연결 상태 칩 (#13) — 문제가 있으면 눌러서 송출 상태로 이동 (#14 · 상태 배지 → 진단 딥링크) */}
                <button onClick={onDiagnose} title={`${QUALITY_META[quality].desc} 송출 상태로 이동합니다.`}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-bold transition-colors hover:brightness-95 ${QUALITY_META[quality].cls}`}>
                  {quality === 'good' ? <Check size={13} /> : <AlertTriangle size={13} />} 연결 {QUALITY_META[quality].label}
                  {quality !== 'good' && <span className="opacity-70 font-medium">· 진단 보기 →</span>}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {state === 'offline'
            ? <button onClick={onGuide} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25"><Link2 size={15} /> 송출 프로그램 연결하기</button>
            : <button onClick={onOpenChannel} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"><Tv size={15} /> 채널 페이지 열기 <ExternalLink size={13} className="text-slate-400" /></button>}
        </div>
      </div>
      {/* 데모 상태 전환 */}
      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-slate-500">
        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-bold">데모</span> 송출 상태:
        {(['offline', 'preparing', 'live', 'suspended'] as StreamState[]).map((s) => (
          <button key={s} onClick={() => setState(s)} className={`px-2 py-0.5 rounded transition-colors ${state === s ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}>{STATE_META[s].label}</button>
        ))}
        {state === 'live' && (
          <>
            <span className="mx-1 text-slate-300 dark:text-slate-600">|</span> 회선:
            {(['good', 'fair', 'bad'] as const).map((q) => (
              <button key={q} onClick={() => setNetDemo(q)} className={`px-2 py-0.5 rounded transition-colors ${netDemo === q ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}>{QUALITY_META[q].label}</button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════ 빌딩 블록 ═══════════ */
const inputCls = 'w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500';

const Card = React.forwardRef<HTMLDivElement, { step: string; title: string; desc: string; badge?: string; children: React.ReactNode }>(({ step, title, desc, badge, children }, ref) => (
  <section ref={ref} className="scroll-mt-16 bg-white dark:bg-[#181a20] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 lg:p-6">
    <div className="flex items-start gap-3 mb-5">
      <span className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{step}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap"><h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white">{title}</h3>{badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">{badge}</span>}</div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
    {children}
  </section>
));
Card.displayName = 'Card';

function KV({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <div className="sm:w-28 shrink-0"><div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</div>{hint && <div className="text-[11px] text-slate-400">{hint}</div>}</div>
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">{children}</div>
    </div>
  );
}
function Mono({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-800 dark:text-slate-100 truncate tracking-wide">{children}</div>;
}
function Act({ icon: Icon, children, onClick, active, disabled, title }: { icon: any; children: React.ReactNode; onClick?: () => void; active?: boolean; disabled?: boolean; title?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold whitespace-nowrap transition-colors ${active ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800`}>
      <Icon size={14} /> {children}
    </button>
  );
}
function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return <div><div className="flex items-center justify-between mb-2"><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</label>{right}</div>{children}</div>;
}
function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
      {options.map(([v, l]) => <button key={v} onClick={() => onChange(v)} className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${value === v ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>{l}</button>)}
    </div>
  );
}
function Tile({ icon: Icon, label, value, sub, tone, hint, subTone = 'emerald' }: { icon: any; label: string; value: string; sub?: string; tone?: 'slate' | 'amber' | 'red' | 'emerald'; hint?: string; subTone?: 'emerald' | 'amber' | 'red' }) {
  const toneCls = tone === 'red' ? 'text-red-500' : tone === 'amber' ? 'text-amber-500' : tone === 'emerald' ? 'text-emerald-500' : tone === 'slate' ? 'text-slate-400' : 'text-slate-900 dark:text-white';
  const subCls = { emerald: 'text-emerald-600 dark:text-emerald-400', amber: 'text-amber-600 dark:text-amber-400', red: 'text-red-600 dark:text-red-400' }[subTone];
  return (
    <div className="group relative bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
        <Icon size={13} /> {label}
        {/* 지표 ⓘ 1줄 정의 (#17) — 집계 기준까지 밝힌다 */}
        {hint && <span title={hint} className="ml-auto cursor-help text-slate-300 dark:text-slate-600 group-hover:text-slate-500"><Info size={12} /></span>}
      </div>
      <div className={`text-base font-bold tabular-nums ${toneCls}`}>{value}</div>
      {sub && <div className={`text-[11px] mt-0.5 ${subCls}`}>{sub}</div>}
      {hint && <div className="absolute left-2 right-2 top-full z-20 mt-1 hidden group-hover:block bg-slate-900 text-white text-[11px] leading-relaxed rounded-lg px-2.5 py-2 shadow-xl">{hint}</div>}
    </div>
  );
}
function Row2({ k, v, tone }: { k: string; v: string; tone?: 'amber' | 'emerald' }) {
  return <div className="flex items-center justify-between"><span className="text-slate-500">{k}</span><span className={`font-semibold ${tone === 'amber' ? 'text-amber-600' : tone === 'emerald' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'}`}>{v}</span></div>;
}
