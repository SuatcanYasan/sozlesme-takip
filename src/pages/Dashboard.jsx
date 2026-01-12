import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import SozlesmeForm from '../components/SozlesmeForm';
import SozlesmeListesi from '../components/SozlesmeListesi';
import OdemeGrafigi from '../components/OdemeGrafigi';

const Dashboard = () => {
  const [yenilemeAnahtari, setYenilemeAnahtari] = useState(0);
  const [istatistikler, setIstatistikler] = useState({
    toplamSozlesme: 0,
    toplamGelir: 0,
    beklenenOdeme: 0,
    gecikenOdeme: 0
  });
  const [yukleniyor, setYukleniyor] = useState(true);

  const handleSozlesmeEklendi = () => {
    setYenilemeAnahtari(prev => prev + 1);
  };

  const handleOdemeYapildi = () => {
    setYenilemeAnahtari(prev => prev + 1);
    istatistikleriYukle();
  };

  const formatPara = (tutar) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(tutar);
  };

  const istatistikleriYukle = async () => {
    setYukleniyor(true);
    try {
      const q = query(collection(db, 'sozlesmeler'));
      const querySnapshot = await getDocs(q);

      const taksitler = [];
      querySnapshot.forEach((doc) => {
        taksitler.push({
          id: doc.id,
          ...doc.data()
        });
      });

      const sozlesmeNoları = [...new Set(taksitler.map(t => t.sozlesme_no))];
      const toplamSozlesme = sozlesmeNoları.length;

      const toplamGelir = taksitler.reduce((sum, t) => sum + (t.taksit_tutari || 0), 0);

      const beklenenOdeme = taksitler.reduce((sum, t) => {
        if (t.status === 0) return sum;
        const kalan = t.kalan_tutar !== undefined ? t.kalan_tutar : t.taksit_tutari;
        return sum + (kalan || 0);
      }, 0);

      const bugun = new Date();
      bugun.setHours(0, 0, 0, 0);

      const gecikenOdeme = taksitler.reduce((sum, t) => {
        if (!t.vade_tarihi || t.status === 0) return sum;

        try {
          const vadeTarihi = t.vade_tarihi.toDate();
          vadeTarihi.setHours(0, 0, 0, 0);

          const kalan = t.kalan_tutar !== undefined ? t.kalan_tutar : t.taksit_tutari;

          if (vadeTarihi < bugun && kalan > 0) {
            return sum + kalan;
          }
        } catch (error) {
          console.error('Vade tarihi hatası:', error);
        }

        return sum;
      }, 0);

      setIstatistikler({
        toplamSozlesme,
        toplamGelir,
        beklenenOdeme,
        gecikenOdeme
      });
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    istatistikleriYukle();
  }, [yenilemeAnahtari]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm md:text-[14px] font-medium">Toplam Sözleşme</p>
              <p className="text-lg md:text-[18px] font-bold mt-2 font-number">
                {yukleniyor ? '...' : istatistikler.toplamSozlesme}
              </p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-2 md:p-3 rounded-lg">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm md:text-[14px] font-medium">Toplam Gelir</p>
              <p className="text-lg md:text-[18px] font-bold mt-2 font-number">
                {yukleniyor ? '...' : formatPara(istatistikler.toplamGelir)}
              </p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-2 md:p-3 rounded-lg">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm md:text-[14px] font-medium">Bekleyen Ödeme</p>
              <p className="text-lg md:text-[18px] font-bold mt-2 font-number">
                {yukleniyor ? '...' : formatPara(istatistikler.beklenenOdeme)}
              </p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 p-2 md:p-3 rounded-lg">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm md:text-[14px] font-medium">Geciken Ödeme</p>
              <p className="text-lg md:text-[18px] font-bold mt-2 font-number">
                {yukleniyor ? '...' : formatPara(istatistikler.gecikenOdeme)}
              </p>
            </div>
            <div className="bg-red-400 bg-opacity-30 p-2 md:p-3 rounded-lg">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <SozlesmeListesi yenile={yenilemeAnahtari} onSozlesmeEklendi={handleSozlesmeEklendi} onOdemeYapildi={handleOdemeYapildi} />

      <OdemeGrafigi yenile={yenilemeAnahtari} />
    </div>
  );
};

export default Dashboard;

