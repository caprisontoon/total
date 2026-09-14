import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudioPage from './StudioPage';
import DashboardPage from './DashboardPage';
import CreatorPage from './CreatorPage';
import BroadcastDesktopPage from './BroadcastDesktopPage';
import WatchDesktopPage from './WatchDesktopPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudioPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* 방송 설정 전용 경로 — 새로고침해도 방송 설정 페이지가 유지됨 */}
        <Route path="/dashboard/broadcast-settings" element={<DashboardPage />} />
        <Route path="/creator" element={<CreatorPage />} />
        <Route path="/desktop/broadcast" element={<BroadcastDesktopPage />} />
        <Route path="/desktop/watch" element={<WatchDesktopPage />} />
      </Routes>
    </BrowserRouter>
  );
}
