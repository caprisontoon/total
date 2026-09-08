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
        <Route path="/creator" element={<CreatorPage />} />
        <Route path="/desktop/broadcast" element={<BroadcastDesktopPage />} />
        <Route path="/desktop/watch" element={<WatchDesktopPage />} />
      </Routes>
    </BrowserRouter>
  );
}
