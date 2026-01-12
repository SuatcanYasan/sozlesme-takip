import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const OdemeListesi = () => {
  const [odemeler, setOdemeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [aramalar, setAramalar] = useState({
    isim_soyisim: '',
    sozlesme_no: '',
    tarih: ''
  });

  const formatTarih = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const tarih = timestamp.toDate();
      return tarih.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Tarih formatlama hatası:', error);
      return '-';
    }
  };

  const formatPara = (tutar) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(tutar);
  };

  const odemeleriYukle = async () => {
    setYukleniyor(true);
    setHata('');

    try {
      const q = query(collection(db, 'odemeler'), orderBy('olusturma_tarihi', 'desc'));
      const querySnapshot = await getDocs(q);

      const odemeListesi = [];
      querySnapshot.forEach((doc) => {
        odemeListesi.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setOdemeler(odemeListesi);
    } catch (error) {
      console.error('Ödemeler yüklenirken hata:', error);
      setHata('Ödemeler yüklenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    odemeleriYukle();
  }, []);

  const filtrelenmisOdemeler = odemeler.filter(odeme => {
    const isimSoyisim = `${odeme.isim} ${odeme.soyisim}`.toLowerCase();
    const sozlesmeNo = odeme.sozlesme_no?.toLowerCase() || '';
    const tarih = formatTarih(odeme.odeme_tarihi).toLowerCase();

    return (
      isimSoyisim.includes(aramalar.isim_soyisim.toLowerCase()) &&
      sozlesmeNo.includes(aramalar.sozlesme_no.toLowerCase()) &&
      tarih.includes(aramalar.tarih.toLowerCase())
    );
  });

  const toplamOdeme = filtrelenmisOdemeler.reduce((sum, odeme) => sum + (odeme.odeme_tutari || 0), 0);

  if (yukleniyor) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (hata) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {hata}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Ödeme Sayısı</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{filtrelenmisOdemeler.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Ödeme Tutarı</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{formatPara(toplamOdeme)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ortalama Ödeme</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {formatPara(filtrelenmisOdemeler.length > 0 ? toplamOdeme / filtrelenmisOdemeler.length : 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Ödeme Geçmişi</h2>
          <p className="text-sm text-gray-600 mt-1">Tüm ödemeler kronolojik sırada</p>
        </div>

        {odemeler.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-4 text-gray-600">Henüz ödeme kaydı yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sözleşme No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taksit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ödeme Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="px-2 py-2">
                    <input
                      type="text"
                      placeholder="İsim/Soyisim..."
                      value={aramalar.isim_soyisim}
                      onChange={(e) => setAramalar(prev => ({ ...prev, isim_soyisim: e.target.value }))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </th>
                  <th className="px-2 py-2">
                    <input
                      type="text"
                      placeholder="Sözleşme No..."
                      value={aramalar.sozlesme_no}
                      onChange={(e) => setAramalar(prev => ({ ...prev, sozlesme_no: e.target.value }))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </th>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2">
                    <input
                      type="text"
                      placeholder="Tarih..."
                      value={aramalar.tarih}
                      onChange={(e) => setAramalar(prev => ({ ...prev, tarih: e.target.value }))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtrelenmisOdemeler.map((odeme) => (
                  <tr key={odeme.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {odeme.isim} {odeme.soyisim}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{odeme.sozlesme_no}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {odeme.taksit_sira}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatTarih(odeme.odeme_tarihi)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        {formatPara(odeme.odeme_tutari)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OdemeListesi;

