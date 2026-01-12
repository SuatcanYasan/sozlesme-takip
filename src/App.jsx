import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Dashboard from './pages/Dashboard';
import OdemeListesi from './pages/OdemeListesi';
import GiderListesi from './pages/GiderListesi';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'odeme-listesi':
        return <OdemeListesi />;
      case 'gider-listesi':
        return <GiderListesi />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={activePage} />

        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;

