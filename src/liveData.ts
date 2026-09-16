// 시청 · 채널 화면 공용 목업 데이터 (⑦ 시청 · 채널 화면 기획서 기반)

export type Platform = '투네이션' | '유튜브' | '치지직' | '트위치' | '기타';
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
  { id: 'kukshi', title: '국시 날씨 ☀️ 오늘의 코디 추천받아요', creator: '나나양', handle: '@nanayang', viewers: 3989, platform: '투네이션', category: '토크', tags: ['일상', '코디'], hue: 'from-pink-500 via-rose-600 to-purple-800', status: 'live', startedMinAgo: 55, lastBroadcast: { title: '가을 코디 특집', date: '2026.09.12', peak: 4210, duration: '2시간 30분' } },
  { id: 'jadoo', title: '[자두세스메이커] 프로필사진 찍고 해방촌 탐방', creator: '자두세스', handle: '@jadoosses', viewers: 3120, platform: '치지직', category: '토크', tags: ['야외방송', '탐방'], hue: 'from-slate-600 via-slate-700 to-slate-900', status: 'live', startedMinAgo: 96, lastBroadcast: { title: '성수동 카페 투어', date: '2026.09.11', peak: 3980, duration: '4시간 10분' } },
  { id: 'agoda', title: '알뜰한 여행의 정석 · 숙소 예약 꿀팁 大방출', creator: '아고다', handle: '@agoda_kr', viewers: 2874, platform: '유튜브', category: '토크', tags: ['여행', '꿀팁'], hue: 'from-teal-500 via-cyan-600 to-blue-800', status: 'live', startedMinAgo: 31, lastBroadcast: { title: '해외 항공권 최저가 찾기', date: '2026.09.10', peak: 3150, duration: '1시간 50분' } },
  { id: 'textdo', title: '텍스트도색 백원 하고싶은 말 다하세요. [신입 3일차]', creator: '다운되', handle: '@downdwe', viewers: 2455, platform: '투네이션', category: '토크', tags: ['신입', '수다'], excel: true, hue: 'from-indigo-600 via-violet-700 to-fuchsia-900', status: 'live', startedMinAgo: 18, lastBroadcast: { title: '신입 2일차 방송', date: '2026.09.15', peak: 2610, duration: '3시간 40분' } },
  { id: 'mangjae', title: '뱅크는 처음이라... 홀쓰 ㄴㄴ', creator: '뱅자두', handle: '@mangjadoo', viewers: 2190, platform: '치지직', category: '게임', tags: ['배틀그라운드', '첫방'], hue: 'from-orange-500 via-amber-600 to-yellow-800', status: 'live', startedMinAgo: 73, lastBroadcast: { title: '배그 스쿼드 정복', date: '2026.09.14', peak: 2480, duration: '5시간 20분' } },
  { id: 'jadoo2', title: '[자두세스메이커] 모바일 뉴비입니다. 자두', creator: 'Jadoo', handle: '@jadoo_m', viewers: 1980, platform: '기타', category: '게임', tags: ['모바일게임', '뉴비'], hue: 'from-lime-500 via-green-600 to-emerald-800', status: 'live', startedMinAgo: 44, lastBroadcast: { title: '모바일 랭킹 도전', date: '2026.09.13', peak: 2100, duration: '2시간 15분' } },
  { id: 'hana', title: '피자헛 신메뉴 먹어보겠습니다! 옥수수피자', creator: '하나', handle: '@hana_eat', viewers: 1760, platform: '투네이션', category: '먹방', tags: ['먹방', '신메뉴'], hue: 'from-red-500 via-orange-600 to-amber-800', status: 'live', startedMinAgo: 27, lastBroadcast: { title: '치킨 신메뉴 리뷰', date: '2026.09.14', peak: 1920, duration: '1시간 40분' } },
  { id: 'karima', title: '🌸헤헤헤헤헤헤헤헤헤헤헤헤헤헤헤헤헤 ( -_-)', creator: '카밀마녀', handle: '@karimawitch', viewers: 1540, platform: '치지직', category: '토크', tags: ['버튜버', '잡담'], hue: 'from-fuchsia-400 via-pink-500 to-rose-700', status: 'live', startedMinAgo: 105, lastBroadcast: { title: '버튜버 데뷔 100일', date: '2026.09.12', peak: 1870, duration: '3시간 55분' } },
  { id: 'gguon', title: '🎪 오늘은 여기까지! 다음에 또 만나요', creator: '깨꿈온', handle: '@gguon', viewers: 1320, platform: '트위치', category: '토크', tags: ['야외', '여행'], hue: 'from-sky-500 via-blue-600 to-indigo-800', status: 'live', startedMinAgo: 12, lastBroadcast: { title: '제주도 여행 브이로그', date: '2026.09.11', peak: 1450, duration: '2시간 05분' } },
  { id: 'jumin', title: '밥먹고 멍조 깔짝 · 작업하면서 수다', creator: '주휘밈', handle: '@jumin', viewers: 1105, platform: '유튜브', category: '아트', tags: ['작업', '수다'], hue: 'from-purple-500 via-violet-600 to-indigo-800', status: 'live', startedMinAgo: 67, lastBroadcast: { title: '일러스트 작업방', date: '2026.09.13', peak: 1280, duration: '4시간 30분' } },
  { id: 'dobong', title: '스페인 우승하면 12시간 방송함', creator: '도봉순', handle: '@dobongsoon', viewers: 980, platform: '트위치', category: '스포츠', tags: ['축구', '같이보기'], hue: 'from-emerald-500 via-teal-600 to-cyan-800', status: 'live', startedMinAgo: 38, lastBroadcast: { title: '유로 결승 같이보기', date: '2026.09.09', peak: 1640, duration: '6시간 00분' } },
  { id: 'chzzk_music', title: '피아노 라이브 🎹 신청곡 무한 받습니다', creator: '건반요정', handle: '@pianofairy', viewers: 845, platform: '치지직', category: '음악', tags: ['피아노', '신청곡'], hue: 'from-blue-500 via-indigo-600 to-violet-800', status: 'live', startedMinAgo: 52, lastBroadcast: { title: '재즈 피아노 특집', date: '2026.09.12', peak: 1020, duration: '2시간 45분' } },
];

export const getLive = (id?: string) => LIVES.find((l) => l.id === id);

export const formatViewers = (n: number) => n.toLocaleString('ko-KR');

export const formatElapsed = (min: number) => {
  if (min < 60) return `${min}분 전 시작`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}시간 ${m}분 전 시작`;
};
