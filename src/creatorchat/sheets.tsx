import React, { useMemo, useState } from 'react';
import { Users, Sparkles, Coins, ShieldAlert, ScrollText, MessagesSquare, Gavel, Megaphone, BookOpen, Settings, Eraser, ExternalLink, Vote, HelpCircle, Pin, Download, Check, X, Info } from 'lucide-react';
import type { CreatorChat } from './store';
import type { Sheet as SheetKind, SanctionKind, Policy } from './types';
import { Sheet, Row, ToggleRow, RadioList, Btn, Counter, SectionHead, RoleBadge, Chip } from './parts';
import {
  userOf, USERS, ROLE_LABEL, ME, TIMEOUT_OPTIONS, SLOW_OPTIONS, FOLLOWER_MIN_OPTIONS, ACCOUNT_AGE_OPTIONS,
  NOTICE_MAX, RULES_MAX, BANNED_MAX, REPLACEMENT_MAX, REVIEW_CATEGORIES,
} from './data';

export type SheetProps = { chat: CreatorChat; go: (s: SheetKind) => void; back: () => void; /** 행동이 끝났으면 시트를 전부 닫는다 */ close: () => void; toast: (m: string) => void; inline: boolean; onPopout?: () => void };

const fmtT = (ts: number) => new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
const fmtDT = (ts: number) => new Date(ts).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
const slowLabel = (s: number) => (s === 0 ? '끔' : s >= 60 ? `${s / 60}분` : `${s}초`);
const partLabel = (p: Policy) => (p.participation === 'all' ? '전체' : p.participation === 'sub' ? '구독자만' : `팔로워 · ${FOLLOWER_MIN_OPTIONS.find((o) => o.min === p.followerMinMin)?.label ?? `${p.followerMinMin}분`}`);
const ageLabel = (h: number) => ACCOUNT_AGE_OPTIONS.find((o) => o.hours === h)?.label ?? `${h}시간`;

/* ── ⋮ 메뉴 ── */
export function MenuSheet({ chat, go, back, close, toast, inline, onPopout }: SheetProps) {
  return (
    <Sheet title="채팅 메뉴" onBack={back}>
      <SectionHead>보기</SectionHead>
      <Row label="참가자" value={`${chat.participants.length}명`} onClick={() => go({ kind: 'participants' })} />
      <Row label="탑 팬" value={chat.policy.leaderboard ? '켬' : '끔'} onClick={() => go({ kind: 'topfans' })} />
      <Row label="선물 받은 내역" value={`${chat.gifts.length}건`} onClick={() => go({ kind: 'gifts' })} />
      <SectionHead>운영</SectionHead>
      <Row label="보류된 메시지" value={chat.held.length ? <Chip tone="amber">{chat.held.length}건 대기</Chip> : '없음'} onClick={() => go({ kind: 'held' })} hint="자동 검토가 붙잡아 둔 메시지. 시청자에게는 안 보이고, 승인하면 올라갑니다." />
      <Row label="채팅 관리" value="제재 · ID 입력" onClick={() => go({ kind: 'manage' })} />
      <Row label="운영 로그" value={`${chat.log.length}건`} onClick={() => go({ kind: 'log' })} />
      <Row label="매니저 채팅" value={chat.staff.length ? `${chat.staff.length}` : '백채널'} onClick={() => go({ kind: 'staff' })} />
      <SectionHead>시청자에게 보이는 텍스트</SectionHead>
      <Row label="스트리머 공지" value={chat.policy.notice.on ? '켬' : '끔'} onClick={() => go({ kind: 'notice' })} />
      <Row label="채팅 규칙" value={chat.policy.rules.on ? '켬 · 동의 필요' : '끔'} onClick={() => go({ kind: 'rules' })} />
      <SectionHead>기타</SectionHead>
      <Row label="채팅 설정" value="내 화면 · 표시" onClick={() => go({ kind: 'settings' })} />
      <Row label="채팅 초기화" value="화면 지움" onClick={() => { chat.clear(); toast('채팅을 초기화했습니다'); close(); }} danger />
      {inline && onPopout && <Row label="새 창에서 채팅 열기" value="" onClick={onPopout} external />}
    </Sheet>
  );
}

/* ── ＋ 시청자와 소통하기 (YT §3 · 입력줄 한 클릭) ── */
export function ToolsSheet({ chat, go, back, close, toast }: SheetProps) {
  return (
    <Sheet title="시청자와 소통하기" onBack={back} sub="방송 중 손이 있는 곳에서 바로 시작합니다">
      <Row label="투표 시작" value={chat.poll && !chat.poll.closed ? '진행 중' : '시청자의 의견을 받습니다'} onClick={() => go({ kind: 'pollEditor' })} />
      <Row label="Q&A" value={chat.qna.open ? `진행 중 · 질문 ${chat.qna.questions.filter((q) => !q.answered).length}` : '시청자 질문에 실시간으로 답합니다'} onClick={() => go({ kind: 'qna' })} />
      <Row label={chat.policy.notice.on ? '공지 끄기' : '공지 켜기'} value={chat.policy.notice.text ? `"${chat.policy.notice.text.slice(0, 18)}…"` : '내용 없음'}
        onClick={() => { if (!chat.policy.notice.text) { go({ kind: 'notice' }); return; } chat.setPolicy({ notice: { ...chat.policy.notice, on: !chat.policy.notice.on } }, { kind: '공지', detail: chat.policy.notice.on ? '끔' : '켬' }); toast(chat.policy.notice.on ? '공지를 내렸습니다' : '공지를 올렸습니다'); close(); }} />
      <Row label="고정 메시지" value={chat.pinned ? '고정 중 · 해제' : '메시지 위에서 📌'} onClick={() => { if (chat.pinned) { chat.pin(null); toast('고정을 해제했습니다'); } close(); }} />
    </Sheet>
  );
}

/* ── 채팅 설정 — 내 화면 / 시청자에게 보이는 설정을 섹션으로 분리 ── */
export function SettingsSheet({ chat, back }: SheetProps) {
  const v = chat.view;
  const sizes: (typeof v.fontPct)[] = [75, 100, 125, 150, 175, 200, 300];
  return (
    <Sheet title="채팅 설정" onBack={back}>
      <SectionHead note="바꾸면 바로 반영 · 내 화면에만 영향">내 화면</SectionHead>
      <div className="px-3.5 py-2">
        <div className="flex items-center justify-between text-[13px] font-medium text-slate-800 dark:text-slate-100 mb-2">글자 크기 <span className="text-[12px] text-slate-500 tabular-nums">{v.fontPct}%</span></div>
        <input type="range" min={0} max={6} step={1} value={sizes.indexOf(v.fontPct)} onChange={(e) => chat.setView({ fontPct: sizes[Number(e.target.value)] })} className="w-full accent-blue-500" aria-label="글자 크기" />
        <div className="flex justify-between text-[9px] text-slate-400 tabular-nums mt-0.5">{sizes.map((s) => <span key={s}>{s}</span>)}</div>
        {/* 인라인 미리보기 — 결과를 상상하기 어려운 설정에만 (SOOP §2.6) */}
        <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5" style={{ fontSize: `${(13 * v.fontPct) / 100}px` }}>
          <RoleBadge role="sub" /><b style={{ color: '#e2569b' }}>방울토마토</b><span className="text-slate-400 mx-1">·</span><span className="text-slate-800 dark:text-slate-200">안녕하세요 오늘도 잘 보고 있어요</span>
        </div>
      </div>
      <div className="px-3.5 py-2 flex items-center gap-2">
        <span className="text-[13px] font-medium text-slate-800 dark:text-slate-100 mr-auto">메시지 간격</span>
        {(['tight', 'normal', 'loose'] as const).map((s) => (
          <button key={s} onClick={() => chat.setView({ spacing: s })} className={`px-2.5 py-1 rounded-md text-[12px] font-bold ${v.spacing === s ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{s === 'tight' ? '좁게' : s === 'normal' ? '보통' : '넓게'}</button>
        ))}
      </div>
      <ToggleRow label="타임스탬프" on={v.timestamps} onChange={(x) => chat.setView({ timestamps: x })} />
      <ToggleRow label="마우스를 올리면 자동 스크롤 멈춤" on={v.hoverPause} onChange={(x) => chat.setView({ hoverPause: x })} />
      <ToggleRow label="입장 표시" on={v.showJoins} onChange={(x) => chat.setView({ showJoins: x })} sub="🔔 입장 알림을 피드에 보여줍니다" />
      <ToggleRow label="운영 활동 표시" on={v.showModActivity} onChange={(x) => chat.setView({ showModActivity: x })} sub="삭제 · 타임아웃 같은 조치를 피드에 기록합니다. 혼자 방송하면 꺼두는 게 조용해요" />
      <ToggleRow label="빠른 이모티콘 바" on={v.quickEmotes} onChange={(x) => chat.setView({ quickEmotes: x })} />

      <SectionHead note="시청자 전체에 적용">시청자에게 보이는 설정</SectionHead>
      <ToggleRow label="강제퇴장 메시지 표시" on={chat.policy.showKickMsg} onChange={(x) => chat.setPolicy({ showKickMsg: x }, { kind: '채팅 모드', detail: `강제퇴장 메시지 표시 ${x ? '켬' : '끔'}` })} sub="퇴장 조치를 시청자 채팅에 알립니다" />
      <ToggleRow label="탑 팬 리더보드" on={chat.policy.leaderboard} onChange={(x) => chat.setPolicy({ leaderboard: x }, { kind: '채팅 모드', detail: `탑 팬 ${x ? '켬' : '끔'}` })} sub="상위 3명에게 탑 배지 · 이 방송 기준으로 매번 리셋" />
    </Sheet>
  );
}

/* ── 채널 조치 (Kick §5 · 현재값 상시 노출) ── */
export function ActionsSheet({ chat, go, back }: SheetProps) {
  const p = chat.policy;
  return (
    <Sheet title="채널 조치" onBack={back} sub="지금 우리 채팅이 어떤 상태인지 — 열지 않아도 읽힙니다">
      <SectionHead>참여 자격</SectionHead>
      <Row label="채팅 참여" value={partLabel(p)} onClick={() => go({ kind: 'participation' })} hint="팔로워 전용은 '팔로우 후 경과 시간'까지 걸 수 있어요. 매니저는 항상 예외." />
      <Row label="계정 연령 제한" value={ageLabel(p.accountAgeHours)} onClick={() => go({ kind: 'accountAge' })} hint="가입한 뒤 이 시간이 지나야 채팅할 수 있어요. 가입 직후 어그로를 막습니다." />
      <SectionHead>메시지 제어</SectionHead>
      <Row label="슬로우 모드" value={slowLabel(p.slowSec)} onClick={() => go({ kind: 'slow' })} hint="같은 사람이 연속으로 보낼 때 최소 간격. 매니저 · 구독자는 예외." />
      <ToggleRow label="이모티콘 전용" on={p.emoteOnly} onChange={(x) => chat.setPolicy({ emoteOnly: x }, { kind: '채팅 모드', detail: `이모티콘 전용 ${x ? '켬' : '끔'}` })} sub="글자 없는 이모티콘 메시지만 올라옵니다" />
      <Row label="금칙어" value={`${p.bannedWords.length}개 · 치환`} onClick={() => go({ kind: 'banned' })} hint="지우지 않고 대체 문구로 바꿉니다. 대화 흐름이 끊기지 않아요." />
      <Row label="자동 검토" value={p.autoReview === 'off' ? '끔' : p.autoReview === 'basic' ? '기본' : '엄격'} onClick={() => go({ kind: 'autoReview' })} hint="의심 메시지를 삭제하지 않고 보류합니다. 결정은 크리에이터가." />
    </Sheet>
  );
}

export function ParticipationSheet({ chat, back, toast }: SheetProps) {
  const [part, setPart] = useState(chat.policy.participation);
  const [min, setMin] = useState(chat.policy.followerMinMin);
  return (
    <Sheet title="채팅 참여" onBack={back} footer={<Btn full tone="blue" onClick={() => { chat.setPolicy({ participation: part, followerMinMin: min }, { kind: '채팅 모드', detail: `참여 → ${partLabel({ ...chat.policy, participation: part, followerMinMin: min })}` }); toast('참여 자격을 바꿨습니다 · 바로 적용'); back(); }}>확인</Btn>}>
      <RadioList value={part} onChange={setPart} options={[{ label: '전체', value: 'all' as const }, { label: '팔로워만', value: 'follower' as const }, { label: '구독자만', value: 'sub' as const }]} />
      {part === 'follower' && (
        <>
          <SectionHead note="팔로우 직후 우회를 막습니다">팔로우 후 최소 경과</SectionHead>
          <RadioList value={min} onChange={setMin} options={FOLLOWER_MIN_OPTIONS.map((o) => ({ label: o.label, value: o.min }))} />
        </>
      )}
      <p className="px-3.5 py-2 text-[11px] text-slate-500 flex items-start gap-1.5"><Info size={12} className="mt-px shrink-0" /> 매니저 · 구독자는 어떤 설정이든 채팅할 수 있어요. 바꾸면 바로 적용됩니다.</p>
    </Sheet>
  );
}

export function AccountAgeSheet({ chat, back, toast }: SheetProps) {
  const [h, setH] = useState(chat.policy.accountAgeHours);
  const [custom, setCustom] = useState('');
  return (
    <Sheet title="계정 연령 제한" onBack={back} footer={<Btn full tone="blue" onClick={() => { const v = custom ? Number(custom) : h; chat.setPolicy({ accountAgeHours: v }, { kind: '채팅 모드', detail: `계정 연령 → ${ageLabel(v)}` }); toast('계정 연령 제한을 바꿨습니다'); back(); }}>확인</Btn>}>
      <RadioList value={h} onChange={(v) => { setH(v); setCustom(''); }} options={ACCOUNT_AGE_OPTIONS.map((o) => ({ label: o.label, value: o.hours }))}
        custom={<div className="flex items-center gap-2 px-3.5 py-2"><span className="text-[13px] text-slate-600">사용자 지정</span><input value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))} placeholder="시간" className="w-20 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[13px]" /><span className="text-[12px] text-slate-400">시간</span></div>} />
    </Sheet>
  );
}

export function SlowSheet({ chat, back, toast }: SheetProps) {
  const [s, setS] = useState(chat.policy.slowSec);
  const [custom, setCustom] = useState('');
  return (
    <Sheet title="슬로우 모드" onBack={back} footer={<Btn full tone="blue" onClick={() => { const v = custom ? Number(custom) : s; chat.setPolicy({ slowSec: v }, { kind: '채팅 모드', detail: `슬로우 → ${slowLabel(v)}` }); toast(v ? `슬로우 모드 ${slowLabel(v)} · 바로 적용` : '슬로우 모드를 껐습니다'); back(); }}>확인</Btn>}>
      <RadioList value={s} onChange={(v) => { setS(v); setCustom(''); }} options={SLOW_OPTIONS.map((v) => ({ label: slowLabel(v), value: v }))}
        custom={<div className="flex items-center gap-2 px-3.5 py-2"><span className="text-[13px] text-slate-600">사용자 지정</span><input value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))} placeholder="초" className="w-20 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[13px]" /><span className="text-[12px] text-slate-400">초</span></div>} />
      <p className="px-3.5 py-2 text-[11px] text-slate-500 flex items-start gap-1.5"><Info size={12} className="mt-px shrink-0" /> 매니저 · 구독자에게는 적용되지 않습니다. 채팅이 너무 빨라 읽기 어려울 때 켜세요.</p>
    </Sheet>
  );
}

/* ── 금칙어 — 차단이 아니라 치환 (SOOP §2.10) ── */
export function BannedSheet({ chat, back, toast }: SheetProps) {
  const [words, setWords] = useState(chat.policy.bannedWords);
  const [rep, setRep] = useState(chat.policy.replacement);
  const [w, setW] = useState('');
  const dirty = JSON.stringify(words) !== JSON.stringify(chat.policy.bannedWords) || rep !== chat.policy.replacement;
  const add = () => { const t = w.trim(); if (t.length < 2 || t.length > 5 || words.includes(t) || words.length >= BANNED_MAX) return; setWords([t, ...words]); setW(''); };
  return (
    <Sheet title="금칙어" onBack={back} sub="지우지 않고 바꿉니다 — 대화가 끊기지 않아요"
      footer={<Btn full tone="blue" disabled={!dirty} onClick={() => { chat.setPolicy({ bannedWords: words, replacement: rep }, { kind: '금칙어', detail: `${words.length}개 · 대체 "${rep}"` }); toast('금칙어를 저장했습니다 · 바로 적용'); back(); }}>저장하기</Btn>}>
      <div className="px-3.5 pt-3">
        <div className="flex items-center gap-2">
          <input value={w} onChange={(e) => setW(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} placeholder="차단할 단어 (2~5자)" className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[13px]" />
          <Btn onClick={add} disabled={w.trim().length < 2 || w.trim().length > 5 || words.length >= BANNED_MAX}>추가</Btn>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400"><span>{w.trim() && (w.trim().length < 2 || w.trim().length > 5) ? <span className="text-rose-500">2~5글자만 등록할 수 있어요</span> : '최대 200개까지 등록할 수 있어요'}</span><span className="tabular-nums">{words.length}/{BANNED_MAX}</span></div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {words.map((x) => <span key={x} className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[12px] text-slate-700 dark:text-slate-200">{x}<button onClick={() => setWords(words.filter((y) => y !== x))} className="text-slate-400 hover:text-rose-500" aria-label={`${x} 삭제`}><X size={11} /></button></span>)}
          {words.length === 0 && <span className="text-[12px] text-slate-400">등록된 금칙어가 없습니다.</span>}
        </div>
      </div>
      <SectionHead note="금칙어가 이 문구로 바뀌어 보입니다">대체 메시지</SectionHead>
      <div className="px-3.5 pb-3">
        <div className="flex items-center gap-2">
          <input value={rep} onChange={(e) => setRep(e.target.value.slice(0, REPLACEMENT_MAX))} placeholder="사랑해요♡" className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[13px]" />
          <Counter n={rep.length} max={REPLACEMENT_MAX} />
        </div>
        <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 text-[12px] text-slate-600 dark:text-slate-300">미리보기 · "아 진짜 <s className="text-slate-400">{words[0] ?? '○○'}</s> → <b className="text-blue-600 dark:text-blue-400">{rep || '***'}</b> 왜 안 되냐"</div>
      </div>
    </Sheet>
  );
}

/* ── 자동 검토 — 보류 후 사람이 결정 · 1인칭 프레이밍 ── */
export function AutoReviewSheet({ chat, back, toast }: SheetProps) {
  const lv = chat.policy.autoReview;
  const set = (v: Policy['autoReview']) => { chat.setPolicy({ autoReview: v }, { kind: '자동 검토', detail: v === 'off' ? '끔' : v === 'basic' ? '기본' : '엄격' }); toast(v === 'off' ? '자동 검토를 껐습니다' : `자동 검토 ${v === 'basic' ? '기본' : '엄격'} · 의심 메시지는 보류함에 쌓입니다`); };
  const on = (key: string) => lv !== 'off' && (lv === 'strict' || key !== 'gibberish');
  return (
    <Sheet title="자동 검토" onBack={back} sub="지우지 않고 붙잡아 둡니다. 올릴지는 크리에이터가 정해요">
      <RadioList value={lv} onChange={set} options={[{ label: '끔 — 모든 메시지가 바로 올라옵니다', value: 'off' as const }, { label: '기본 — 욕설 · 광고 · 링크를 보류', value: 'basic' as const }, { label: '엄격 — 기본 + 도배 · 무의미 문자까지', value: 'strict' as const }]} />
      <SectionHead note="검열 설정이 아니라 우리 채팅의 성격 선언">이 채팅에서 저는</SectionHead>
      <ul className="px-3.5 pb-3 space-y-1.5">
        {REVIEW_CATEGORIES.map((c) => (
          <li key={c.key} className={`flex items-start gap-2 text-[12.5px] ${on(c.key) ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 line-through'}`}>
            <span className={`mt-0.5 shrink-0 ${on(c.key) ? 'text-emerald-500' : 'text-slate-300'}`}>{on(c.key) ? <Check size={13} /> : <X size={13} />}</span>{c.firstPerson}
          </li>
        ))}
      </ul>
      <p className="px-3.5 pb-3 text-[11px] text-slate-500 flex items-start gap-1.5"><Info size={12} className="mt-px shrink-0" /> 보류된 메시지는 시청자에게 보이지 않고, 승인하면 "승인" 표시와 함께 올라갑니다. 설정과 무관하게 서비스가 절대 허용하지 않는 표현은 별도로 걸러집니다.</p>
    </Sheet>
  );
}

/* ── 공지 · 규칙 — 노출 토글과 본문 분리 (SOOP §2.4 · 2.5) ── */
export function NoticeSheet({ chat, back, toast }: SheetProps) {
  const [on, setOn] = useState(chat.policy.notice.on);
  const [text, setText] = useState(chat.policy.notice.text);
  const dirty = on !== chat.policy.notice.on || text !== chat.policy.notice.text;
  return (
    <Sheet title="스트리머 공지" onBack={back} sub="채팅창 상단에 띠로 표시 · 시청자가 접을 수 있어요"
      footer={<div className="flex gap-2"><Btn onClick={back}>취소</Btn><Btn full tone="blue" disabled={!dirty || (on && !text.trim())} onClick={() => { chat.setPolicy({ notice: { on, text } }, { kind: '공지', detail: `${on ? '켬' : '끔'} · "${text.slice(0, 20)}"` }); toast('공지를 저장했습니다 · 바로 적용'); back(); }}>저장</Btn></div>}>
      <ToggleRow label="공지 노출" on={on} onChange={setOn} sub="문구는 지우지 않고 껐다 켤 수 있어요" />
      <div className="px-3.5 pb-3">
        <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, NOTICE_MAX))} rows={4} placeholder="공지 내용을 입력해 주세요." className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-[13px] resize-none" />
        <div className="flex justify-end"><Counter n={text.length} max={NOTICE_MAX} /></div>
      </div>
    </Sheet>
  );
}
export function RulesSheet({ chat, back, toast }: SheetProps) {
  const [on, setOn] = useState(chat.policy.rules.on);
  const [text, setText] = useState(chat.policy.rules.text);
  const dirty = on !== chat.policy.rules.on || text !== chat.policy.rules.text;
  return (
    <Sheet title="채팅 규칙" onBack={back} sub="처음 채팅하는 시청자는 동의해야 발언할 수 있어요"
      footer={<div className="flex gap-2"><Btn onClick={back}>취소</Btn><Btn full tone="blue" disabled={!dirty || (on && !text.trim())} onClick={() => { chat.setPolicy({ rules: { on, text } }, { kind: '규칙', detail: `${on ? '켬' : '끔'}` }); toast('채팅 규칙을 저장했습니다'); back(); }}>저장</Btn></div>}>
      <ToggleRow label="규칙 동의 요구" on={on} onChange={setOn} hint="방송 중 규칙을 바꾸면, 이미 보고 있는 시청자에게는 방송에 다시 들어올 때 적용됩니다." />
      <div className="px-3.5 pb-3">
        <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, RULES_MAX))} rows={6} placeholder="채팅 규칙 내용을 입력해 주세요." className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-[13px] resize-none" />
        <div className="flex justify-end"><Counter n={text.length} max={RULES_MAX} /></div>
        <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5"><Info size={12} className="mt-px shrink-0" /> 방송 중 수정하면 이미 시청 중인 유저는 <b>방송 재입장 시</b> 수정된 규칙이 적용됩니다.</p>
      </div>
    </Sheet>
  );
}

/* ── 사용자 카드 — 판단 근거(가입일 · 이 채널 발언)와 조치를 한 카드에 (Kick §6 · YT §4-1) ── */
export function UserSheet({ chat, back, toast, uid }: SheetProps & { uid: string }) {
  const u = userOf(uid);
  const hist = chat.historyOf(uid);
  const active = chat.sanctionOf(uid);
  const isMod = u.role === 'mod' || active.some((s) => s.kind === 'mod');
  const xp = chat.topFans.find((t) => t.uid === uid)?.xp ?? 0;
  const [reason, setReason] = useState('');
  const [toSec, setToSec] = useState(300);
  const act = (kind: SanctionKind, sec?: number, label?: string) => { chat.sanction(uid, kind, { sec, reason: reason.trim() || undefined }); toast(`${u.nick} 님 ${label ?? kind}`); if (kind !== 'mute' && kind !== 'mod') back(); };
  const joinedDays = Math.max(0, Math.round((Date.now() - new Date(u.joinedAt).getTime()) / 864e5));
  return (
    <Sheet title={u.nick} onBack={back} sub={`${ROLE_LABEL[u.role]} · 가입 ${u.joinedAt} (${joinedDays}일)`}>
      <div className="px-3.5 pt-3 pb-2 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full text-white flex items-center justify-center text-[13px] font-bold shrink-0" style={{ background: u.color }}>{u.nick.slice(0, 2)}</div>
        <div className="min-w-0 text-[12px] text-slate-500 space-y-0.5">
          <div><RoleBadge role={u.role} top={chat.top3.has(uid)} />{u.followedDays !== undefined ? `팔로우 ${u.followedDays}일` : '미팔로우'}{u.subMonths !== undefined && ` · 구독 ${u.subMonths}개월`}</div>
          <div>이 방송 채팅 <b className="text-slate-700 dark:text-slate-200 tabular-nums">{hist.filter((m) => m.type === 'chat').length}</b>건 · XP <b className="text-slate-700 dark:text-slate-200 tabular-nums">{xp}</b>{joinedDays < 2 && <Chip tone="amber" title="가입 2일 미만">신규 계정</Chip>}</div>
        </div>
      </div>
      {active.length > 0 && (
        <div className="mx-3.5 mb-2 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-900/10 px-2.5 py-2 text-[12px]">
          <div className="font-bold text-amber-800 dark:text-amber-300 mb-1">적용 중인 조치</div>
          {active.map((s) => <div key={s.id} className="flex items-center gap-2 py-0.5 text-slate-700 dark:text-slate-200"><span>{ { timeout: '타임아웃', hide: '숨기기', ban: '채팅금지', kick: '강제퇴장', blacklist: '블랙리스트', mute: '음소거(내 화면)', mod: '매니저' }[s.kind] }{s.until ? ` · ${fmtT(s.until)}까지` : ''}</span><span className="text-slate-400 text-[11px]">by {s.by}</span><button onClick={() => { chat.unsanction(s.id); toast('해제했습니다'); }} className="ml-auto text-[11px] font-bold text-blue-600 hover:underline">해제</button></div>)}
        </div>
      )}
      {/* 조치 전 확인을 먼저 — '채널로 이동'을 맨 위에 (YT §4-1) */}
      <Row label="채널로 이동" value="" onClick={() => toast(`${u.nick} 님 채널을 새 탭으로 엽니다`)} external />
      <SectionHead>이 채널에서 한 말</SectionHead>
      <ul className="px-3.5 pb-2 max-h-40 overflow-y-auto space-y-1">
        {hist.length === 0 ? <li className="text-[12px] text-slate-400">이 방송에서 남긴 메시지가 없습니다.</li>
          : [...hist].reverse().map((m) => <li key={m.id} className="text-[12px] text-slate-700 dark:text-slate-200 flex gap-2"><span className="text-slate-400 tabular-nums shrink-0">{fmtT(m.ts)}</span><span className="min-w-0 break-words">{m.type === 'dono' ? `💰 ${(m.amount ?? 0).toLocaleString()}원 · ` : ''}{m.text}</span></li>)}
      </ul>
      <SectionHead note="영향 범위가 커질수록 아래에">조치</SectionHead>
      <div className="px-3.5 pb-3 space-y-2">
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="사유 (선택) — 로그에 남습니다" className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[12.5px]" />
        <div className="flex items-center gap-1.5">
          <select value={toSec} onChange={(e) => setToSec(Number(e.target.value))} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-[12.5px]" aria-label="타임아웃 시간">{TIMEOUT_OPTIONS.map((o) => <option key={o.sec} value={o.sec}>{o.label}</option>)}</select>
          <Btn full onClick={() => act('timeout', toSec, `타임아웃 ${TIMEOUT_OPTIONS.find((o) => o.sec === toSec)?.label}`)}>타임아웃</Btn>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Btn onClick={() => act('hide', undefined, '숨김 — 본인은 모릅니다')} title="다른 시청자에게 보이지 않고 본인은 알지 못합니다">숨기기</Btn>
          <Btn onClick={() => act('mute', undefined, '음소거 (내 화면만)')} title="내 화면에서만 가립니다. 채널에는 영향 없음">음소거</Btn>
          <Btn onClick={() => act('kick', undefined, '강제퇴장')} title="이번 방송에서 내보냅니다">강제퇴장</Btn>
          <Btn onClick={() => act('ban', undefined, '채팅금지')}>채팅금지</Btn>
        </div>
        <Btn full tone="red" onClick={() => act('blacklist', undefined, '블랙리스트 — 영구')} title="영구 차단. 차단 목록에서 해제할 수 있어요">블랙리스트 (영구)</Btn>
        {u.role !== 'creator' && (isMod
          ? <Btn full onClick={() => { const s = active.find((x) => x.kind === 'mod'); if (s) chat.unsanction(s.id); toast(`${u.nick} 님 매니저 해임`); }}>매니저 해임</Btn>
          : <Btn full onClick={() => act('mod', undefined, '매니저 임명')}>매니저 임명</Btn>)}
      </div>
    </Sheet>
  );
}

/* ── 참가자 (사람 축) ── */
export function ParticipantsSheet({ chat, go, back }: SheetProps) {
  return (
    <Sheet title="참가자" onBack={back} sub={`${chat.participants.length}명 · 채팅 참여율 ${chat.chatRate}%`}>
      {chat.participants.length === 0 ? <p className="p-4 text-[12.5px] text-slate-400">아직 채팅한 시청자가 없습니다.</p> : chat.participants.map((p) => {
        const u = userOf(p.uid); const silenced = chat.isSilenced(p.uid);
        return (
          <button key={p.uid} onClick={() => go({ kind: 'user', uid: p.uid })} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60">
            <span className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0" style={{ background: u.color }}>{u.nick.slice(0, 2)}</span>
            <span className="min-w-0"><span className="block text-[13px] font-bold truncate" style={{ color: u.color }}><RoleBadge role={u.role} top={chat.top3.has(p.uid)} />{u.nick}</span><span className="block text-[11px] text-slate-400">메시지 {p.count} · 마지막 {fmtT(p.last)}</span></span>
            <span className="ml-auto shrink-0">{silenced ? <Chip tone="rose">제재 중</Chip> : <Chip tone="slate">활동</Chip>}</span>
          </button>
        );
      })}
    </Sheet>
  );
}

/* ── 보류함 ── */
export function HeldSheet({ chat, back, toast }: SheetProps) {
  return (
    <Sheet title="보류된 메시지" onBack={back} sub="자동 검토가 붙잡아 둔 메시지 · 시청자에게는 안 보입니다"
      footer={chat.held.length ? <Btn full tone="red" onClick={() => { chat.held.forEach((m) => chat.resolveHeld(m, false)); toast(`${chat.held.length}건을 모두 삭제했습니다`); }}>모두 삭제</Btn> : undefined}>
      {chat.held.length === 0 ? <p className="p-4 text-[12.5px] text-slate-400">보류된 메시지가 없습니다. 자동 검토에 걸린 메시지가 여기에 쌓입니다.</p> : chat.held.map((m) => {
        const u = userOf(m.uid);
        return (
          <div key={m.id} className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] mb-1"><Chip tone="amber">AI 검토 · {m.held?.reason}</Chip><span className="text-slate-400 tabular-nums">{fmtT(m.ts)}</span></div>
            <div className="text-[13px]"><RoleBadge role={u.role} /><b style={{ color: u.color }}>{u.nick}</b><span className="text-slate-400 mx-1">·</span><span className="text-slate-800 dark:text-slate-200 break-words">{m.text}</span></div>
            <div className="mt-1.5 flex gap-1.5"><Btn onClick={() => { chat.resolveHeld(m, true); toast('승인 — 채팅에 올렸습니다'); }}>승인</Btn><Btn tone="red" onClick={() => { chat.resolveHeld(m, false); toast('삭제했습니다'); }}>삭제</Btn></div>
          </div>
        );
      })}
    </Sheet>
  );
}

/* ── 운영 로그 — 설정 변경까지 한 타임라인 (Kick §8-1) · 적용자 기록 (SOOP §2.3) ── */
export function LogSheet({ chat, back }: SheetProps) {
  const kinds = useMemo(() => ['전체', ...Array.from(new Set(chat.log.map((l) => l.kind)))], [chat.log]);
  const [k, setK] = useState('전체');
  const rows = [...chat.log].reverse().filter((l) => k === '전체' || l.kind === k);
  return (
    <Sheet title="운영 로그" onBack={back} sub="누가 · 언제 · 무엇을 — 채팅 조치와 설정 변경을 같은 줄에">
      <div className="flex gap-1 px-3.5 py-2 overflow-x-auto">{kinds.map((x) => <button key={x} onClick={() => setK(x)} className={`shrink-0 px-2 py-0.5 rounded-md text-[11px] font-bold ${k === x ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{x}</button>)}</div>
      {rows.length === 0 ? <p className="p-4 text-[12.5px] text-slate-400">기록이 없습니다.</p> : rows.map((l) => (
        <div key={l.id} className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 text-[12px]">
          <div className="flex items-center gap-1.5"><span className="text-slate-400 tabular-nums">{fmtDT(l.at)}</span><Chip tone={l.by === ME.nick ? 'blue' : 'emerald'}>{l.by}</Chip><b className="text-slate-800 dark:text-slate-100">{l.kind}</b><span className="text-slate-500 truncate">→ {l.target}</span></div>
          {l.detail && <div className="text-slate-500 mt-0.5 truncate">{l.detail}</div>}
        </div>
      ))}
    </Sheet>
  );
}

/* ── 탑 팬 — 상위 3 · 스트림 단위 리셋 (YT §2-1) ── */
export function TopFansSheet({ chat, go, back }: SheetProps) {
  return (
    <Sheet title="탑 팬" onBack={back} sub="채팅 10 · 후원 1,000원당 10 XP — 이 방송이 끝나면 리셋됩니다">
      <ToggleRow label="리더보드 · 탑 배지" on={chat.policy.leaderboard} onChange={(x) => chat.setPolicy({ leaderboard: x }, { kind: '채팅 모드', detail: `탑 팬 ${x ? '켬' : '끔'}` })} sub="상위 3명 메시지 옆에 '탑' 배지가 붙습니다" />
      {chat.topFans.length === 0 ? <p className="p-4 text-[12.5px] text-slate-400">팬심을 표현한 시청자가 아직 없어요. 채팅이나 후원을 보내면 리더보드에 오릅니다.</p> : chat.topFans.slice(0, 10).map((t, i) => {
        const u = userOf(t.uid);
        return (
          <button key={t.uid} onClick={() => go({ kind: 'user', uid: t.uid })} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60">
            <span className={`w-6 text-center text-[13px] font-black tabular-nums ${i < 3 ? 'text-amber-500' : 'text-slate-400'}`}>{i + 1}</span>
            <span className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0" style={{ background: u.color }}>{u.nick.slice(0, 2)}</span>
            <span className="min-w-0 text-[13px] font-bold truncate" style={{ color: u.color }}>{u.nick}</span>
            {i < 3 && chat.policy.leaderboard && <Sparkles size={12} className="text-amber-500" />}
            <span className="ml-auto text-[12px] text-slate-500 tabular-nums">{t.xp} XP</span>
          </button>
        );
      })}
    </Sheet>
  );
}

/* ── 매니저 채팅 — 백채널 + 저장 (SOOP §2.2③) ── */
export function StaffSheet({ chat, back, toast }: SheetProps) {
  const [t, setT] = useState('');
  const save = () => {
    const body = chat.staff.map((s) => `[${fmtDT(s.ts)}] ${s.by}: ${s.text}`).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + body], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'toonation-staff-chat.txt'; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 0);
    toast('매니저 채팅을 저장했습니다');
  };
  return (
    <Sheet title="매니저 채팅" onBack={back} sub="시청자에게 보이지 않는 운영진 대화"
      footer={<div className="flex items-center gap-1.5"><input value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && t.trim()) { chat.sendStaff(t.trim()); setT(''); } }} placeholder="매니저에게 메시지" className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[13px]" /><Btn tone="blue" disabled={!t.trim()} onClick={() => { chat.sendStaff(t.trim()); setT(''); }}>보내기</Btn><Btn onClick={save} disabled={!chat.staff.length} title="제재 근거 · 인수인계용으로 내려받기"><Download size={14} /></Btn></div>}>
      {chat.staff.length === 0 ? <p className="p-4 text-[12.5px] text-slate-400">아직 대화가 없습니다. 제재 근거나 인수인계 메모를 남기면 저장할 수 있어요.</p> : chat.staff.map((s) => <div key={s.id} className="px-3.5 py-1.5 text-[13px]"><span className="text-[11px] text-slate-400 tabular-nums mr-1.5">{fmtT(s.ts)}</span><b className="text-emerald-700 dark:text-emerald-300">{s.by}</b><span className="text-slate-400 mx-1">·</span>{s.text}</div>)}
    </Sheet>
  );
}

/* ── 선물 받은 내역 — 방송 중 즉시 확인용 (정산 화면과 분리 · SOOP §2.2②) ── */
export function GiftsSheet({ chat, go, back }: SheetProps) {
  const total = chat.gifts.reduce((a, m) => a + (m.amount ?? 0), 0);
  return (
    <Sheet title="선물 받은 내역" onBack={back} sub={`이 방송 · ${chat.gifts.length}건 · ${total.toLocaleString()}원 (정산 금액과는 수수료 차이가 있어요)`}>
      {chat.gifts.length === 0 ? <p className="p-4 text-[12.5px] text-slate-400">이 방송에서 받은 후원이 없습니다.</p> : [...chat.gifts].reverse().map((m) => {
        const u = userOf(m.uid);
        return <button key={m.id} onClick={() => go({ kind: 'user', uid: m.uid })} className="w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 text-[12.5px]"><span className="text-slate-400 tabular-nums">{fmtT(m.ts)}</span><b style={{ color: u.color }}>{u.nick}</b><span className="text-slate-600 dark:text-slate-300 truncate">{m.text}</span><span className="ml-auto font-bold text-amber-700 dark:text-amber-300 tabular-nums shrink-0">{(m.amount ?? 0).toLocaleString()}원</span></button>;
      })}
    </Sheet>
  );
}

/* ── 채팅 관리 — 4단계 제재를 한 창에, ID 직접 입력 경로 (SOOP §2.2④ · §2.3) ── */
export function ManageSheet({ chat, back, toast }: SheetProps) {
  const [tab, setTab] = useState<'ban' | 'kick' | 'mod' | 'blacklist'>('ban');
  const [q, setQ] = useState('');
  const match = USERS.find((u) => u.nick === q.trim() || u.uid === q.trim());
  const kicked = chat.allSanctions.filter((s) => s.kind === 'kick');
  const label = { ban: '채팅금지', kick: '강제퇴장', mod: '매니저 임명 · 해임', blacklist: '블랙리스트 추가' }[tab];
  const apply = () => {
    if (!match) { toast('해당 아이디 · 닉네임을 찾을 수 없습니다'); return; }
    if (tab === 'mod') { const s = chat.sanctionOf(match.uid, 'mod')[0]; if (s) { chat.unsanction(s.id); toast(`${match.nick} 매니저 해임`); } else { chat.sanction(match.uid, 'mod'); toast(`${match.nick} 매니저 임명`); } }
    else { chat.sanction(match.uid, tab); toast(`${match.nick} ${label}`); }
    setQ('');
  };
  const download = () => {
    const rows = [['종류', '대상', '적용 시각', '적용자', '사유'], ...chat.allSanctions.map((s) => [s.kind, userOf(s.uid).nick, fmtDT(s.at), s.by, s.reason ?? ''])];
    const url = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'toonation-chat-sanctions.csv'; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 0);
    toast('제재 내역을 내려받았습니다');
  };
  return (
    <Sheet title="채팅 관리" onBack={back} sub="메시지를 찾지 않고도 아이디로 바로 조치합니다">
      <div className="flex gap-1 px-3.5 pt-3">{(['ban', 'kick', 'mod', 'blacklist'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`flex-1 px-1 py-1.5 rounded-md text-[11.5px] font-bold ${tab === t ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{ { ban: '채팅금지', kick: '강제퇴장', mod: '매니저', blacklist: '블랙리스트' }[t] }</button>)}</div>
      <div className="px-3.5 py-3 flex items-center gap-1.5">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') apply(); }} placeholder="아이디, 닉네임" className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[13px]" />
        <Btn tone={tab === 'blacklist' ? 'red' : 'blue'} onClick={apply} disabled={!q.trim()}>적용</Btn>
      </div>
      {q.trim() && !match && <p className="px-3.5 -mt-1 pb-2 text-[11px] text-rose-500">일치하는 사용자가 없습니다</p>}
      <SectionHead note={`총 ${kicked.length}명`}>강제퇴장 인원</SectionHead>
      {kicked.length === 0 ? <p className="px-3.5 pb-3 text-[12px] text-slate-400">강제퇴장된 참여자가 없습니다.</p> : (
        <table className="w-full text-[12px] mb-2"><thead><tr className="text-[10.5px] text-slate-400"><th className="text-left px-3.5 py-1 font-semibold">닉네임</th><th className="text-left py-1 font-semibold">적용 시간</th><th className="text-left py-1 font-semibold">적용자</th><th className="py-1" /></tr></thead>
          <tbody>{kicked.map((s) => <tr key={s.id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-3.5 py-1.5 font-bold" style={{ color: userOf(s.uid).color }}>{userOf(s.uid).nick}</td><td className="py-1.5 tabular-nums text-slate-500">{fmtT(s.at)}</td><td className="py-1.5 text-slate-500">{s.by}</td><td className="py-1.5 pr-3.5 text-right"><button onClick={() => { chat.unsanction(s.id); toast('강제퇴장을 해제했습니다'); }} className="text-[11px] font-bold text-blue-600 hover:underline">해제</button></td></tr>)}</tbody></table>
      )}
      <div className="px-3.5 pb-3"><Btn onClick={download} disabled={!chat.allSanctions.length} title="제재 내역 CSV"><span className="inline-flex items-center gap-1.5"><Download size={13} /> 다운로드</span></Btn></div>
    </Sheet>
  );
}

/* ── 투표 만들기 · Q&A ── */
export function PollEditorSheet({ chat, back, close, toast }: SheetProps) {
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState(['', '']);
  const valid = q.trim() && opts.filter((o) => o.trim()).length >= 2;
  if (chat.poll && !chat.poll.closed) {
    const total = chat.poll.options.reduce((a, o) => a + o.votes, 0);
    return (
      <Sheet title="투표 진행 중" onBack={back} footer={<Btn full tone="blue" onClick={() => { chat.endPoll(); toast('투표를 종료하고 결과를 채팅에 올렸습니다'); close(); }}>종료 · 결과 발표</Btn>}>
        <div className="px-3.5 pt-3 text-[13px] font-bold text-slate-800 dark:text-slate-100">{chat.poll.question}</div>
        <div className="px-3.5 py-2 space-y-1.5">{chat.poll.options.map((o, i) => { const pct = total ? Math.round((o.votes / total) * 100) : 0; return <div key={i} className="relative rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden px-2.5 py-1.5 text-[12.5px]"><span className="absolute inset-y-0 left-0 bg-blue-50 dark:bg-blue-900/30" style={{ width: `${pct}%` }} /><span className="relative flex justify-between"><span className="font-bold text-slate-800 dark:text-slate-100">{o.label}</span><span className="tabular-nums text-slate-500">{pct}% · {o.votes}표</span></span></div>; })}</div>
        <p className="px-3.5 text-[11px] text-slate-400">총 {total}표 · 시청자 채팅에 스티커로 표시됩니다</p>
      </Sheet>
    );
  }
  return (
    <Sheet title="투표 만들기" onBack={back} footer={<div className="flex gap-2"><Btn onClick={back}>취소</Btn><Btn full tone="blue" disabled={!valid} onClick={() => { chat.startPoll(q.trim(), opts.map((o) => o.trim()).filter(Boolean)); toast('투표를 시작했습니다'); close(); }}>시작하기</Btn></div>}>
      <div className="px-3.5 pt-3 space-y-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="질문" className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[13px]" />
        {opts.map((o, i) => <div key={i} className="flex items-center gap-1.5"><input value={o} onChange={(e) => setOpts(opts.map((x, k) => (k === i ? e.target.value : x)))} placeholder={`항목 ${i + 1}`} className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[13px]" /><button disabled={opts.length <= 2} onClick={() => setOpts(opts.filter((_, k) => k !== i))} className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30" aria-label="항목 삭제"><X size={13} /></button></div>)}
        <button disabled={opts.length >= 4} onClick={() => setOpts([...opts, ''])} className="text-[12px] font-bold text-blue-600 disabled:opacity-40">＋ 항목 추가 (최대 4개)</button>
      </div>
    </Sheet>
  );
}
export function QnASheet({ chat, back, toast }: SheetProps) {
  const open = chat.qna.open;
  const pending = chat.qna.questions.filter((q) => !q.answered);
  return (
    <Sheet title="Q&A" onBack={back} sub="흘러가는 채팅에서 질문만 따로 건져 올립니다"
      footer={<Btn full tone={open ? 'gray' : 'blue'} onClick={() => { chat.toggleQna(!open); toast(open ? 'Q&A를 종료했습니다 · 답하지 않은 질문은 지웠어요' : 'Q&A 세션을 열었습니다 · 물음표가 있는 채팅이 모입니다'); }}>{open ? '세션 종료' : 'Q&A 시작'}</Btn>}>
      {!open && chat.qna.questions.length === 0 && <p className="p-4 text-[12.5px] text-slate-400">세션을 열면 시청자 채팅 중 질문이 여기에 모입니다. 종료하면 답하지 않은 질문은 삭제됩니다.</p>}
      {open && pending.length === 0 && <p className="p-4 text-[12.5px] text-slate-400">아직 질문이 없어요. "~나요?" "~까요?" 같은 채팅이 자동으로 모입니다.</p>}
      {chat.qna.questions.map((q) => { const u = userOf(q.uid); return (
        <div key={q.id} className={`px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-start gap-2 ${q.answered ? 'opacity-50' : ''}`}>
          <HelpCircle size={14} className={`mt-0.5 shrink-0 ${q.answered ? 'text-slate-300' : 'text-blue-500'}`} />
          <div className="min-w-0 flex-1 text-[12.5px]"><b style={{ color: u.color }}>{u.nick}</b><span className="text-slate-400 mx-1">·</span><span className="text-slate-800 dark:text-slate-200">{q.text}</span></div>
          {!q.answered && <button onClick={() => chat.answerQ(q.id)} className="shrink-0 text-[11px] font-bold text-blue-600 hover:underline">답변 완료</button>}
        </div>); })}
    </Sheet>
  );
}

// 시트 아이콘(메뉴용) — 미사용 import 방지 겸 목록
export const SHEET_ICONS = { Users, Sparkles, Coins, ShieldAlert, ScrollText, MessagesSquare, Gavel, Megaphone, BookOpen, Settings, Eraser, ExternalLink, Vote, Pin };
