import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import MobileNav from './components/Layout/MobileNav';
import Dashboard from './pages/Dashboard';
import OdemeListesi from './pages/OdemeListesi';
import GiderListesi from './pages/GiderListesi';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/odeme-listesi" element={<OdemeListesi />} />
              <Route path="/gider-listesi" element={<GiderListesi />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>

          <div className="hidden md:block">
            <Footer />
          </div>
        </div>

        <MobileNav />
      </div>
    </BrowserRouter>
  );
}

export default App;

