import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const SozlesmeListesi = ({ yenile }) => {
  const [sozlesmeler, setSozlesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');

  // Tarihi formatla
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

  // Para birimi formatla
  const formatPara = (tutar) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(tutar);
  };

  // Sözleşmeleri yükle
  const sozlesmeleriYukle = async () => {
    setYukleniyor(true);
    setHata('');

    try {
      const q = query(collection(db, 'sozlesmeler'), orderBy('olusturma_tarihi', 'desc'));
      const querySnapshot = await getDocs(q);

      const sozlesmeListesi = [];
      querySnapshot.forEach((doc) => {
        sozlesmeListesi.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setSozlesmeler(sozlesmeListesi);
    } catch (error) {
      console.error('Sözleşmeler yüklenirken hata:', error);
      setHata('Sözleşmeler yüklenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  // Sözleşme sil
  const sozlesmeSil = async (id, sozlesmeNo) => {
    if (!window.confirm(`"${sozlesmeNo}" numaralı sözleşmeyi silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'sozlesmeler', id));
      // Listeyi güncelle
      setSozlesmeler(prev => prev.filter(s => s.id !== id));
      alert('Sözleşme başarıyla silindi!');
    } catch (error) {
      console.error('Sözleşme silinirken hata:', error);
      alert('Sözleşme silinirken bir hata oluştu');
    }
  };

  // Component yüklendiğinde ve yenile değiştiğinde sözleşmeleri yükle
  useEffect(() => {
    sozlesmeleriYukle();
  }, [yenile]);

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Sözleşme Listesi
        </h2>
        <p className="text-gray-600 mt-1">
          Toplam {sozlesmeler.length} sözleşme
        </p>
      </div>

      {sozlesmeler.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-gray-600">Henüz sözleşme eklenmemiş</p>
          <p className="text-sm text-gray-500 mt-1">Yukarıdaki formu kullanarak yeni bir sözleşme ekleyebilirsiniz</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İsim Soyisim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sözleşme No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sözleşme Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taksit Sayısı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vade Aralığı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aylık Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Tutar
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sozlesmeler.map((sozlesme) => (
                <tr key={sozlesme.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {sozlesme.isim} {sozlesme.soyisim}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {sozlesme.sozlesme_no}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatTarih(sozlesme.sozlesme_tarihi)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {sozlesme.taksit_sayisi} Ay
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {sozlesme.vade_araligi} Gün
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPara(sozlesme.aylik_tutar)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      {formatPara(sozlesme.aylik_tutar * sozlesme.taksit_sayisi)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => sozlesmeSil(sozlesme.id, sozlesme.sozlesme_no)}
                      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SozlesmeListesi;

