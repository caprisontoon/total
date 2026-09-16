import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudioPage from './StudioPage';
import DashboardPage from './DashboardPage';
import CreatorPage from './CreatorPage';
import BroadcastDesktopPage from './BroadcastDesktopPage';
import WatchDesktopPage from './WatchDesktopPage';
import LivePage from './LivePage';
import ChannelPage from './ChannelPage';
import ChatPopupPage from './ChatPopupPage';
import AdminPage from './AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudioPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* 방송 설정 전용 경로 — 새로고침해도 방송 설정 페이지가 유지됨 */}
        <Route path="/broadcast-settings" element={<DashboardPage />} />
        <Route path="/broadcast-analytics" element={<DashboardPage />} />
        {/* 방송 관리 채팅을 별도 창으로 분리한 팝업 */}
        <Route path="/broadcast-settings/chat" element={<ChatPopupPage />} />
        {/* ⑨ 관리자 페이지 — 새 창/팝업으로 열린다 */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/creator" element={<CreatorPage />} />
        {/* 시청 · 채널 화면 (⑦) — 전체 라이브 목록 → 카드 클릭 → 채널 시청 */}
        <Route path="/live" element={<LivePage />} />
        <Route path="/live/:channelId" element={<ChannelPage />} />
        <Route path="/desktop/broadcast" element={<BroadcastDesktopPage />} />
        <Route path="/desktop/watch" element={<WatchDesktopPage />} />
      </Routes>
    </BrowserRouter>
  );
}
