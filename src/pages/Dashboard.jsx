import React, { useState } from 'react';
import SozlesmeForm from '../components/SozlesmeForm';
import SozlesmeListesi from '../components/SozlesmeListesi';
import OdemeGrafigi from '../components/OdemeGrafigi';

const Dashboard = () => {
  const [yenilemeAnahtari, setYenilemeAnahtari] = useState(0);

  const handleSozlesmeEklendi = () => {
    setYenilemeAnahtari(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Toplam Sözleşme</p>
              <p className="text-3xl font-bold mt-2">-</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Toplam Gelir</p>
              <p className="text-3xl font-bold mt-2">-</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Bekleyen Ödeme</p>
              <p className="text-3xl font-bold mt-2">-</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <SozlesmeForm onSozlesmeEklendi={handleSozlesmeEklendi} />

      <SozlesmeListesi yenile={yenilemeAnahtari} />

      <OdemeGrafigi yenile={yenilemeAnahtari} />
    </div>
  );
};

export default Dashboard;

