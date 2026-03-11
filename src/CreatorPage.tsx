import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, Search, Bell, Moon, Sun, ChevronDown, ChevronRight, 
  Home, Star, Package, User, Trophy, ShoppingBag, Headphones,
  LogOut, Heart, HelpCircle, Smartphone, Play, Image as ImageIcon,
  Gift, Box, Gamepad2, Mic, Eye, ThumbsUp, Clock, X, ExternalLink
} from 'lucide-react';

export default function CreatorPage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('텍스트');
  const [showVideos, setShowVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const videos = [
    {
      id: 1,
      title: 'YM상사 비키니 방송 퓨리 하연이 샤빈 인민 영민',
      duration: '3:07:19',
      views: '3.7K',
      likes: '146',
      date: '오늘',
      thumbnail: 'https://picsum.photos/seed/video1/400/225',
      description: '🔥 YM상사 드디어 오픈합니다 🔥 3월 3일 화요일 오후 5시 엑셀 방송의 새로운 판이 시작됩니다 기다리셨던 분들 많으시죠 그동안 준비 많이 했고 멤버 한 명 한 명 신중하게 구성했습니다 이번 YM상사는 ✔ 실력 있는 멤버 라인업 ✔ 매력 있는 캐릭터 조합 ✔ 제대로 준비한 콘텐츠 구성 ✔ 텐션 터지는 엑셀 방송 ✔ 시청자 참여형 재미 요소 단순한 엑셀이 아니라 "판을 만드는 엑셀"로 가보겠습니다 각 멤버들의 ...'
    },
    {
      id: 2,
      title: '고하연 - 이쿠욧 챌린지 섹시함 미쳤다ㄷㄷㄷ',
      duration: '0:37',
      views: '594',
      likes: '15',
      date: '오늘',
      thumbnail: 'https://picsum.photos/seed/video2/400/225',
      description: '🔥 YM상사 드디어 오픈합니다 🔥 3월 3일 화요일 오후 5시 엑셀 방송의 새로운 판이 시작됩니다 기다리셨던 분들 많으시죠 그동안 준비 많이 했고 멤버 한 명 한 명 신중하게 구성했습니다 이번 YM상사는 ✔ 실력 있는 멤버 라인업 ✔ 매력 있는 캐릭터 조합 ✔ 제대로 준비한 콘텐츠 구성 ✔ 텐션 터지는 엑셀 방송 ✔ 시청자 참여형 재미 요소 단순한 엑셀이 아니라 "판을 만드는 엑셀"로 가보겠습니다 각 멤버들의 ...'
    },
    {
      id: 3,
      title: '꿀잼 200% 성대모사에 빵터진 영민 ㅋㅋㅋ',
      duration: '1:23',
      views: '1.2K',
      likes: '14',
      date: '오늘',
      thumbnail: 'https://picsum.photos/seed/video3/400/225',
      description: '🔥 YM상사 드디어 오픈합니다 🔥 3월 3일 화요일 오후 5시 엑셀 방송의 새로운 판이 시작됩니다 기다리셨던 분들 많으시죠 그동안 준비 많이 했고 멤버 한 명 한 명 신중하게 구성했습니다 이번 YM상사는 ✔ 실력 있는 멤버 라인업 ✔ 매력 있는 캐릭터 조합 ✔ 제대로 준비한 콘텐츠 구성 ✔ 텐션 터지는 엑셀 방송 ✔ 시청자 참여형 재미 요소 단순한 엑셀이 아니라 "판을 만드는 엑셀"로 가보겠습니다 각 멤버들의 ...'
    },
    {
      id: 4,
      title: '퓨리 - 공주들아 챌린지 너무 이쁘다ㄷㄷㄷ',
      duration: '0:35',
      views: '865',
      likes: '32',
      date: '오늘',
      thumbnail: 'https://picsum.photos/seed/video4/400/225',
      description: '🔥 YM상사 드디어 오픈합니다 🔥 3월 3일 화요일 오후 5시 엑셀 방송의 새로운 판이 시작됩니다 기다리셨던 분들 많으시죠 그동안 준비 많이 했고 멤버 한 명 한 명 신중하게 구성했습니다 이번 YM상사는 ✔ 실력 있는 멤버 라인업 ✔ 매력 있는 캐릭터 조합 ✔ 제대로 준비한 콘텐츠 구성 ✔ 텐션 터지는 엑셀 방송 ✔ 시청자 참여형 재미 요소 단순한 엑셀이 아니라 "판을 만드는 엑셀"로 가보겠습니다 각 멤버들의 ...'
    },
    {
      id: 5,
      title: 'YM상사 비키니 방송 퓨리 하연이 샤빈 인민 영민',
      duration: '5:02:41',
      views: '8.5K',
      likes: '218',
      date: '오늘',
      thumbnail: 'https://picsum.photos/seed/video5/400/225',
      description: '🔥 YM상사 드디어 오픈합니다 🔥 3월 3일 화요일 오후 5시 엑셀 방송의 새로운 판이 시작됩니다 기다리셨던 분들 많으시죠 그동안 준비 많이 했고 멤버 한 명 한 명 신중하게 구성했습니다 이번 YM상사는 ✔ 실력 있는 멤버 라인업 ✔ 매력 있는 캐릭터 조합 ✔ 제대로 준비한 콘텐츠 구성 ✔ 텐션 터지는 엑셀 방송 ✔ 시청자 참여형 재미 요소 단순한 엑셀이 아니라 "판을 만드는 엑셀"로 가보겠습니다 각 멤버들의 ...'
    },
    {
      id: 6,
      title: 'WOP 춤 챌린지 - 영민 #영민 #YM상사 #댄스',
      duration: '0:24',
      views: '2.1K',
      likes: '21',
      date: '어제',
      thumbnail: 'https://picsum.photos/seed/video6/400/225',
      description: '🔥 YM상사 드디어 오픈합니다 🔥 3월 3일 화요일 오후 5시 엑셀 방송의 새로운 판이 시작됩니다 기다리셨던 분들 많으시죠 그동안 준비 많이 했고 멤버 한 명 한 명 신중하게 구성했습니다 이번 YM상사는 ✔ 실력 있는 멤버 라인업 ✔ 매력 있는 캐릭터 조합 ✔ 제대로 준비한 콘텐츠 구성 ✔ 텐션 터지는 엑셀 방송 ✔ 시청자 참여형 재미 요소 단순한 엑셀이 아니라 "판을 만드는 엑셀"로 가보겠습니다 각 멤버들의 ...'
    }
  ];

  const tabs = [
    { id: '텍스트', label: '텍스트' },
    { id: '게임', label: '게임', badge: 'N' },
    { id: '음성 녹음', label: '음성 녹음' },
    { id: '퀘스트', label: '퀘스트' },
    { id: '그림 후원', label: '그림 후원' },
    { id: '기프트 후원', label: '기프트 후원' },
    { id: '럭키박스 후원', label: '럭키박스 후원' },
    { id: '플레이', label: '플레이' },
    { id: '뽑기', label: '뽑기' },
  ];

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-[#181a20]' : 'bg-white'}`}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#181a20] shrink-0 h-screen sticky top-0 overflow-y-auto custom-scrollbar">
        <div className="p-4 flex items-center gap-2">
          <Menu size={24} className="text-slate-600 dark:text-slate-300" />
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-blue-500 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">+</span>
            <span className="text-slate-800 dark:text-white">toonation</span>
          </button>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
              LV.50
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">블랙 다이아</div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">김종윤</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">소셜 ID</span>
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span className="w-3 h-3 bg-purple-500 rounded-sm inline-block"></span>
                00loopi1@gmail.com
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">투네이션 ID</span>
              <span className="text-blue-500 hover:underline cursor-pointer">투네이션 ID 연결</span>
            </div>
            <button className="w-full py-1.5 mt-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              로그아웃
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">캐시</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">27,422,490</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">강냉이</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">9,792,431</span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <button className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors">
              캐시 충전
            </button>
            <button className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
              <Smartphone size={16} />
              모바일에서 충전 (QR코드)
            </button>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Home size={18} />
            홈
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
            <Play size={18} />
            추천 라이브
            <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">LIVE</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
            <Star size={18} />
            즐겨찾기
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
            <Package size={18} />
            인벤토리
          </a>
          <div className="py-1">
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <User size={18} />
                내정보
              </div>
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="py-1">
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Trophy size={18} />
                투네 랭킹
              </div>
              <ChevronDown size={16} />
            </button>
          </div>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
            <Gamepad2 size={18} />
            강냉이 사용하기(투네랜드)
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
            <ShoppingBag size={18} />
            투네이션 더굿즈(기프트 샵)
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
            <Headphones size={18} />
            고객센터
          </a>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">어두운 테마</span>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-blue-500' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white dark:bg-[#181a20]">
        {/* Header */}
        <header className="h-24 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500">
                YM
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                YM상사
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                제 방송을 시청해주셔서 감사합니다. ...<button className="text-slate-700 dark:text-slate-300 font-medium">더보기</button>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={() => setShowVideos(!showVideos)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded"
                >
                  채널 영상
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Heart size={16} />
              즐겨찾기
            </button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Menu size={16} />
            </button>
            <button className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-2">
              칭호 <HelpCircle size={14} className="text-slate-400" />
            </button>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              받은후원내역
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">시청모드</span>
                <button className="w-8 h-4 rounded-full bg-slate-300 dark:bg-slate-600 relative">
                  <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 left-0.5"></div>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8 overflow-x-auto custom-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors relative ${
                    activeTab === tab.id 
                      ? 'border-blue-500 text-blue-500' 
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-sm">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {showVideos && (
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map(video => (
                    <div 
                      key={video.id} 
                      className="bg-white dark:bg-[#181a20] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="relative aspect-video bg-slate-900">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                          {video.duration}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Play size={24} fill="currentColor" className="ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">{video.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><Eye size={12} /> {video.views}</span>
                          <span className="flex items-center gap-1"><ThumbsUp size={12} /> {video.likes}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {video.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">이름</label>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    defaultValue="김종윤"
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">17</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">프로필 숨기기</span>
                  <button className="w-10 h-5 rounded-full bg-slate-300 dark:bg-slate-600 relative">
                    <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 left-0.5"></div>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">후원금액</label>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    defaultValue="500 캐시"
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <label className="w-24 text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0 pt-3">텍스트 내용</label>
                <div className="flex-1 relative">
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  ></textarea>
                  <span className="absolute right-4 bottom-3 text-sm text-slate-400">120</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">보이스 선택</label>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-blue-500 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800">
                    <div className="w-5 h-5 rounded-full bg-orange-200 overflow-hidden">
                      <img src="https://picsum.photos/seed/avatar/20/20" alt="준우" />
                    </div>
                    준우
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-bold hover:bg-blue-600 transition-colors">
                    더 보기
                  </button>
                </div>
              </div>

              <div className="pt-8 flex justify-center border-b border-slate-200 dark:border-slate-700 pb-12">
                <button className="w-full max-w-md py-4 bg-[#2196f3] hover:bg-blue-600 text-white text-lg font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/30">
                  YM상사님에게 후원하기
                </button>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 text-xs text-slate-500 dark:text-slate-400 space-y-6 pb-12">
              <div className="flex justify-end gap-4">
                <button className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
                  <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-[8px]">KR</span>
                  한국어 <ChevronDown size={12} />
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
                  패밀리 사이트 <ChevronDown size={12} />
                </button>
              </div>

              <div className="space-y-1">
                <p>(주)투네이션</p>
                <p>경기 성남시 분당구 황새울로335번길 10 멜로즈프라자 2층 | 대표 : 추연성</p>
                <p>사업자 등록번호 : 261-81-13002 | 통신판매업 신고번호 : 제2018-성남수정-0240 | 문의 : toonation@toonation.co.kr</p>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">크리에이터 이용약관</a>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">유료서비스 이용약관</a>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <a href="#" className="font-bold text-slate-700 dark:text-slate-300">개인정보 처리방침</a>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <a href="#" className="font-bold text-slate-700 dark:text-slate-300">청소년보호정책</a>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">수수료 안내</a>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">YouTube API 서비스 이용약관</a>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">YouTube 서비스 이용약관</a>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">구글 개인정보 처리방침</a>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">구글 계정 접근 권한 해제하기</a>
              </div>

              <div className="space-y-1 pt-4">
                <p>Toonation은 YouTube 및 Twitch의 서드파티 사이트로 YouTube 및 Twitch에서 운영하는 사이트가 아닙니다.</p>
                <p>'YouTube' 및 '유튜브'는 YouTube, LLC의 등록상표이며 'Twitch' 및 '트위치'는 Twitch Interactive, Inc.의 등록상표입니다.</p>
                <p>투네이션 이용 시 <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-300">YouTube 서비스 약관</a>에 동의한 것으로 여깁니다.</p>
              </div>
            </footer>
          </div>
        </div>
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-white dark:bg-[#181a20] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="relative aspect-video bg-black shrink-0">
              <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-contain" />
              <div className="absolute inset-0 flex items-center justify-center">
                <a 
                  href="https://youtu.be/l3qHYASyT5Y?si=TTeuGP-VgzF99tbZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                >
                  <Play size={32} fill="currentColor" className="ml-1" />
                </a>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedVideo.title}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center gap-1"><Eye size={14} /> {selectedVideo.views} 조회</span>
                <span className="flex items-center gap-1"><ThumbsUp size={14} /> {selectedVideo.likes} 좋아요</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {selectedVideo.date}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                {selectedVideo.description}
              </p>
              <a 
                href="https://youtu.be/l3qHYASyT5Y?si=TTeuGP-VgzF99tbZ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors w-fit"
              >
                <Play size={18} fill="currentColor" />
                YouTube에서 보기 <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
