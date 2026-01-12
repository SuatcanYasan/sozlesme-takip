import React, { useState } from 'react';
import SozlesmeForm from './components/SozlesmeForm';
import SozlesmeListesi from './components/SozlesmeListesi';
import OdemeGrafigi from "./components/OdemeGrafigi";

function App() {
  const [yenilemeAnahtari, setYenilemeAnahtari] = useState(0);

  const handleSozlesmeEklendi = () => {
    setYenilemeAnahtari(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">
              Sözleşme Yönetim Paneli
            </h1>
          </div>
          <p className="mt-2 text-gray-600">
            Sözleşmelerinizi kolayca ekleyin, listeleyin ve yönetin
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SozlesmeForm onSozlesmeEklendi={handleSozlesmeEklendi} />
        <div className="my-4">
          <SozlesmeListesi yenile={yenilemeAnahtari} />
        </div>
        <OdemeGrafigi yenile={yenilemeAnahtari} />
      </main>

      <footer className="mt-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Sözleşme Yönetim Sistemi - Firebase & React ile güçlendirilmiştir
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

