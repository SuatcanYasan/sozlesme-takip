import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SozlesmeListesi = ({ yenile }) => {
  const [sozlesmeler, setSozlesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [mevcutSayfa, setMevcutSayfa] = useState(1);
  const [sayfaBasinaKayit] = useState(10);
  const [aramalar, setAramalar] = useState({
    isim_soyisim: '',
    sozlesme_no: '',
    sozlesme_tarihi: '',
    taksit_sayisi: '',
    vade_araligi: '',
    taksit_tutari: '',
    status: ''
  });

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

  // Arama değiştir
  const aramaDegistir = (alan, deger) => {
    setAramalar(prev => ({
      ...prev,
      [alan]: deger
    }));
    setMevcutSayfa(1);
  };

  // Aramaları temizle
  const aramalariTemizle = () => {
    setAramalar({
      isim_soyisim: '',
      sozlesme_no: '',
      sozlesme_tarihi: '',
      taksit_sayisi: '',
      vade_araligi: '',
      taksit_tutari: '',
      status: ''
    });
    setMevcutSayfa(1);
  };

  // Filtrelenmiş veriler
  const filtrelenmisVeriler = sozlesmeler.filter(sozlesme => {
    const isimSoyisim = `${sozlesme.isim} ${sozlesme.soyisim}`.toLowerCase();
    const sozlesmeNo = sozlesme.sozlesme_no?.toLowerCase() || '';
    const tarih = formatTarih(sozlesme.sozlesme_tarihi).toLowerCase();
    const taksitSayisi = sozlesme.taksit_sayisi?.toString() || '';
    const vadeAraligi = sozlesme.vade_araligi?.toString() || '';
    const taksitTutari = (sozlesme.taksit_tutari || sozlesme.aylik_tutar)?.toString() || '';
    const status = (sozlesme.status ?? 1).toString();

    return (
      isimSoyisim.includes(aramalar.isim_soyisim.toLowerCase()) &&
      sozlesmeNo.includes(aramalar.sozlesme_no.toLowerCase()) &&
      tarih.includes(aramalar.sozlesme_tarihi.toLowerCase()) &&
      taksitSayisi.includes(aramalar.taksit_sayisi) &&
      vadeAraligi.includes(aramalar.vade_araligi) &&
      taksitTutari.includes(aramalar.taksit_tutari) &&
      (aramalar.status === '' || status === aramalar.status)
    );
  });

  // Pagination hesaplamaları
  const toplamSayfa = Math.ceil(filtrelenmisVeriler.length / sayfaBasinaKayit);
  const baslangicIndex = (mevcutSayfa - 1) * sayfaBasinaKayit;
  const bitisIndex = baslangicIndex + sayfaBasinaKayit;
  const mevcutVeriler = filtrelenmisVeriler.slice(baslangicIndex, bitisIndex);

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

  // Durum değiştir
  const statusDegistir = async (id, mevcutStatus) => {
    try {
      const yeniStatus = mevcutStatus === 1 ? 0 : 1;
      await updateDoc(doc(db, 'sozlesmeler', id), {
        status: yeniStatus
      });

      setSozlesmeler(prev => prev.map(s =>
        s.id === id ? { ...s, status: yeniStatus } : s
      ));
    } catch (error) {
      console.error('Status güncellenirken hata:', error);
      alert('Status güncellenirken bir hata oluştu');
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Sözleşme Listesi
            </h2>
            <p className="text-gray-600 mt-1">
              Toplam {sozlesmeler.length} sözleşme • {filtrelenmisVeriler.length} sonuç gösteriliyor
            </p>
          </div>
          {(Object.values(aramalar).some(v => v !== '')) && (
            <button
              onClick={aramalariTemizle}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition duration-200"
            >
              Aramaları Temizle
            </button>
          )}
        </div>
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
                  Taksit Tutarı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Tutar
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="İsim/Soyisim Ara..."
                    value={aramalar.isim_soyisim}
                    onChange={(e) => aramaDegistir('isim_soyisim', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="Sözleşme No..."
                    value={aramalar.sozlesme_no}
                    onChange={(e) => aramaDegistir('sozlesme_no', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="Tarih Ara..."
                    value={aramalar.sozlesme_tarihi}
                    onChange={(e) => aramaDegistir('sozlesme_tarihi', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="Taksit..."
                    value={aramalar.taksit_sayisi}
                    onChange={(e) => aramaDegistir('taksit_sayisi', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="Vade..."
                    value={aramalar.vade_araligi}
                    onChange={(e) => aramaDegistir('vade_araligi', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="Tutar..."
                    value={aramalar.taksit_tutari}
                    onChange={(e) => aramaDegistir('taksit_tutari', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </th>
                <th className="px-2 py-2"></th>
                <th className="px-2 py-2">
                  <select
                    value={aramalar.status}
                    onChange={(e) => aramaDegistir('status', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Tümü</option>
                    <option value="1">Aktif</option>
                    <option value="0">Kapalı</option>
                  </select>
                </th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mevcutVeriler.map((sozlesme) => (
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
                      {sozlesme.taksit_sayisi} Adet
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {sozlesme.vade_araligi} Gün
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPara(sozlesme.taksit_tutari || sozlesme.aylik_tutar)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      {formatPara((sozlesme.taksit_tutari || sozlesme.aylik_tutar) * sozlesme.taksit_sayisi)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">

                    <button
                      onClick={() => statusDegistir(sozlesme.id, sozlesme.status ?? 1)}
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition duration-200 ${
                        (sozlesme.status ?? 1) === 1
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {(sozlesme.status ?? 1) === 1 ? (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Aktif
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Kapalı
                        </>
                      )}
                    </button>
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

        {filtrelenmisVeriler.length > 0 && toplamSayfa > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{baslangicIndex + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">{Math.min(bitisIndex, filtrelenmisVeriler.length)}</span>
                  {' '}arası gösteriliyor (Toplam{' '}
                  <span className="font-medium">{filtrelenmisVeriler.length}</span>
                  {' '}kayıt)
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMevcutSayfa(1)}
                    disabled={mevcutSayfa === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    İlk
                  </button>

                  <button
                    onClick={() => setMevcutSayfa(prev => Math.max(prev - 1, 1))}
                    disabled={mevcutSayfa === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Önceki
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: toplamSayfa }, (_, i) => i + 1)
                      .filter(sayfa => {
                        if (toplamSayfa <= 7) return true;
                        if (sayfa === 1 || sayfa === toplamSayfa) return true;
                        return sayfa >= mevcutSayfa - 1 && sayfa <= mevcutSayfa + 1;
                      })
                      .map((sayfa, index, array) => (
                        <React.Fragment key={sayfa}>
                          {index > 0 && array[index - 1] !== sayfa - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setMevcutSayfa(sayfa)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition ${
                              mevcutSayfa === sayfa
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {sayfa}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    onClick={() => setMevcutSayfa(prev => Math.min(prev + 1, toplamSayfa))}
                    disabled={mevcutSayfa === toplamSayfa}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Sonraki
                  </button>

                  <button
                    onClick={() => setMevcutSayfa(toplamSayfa)}
                    disabled={mevcutSayfa === toplamSayfa}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Son
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SozlesmeListesi;

