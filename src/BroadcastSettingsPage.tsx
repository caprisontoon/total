import React, { useState } from 'react';
import {
  Copy, Check, Eye, EyeOff, RefreshCw, Info, ExternalLink, Upload, Plus, X,
  Radio, Activity, Wifi, Monitor, Clock, Users, AlertTriangle,
} from 'lucide-react';

// 방송 설정 — 1단계 웹 스트리밍 서비스 "⑥ 방송 설정 화면 기획서" 기반.
// ① 송출 정보 · ② 방송 정보 · ③ 방송 옵션 · ④ 송출 상태 4개 섹션으로 구성.

const SERVER_URL = 'rtmp://live.toonation.com/app';
const STREAM_KEY = 'live_a1b2c3d4e5f6g7h8i9j0k1l2';

const CATEGORIES = ['선택', '게임', '토크', '음악', '먹방', '아트', '스포츠', '교육', '기타'];
const SLOW_MODES = ['사용 안 함', '3초 간격', '5초 간격', '10초 간격', '30초 간격'];

export default function BroadcastSettingsPage() {
  // 송출 상태 (데모: 방송 중 토글로 재발급 차단 동작 확인)
  const [isLive, setIsLive] = useState(true);
  // ① 송출 정보
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<'server' | 'key' | null>(null);
  const [reissueOpen, setReissueOpen] = useState(false);
  // ② 방송 정보
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('선택');
  const [tags, setTags] = useState<string[]>(['게임', '신작']);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(false);
  // ③ 방송 옵션
  const [age, setAge] = useState<'all' | 'restricted'>('all');
  const [chat, setChat] = useState<'all' | 'follower' | 'off'>('all');
  const [slow, setSlow] = useState(SLOW_MODES[0]);

  const copy = (what: 'server' | 'key', text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 1500); };

  const masked = '●'.repeat(24);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ① 송출 정보 */}
      <Card
        title="① 송출 정보"
        subtitle="송출 프로그램(OBS · 스트림랩스 등)에 입력하는 서버 주소와 스트림키입니다."
        right={
          <button
            onClick={() => setIsLive(!isLive)}
            title="데모: 클릭하여 방송 중 / 오프라인 전환"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${isLive ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
            {isLive ? '방송 중' : '오프라인'}
          </button>
        }
      >
        <Row label="서버 주소">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-700 dark:text-slate-200 truncate">{SERVER_URL}</div>
            <ActionBtn onClick={() => copy('server', SERVER_URL)} icon={copied === 'server' ? Check : Copy} active={copied === 'server'}>
              {copied === 'server' ? '복사됨' : '복사'}
            </ActionBtn>
          </div>
        </Row>

        <Row label="스트림키">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-700 dark:text-slate-200 truncate tracking-wider">
              {showKey ? STREAM_KEY : masked}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ActionBtn onClick={() => setShowKey(!showKey)} icon={showKey ? EyeOff : Eye}>{showKey ? '숨기기' : '표시'}</ActionBtn>
              <ActionBtn onClick={() => copy('key', STREAM_KEY)} icon={copied === 'key' ? Check : Copy} active={copied === 'key'}>
                {copied === 'key' ? '복사됨' : '복사'}
              </ActionBtn>
              <ActionBtn onClick={() => setReissueOpen(true)} icon={RefreshCw} disabled={isLive} title={isLive ? '방송 중에는 재발급할 수 없습니다' : undefined}>
                재발급
              </ActionBtn>
            </div>
          </div>
          {isLive && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle size={13} /> 방송 중에는 스트림키를 재발급할 수 없습니다. 진행 중인 방송이 끊기므로 종료 후 재발급해 주세요.
            </p>
          )}
        </Row>

        <Notice>
          <span>스트림키를 송출 프로그램(OBS 등)에 입력하세요. 스트림키는 타인에게 노출되지 않도록 주의해 주세요.</span>
          <a className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline shrink-0" href="#" onClick={(e) => e.preventDefault()}>
            설정 가이드 <ExternalLink size={12} />
          </a>
        </Notice>
      </Card>

      {/* ② 방송 정보 */}
      <Card title="② 방송 정보" subtitle="라이브 목록과 채널 페이지에 표시되는 정보입니다. 방송 중에도 변경할 수 있습니다.">
        <Row label="제목">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="방송 제목을 입력하세요 (미입력 시 채널명 사용)"
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Row>
        <Row label="카테고리">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Row>
        <Row label="태그">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="태그 입력"
                className="w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={addTag} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <Plus size={14} /> 태그 추가
              </button>
            </div>
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                #{t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-red-500"><X size={12} /></button>
              </span>
            ))}
          </div>
        </Row>
        <Row label="썸네일">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-40 aspect-video rounded-lg bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400">
              <Monitor size={22} />
            </div>
            <div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                <Upload size={15} /> 이미지 업로드
              </button>
              <p className="mt-1.5 text-xs text-slate-500">미설정 시 방송 화면을 자동 캡처해 사용합니다.</p>
            </div>
          </div>
        </Row>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><Info size={13} /> 방송 중에도 변경할 수 있습니다. 저장한 값은 다음 방송에도 유지됩니다.</span>
          <button onClick={save} className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-colors ${saved ? 'bg-emerald-500' : 'bg-blue-500 hover:bg-blue-600'}`}>
            {saved ? '저장됨' : '저장'}
          </button>
        </div>
      </Card>

      {/* ③ 방송 옵션 */}
      <Card title="③ 방송 옵션" subtitle="연령 제한과 채팅 운영 방식을 설정합니다.">
        <Row label="연령 제한">
          <div className="flex flex-wrap gap-4">
            <RadioOpt checked={age === 'all'} onChange={() => setAge('all')} label="전체 이용가" />
            <RadioOpt checked={age === 'restricted'} onChange={() => setAge('restricted')} label="연령 제한" />
          </div>
        </Row>
        <Row label="채팅">
          <div className="flex flex-wrap gap-4">
            <RadioOpt checked={chat === 'all'} onChange={() => setChat('all')} label="전체" />
            <RadioOpt checked={chat === 'follower'} onChange={() => setChat('follower')} label="팔로워만" />
            <RadioOpt checked={chat === 'off'} onChange={() => setChat('off')} label="사용 안 함" />
          </div>
        </Row>
        <Row label="슬로우 모드">
          <select
            value={slow}
            onChange={(e) => setSlow(e.target.value)}
            disabled={chat === 'off'}
            className="w-full sm:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {SLOW_MODES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Row>
        <Row label="고화질 시청">
          <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
            <Wifi size={16} className="mt-0.5 text-emerald-500 shrink-0" />
            <span>시청자가 고화질로 보려면 그리드(P2P 분산 전송) 모듈 설치가 필요합니다. 크리에이터가 설정하는 값이 아닌 안내 사항입니다.</span>
          </div>
        </Row>
      </Card>

      {/* ④ 송출 상태 */}
      <Card title="④ 송출 상태" subtitle="서버에서 수집한 실시간 송출 진단 정보입니다.">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatTile icon={Radio} label="상태" value={isLive ? '정상' : '오프라인'} valueClass={isLive ? 'text-emerald-500' : 'text-slate-400'} dot={isLive ? 'bg-emerald-500' : 'bg-slate-400'} />
          <StatTile icon={Activity} label="비트레이트" value={isLive ? '6,000 kbps' : '—'} />
          <StatTile icon={Monitor} label="해상도" value={isLive ? '1920×1080 / 60fps' : '—'} />
          <StatTile icon={Wifi} label="수신 지연" value={isLive ? '2.1초' : '—'} />
          <StatTile icon={Users} label="시청자" value={isLive ? '1,204명' : '—'} />
          <StatTile icon={Clock} label="방송 시간" value={isLive ? '01:24:07' : '—'} />
        </div>
        <Notice className="mt-4">
          <span>송출 프로그램 측 지표(드랍 프레임 · CPU 부하)는 수집되지 않습니다. OBS 등에서 확인하는 수치와 다를 수 있습니다.</span>
        </Notice>
      </Card>

      {/* 재발급 확인 모달 */}
      {reissueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setReissueOpen(false)}>
          <div className="bg-white dark:bg-[#181a20] rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500"><AlertTriangle size={20} /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">스트림키를 재발급할까요?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              재발급하면 <b>기존 키가 즉시 무효화</b>됩니다. 송출 프로그램에 새 스트림키를 다시 입력해야 합니다.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setReissueOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">취소</button>
              <button onClick={() => { setReissueOpen(false); setShowKey(false); }} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600">재발급</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- building blocks (dashboard style) ---------------- */
function Card({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#181a20] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        {right}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-4 border-b border-slate-100 dark:border-slate-800 last:border-0 gap-2 sm:gap-0">
      <div className="w-full sm:w-40 sm:pt-2 text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">{label}</div>
      <div className="flex-1 w-full min-w-0">{children}</div>
    </div>
  );
}

function ActionBtn({ icon: Icon, children, onClick, active, disabled, title }: { icon: any; children: React.ReactNode; onClick?: () => void; active?: boolean; disabled?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
      } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800`}
    >
      <Icon size={14} /> {children}
    </button>
  );
}

function Notice({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg px-4 py-3 text-xs text-slate-600 dark:text-slate-300 ${className}`}>
      <div className="flex items-start gap-1.5"><Info size={14} className="mt-px text-blue-500 shrink-0" />{children}</div>
    </div>
  );
}

function RadioOpt({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  // relative: sr-only(absolute) input을 라벨 안에 가둬 문서 높이를 늘리지 않도록 함
  return (
    <label className="relative flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? 'border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
        {checked && <span className="w-2 h-2 rounded-full bg-blue-500" />}
      </span>
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function StatTile({ icon: Icon, label, value, valueClass = 'text-slate-900 dark:text-white', dot }: { icon: any; label: string; value: string; valueClass?: string; dot?: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Icon size={13} /> {label}</div>
      <div className={`flex items-center gap-2 text-base font-bold tabular-nums ${valueClass}`}>
        {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
        {value}
      </div>
    </div>
  );
}
