// 시청 · 채널 화면 공용 목업 데이터 (⑦ 시청 · 채널 화면 기획서 기반)

export type Platform = '투네이션' | '유튜브' | '트위치' | '기타';
export type LiveStatus = 'live' | 'suspended' | 'offline';

export type Live = {
  id: string;
  title: string;
  creator: string;
  handle: string;
  viewers: number;
  platform: Platform;
  category: string;
  tags: string[];
  excel?: boolean;          // 엑셀 방송(후원 순위 경쟁) 여부
  hue: string;              // 썸네일 대체 그라디언트
  status: LiveStatus;
  startedMinAgo: number;    // 방송 시작 후 경과(분)
  lastBroadcast: { title: string; date: string; peak: number; duration: string };
};

export const CATEGORIES = ['전체', '토크', '게임', '음악', '먹방', '아트', '금융', '스포츠'];

export const LIVES: Live[] = [
  { id: 'ym', title: '엑셀 방송 | 오늘 목표 300만원 가보자!', creator: 'YM상사', handle: '@ym_company', viewers: 1204, platform: '투네이션', category: '토크', tags: ['엑셀방송', '토크', '후원경쟁'], excel: true, hue: 'from-fuchsia-600 via-purple-700 to-indigo-800', status: 'live', startedMinAgo: 84, lastBroadcast: { title: '엑셀 방송 | 시즌 오픈 첫날', date: '2026.09.13', peak: 1856, duration: '3시간 12분' } },
  { id: 'gameking', title: '롤 챌린저 랭크 올리기 🎮 오늘 승급 간다', creator: '게임왕TV', handle: '@gameking', viewers: 892, platform: '유튜브', category: '게임', tags: ['리그오브레전드', '랭크'], hue: 'from-emerald-600 via-teal-700 to-cyan-900', status: 'live', startedMinAgo: 141, lastBroadcast: { title: '롤 랭크 다이아 승급전', date: '2026.09.12', peak: 1020, duration: '4시간 05분' } },
  { id: 'nightsky', title: '심야 감성 토크 & 사연 읽어드립니다', creator: '밤하늘', handle: '@nightsky', viewers: 455, platform: '투네이션', category: '토크', tags: ['감성', '사연'], excel: true, hue: 'from-sky-600 via-blue-700 to-slate-900', status: 'live', startedMinAgo: 37, lastBroadcast: { title: '새벽 라디오 · 신청곡', date: '2026.09.13', peak: 610, duration: '2시간 40분' } },
  { id: 'taxi', title: '발로란트 5인 파티 모집 중! 같이 하실 분', creator: '타격감', handle: '@hitfeel', viewers: 310, platform: '트위치', category: '게임', tags: ['발로란트', '파티'], hue: 'from-rose-600 via-pink-700 to-red-900', status: 'live', startedMinAgo: 22, lastBroadcast: { title: '발로 경쟁전 다이아 도전', date: '2026.09.11', peak: 420, duration: '3시간 30분' } },
  { id: 'vocal', title: '노래방송 🎵 신청곡 받아요 (발라드/팝)', creator: '보컬여신', handle: '@vocalgoddess', viewers: 678, platform: '투네이션', category: '음악', tags: ['노래', '신청곡'], hue: 'from-amber-500 via-orange-600 to-red-700', status: 'live', startedMinAgo: 63, lastBroadcast: { title: '90년대 발라드 특집', date: '2026.09.12', peak: 890, duration: '2시간 55분' } },
  { id: 'chart', title: '주식 리딩 실시간 · 장중 대응', creator: '차트마스터', handle: '@chartmaster', viewers: 240, platform: '유튜브', category: '금융', tags: ['주식', '실시간'], hue: 'from-lime-600 via-green-700 to-emerald-900', status: 'live', startedMinAgo: 190, lastBroadcast: { title: '장 마감 리뷰', date: '2026.09.12', peak: 300, duration: '1시간 20분' } },
  { id: 'artlin', title: '그림 커미션 작업방 · 오늘은 캐릭터 채색', creator: '아트린', handle: '@artlin', viewers: 156, platform: '투네이션', category: '아트', tags: ['드로잉', '커미션'], hue: 'from-violet-600 via-purple-700 to-fuchsia-900', status: 'suspended', startedMinAgo: 112, lastBroadcast: { title: '일러스트 라이브 드로잉', date: '2026.09.13', peak: 210, duration: '3시간 05분' } },
  { id: 'foodfighter', title: '먹방 | 매운거 챌린지 🔥 불닭 10봉', creator: '푸드파이터', handle: '@foodfighter', viewers: 523, platform: '기타', category: '먹방', tags: ['먹방', '챌린지'], hue: 'from-red-600 via-rose-700 to-orange-900', status: 'live', startedMinAgo: 48, lastBroadcast: { title: '치킨 5마리 먹방', date: '2026.09.10', peak: 640, duration: '2시간 10분' } },
  { id: 'runner', title: '새벽 러닝 크루 · 한강 10km', creator: '런너준', handle: '@runnerjun', viewers: 0, platform: '투네이션', category: '스포츠', tags: ['러닝', '한강'], hue: 'from-cyan-600 via-sky-700 to-blue-900', status: 'offline', startedMinAgo: 0, lastBroadcast: { title: '한강 러닝 10km 라이브', date: '2026.09.13', peak: 180, duration: '1시간 15분' } },
];

export const getLive = (id?: string) => LIVES.find((l) => l.id === id);

export const formatViewers = (n: number) => n.toLocaleString('ko-KR');

export const formatElapsed = (min: number) => {
  if (min < 60) return `${min}분 전 시작`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}시간 ${m}분 전 시작`;
};
