import React, { useMemo, useState } from 'react';
import {
  PageHead, Card, FilterTable, SearchButton, Check, Radio as RadioOpt, inputCls, Select,
  TableTools, OutlineButton, DataTable, Td, LinkCell, Pill, Badge, Pagination, Modal, ModalBtn,
  InfoTable, AD,
} from './ui';
import {
  LIVES, CHANNELS, SESSIONS, REPORTS, CHAT_LOGS, BANNED_WORDS, CATEGORIES, TAGS, INFRA,
  GRID_INSTALLS, GRID_VERSIONS, GRID_ISSUES, POLICIES, STAT_DAILY, STAT_RANK, BANNERS,
  CREATOR_NOTICES, AUDIT, ESCALATION, anomalies, fmt, dur,
  type LiveRow, type ChannelRow, type SessionRow, type ReportRow, type ChatLogRow, type AuditRow, type Policy,
} from './data';

type Notify = (msg: string) => void;
export interface ScreenProps { notify: Notify }

const PAGE = 10;
function usePaged<T>(rows: T[]) {
  const [page, setPage] = useState(1);
  const total = Math.max(1, Math.ceil(rows.length / PAGE));
  const p = Math.min(page, total);
  return { rows: rows.slice((p - 1) * PAGE, p * PAGE), page: p, total, setPage };
}

/* 요약 타일 — 숫자 위에 항상 라벨을 둔다 */
function Tiles({ items }: { items: { label: string; value: string; sub?: string; tone?: 'blue' | 'red' | 'amber' | 'slate' }[] }) {
  const tone = { blue: '#1a6ad4', red: '#d33c3c', amber: '#c27b12', slate: '#334155' };
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {items.map((it, i) => (
        <div key={i} className="bg-white rounded-[4px] border px-4 py-3" style={{ borderColor: AD.border }}>
          <div className="text-[12px] text-slate-500 mb-1">{it.label}</div>
          <div className="text-[20px] font-bold" style={{ color: tone[it.tone ?? 'slate'] }}>{it.value}</div>
          {it.sub && <div className="text-[11px] text-slate-400 mt-0.5">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}

/* 미니 막대 — 시계열 · 분포 공용 */
function Bars({ data, max, color = '#4a7fd4', labels }: { data: number[]; max?: number; color?: string; labels?: string[] }) {
  const m = max ?? Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1" title={labels ? `${labels[i]} · ${v}` : String(v)}>
          <div className="w-full rounded-t-[2px]" style={{ height: `${Math.max(3, (v / m) * 84)}px`, background: color }} />
          {labels && <span className="text-[9px] text-slate-400 truncate w-full text-center">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

/* ══════════ ① 라이브 모니터링 ══════════ */
export function LiveMonitor({ notify }: ScreenProps) {
  const [status, setStatus] = useState<Record<string, boolean>>({ 라이브: true, 준비: true, 일시중단: true });
  const [kw, setKw] = useState('');
  const [onlyAnomaly, setOnlyAnomaly] = useState(false);
  const [sort, setSort] = useState('시청자 수');
  const [q, setQ] = useState({ kw: '', onlyAnomaly: false, status: { 라이브: true, 준비: true, 일시중단: true } as Record<string, boolean> });
  const [detail, setDetail] = useState<LiveRow | null>(null);
  const [kill, setKill] = useState<LiveRow | null>(null);
  const [killReason, setKillReason] = useState('정책 위반');
  const [killKey, setKillKey] = useState(false);

  const rows: LiveRow[] = useMemo(() => {
    const f = LIVES.filter((r) => q.status[r.status])
      .filter((r) => !q.kw || r.channel.includes(q.kw) || r.title.includes(q.kw) || r.cid.includes(q.kw))
      .filter((r) => !q.onlyAnomaly || anomalies(r).length > 0);
    const keys: Record<string, (r: LiveRow) => number | string> = {
      '시청자 수': (r) => -r.viewers, '시작 시각': (r) => r.startedAt, '비트레이트': (r) => -r.bitrate, '신고 수': (r) => -r.reports,
    };
    const key = keys[sort] ?? keys['시청자 수'];
    return [...f].sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0));
  }, [q, sort]);
  const pg = usePaged(rows);

  const live = LIVES.filter((r) => r.status === '라이브').length;
  const abnormal = LIVES.filter((r) => anomalies(r).length > 0).length;

  return (
    <>
      <PageHead title="라이브 모니터링" desc="현재 송출 중인 방송을 실시간으로 감시하고, 필요 시 강제 종료 · 스트림키 무효화를 실행합니다. 목록은 5초 주기로 갱신됩니다." />
      <Tiles items={[
        { label: '동시 방송 수', value: fmt(live), sub: '라이브 상태', tone: 'blue' },
        { label: '동시 시청자 수', value: fmt(LIVES.reduce((s, r) => s + r.viewers, 0)), tone: 'blue' },
        { label: '일시중단', value: fmt(LIVES.filter((r) => r.status === '일시중단').length), sub: '재접속 유예 90초', tone: 'amber' },
        { label: '이상 감지', value: fmt(abnormal), sub: '비트레이트 · 지연 · 신고', tone: 'red' },
      ]} />
      <Card>
        <FilterTable rows={[
          { label: '방송 상태', content: (<>{(['라이브', '준비', '일시중단'] as const).map((s) => (
            <Check key={s} label={s} checked={status[s]} onChange={() => setStatus({ ...status, [s]: !status[s] })} />))}</>) },
          { label: '검색어', content: (
            <div className="flex items-center gap-2">
              <input className={`${inputCls} w-80`} placeholder="채널명 · 방송 제목 · CID" value={kw} onChange={(e) => setKw(e.target.value)} />
              <span className="text-[12px] text-slate-400">부분 일치</span>
            </div>) },
          { label: '이상 방송', content: <Check label="이상 감지된 방송만 보기" checked={onlyAnomaly} onChange={() => setOnlyAnomaly(!onlyAnomaly)} /> },
          { label: '정렬', content: (<>{['시청자 수', '시작 시각', '비트레이트', '신고 수'].map((s) => (
            <RadioOpt key={s} label={s} checked={sort === s} onChange={() => setSort(s)} />))}</>) },
        ]} />
        <SearchButton onClick={() => { setQ({ kw, onlyAnomaly, status }); pg.setPage(1); }} />
        <TableTools>
          <span className="mr-auto text-[13px] text-slate-500">총 <b className="text-slate-800">{fmt(rows.length)}</b>건</span>
          <OutlineButton onClick={() => notify('목록을 새로 불러왔습니다.')}>새로고침</OutlineButton>
        </TableTools>
        <DataTable head={['상태', '채널', '방송 제목', '카테고리', '시청자', '방송 시간', '비트레이트', '수신 지연', '신고', '이상 표시', '관리']} empty={rows.length === 0}>
          {pg.rows.map((r) => {
            const an = anomalies(r);
            return (
              <tr key={r.id} className={an.some((a) => a.tone === 'red') ? 'bg-red-50/60' : an.length ? 'bg-amber-50/50' : ''}>
                <Td center><Badge tone={r.status === '라이브' ? 'red' : r.status === '일시중단' ? 'amber' : 'slate'}>{r.status}</Badge></Td>
                <Td><LinkCell onClick={() => setDetail(r)}>{r.channel}</LinkCell><div className="text-[11px] text-slate-400">{r.cid}</div></Td>
                <Td className="max-w-[240px] truncate">{r.title}</Td>
                <Td center>{r.category}</Td>
                <Td center>{fmt(r.viewers)}</Td>
                <Td center>{r.status === '준비' ? '—' : dur(r.minutes)}<div className="text-[11px] text-slate-400">{r.startedAt} 시작</div></Td>
                <Td center>{fmt(r.bitrate)} kbps</Td>
                <Td center>{fmt(r.delay)} ms</Td>
                <Td center>{r.reports > 0 ? <b className="text-red-600">{r.reports}</b> : '0'}</Td>
                <Td>
                  {an.length === 0 ? <span className="text-slate-400">정상</span> : (
                    <div className="flex flex-wrap gap-1">{an.map((a, i) => <Badge key={i} tone={a.tone}>{a.label}</Badge>)}
                      {r.ghostIn !== undefined && <span className="text-[11px] text-slate-500">판정까지 {r.ghostIn}초</span>}</div>)}
                </Td>
                <Td center>
                  <div className="flex gap-1 justify-center">
                    <Pill tone="blue" onClick={() => setDetail(r)}>상세</Pill>
                    <Pill tone="pink" onClick={() => { setKill(r); setKillReason('정책 위반'); setKillKey(false); }} disabled={r.status === '준비'}>강제 종료</Pill>
                    <Pill tone="gray" onClick={() => notify(`${r.channel} 스트림키를 무효화했습니다. 재접속이 차단됩니다. (감사 로그 기록)`)}>키 무효화</Pill>
                  </div>
                </Td>
              </tr>
            );
          })}
        </DataTable>
        <Pagination page={pg.page} total={pg.total} onChange={pg.setPage} />
      </Card>

      {detail && (
        <Modal wide title={`방송 상세 — ${detail.channel} (${detail.cid})`} onClose={() => setDetail(null)}
          footer={<><ModalBtn onClick={() => setDetail(null)}>닫기</ModalBtn>
            <ModalBtn tone="red" onClick={() => { setKill(detail); setDetail(null); }}>강제 종료</ModalBtn></>}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="aspect-video rounded bg-slate-900 flex flex-col items-center justify-center text-slate-400 text-[12px] gap-1">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold">LIVE 미리보기</span>
                <span>실시간 캡처 · 5초 주기</span>
              </div>
              <div className="mt-3">
                <InfoTable rows={[
                  ['회차 ID', detail.id], ['방송 제목', detail.title], ['카테고리', detail.category],
                  ['상태', <Badge tone={detail.status === '라이브' ? 'red' : 'amber'}>{detail.status}</Badge>],
                  ['시작 · 경과', `${detail.startedAt} · ${dur(detail.minutes)}`],
                  ['시청자', `${fmt(detail.viewers)}명`],
                  ['송출 품질', `${fmt(detail.bitrate)} kbps · 지연 ${fmt(detail.delay)} ms`],
                ]} />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-[13px] font-bold text-slate-700 mb-1.5">실시간 채팅</h4>
                <div className="h-44 overflow-y-auto border rounded p-2 space-y-1.5 bg-slate-50" style={{ borderColor: AD.border }}>
                  {CHAT_LOGS.slice(0, 8).map((m) => (
                    <div key={m.id} className="text-[12px]"><b className="text-slate-700">{m.user}</b> <span className="text-slate-600">{m.message}</span></div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-700 mb-1.5">신고 내역 ({detail.reports}건)</h4>
                <div className="border rounded divide-y" style={{ borderColor: AD.border }}>
                  {REPORTS.filter((r) => r.channel === detail.channel).slice(0, 3).map((r) => (
                    <div key={r.id} className="px-2.5 py-2 text-[12px] flex items-center gap-2">
                      <Badge tone="slate">{r.kind}</Badge><b className="text-slate-700">{r.type}</b>
                      <span className="text-slate-500 truncate">{r.reason}</span>
                      <span className="ml-auto text-slate-400 shrink-0">{r.at}</span>
                    </div>
                  ))}
                  {detail.reports === 0 && <div className="px-2.5 py-4 text-[12px] text-slate-400 text-center">접수된 신고가 없습니다.</div>}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {kill && (
        <Modal title="방송 강제 종료" onClose={() => setKill(null)}
          footer={<><ModalBtn onClick={() => setKill(null)}>취소</ModalBtn>
            <ModalBtn tone="red" onClick={() => { notify(`${kill.channel} 방송을 강제 종료했습니다. 사유: ${killReason}${killKey ? ' · 스트림키 무효화 포함' : ''} · 크리에이터 통지 발송`); setKill(null); }}>강제 종료 실행</ModalBtn></>}>
          <p className="text-[13px] text-slate-600 mb-3">
            <b className="text-slate-800">{kill.channel}</b>의 방송 <b>{kill.id}</b>을(를) 즉시 종료합니다.
            수신 연결이 끊기고 회차 종료 사유는 <b>강제</b>로 기록되며, 크리에이터에게 사유가 자동 통지됩니다.
          </p>
          <div className="border rounded p-3 mb-3" style={{ borderColor: AD.border }}>
            <div className="text-[13px] font-bold text-slate-700 mb-2">종료 사유</div>
            {['정책 위반', '부정 사용', '인프라 보호'].map((r) => (
              <div key={r}><RadioOpt label={r} checked={killReason === r} onChange={() => setKillReason(r)} /></div>
            ))}
          </div>
          <Check label="스트림키도 함께 무효화 (재접속 차단)" checked={killKey} onChange={() => setKillKey(!killKey)} />
          <p className="mt-3 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            이 조치는 감사 로그에 관리자 ID · 시각 · 대상 · 사유와 함께 영구 기록됩니다.
          </p>
        </Modal>
      )}
    </>
  );
}

/* ══════════ ② 채널 관리 ══════════ */
export function ChannelAdmin({ notify }: ScreenProps) {
  const [kw, setKw] = useState('');
  const [field, setField] = useState('전체');
  const [st, setSt] = useState<Record<string, boolean>>({ 정상: true, 정지: true, 폐쇄: true });
  const [q, setQ] = useState({ kw: '', field: '전체', st: { 정상: true, 정지: true, 폐쇄: true } as Record<string, boolean> });
  const [detail, setDetail] = useState<ChannelRow | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [suspend, setSuspend] = useState<ChannelRow | null>(null);
  const [susPeriod, setSusPeriod] = useState('7일');
  const [susReason, setSusReason] = useState('');

  const rows: ChannelRow[] = useMemo(() => CHANNELS.filter((c) => q.st[c.status]).filter((c) => {
    if (!q.kw) return true;
    const k = q.kw.toLowerCase();
    const inName = c.name.toLowerCase().includes(k), inId = c.id.includes(k), inCid = c.cid.toLowerCase().includes(k), inKey = c.streamKey.includes(k);
    return q.field === '채널명' ? inName : q.field === '채널 ID' ? inId : q.field === 'CID' ? inCid : q.field === '스트림키' ? inKey : (inName || inId || inCid || inKey);
  }), [q]);
  const pg = usePaged(rows);
  const mask = (k: string) => `${k.slice(0, 5)}${'•'.repeat(18)}${k.slice(-4)}`;

  return (
    <>
      <PageHead title="채널 관리" desc="채널 상태 · 스트림키 · 제재를 관리합니다. 스트림키는 기본 마스킹되며 열람 시 감사 로그가 기록됩니다." />
      <Card>
        <FilterTable rows={[
          { label: '검색', content: (
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={field} onChange={setField} options={['전체', '채널명', '채널 ID', 'CID', '스트림키']} />
              <input className={`${inputCls} w-80`} placeholder="스트림키는 일부만 입력해도 검색됩니다" value={kw} onChange={(e) => setKw(e.target.value)} />
            </div>) },
          { label: '채널 상태', content: (<>{(['정상', '정지', '폐쇄'] as const).map((s) => (
            <Check key={s} label={s} checked={st[s]} onChange={() => setSt({ ...st, [s]: !st[s] })} />))}</>) },
        ]} />
        <SearchButton onClick={() => { setQ({ kw, field, st }); pg.setPage(1); }} />
        <TableTools><span className="mr-auto text-[13px] text-slate-500">총 <b className="text-slate-800">{fmt(rows.length)}</b>건</span></TableTools>
        <DataTable head={['채널명', 'CID', '상태', '개설일', '마지막 방송', '총 회차', '누적 시청', '신고', '제재', '스트림키', '관리']} empty={rows.length === 0}>
          {pg.rows.map((c) => (
            <tr key={c.id}>
              <Td><LinkCell onClick={() => setDetail(c)}>{c.name}</LinkCell><div className="text-[11px] text-slate-400">{c.id}</div></Td>
              <Td center>{c.cid}</Td>
              <Td center>
                <Badge tone={c.status === '정상' ? 'green' : c.status === '정지' ? 'red' : 'slate'}>{c.status}</Badge>
                {c.suspendUntil && <div className="text-[11px] text-red-600 mt-0.5">~{c.suspendUntil}</div>}
              </Td>
              <Td center>{c.openedAt}</Td>
              <Td center>{c.lastLive}</Td>
              <Td center>{fmt(c.sessions)}</Td>
              <Td center>{fmt(c.totalViews)}</Td>
              <Td center>{c.reports}</Td>
              <Td center>{c.sanctions}</Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <code className="text-[11px] text-slate-600">{revealed[c.id] ? c.streamKey : mask(c.streamKey)}</code>
                  <Pill tone="gray" onClick={() => { setRevealed({ ...revealed, [c.id]: !revealed[c.id] }); if (!revealed[c.id]) notify(`${c.name} 스트림키를 열람했습니다. 감사 로그에 기록됩니다. (슈퍼관리자)`); }}>
                    {revealed[c.id] ? '가리기' : '열람'}
                  </Pill>
                </div>
              </Td>
              <Td center>
                <div className="flex gap-1 justify-center">
                  <Pill tone="blue" onClick={() => setDetail(c)}>상세</Pill>
                  <Pill tone="teal" onClick={() => notify(`${c.name} 스트림키를 강제 재발급했습니다. 기존 키는 즉시 무효화되고 크리에이터에게 통지됩니다.`)}>키 재발급</Pill>
                  {c.status === '정지'
                    ? <Pill tone="gray" onClick={() => notify(`${c.name} 채널 정지를 해제했습니다.`)}>정지 해제</Pill>
                    : <Pill tone="pink" onClick={() => { setSuspend(c); setSusPeriod('7일'); setSusReason(''); }}>채널 정지</Pill>}
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
        <Pagination page={pg.page} total={pg.total} onChange={pg.setPage} />
      </Card>

      {detail && (
        <Modal wide title={`채널 상세 — ${detail.name}`} onClose={() => setDetail(null)} footer={<ModalBtn onClick={() => setDetail(null)}>닫기</ModalBtn>}>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoTable rows={[
              ['채널명', detail.name], ['채널 ID / CID', `${detail.id} / ${detail.cid}`], ['소유 회원', <LinkCell onClick={() => notify('기존 관리자 회원 관리 화면으로 이동합니다.')}>{detail.owner}</LinkCell>],
              ['상태', <Badge tone={detail.status === '정상' ? 'green' : detail.status === '정지' ? 'red' : 'slate'}>{detail.status}</Badge>],
              ['개설일', detail.openedAt], ['마지막 방송', detail.lastLive],
              ['총 회차 / 누적 시청', `${fmt(detail.sessions)}회 / ${fmt(detail.totalViews)}명`],
              ['개설 자격', detail.eligible ? <Badge tone="green">충족</Badge> : <Badge tone="red">미충족</Badge>],
            ]} />
            <div className="space-y-3">
              <div>
                <h4 className="text-[13px] font-bold text-slate-700 mb-1.5">제재 이력 ({detail.sanctions}건)</h4>
                <div className="border rounded divide-y" style={{ borderColor: AD.border }}>
                  {detail.sanctions === 0 ? <div className="px-3 py-4 text-[12px] text-slate-400 text-center">제재 이력이 없습니다.</div>
                    : Array.from({ length: detail.sanctions }, (_, i) => (
                      <div key={i} className="px-3 py-2 text-[12px] flex gap-2">
                        <Badge tone="amber">{ESCALATION[i]?.action ?? '경고'}</Badge>
                        <span className="text-slate-500">신고 누적</span>
                        <span className="ml-auto text-slate-400">2026-0{8 - i}-1{i}</span>
                      </div>))}
                </div>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-700 mb-1.5">신고 이력 ({detail.reports}건)</h4>
                <div className="border rounded divide-y max-h-40 overflow-y-auto" style={{ borderColor: AD.border }}>
                  {REPORTS.filter((r) => r.channel === detail.name).map((r) => (
                    <div key={r.id} className="px-3 py-2 text-[12px] flex gap-2"><Badge tone="slate">{r.kind}</Badge><b className="text-slate-700">{r.type}</b><span className="ml-auto text-slate-400">{r.at}</span></div>
                  ))}
                  {REPORTS.filter((r) => r.channel === detail.name).length === 0 && <div className="px-3 py-4 text-[12px] text-slate-400 text-center">접수된 신고가 없습니다.</div>}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {suspend && (
        <Modal title="채널 정지" onClose={() => setSuspend(null)}
          footer={<><ModalBtn onClick={() => setSuspend(null)}>취소</ModalBtn>
            <ModalBtn tone="red" onClick={() => { notify(`${suspend.name} 채널을 ${susPeriod} 정지했습니다. 정지 중 방송 인증이 거부됩니다.`); setSuspend(null); }}>정지 실행</ModalBtn></>}>
          <p className="text-[13px] text-slate-600 mb-3"><b className="text-slate-800">{suspend.name}</b> 채널을 정지합니다. 정지 기간 동안 송출 인증이 거부됩니다.</p>
          <div className="border rounded p-3 mb-3" style={{ borderColor: AD.border }}>
            <div className="text-[13px] font-bold text-slate-700 mb-2">정지 기간</div>
            {['1일', '7일', '30일', '영구'].map((p) => <RadioOpt key={p} label={p} checked={susPeriod === p} onChange={() => setSusPeriod(p)} />)}
            {susPeriod === '영구' && <p className="mt-2 text-[12px] text-red-600">영구 정지는 슈퍼관리자 권한이 필요합니다.</p>}
          </div>
          <div className="text-[13px] font-bold text-slate-700 mb-1.5">사유</div>
          <textarea className={`${inputCls} w-full h-20 resize-none`} placeholder="크리에이터에게 통지될 사유를 입력하세요" value={susReason} onChange={(e) => setSusReason(e.target.value)} />
        </Modal>
      )}
    </>
  );
}

/* ══════════ ③ 방송 회차 관리 ══════════ */
export function SessionAdmin({ notify }: ScreenProps) {
  const [from, setFrom] = useState('2026-09-01');
  const [to, setTo] = useState('2026-09-16');
  const [ch, setCh] = useState('');
  const [reason, setReason] = useState<Record<string, boolean>>({ 정상: true, 타임아웃: true, 강제: true });
  const [q, setQ] = useState({ from: '2026-09-01', to: '2026-09-16', ch: '', reason: { 정상: true, 타임아웃: true, 강제: true } as Record<string, boolean> });
  const [detail, setDetail] = useState<SessionRow | null>(null);
  const [edit, setEdit] = useState<SessionRow | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const rows: SessionRow[] = useMemo(() => SESSIONS.filter((s) => q.reason[s.endReason])
    .filter((s) => !q.ch || s.channel.includes(q.ch) || s.cid.includes(q.ch))
    .filter((s) => s.start.slice(0, 10) >= q.from && s.start.slice(0, 10) <= q.to), [q]);
  const pg = usePaged(rows);

  return (
    <>
      <PageHead title="방송 회차 관리" desc="종료된 회차의 이력과 송출 품질을 조회합니다. 일시중단 구간 이력은 재접속 유예 정책값 조정의 근거가 됩니다." />
      <Card>
        <FilterTable rows={[
          { label: '기간', content: (
            <div className="flex items-center gap-2">
              <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
              <span className="text-slate-400">~</span>
              <input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
            </div>) },
          { label: '채널', content: <input className={`${inputCls} w-80`} placeholder="채널명 또는 CID" value={ch} onChange={(e) => setCh(e.target.value)} /> },
          { label: '종료 사유', content: (<>{(['정상', '타임아웃', '강제'] as const).map((r) => (
            <Check key={r} label={r} checked={reason[r]} onChange={() => setReason({ ...reason, [r]: !reason[r] })} />))}</>) },
        ]} />
        <SearchButton onClick={() => { setQ({ from, to, ch, reason }); pg.setPage(1); }} />
        <TableTools>
          <span className="mr-auto text-[13px] text-slate-500">총 <b className="text-slate-800">{fmt(rows.length)}</b>건</span>
          <OutlineButton onClick={() => notify('회차 목록을 CSV로 내려받았습니다.')}>CSV 내보내기</OutlineButton>
        </TableTools>
        <DataTable head={['회차 ID', '채널', '방송 제목', '시작', '종료', '방송 시간', '최고 시청자', '평균 시청자', '일시중단', '종료 사유', '관리']} empty={rows.length === 0}>
          {pg.rows.map((s) => (
            <tr key={s.id}>
              <Td><LinkCell onClick={() => setDetail(s)}>{s.id}</LinkCell></Td>
              <Td>{s.channel}<div className="text-[11px] text-slate-400">{s.cid}</div></Td>
              <Td className="max-w-[220px] truncate">{s.title}</Td>
              <Td center>{s.start}</Td>
              <Td center>{s.end}</Td>
              <Td center>{dur(s.minutes)}</Td>
              <Td center>{fmt(s.peak)}</Td>
              <Td center>{fmt(s.avg)}</Td>
              <Td center>{s.suspends.length === 0 ? '—' : <b className="text-amber-700">{s.suspends.length}회</b>}</Td>
              <Td center><Badge tone={s.endReason === '정상' ? 'green' : s.endReason === '타임아웃' ? 'amber' : 'red'}>{s.endReason}</Badge></Td>
              <Td center>
                <div className="flex gap-1 justify-center">
                  <Pill tone="blue" onClick={() => setDetail(s)}>상세</Pill>
                  <Pill tone="gray" onClick={() => { setEdit(s); setEditTitle(s.title); }}>메타 수정</Pill>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
        <Pagination page={pg.page} total={pg.total} onChange={pg.setPage} />
      </Card>

      {detail && (
        <Modal wide title={`회차 상세 — ${detail.id}`} onClose={() => setDetail(null)} footer={<ModalBtn onClick={() => setDetail(null)}>닫기</ModalBtn>}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <InfoTable rows={[
              ['채널', `${detail.channel} (${detail.cid})`], ['방송 제목', detail.title], ['카테고리', detail.category],
              ['시작 · 종료', `${detail.start} ~ ${detail.end}`], ['총 방송 시간', dur(detail.minutes)],
              ['최고 · 평균 시청자', `${fmt(detail.peak)}명 · ${fmt(detail.avg)}명`],
              ['종료 사유', <Badge tone={detail.endReason === '정상' ? 'green' : detail.endReason === '타임아웃' ? 'amber' : 'red'}>{detail.endReason}</Badge>],
            ]} />
            <div>
              <h4 className="text-[13px] font-bold text-slate-700 mb-1.5">일시중단 구간 이력 · 유예 90초</h4>
              <div className="border rounded" style={{ borderColor: AD.border }}>
                {detail.suspends.length === 0 ? <div className="px-3 py-6 text-[12px] text-slate-400 text-center">일시중단 구간이 없습니다.</div> : (
                  <table className="w-full">
                    <tbody className="divide-y" style={{ borderColor: AD.border }}>
                      {detail.suspends.map((s, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-[12.5px] text-slate-600">{s.at}</td>
                          <td className="px-3 py-2 text-[12.5px]">
                            <span className={s.sec > 90 ? 'text-red-600 font-bold' : 'text-slate-700'}>{s.sec}초</span>
                            <span className="text-slate-400"> / 90초</span>
                          </td>
                          <td className="px-3 py-2 text-right">{s.rejoined ? <Badge tone="green">재접속 성공</Badge> : <Badge tone="red">재접속 실패</Badge>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>)}
              </div>
            </div>
          </div>
          <h4 className="text-[13px] font-bold text-slate-700 mb-1.5">송출 품질 이력 — 비트레이트 (kbps)</h4>
          <div className="border rounded p-3 mb-4" style={{ borderColor: AD.border }}>
            <Bars data={detail.quality.map((q) => q.bitrate)} labels={detail.quality.map((q, i) => (i % 4 === 0 ? q.t : ''))} />
          </div>
          <h4 className="text-[13px] font-bold text-slate-700 mb-1.5">방송 정보 변경 이력</h4>
          <div className="border rounded divide-y" style={{ borderColor: AD.border }}>
            {detail.infoChanges.length === 0 ? <div className="px-3 py-4 text-[12px] text-slate-400 text-center">변경 이력이 없습니다.</div>
              : detail.infoChanges.map((c, i) => (
                <div key={i} className="px-3 py-2 text-[12.5px] flex items-center gap-2">
                  <span className="text-slate-400 w-12">{c.at}</span><Badge tone="blue">{c.field}</Badge>
                  <span className="text-slate-500 line-through">{c.before}</span><span className="text-slate-400">→</span><b className="text-slate-700">{c.after}</b>
                </div>))}
          </div>
        </Modal>
      )}

      {edit && (
        <Modal title="회차 메타 수정" onClose={() => setEdit(null)}
          footer={<><ModalBtn onClick={() => setEdit(null)}>취소</ModalBtn>
            <ModalBtn tone="blue" onClick={() => { notify(`${edit.id} 회차 메타를 수정했습니다. 감사 로그에 기록됩니다.`); setEdit(null); }}>저장</ModalBtn></>}>
          <p className="text-[13px] text-slate-600 mb-3">부적절한 제목 · 썸네일을 운영자가 직접 수정합니다. 수정 내역은 감사 로그에 남습니다.</p>
          <div className="space-y-3">
            <div><div className="text-[13px] font-bold text-slate-700 mb-1">방송 제목</div>
              <input className={`${inputCls} w-full`} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div>
            <div><div className="text-[13px] font-bold text-slate-700 mb-1">썸네일</div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-18 aspect-video rounded bg-slate-200" />
                <OutlineButton onClick={() => notify('기본 썸네일로 교체했습니다.')}>기본 썸네일로 교체</OutlineButton>
              </div></div>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ══════════ ④ 신고 처리 ══════════ */
export function ReportAdmin({ notify }: ScreenProps) {
  const [kind, setKind] = useState('전체');
  const [state, setState] = useState<Record<string, boolean>>({ 미처리: true, 처리중: true, 완료: false });
  const [sort, setSort] = useState('우선순위');
  const [q, setQ] = useState({ kind: '전체', state: { 미처리: true, 처리중: true, 완료: false } as Record<string, boolean>, sort: '우선순위' });
  const [act, setAct] = useState<ReportRow | null>(null);
  const [action, setAction] = useState('경고');
  const [memo, setMemo] = useState('');

  const rows: ReportRow[] = useMemo(() => {
    const f = REPORTS.filter((r) => q.state[r.state]).filter((r) => q.kind === '전체' || r.kind === q.kind);
    return [...f].sort((a, b) => q.sort === '우선순위'
      ? (b.stacked * b.weight) - (a.stacked * a.weight)
      : b.at.localeCompare(a.at));
  }, [q]);
  const pg = usePaged(rows);
  const pending = REPORTS.filter((r) => r.state === '미처리').length;

  return (
    <>
      <PageHead title="신고 처리" desc="방송 · 채팅 신고를 접수하고 조치합니다. 동일 대상 누적 수와 유형 가중치로 우선순위가 정해집니다." />
      <Tiles items={[
        { label: '미처리', value: fmt(pending), sub: '즉시 확인 필요', tone: 'red' },
        { label: '처리중', value: fmt(REPORTS.filter((r) => r.state === '처리중').length), tone: 'amber' },
        { label: '오늘 완료', value: fmt(REPORTS.filter((r) => r.state === '완료').length), tone: 'blue' },
        { label: '중대 위반 신고', value: fmt(REPORTS.filter((r) => r.weight >= 5).length), sub: '단계 무시 · 즉시 조치 대상', tone: 'red' },
      ]} />
      <Card>
        <FilterTable rows={[
          { label: '신고 구분', content: (<>{['전체', '방송', '채팅'].map((k) => <RadioOpt key={k} label={k} checked={kind === k} onChange={() => setKind(k)} />)}</>) },
          { label: '처리 상태', content: (<>{(['미처리', '처리중', '완료'] as const).map((s) => (
            <Check key={s} label={s} checked={state[s]} onChange={() => setState({ ...state, [s]: !state[s] })} />))}</>) },
          { label: '정렬', content: (<>{['우선순위', '접수 시각'].map((s) => <RadioOpt key={s} label={s} checked={sort === s} onChange={() => setSort(s)} />)}</>) },
        ]} />
        <SearchButton onClick={() => { setQ({ kind, state, sort }); pg.setPage(1); }} />
        <TableTools><span className="mr-auto text-[13px] text-slate-500">총 <b className="text-slate-800">{fmt(rows.length)}</b>건</span></TableTools>
        <DataTable head={['우선순위', '구분', '대상', '채널', '유형', '사유', '신고자', '접수 시각', '증거', '상태', '조치']} empty={rows.length === 0}>
          {pg.rows.map((r) => {
            const score = r.stacked * r.weight;
            return (
              <tr key={r.id} className={score >= 30 ? 'bg-red-50/60' : score >= 12 ? 'bg-amber-50/50' : ''}>
                <Td center>
                  <b className={score >= 30 ? 'text-red-600' : score >= 12 ? 'text-amber-700' : 'text-slate-600'}>{score}</b>
                  <div className="text-[11px] text-slate-400">누적 {r.stacked} × 가중 {r.weight}</div>
                </Td>
                <Td center><Badge tone={r.kind === '방송' ? 'blue' : 'slate'}>{r.kind}</Badge></Td>
                <Td center><code className="text-[11px]">{r.target}</code></Td>
                <Td>{r.channel}<div className="text-[11px] text-slate-400">{r.cid}</div></Td>
                <Td center>{r.type}</Td>
                <Td className="max-w-[200px] truncate">{r.reason}</Td>
                <Td center>{r.reporter}</Td>
                <Td center>{r.at}</Td>
                <Td center><LinkCell onClick={() => notify(`${r.evidence}을(를) 열었습니다.`)}>{r.evidence}</LinkCell></Td>
                <Td center><Badge tone={r.state === '미처리' ? 'red' : r.state === '처리중' ? 'amber' : 'green'}>{r.state}</Badge>
                  {r.action && <div className="text-[11px] text-slate-500 mt-0.5">{r.action}</div>}</Td>
                <Td center>
                  {r.state === '완료'
                    ? <span className="text-[11px] text-slate-400">{r.handler} · {r.handledAt}</span>
                    : <Pill tone="pink" onClick={() => { setAct(r); setAction('경고'); setMemo(''); }}>조치</Pill>}
                </Td>
              </tr>
            );
          })}
        </DataTable>
        <Pagination page={pg.page} total={pg.total} onChange={pg.setPage} />
      </Card>

      {act && (
        <Modal wide title={`신고 조치 — ${act.id}`} onClose={() => setAct(null)}
          footer={<><ModalBtn onClick={() => setAct(null)}>취소</ModalBtn>
            <ModalBtn tone="blue" onClick={() => { notify(`${act.channel}에 '${action}' 조치를 적용했습니다. 제재 이력에 누적되고 크리에이터에게 통지됩니다.`); setAct(null); }}>조치 실행</ModalBtn></>}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <InfoTable rows={[
                ['신고 구분', act.kind], ['대상', act.target], ['채널', `${act.channel} (${act.cid})`],
                ['유형 · 가중치', `${act.type} (가중 ${act.weight})`], ['누적 신고', `${act.stacked}건`],
                ['신고자', act.reporter], ['접수 시각', act.at], ['사유', act.reason], ['증거', act.evidence],
              ]} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-700 mb-2">조치 선택</div>
              <div className="border rounded p-3 mb-3 space-y-1" style={{ borderColor: AD.border }}>
                {['경고', '채팅 제한 (24시간)', '채널 정지 (7일)', '채널 정지 (30일)', '영구 정지', '강제 종료', '기각'].map((a) => (
                  <div key={a}><RadioOpt label={a} checked={action === a} onChange={() => setAction(a)} /></div>
                ))}
              </div>
              <div className="text-[13px] font-bold text-slate-700 mb-1">처리 메모</div>
              <textarea className={`${inputCls} w-full h-16 resize-none`} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="조치 사유 · 판단 근거" />
              <div className="mt-3 border rounded overflow-hidden" style={{ borderColor: AD.border }}>
                <div className="px-3 py-1.5 text-[12px] font-bold text-slate-700" style={{ background: '#eaf0fa' }}>조치 단계 (안) — 이 채널 현재 {act.stacked >= 5 ? 5 : act.stacked}단계</div>
                <table className="w-full">
                  <tbody>
                    {ESCALATION.map((e) => (
                      <tr key={e.step} className={e.step === Math.min(5, act.stacked) ? 'bg-blue-50' : ''}>
                        <td className="px-3 py-1.5 text-[12px] text-slate-500 w-10">{e.step}회</td>
                        <td className="px-3 py-1.5 text-[12px] font-bold text-slate-700">{e.action}</td>
                        <td className="px-3 py-1.5 text-[12px] text-slate-400 text-right">{e.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[12px] text-slate-500">※ 중대 위반은 단계를 무시하고 즉시 강제 종료 + 정지가 가능합니다.</p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ══════════ ⑤ 채팅 관리 ══════════ */
export function ChatAdmin({ notify }: ScreenProps) {
  const [tab, setTab] = useState<'log' | 'banned' | 'spam'>('log');
  const [kw, setKw] = useState('');
  const [ch, setCh] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(true);
  const [q, setQ] = useState({ kw: '', ch: '', includeDeleted: true });
  const [deleted, setDeleted] = useState<Record<string, boolean>>({});
  const [words, setWords] = useState(BANNED_WORDS);
  const [newWord, setNewWord] = useState('');
  const [restrict, setRestrict] = useState<{ user: string; id: string } | null>(null);
  const [period, setPeriod] = useState('24시간');

  const rows: ChatLogRow[] = useMemo(() => CHAT_LOGS
    .filter((m) => q.includeDeleted || !m.deleted)
    .filter((m) => !q.kw || m.message.includes(q.kw) || m.user.includes(q.kw) || m.userId.includes(q.kw))
    .filter((m) => !q.ch || m.channel.includes(q.ch) || m.cid.includes(q.ch)), [q]);
  const pg = usePaged(rows);

  return (
    <>
      <PageHead title="채팅 관리" desc="회차 · 사용자 · 키워드로 채팅 로그를 조회하고, 서비스 단위 채팅 제한과 공통 금칙어를 관리합니다." />
      <Tabs value={tab} onChange={(v) => setTab(v as typeof tab)} items={[['log', '채팅 로그'], ['banned', '금칙어 사전'], ['spam', '스팸 감지']]} />
      {tab === 'log' && (
        <Card>
          <FilterTable rows={[
            { label: '채널 · 회차', content: <input className={`${inputCls} w-80`} placeholder="채널명 또는 CID" value={ch} onChange={(e) => setCh(e.target.value)} /> },
            { label: '키워드 · 사용자', content: <input className={`${inputCls} w-80`} placeholder="메시지 내용 · 닉네임 · 사용자 ID" value={kw} onChange={(e) => setKw(e.target.value)} /> },
            { label: '삭제 메시지', content: <Check label="삭제된 메시지 포함" checked={includeDeleted} onChange={() => setIncludeDeleted(!includeDeleted)} /> },
          ]} />
          <SearchButton onClick={() => { setQ({ kw, ch, includeDeleted }); pg.setPage(1); }} />
          <TableTools><span className="mr-auto text-[13px] text-slate-500">총 <b className="text-slate-800">{fmt(rows.length)}</b>건</span></TableTools>
          <DataTable head={['시각', '채널', '사용자', '메시지', '감지', '상태', '관리']} empty={rows.length === 0}>
            {pg.rows.map((m) => {
              const gone = m.deleted || deleted[m.id];
              return (
                <tr key={m.id} className={gone ? 'bg-slate-50' : ''}>
                  <Td center>{m.at}</Td>
                  <Td>{m.channel}<div className="text-[11px] text-slate-400">{m.cid}</div></Td>
                  <Td>{m.user}<div className="text-[11px] text-slate-400">{m.userId}</div></Td>
                  <Td className={gone ? 'text-slate-400 line-through' : ''}>{m.message}</Td>
                  <Td center>{m.flagged ? <Badge tone="amber">{m.flagged}</Badge> : <span className="text-slate-400">—</span>}</Td>
                  <Td center>{gone ? <Badge tone="slate">삭제됨</Badge> : <Badge tone="green">노출 중</Badge>}</Td>
                  <Td center>
                    <div className="flex gap-1 justify-center">
                      <Pill tone="gray" disabled={gone} onClick={() => { setDeleted({ ...deleted, [m.id]: true }); notify('메시지를 삭제했습니다. 시청자 화면에서 즉시 제거됩니다.'); }}>삭제</Pill>
                      <Pill tone="pink" onClick={() => { setRestrict({ user: m.user, id: m.userId }); setPeriod('24시간'); }}>채팅 제한</Pill>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </DataTable>
          <Pagination page={pg.page} total={pg.total} onChange={pg.setPage} />
        </Card>
      )}
      {tab === 'banned' && (
        <Card>
          <p className="text-[13px] text-slate-500 mb-3">서비스 공통 금칙어입니다. 크리에이터가 채널별로 등록하는 금칙어와는 별개로 적용됩니다.</p>
          <div className="flex items-center gap-2 mb-4">
            <input className={`${inputCls} w-64`} placeholder="금칙어 입력" value={newWord} onChange={(e) => setNewWord(e.target.value)} />
            <ModalBtn tone="blue" onClick={() => { if (!newWord.trim()) return; setWords([newWord.trim(), ...words]); setNewWord(''); notify('금칙어를 등록했습니다.'); }}>등록</ModalBtn>
          </div>
          <DataTable head={[{ t: 'No', w: '60px' }, '금칙어', '등록일', { t: '관리', w: '120px' }]}>
            {words.map((w, i) => (
              <tr key={w}>
                <Td center>{words.length - i}</Td><Td>{w}</Td><Td center>2026-09-{String(16 - (i % 9)).padStart(2, '0')}</Td>
                <Td center><Pill tone="gray" onClick={() => { setWords(words.filter((x) => x !== w)); notify('금칙어를 삭제했습니다.'); }}>삭제</Pill></Td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
      {tab === 'spam' && (
        <Card>
          <p className="text-[13px] text-slate-500 mb-3">반복 메시지 · 도배를 자동 감지해 알람만 표시합니다. 자동 조치는 2단계에서 도입 예정입니다.</p>
          <DataTable head={['감지 시각', '채널', '사용자', '감지 유형', '반복 횟수', '샘플 메시지', '관리']}>
            {CHAT_LOGS.filter((m) => m.flagged).map((m) => (
              <tr key={m.id}>
                <Td center>{m.at}</Td><Td>{m.channel}</Td><Td>{m.user}<div className="text-[11px] text-slate-400">{m.userId}</div></Td>
                <Td center><Badge tone="amber">{m.flagged}</Badge></Td><Td center>{7 + (m.id.length % 9)}회</Td>
                <Td className="max-w-[240px] truncate">{m.message}</Td>
                <Td center><Pill tone="pink" onClick={() => { setRestrict({ user: m.user, id: m.userId }); setPeriod('24시간'); }}>채팅 제한</Pill></Td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
      {restrict && (
        <Modal title="서비스 단위 채팅 제한" onClose={() => setRestrict(null)}
          footer={<><ModalBtn onClick={() => setRestrict(null)}>취소</ModalBtn>
            <ModalBtn tone="red" onClick={() => { notify(`${restrict.user} 사용자의 채팅을 ${period} 제한했습니다.`); setRestrict(null); }}>제한 적용</ModalBtn></>}>
          <p className="text-[13px] text-slate-600 mb-3">
            <b className="text-slate-800">{restrict.user}</b>({restrict.id})의 채팅을 <b>서비스 전체</b>에서 제한합니다.
            채널 단위 제한은 크리에이터 권한이며 여기서 다루지 않습니다.
          </p>
          <div className="border rounded p-3" style={{ borderColor: AD.border }}>
            <div className="text-[13px] font-bold text-slate-700 mb-2">제한 기간</div>
            {['30초', '10분', '24시간', '7일', '영구'].map((p) => <RadioOpt key={p} label={p} checked={period === p} onChange={() => setPeriod(p)} />)}
          </div>
        </Modal>
      )}
    </>
  );
}

function Tabs({ value, onChange, items }: { value: string; onChange: (v: string) => void; items: [string, string][] }) {
  return (
    <div className="flex gap-1 mb-3">
      {items.map(([k, label]) => (
        <button key={k} onClick={() => onChange(k)}
          className={`px-4 py-2 text-[13px] font-bold rounded-t-[4px] border border-b-0 ${value === k ? 'text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          style={value === k ? { background: AD.thead, borderColor: AD.thead } : { borderColor: AD.border }}>{label}</button>
      ))}
    </div>
  );
}

/* ══════════ ⑥ 카테고리 · 태그 관리 ══════════ */
export function CategoryAdmin({ notify }: ScreenProps) {
  const [cats, setCats] = useState(CATEGORIES);
  const [name, setName] = useState('');
  const move = (i: number, d: -1 | 1) => {
    const n = [...cats]; const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    setCats(n.map((c, k) => ({ ...c, order: k + 1 })));
  };
  return (
    <>
      <PageHead title="카테고리 · 태그 관리" desc="시청 화면에 노출되는 카테고리 체계와 태그를 관리합니다. 노출 순서는 위아래 버튼으로 조정합니다." />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-[15px] font-bold text-slate-800 mb-3">카테고리</h3>
          <div className="flex items-center gap-2 mb-3">
            <input className={`${inputCls} w-52`} placeholder="카테고리명" value={name} onChange={(e) => setName(e.target.value)} />
            <ModalBtn tone="blue" onClick={() => { if (!name.trim()) return; setCats([...cats, { id: `cat_${cats.length + 1}`, name: name.trim(), order: cats.length + 1, visible: true, lives: 0, icon: '🆕' }]); setName(''); notify('카테고리를 등록했습니다.'); }}>등록</ModalBtn>
          </div>
          <DataTable head={[{ t: '순서', w: '110px' }, '대표 이미지', '카테고리', '진행 방송', '노출', { t: '관리', w: '100px' }]}>
            {cats.map((c, i) => (
              <tr key={c.id}>
                <Td center>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-slate-500 w-4">{c.order}</span>
                    <button onClick={() => move(i, -1)} className="w-6 h-6 border border-slate-300 rounded-[3px] bg-white text-slate-500 hover:bg-slate-50 text-[11px]" aria-label="위로">▲</button>
                    <button onClick={() => move(i, 1)} className="w-6 h-6 border border-slate-300 rounded-[3px] bg-white text-slate-500 hover:bg-slate-50 text-[11px]" aria-label="아래로">▼</button>
                  </div>
                </Td>
                <Td center><span className="text-[18px]">{c.icon}</span></Td>
                <Td>{c.name}</Td>
                <Td center>{c.lives}</Td>
                <Td center>{c.visible ? <Badge tone="green">노출</Badge> : <Badge tone="slate">숨김</Badge>}</Td>
                <Td center><Pill tone="gray" onClick={() => { setCats(cats.map((x) => (x.id === c.id ? { ...x, visible: !x.visible } : x))); notify(c.visible ? '카테고리를 숨겼습니다.' : '카테고리를 노출합니다.'); }}>{c.visible ? '숨김' : '노출'}</Pill></Td>
              </tr>
            ))}
          </DataTable>
        </Card>
        <Card>
          <h3 className="text-[15px] font-bold text-slate-800 mb-3">태그</h3>
          <p className="text-[12px] text-slate-500 mb-3">사용 빈도가 높은 순으로 표시됩니다. 금지 태그는 방송 정보 입력 시 거부됩니다.</p>
          <DataTable head={['태그', '사용 횟수', '상태', { t: '관리', w: '120px' }]}>
            {[...TAGS].sort((a, b) => b.uses - a.uses).map((t) => (
              <tr key={t.name}>
                <Td>#{t.name}</Td><Td center>{fmt(t.uses)}</Td>
                <Td center>{t.banned ? <Badge tone="red">금지</Badge> : <Badge tone="green">사용 가능</Badge>}</Td>
                <Td center><Pill tone={t.banned ? 'gray' : 'pink'} onClick={() => notify(t.banned ? `#${t.name} 금지를 해제했습니다.` : `#${t.name}을(를) 금지 태그로 등록했습니다.`)}>{t.banned ? '금지 해제' : '금지 등록'}</Pill></Td>
              </tr>
            ))}
          </DataTable>
        </Card>
      </div>
    </>
  );
}

/* ══════════ ⑦ 인프라 대시보드 ══════════ */
function Panel({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[4px] border" style={{ borderColor: AD.border }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: AD.border, background: '#f6f8fc' }}>
        <h3 className="text-[13px] font-bold text-slate-700">{title}</h3>{right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
function KV({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="space-y-2">
      {rows.map(([k, v], i) => (
        <div key={i} className="flex items-center justify-between text-[13px]">
          <dt className="text-slate-500">{k}</dt><dd className="font-bold text-slate-800">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
function Distribution({ rows, color = '#4a7fd4' }: { rows: [string, number][]; color?: string }) {
  return (
    <div className="space-y-2">
      {rows.map(([label, pct]) => (
        <div key={label}>
          <div className="flex justify-between text-[12px] mb-0.5"><span className="text-slate-600">{label}</span><span className="font-bold text-slate-700">{pct}%</span></div>
          <div className="h-2 rounded bg-slate-100 overflow-hidden"><div className="h-full rounded" style={{ width: `${pct}%`, background: color }} /></div>
        </div>
      ))}
    </div>
  );
}
export function InfraDashboard({ notify }: ScreenProps) {
  return (
    <>
      <PageHead title="인프라 대시보드" desc="원가에 직결되는 동시 방송 수 · 동시 시청자 수 · 그리드 분산 전송 비율을 중심으로 서비스 상태를 확인합니다." />
      <Tiles items={[
        { label: '동시 방송 수', value: fmt(INFRA.liveCount), sub: '전일 대비 +3', tone: 'blue' },
        { label: '동시 시청자 수', value: fmt(INFRA.viewers), sub: '전일 대비 +12%', tone: 'blue' },
        { label: '그리드 분산 전송 비율', value: `${INFRA.gridRatio}%`, sub: '임계값 60% 이상 유지', tone: INFRA.gridRatio < 60 ? 'red' : 'blue' },
        { label: '활성 알람', value: fmt(INFRA.alerts.length), sub: '임계값 초과 항목', tone: 'amber' },
      ]} />
      <div className="mb-4 bg-white rounded-[4px] border" style={{ borderColor: AD.border }}>
        <div className="px-4 py-2.5 border-b text-[13px] font-bold text-slate-700" style={{ borderColor: AD.border, background: '#f6f8fc' }}>알람</div>
        <div className="divide-y" style={{ borderColor: AD.border }}>
          {INFRA.alerts.map((a, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center gap-2 text-[13px]">
              <Badge tone={a.level === '경고' ? 'red' : 'amber'}>{a.level}</Badge>
              <span className="text-slate-700">{a.msg}</span>
              <span className="ml-auto text-slate-400 text-[12px]">{a.at}</span>
              <Pill tone="gray" onClick={() => notify('운영 정책 설정에서 임계값을 조정할 수 있습니다.')}>임계값 조정</Pill>
            </div>
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="방송 수신">
          <KV rows={[['활성 연결 수', fmt(INFRA.ingest.active)], ['인증 실패 수', <span className={INFRA.ingest.authFail > 0 ? 'text-amber-700' : ''}>{fmt(INFRA.ingest.authFail)}</span>], ['연결 끊김 수', fmt(INFRA.ingest.dropped)]]} />
        </Panel>
        <Panel title="트랜스코딩">
          <KV rows={[['처리 중 채널', fmt(INFRA.transcode.channels)], ['대기 큐', fmt(INFRA.transcode.queue)], ['실패 건수', fmt(INFRA.transcode.failed)], ['서버 부하', `${INFRA.transcode.load}%`]]} />
          <div className="mt-3 h-2 rounded bg-slate-100 overflow-hidden"><div className="h-full rounded" style={{ width: `${INFRA.transcode.load}%`, background: INFRA.transcode.load > 80 ? '#d33c3c' : '#4a7fd4' }} /></div>
        </Panel>
        <Panel title="CDN">
          <KV rows={[['전송량', INFRA.cdn.traffic], ['오류율', `${INFRA.cdn.errorRate}%`]]} />
          <div className="mt-3 text-[12px] text-slate-500 mb-1.5">지역별 분포</div>
          <Distribution rows={INFRA.cdn.regions} />
        </Panel>
        <Panel title="그리드" right={<span className="text-[12px] text-slate-500">활성 피어 {fmt(INFRA.grid.peers)}</span>}>
          <div className="text-[12px] text-slate-500 mb-1">분산 전송 비율 추이 (최근 12시간)</div>
          <Bars data={INFRA.grid.ratioTrend} max={100} />
          <div className="mt-3"><KV rows={[['CDN 전환 발생 수', `${fmt(INFRA.grid.fallback)}건`]]} /></div>
        </Panel>
        <Panel title="재생 품질">
          <KV rows={[['버퍼링 발생률', `${INFRA.playback.buffering}%`], ['오류율', `${INFRA.playback.error}%`]]} />
          <div className="mt-3 text-[12px] text-slate-500 mb-1.5">화질 분포</div>
          <Distribution rows={INFRA.playback.quality} color="#20a58f" />
        </Panel>
        <Panel title="동시 시청자 추이">
          <Bars data={[18, 22, 26, 31, 38, 44, 48, 52, 49, 45, 41, 36]} color="#3b7dd8"
            labels={['12', '', '14', '', '16', '', '18', '', '20', '', '22', '']} />
          <p className="mt-2 text-[12px] text-slate-400">단위: 천 명 · 시간대(시)</p>
        </Panel>
      </div>
    </>
  );
}

/* ══════════ ⑧ 그리드 관리 ══════════ */
export function GridAdmin({ notify }: ScreenProps) {
  return (
    <>
      <PageHead title="그리드 관리" desc="그리드 클라이언트 설치 현황과 버전 분포를 관리하고, 분산 전송 이슈가 잦은 채널을 추적합니다." />
      <Tiles items={[
        { label: '누적 설치 수', value: fmt(GRID_INSTALLS.total), tone: 'slate' },
        { label: '현재 활성 피어', value: fmt(GRID_INSTALLS.active), tone: 'blue' },
        { label: '분산 전송 비율', value: `${INFRA.gridRatio}%`, tone: 'blue' },
        { label: 'CDN 전환 발생', value: `${fmt(INFRA.grid.fallback)}건`, sub: '최근 1시간', tone: 'amber' },
      ]} />
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Panel title="OS 분포"><Distribution rows={GRID_INSTALLS.os} /></Panel>
        <Panel title="버전 관리">
          <DataTable head={['버전', '점유율', '상태', { t: '관리', w: '180px' }]}>
            {GRID_VERSIONS.map((v) => (
              <tr key={v.v}>
                <Td center>{v.v}</Td><Td center>{v.share}%</Td>
                <Td center><Badge tone={v.status === '최신' ? 'green' : v.status === '지원' ? 'blue' : v.status === '지원 종료 예정' ? 'amber' : 'red'}>{v.status}</Badge></Td>
                <Td center>
                  <div className="flex gap-1 justify-center">
                    <Pill tone="blue" onClick={() => notify(`${v.v} 사용자에게 강제 업데이트를 배포했습니다.`)}>강제 업데이트</Pill>
                    <Pill tone="gray" onClick={() => notify(`${v.v}으로 롤백을 예약했습니다.`)}>롤백</Pill>
                  </div>
                </Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
      <Card>
        <h3 className="text-[15px] font-bold text-slate-800 mb-3">이슈 추적 — 폴백 발생 상위 채널</h3>
        <DataTable head={['채널', 'CDN 폴백 발생', '사용자 신고 (끊김 · 과점유)', '조치']}>
          {GRID_ISSUES.map((g) => (
            <tr key={g.channel}>
              <Td>{g.channel}</Td>
              <Td center><b className={g.fallback > 50 ? 'text-red-600' : 'text-slate-700'}>{g.fallback}건</b></Td>
              <Td center>{g.complaints}건</Td>
              <Td center><Pill tone="gray" onClick={() => notify(`${g.channel} 채널을 그리드 제외 대상으로 지정했습니다.`)}>그리드 제외</Pill></Td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </>
  );
}

/* ══════════ ⑨ 운영 정책 설정 ══════════ */
export function PolicyAdmin({ notify }: ScreenProps) {
  const [vals, setVals] = useState<Record<string, string>>(Object.fromEntries(POLICIES.map((p) => [p.key, p.value])));
  const [draft, setDraft] = useState<Record<string, string>>(Object.fromEntries(POLICIES.map((p) => [p.key, p.value])));
  const [confirm, setConfirm] = useState<Policy | null>(null);
  const dirty = POLICIES.filter((p) => draft[p.key] !== vals[p.key]);

  return (
    <>
      <PageHead title="운영 정책 설정" desc="배포 없이 운영 중 조정할 수 있는 값입니다. 변경은 슈퍼관리자만 가능하며 이전값 → 신규값이 감사 로그에 기록됩니다." />
      <Card>
        <div className="flex items-center gap-2 mb-3 text-[12.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          <b>슈퍼관리자 전용</b><span>변경 시 누가 · 언제 · 이전값 → 신규값이 감사 로그에 남습니다. 적용 시점은 항목별로 다릅니다.</span>
        </div>
        <DataTable head={['정책값', '현재값', '변경값', '단위', '적용 시점', '근거 문서', { t: '관리', w: '110px' }]}>
          {POLICIES.map((p) => {
            const changed = draft[p.key] !== vals[p.key];
            return (
              <tr key={p.key} className={changed ? 'bg-blue-50/60' : ''}>
                <Td>{p.label}</Td>
                <Td center><b className="text-slate-800">{vals[p.key]}</b></Td>
                <Td center>
                  {p.options
                    ? <Select value={draft[p.key]} onChange={(v) => setDraft({ ...draft, [p.key]: v })} options={p.options} />
                    : <input className={`${inputCls} w-40 text-center`} value={draft[p.key]} onChange={(e) => setDraft({ ...draft, [p.key]: e.target.value })} />}
                </Td>
                <Td center>{p.unit || '—'}</Td>
                <Td center><Badge tone={p.apply === '즉시' ? 'red' : 'blue'}>{p.apply}</Badge></Td>
                <Td center className="text-slate-400">{p.doc}</Td>
                <Td center><Pill tone="blue" disabled={!changed} onClick={() => setConfirm(p)}>변경</Pill></Td>
              </tr>
            );
          })}
        </DataTable>
        <div className="flex items-center justify-end gap-2 mt-4">
          <span className="mr-auto text-[13px] text-slate-500">{dirty.length > 0 ? <>변경 대기 <b className="text-blue-700">{dirty.length}</b>건</> : '변경된 항목이 없습니다.'}</span>
          <OutlineButton onClick={() => setDraft({ ...vals })}>되돌리기</OutlineButton>
          <ModalBtn tone="blue" onClick={() => { if (!dirty.length) return; setVals({ ...draft }); notify(`정책값 ${dirty.length}건을 변경했습니다. 감사 로그에 기록됩니다.`); }}>일괄 저장</ModalBtn>
        </div>
      </Card>
      {confirm && (
        <Modal title="정책값 변경 확인" onClose={() => setConfirm(null)}
          footer={<><ModalBtn onClick={() => setConfirm(null)}>취소</ModalBtn>
            <ModalBtn tone="blue" onClick={() => { setVals({ ...vals, [confirm.key]: draft[confirm.key] }); notify(`${confirm.label}: ${vals[confirm.key]} → ${draft[confirm.key]} 변경 완료`); setConfirm(null); }}>변경 적용</ModalBtn></>}>
          <InfoTable rows={[
            ['정책값', confirm.label],
            ['이전값 → 신규값', <span><b className="text-slate-500">{vals[confirm.key]}{confirm.unit}</b> → <b className="text-blue-700">{draft[confirm.key]}{confirm.unit}</b></span>],
            ['적용 시점', confirm.apply], ['변경 권한', confirm.grade], ['근거 문서', confirm.doc],
          ]} />
        </Modal>
      )}
    </>
  );
}

/* ══════════ ⑩ 통계 ══════════ */
export function StatsAdmin({ notify }: ScreenProps) {
  const [unit, setUnit] = useState('일');
  const [rank, setRank] = useState<'viewers' | 'hours' | 'reports'>('viewers');
  const sorted = [...STAT_RANK].sort((a, b) => b[rank] - a[rank]);
  const sum = STAT_DAILY.reduce((a, d) => ({
    broadcasts: a.broadcasts + d.broadcasts, hours: a.hours + d.hours,
    uniqueViewers: Math.max(a.uniqueViewers, d.uniqueViewers), watchHours: a.watchHours + d.watchHours,
  }), { broadcasts: 0, hours: 0, uniqueViewers: 0, watchHours: 0 });

  const exportCsv = () => {
    const head = ['날짜', '방송 수', '총 방송 시간(시간)', '순 시청자', '총 시청 시간(시간)', '동시 방송 피크', '동시 시청자 피크'];
    const body = STAT_DAILY.map((d) => [d.date, d.broadcasts, d.hours, d.uniqueViewers, d.watchHours, d.peakLive, d.peakViewers].join(','));
    const blob = new Blob(['﻿' + [head.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    // 앵커를 DOM에 붙여야 download 속성(파일명)이 적용된다. 파일명은 ASCII로 둔다.
    const a = document.createElement('a');
    a.href = url; a.download = 'toonation-admin-stats_2026-09-03_2026-09-16.csv'; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    notify('통계를 CSV로 내려받았습니다.');
  };

  return (
    <>
      <PageHead title="통계" desc="일 · 주 · 월 단위 집계입니다. 지표 정의는 크리에이터용 방송 분석(⑥)과 동일하게 맞춰져 있습니다." />
      <Tiles items={[
        { label: '총 방송 수', value: fmt(sum.broadcasts), sub: '최근 14일', tone: 'blue' },
        { label: '총 방송 시간', value: `${fmt(sum.hours)}시간`, tone: 'slate' },
        { label: '일 최대 순 시청자', value: fmt(sum.uniqueViewers), tone: 'blue' },
        { label: '총 시청 시간', value: `${fmt(sum.watchHours)}시간`, tone: 'slate' },
      ]} />
      <Card className="mb-4">
        <FilterTable rows={[
          { label: '집계 단위', content: (<>{['일', '주', '월'].map((u) => <RadioOpt key={u} label={u} checked={unit === u} onChange={() => setUnit(u)} />)}</>) },
        ]} />
        <TableTools>
          <span className="mr-auto text-[13px] text-slate-500">기간 집계 — {unit} 단위</span>
          <OutlineButton onClick={exportCsv}>CSV 내보내기</OutlineButton>
        </TableTools>
        <div className="border rounded p-3 mb-3" style={{ borderColor: AD.border }}>
          <div className="text-[12px] text-slate-500 mb-2">동시 시청자 피크 추이</div>
          <Bars data={STAT_DAILY.map((d) => d.peakViewers)} labels={STAT_DAILY.map((d) => d.date.slice(5))} />
        </div>
        <DataTable head={['날짜', '방송 수', '총 방송 시간', '순 시청자', '총 시청 시간', '동시 방송 피크', '동시 시청자 피크']}>
          {STAT_DAILY.map((d) => (
            <tr key={d.date}>
              <Td center>{d.date}</Td><Td center>{fmt(d.broadcasts)}</Td><Td center>{fmt(d.hours)}시간</Td>
              <Td center>{fmt(d.uniqueViewers)}</Td><Td center>{fmt(d.watchHours)}시간</Td>
              <Td center>{fmt(d.peakLive)}</Td><Td center>{fmt(d.peakViewers)}</Td>
            </tr>
          ))}
        </DataTable>
      </Card>
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-[15px] font-bold text-slate-800 mr-auto">채널 순위</h3>
          {([['viewers', '시청자'], ['hours', '방송 시간'], ['reports', '신고 수']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setRank(k)}
              className={`px-3 py-1.5 text-[12.5px] font-bold rounded-[3px] border ${rank === k ? 'text-white border-transparent' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}
              style={rank === k ? { background: AD.thead } : undefined}>{l} 기준</button>
          ))}
        </div>
        <DataTable head={[{ t: '순위', w: '70px' }, '채널', 'CID', '누적 시청자', '방송 시간', '신고 수']}>
          {sorted.map((r, i) => (
            <tr key={r.cid}>
              <Td center><b className={i < 3 ? 'text-blue-700' : 'text-slate-600'}>{i + 1}</b></Td>
              <Td>{r.channel}</Td><Td center>{r.cid}</Td>
              <Td center>{fmt(r.viewers)}</Td><Td center>{fmt(r.hours)}시간</Td>
              <Td center>{r.reports > 10 ? <b className="text-red-600">{r.reports}</b> : r.reports}</Td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </>
  );
}

/* ══════════ ⑪ 공지 · 안내 ══════════ */
export function NoticeAdmin({ notify }: ScreenProps) {
  const [banners, setBanners] = useState(BANNERS);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('서버 점검으로 신규 방송 시작이 일시 중단됩니다. (02:00~04:00)');
  const [compose, setCompose] = useState(false);
  const [target, setTarget] = useState('전체 채널');
  const [title, setTitle] = useState('');

  return (
    <>
      <PageHead title="공지 · 안내" desc="시청 · 스튜디오 화면 상단 배너와 크리에이터 알림을 관리합니다. 점검 모드는 신규 방송 시작을 차단합니다." />
      <div className="mb-4 bg-white rounded-[4px] border p-4" style={{ borderColor: maintenance ? '#e8952f' : AD.border }}>
        <div className="flex items-center gap-3">
          <div className="mr-auto">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-slate-800">점검 모드</h3>
              {maintenance ? <Badge tone="amber">활성 — 신규 방송 차단 중</Badge> : <Badge tone="slate">비활성</Badge>}
            </div>
            <p className="text-[12.5px] text-slate-500 mt-1">활성화하면 신규 방송 시작이 차단되고 안내 문구가 노출됩니다. 진행 중인 방송은 유지됩니다.</p>
          </div>
          <ModalBtn tone={maintenance ? 'gray' : 'red'} onClick={() => { setMaintenance(!maintenance); notify(maintenance ? '점검 모드를 해제했습니다.' : '점검 모드를 활성화했습니다. 신규 방송 시작이 차단됩니다.'); }}>
            {maintenance ? '점검 모드 해제' : '점검 모드 활성화'}
          </ModalBtn>
        </div>
        <input className={`${inputCls} w-full mt-3`} value={maintenanceMsg} onChange={(e) => setMaintenanceMsg(e.target.value)} placeholder="점검 안내 문구" />
      </div>
      <Card className="mb-4">
        <h3 className="text-[15px] font-bold text-slate-800 mb-3">서비스 배너</h3>
        <DataTable head={['제목', '노출 영역', '기간', '상태', { t: '관리', w: '110px' }]}>
          {banners.map((b) => (
            <tr key={b.id}>
              <Td>{b.title}</Td><Td center>{b.scope}</Td><Td center>{b.from} ~ {b.to}</Td>
              <Td center>{b.on ? <Badge tone="green">노출 중</Badge> : <Badge tone="slate">중지</Badge>}</Td>
              <Td center><Pill tone="gray" onClick={() => { setBanners(banners.map((x) => (x.id === b.id ? { ...x, on: !x.on } : x))); notify(b.on ? '배너 노출을 중지했습니다.' : '배너를 노출합니다.'); }}>{b.on ? '중지' : '노출'}</Pill></Td>
            </tr>
          ))}
        </DataTable>
      </Card>
      <Card>
        <div className="flex items-center mb-3">
          <h3 className="text-[15px] font-bold text-slate-800 mr-auto">크리에이터 알림</h3>
          <ModalBtn tone="blue" onClick={() => { setCompose(true); setTitle(''); setTarget('전체 채널'); }}>알림 발송</ModalBtn>
        </div>
        <DataTable head={['제목', '대상', '발송 시각', '열람 수']}>
          {CREATOR_NOTICES.map((n) => (
            <tr key={n.id}><Td>{n.title}</Td><Td center>{n.target}</Td><Td center>{n.sentAt}</Td><Td center>{fmt(n.read)}</Td></tr>
          ))}
        </DataTable>
      </Card>
      {compose && (
        <Modal title="크리에이터 알림 발송" onClose={() => setCompose(false)}
          footer={<><ModalBtn onClick={() => setCompose(false)}>취소</ModalBtn>
            <ModalBtn tone="blue" onClick={() => { notify(`${target}에 알림을 발송했습니다.`); setCompose(false); }}>발송</ModalBtn></>}>
          <div className="space-y-3">
            <div><div className="text-[13px] font-bold text-slate-700 mb-1">대상</div>
              {['전체 채널', '선택 채널'].map((t) => <RadioOpt key={t} label={t} checked={target === t} onChange={() => setTarget(t)} />)}</div>
            <div><div className="text-[13px] font-bold text-slate-700 mb-1">제목</div>
              <input className={`${inputCls} w-full`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="정책 변경 · 점검 안내 등" /></div>
            <div><div className="text-[13px] font-bold text-slate-700 mb-1">내용</div>
              <textarea className={`${inputCls} w-full h-28 resize-none`} placeholder="크리에이터 스튜디오 알림함에 전달됩니다." /></div>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ══════════ ⑫ 감사 로그 ══════════ */
export function AuditAdmin({ notify }: ScreenProps) {
  const [action, setAction] = useState('전체');
  const [admin, setAdmin] = useState('');
  const [from, setFrom] = useState('2026-09-01');
  const [to, setTo] = useState('2026-09-16');
  const [q, setQ] = useState({ action: '전체', admin: '', from: '2026-09-01', to: '2026-09-16' });
  const actions = ['전체', ...Array.from(new Set(AUDIT.map((a) => a.action)))];
  const rows: AuditRow[] = useMemo(() => AUDIT
    .filter((a) => q.action === '전체' || a.action === q.action)
    .filter((a) => !q.admin || a.admin.includes(q.admin))
    .filter((a) => a.at.slice(0, 10) >= q.from && a.at.slice(0, 10) <= q.to), [q]);
  const pg = usePaged(rows);

  return (
    <>
      <PageHead title="감사 로그" desc="강제 종료 · 채널 정지 · 스트림키 재발급 · 스트림키 열람 · 정책값 변경 · 신고 조치 · 메시지 삭제가 영구 기록됩니다. 조회는 슈퍼관리자 권한입니다." />
      <Card>
        <FilterTable rows={[
          { label: '기간', content: (
            <div className="flex items-center gap-2">
              <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
              <span className="text-slate-400">~</span>
              <input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
            </div>) },
          { label: '행위', content: <Select value={action} onChange={setAction} options={actions} className="w-52" /> },
          { label: '관리자 ID', content: <input className={`${inputCls} w-64`} placeholder="관리자 ID" value={admin} onChange={(e) => setAdmin(e.target.value)} /> },
        ]} />
        <SearchButton onClick={() => { setQ({ action, admin, from, to }); pg.setPage(1); }} />
        <TableTools>
          <span className="mr-auto text-[13px] text-slate-500">총 <b className="text-slate-800">{fmt(rows.length)}</b>건 · 보관 기간 영구</span>
          <OutlineButton onClick={() => notify('감사 로그를 CSV로 내려받았습니다.')}>CSV 내보내기</OutlineButton>
        </TableTools>
        <DataTable head={['로그 ID', '시각', '관리자 ID', '권한 등급', '행위', '대상', '사유', '이전값 → 신규값']} empty={rows.length === 0}>
          {pg.rows.map((a) => (
            <tr key={a.id}>
              <Td center><code className="text-[11px]">{a.id}</code></Td>
              <Td center>{a.at}</Td>
              <Td center>{a.admin}</Td>
              <Td center><Badge tone={a.grade === '슈퍼관리자' ? 'red' : a.grade === '운영자' ? 'blue' : 'slate'}>{a.grade}</Badge></Td>
              <Td center>{a.action}</Td>
              <Td>{a.target}</Td>
              <Td>{a.reason}</Td>
              <Td center>{a.before ? <span><span className="text-slate-500">{a.before}</span> → <b className="text-slate-800">{a.after}</b></span> : '—'}</Td>
            </tr>
          ))}
        </DataTable>
        <Pagination page={pg.page} total={pg.total} onChange={pg.setPage} />
      </Card>
    </>
  );
}
