import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, addDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { formatCurrency, formatDate, calculateStatus, isPositiveNumber } from '../utils';

const PaymentList = () => {
  const [odemeler, setOdemeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [aramalar, setAramalar] = useState({
    isim_soyisim: '',
    sozlesme_no: '',
    tarih: ''
  });
  const [odemeEkleModalAcik, setOdemeEkleModalAcik] = useState(false);
  const [yeniOdeme, setYeniOdeme] = useState({
    isim: '',
    soyisim: '',
    sozlesme_no: '',
    taksit_sira: '',
    odeme_tutari: '',
    odeme_tarihi: ''
  });
  const [odemeEkleYukleniyor, setOdemeEkleYukleniyor] = useState(false);
  const [silmeYukleniyor, setSilmeYukleniyor] = useState(null);


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

  const odemeEkleModalAc = () => {
    const bugun = new Date().toISOString().split('T')[0];
    setYeniOdeme({
      isim: '',
      soyisim: '',
      sozlesme_no: '',
      taksit_sira: '',
      odeme_tutari: '',
      odeme_tarihi: bugun
    });
    setOdemeEkleModalAcik(true);
  };

  const odemeEkleModalKapat = () => {
    setOdemeEkleModalAcik(false);
    setYeniOdeme({
      isim: '',
      soyisim: '',
      sozlesme_no: '',
      taksit_sira: '',
      odeme_tutari: '',
      odeme_tarihi: ''
    });
  };

  const yeniOdemeKaydet = async () => {
    if (!yeniOdeme.isim || !yeniOdeme.soyisim || !yeniOdeme.sozlesme_no ||
        !yeniOdeme.taksit_sira || !yeniOdeme.odeme_tutari || !yeniOdeme.odeme_tarihi) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    const odemeTutari = parseFloat(yeniOdeme.odeme_tutari);
    const taksitSira = parseInt(yeniOdeme.taksit_sira);

    if (!isPositiveNumber(odemeTutari)) {
      alert('Lütfen geçerli bir tutar girin');
      return;
    }

    if (!isPositiveNumber(taksitSira) || taksitSira < 1) {
      alert('Lütfen geçerli bir taksit sırası girin');
      return;
    }

    setOdemeEkleYukleniyor(true);
    try {
      const odemeKaydi = {
        isim: yeniOdeme.isim,
        soyisim: yeniOdeme.soyisim,
        sozlesme_no: yeniOdeme.sozlesme_no,
        taksit_sira: taksitSira,
        odeme_tutari: odemeTutari,
        odeme_tarihi: Timestamp.fromDate(new Date(yeniOdeme.odeme_tarihi)),
        olusturma_tarihi: Timestamp.now()
      };

      await addDoc(collection(db, 'odemeler'), odemeKaydi);

      const sozlesmelerQuery = query(
        collection(db, 'sozlesmeler'),
        where('sozlesme_no', '==', yeniOdeme.sozlesme_no),
        where('taksit_sira', '==', taksitSira)
      );

      const sozlesmelerSnapshot = await getDocs(sozlesmelerQuery);

      if (!sozlesmelerSnapshot.empty) {
        const taksitDoc = sozlesmelerSnapshot.docs[0];
        const taksitData = taksitDoc.data();

        const mevcutOdenen = taksitData.odenen_tutar || 0;
        const taksitTutari = taksitData.taksit_tutari || 0;

        const yeniOdenenTutar = mevcutOdenen + odemeTutari;
        const yeniKalanTutar = taksitTutari - yeniOdenenTutar;
        const yeniStatus = calculateStatus(yeniOdenenTutar, yeniKalanTutar);

        await updateDoc(doc(db, 'sozlesmeler', taksitDoc.id), {
          odenen_tutar: yeniOdenenTutar,
          kalan_tutar: yeniKalanTutar,
          status: yeniStatus
        });
      }

      alert('Ödeme başarıyla eklendi!');
      odemeEkleModalKapat();
      odemeleriYukle();
    } catch (error) {
      console.error('Ödeme eklenirken hata:', error);
      alert('Ödeme eklenirken bir hata oluştu: ' + error.message);
    } finally {
      setOdemeEkleYukleniyor(false);
    }
  };

  const odemeSil = async (odeme) => {
    if (!window.confirm(`${odeme.isim} ${odeme.soyisim} - ${odeme.sozlesme_no} (${odeme.taksit_sira}. taksit) için ${formatCurrency(odeme.odeme_tutari)} tutarındaki ödemeyi silmek istediğinize emin misiniz?\n\nBu işlem ilgili taksitteki ödeme bilgilerini geri alacaktır.`)) {
      return;
    }

    setSilmeYukleniyor(odeme.id);
    try {
      const sozlesmelerQuery = query(
        collection(db, 'sozlesmeler'),
        where('sozlesme_no', '==', odeme.sozlesme_no),
        where('taksit_sira', '==', odeme.taksit_sira)
      );

      const sozlesmelerSnapshot = await getDocs(sozlesmelerQuery);

      if (!sozlesmelerSnapshot.empty) {
        const taksitDoc = sozlesmelerSnapshot.docs[0];
        const taksitData = taksitDoc.data();

        const mevcutOdenen = taksitData.odenen_tutar || 0;
        const taksitTutari = taksitData.taksit_tutari || 0;

        const yeniOdenenTutar = Math.max(0, mevcutOdenen - odeme.odeme_tutari);
        const yeniKalanTutar = taksitTutari - yeniOdenenTutar;
        const yeniStatus = calculateStatus(yeniOdenenTutar, yeniKalanTutar);

        await updateDoc(doc(db, 'sozlesmeler', taksitDoc.id), {
          odenen_tutar: yeniOdenenTutar,
          kalan_tutar: yeniKalanTutar,
          status: yeniStatus
        });
      }

      await deleteDoc(doc(db, 'odemeler', odeme.id));

      alert('Ödeme başarıyla silindi ve taksit bilgileri güncellendi!');
      odemeleriYukle();
    } catch (error) {
      console.error('Ödeme silinirken hata:', error);
      alert('Ödeme silinirken bir hata oluştu: ' + error.message);
    } finally {
      setSilmeYukleniyor(null);
    }
  };

  const filtrelenmisOdemeler = odemeler.filter(odeme => {
    const isimSoyisim = `${odeme.isim} ${odeme.soyisim}`.toLowerCase();
    const sozlesmeNo = odeme.sozlesme_no?.toLowerCase() || '';
    const tarih = formatDate(odeme.odeme_tarihi).toLowerCase();

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
              <p className="text-xl md:text-2xl font-bold text-gray-900 mt-2 font-number">{filtrelenmisOdemeler.length}</p>
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
              <p className="text-xl md:text-2xl font-bold text-green-600 mt-2 font-number">{formatCurrency(toplamOdeme)}</p>
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
              <p className="text-xl md:text-2xl font-bold text-purple-600 mt-2 font-number">
                {formatCurrency(filtrelenmisOdemeler.length > 0 ? toplamOdeme / filtrelenmisOdemeler.length : 0)}
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-700">Ödeme Geçmişi</h2>
              <p className="text-xs text-gray-500 mt-0.5">Tüm ödemeler kronolojik sırada</p>
            </div>
            <button
              onClick={odemeEkleModalAc}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Yeni Ödeme Ekle</span>
              <span className="sm:hidden">Ekle</span>
            </button>
          </div>
        </div>

        <div className="bg-white">
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
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
                      <div className="text-sm text-gray-600">{formatDate(odeme.odeme_tarihi)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(odeme.odeme_tutari)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => odemeSil(odeme)}
                        disabled={silmeYukleniyor === odeme.id}
                        className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        title="Ödemeyi Sil"
                      >
                        {silmeYukleniyor === odeme.id ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {odemeEkleModalAcik && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Yeni Ödeme Ekle</h3>
                <button
                  onClick={odemeEkleModalKapat}
                  className="p-2 hover:bg-gray-200 rounded-full transition"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="odeme_isim" className="block text-sm font-medium text-gray-700 mb-2">
                      İsim *
                    </label>
                    <input
                      type="text"
                      id="odeme_isim"
                      value={yeniOdeme.isim}
                      onChange={(e) => setYeniOdeme(prev => ({ ...prev, isim: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="Örn: Ahmet"
                    />
                  </div>

                  <div>
                    <label htmlFor="odeme_soyisim" className="block text-sm font-medium text-gray-700 mb-2">
                      Soyisim *
                    </label>
                    <input
                      type="text"
                      id="odeme_soyisim"
                      value={yeniOdeme.soyisim}
                      onChange={(e) => setYeniOdeme(prev => ({ ...prev, soyisim: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="Örn: Yılmaz"
                    />
                  </div>

                  <div>
                    <label htmlFor="odeme_sozlesme_no" className="block text-sm font-medium text-gray-700 mb-2">
                      Sözleşme No *
                    </label>
                    <input
                      type="text"
                      id="odeme_sozlesme_no"
                      value={yeniOdeme.sozlesme_no}
                      onChange={(e) => setYeniOdeme(prev => ({ ...prev, sozlesme_no: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="Örn: SZL-2024-001"
                    />
                  </div>

                  <div>
                    <label htmlFor="odeme_taksit_sira" className="block text-sm font-medium text-gray-700 mb-2">
                      Taksit Sırası *
                    </label>
                    <input
                      type="number"
                      id="odeme_taksit_sira"
                      value={yeniOdeme.taksit_sira}
                      onChange={(e) => setYeniOdeme(prev => ({ ...prev, taksit_sira: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="Örn: 1"
                      min="1"
                    />
                  </div>

                  <div>
                    <label htmlFor="odeme_tutari" className="block text-sm font-medium text-gray-700 mb-2">
                      Ödeme Tutarı (₺) *
                    </label>
                    <input
                      type="number"
                      id="odeme_tutari"
                      value={yeniOdeme.odeme_tutari}
                      onChange={(e) => setYeniOdeme(prev => ({ ...prev, odeme_tutari: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="Örn: 1500.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label htmlFor="odeme_tarihi" className="block text-sm font-medium text-gray-700 mb-2">
                      Ödeme Tarihi *
                    </label>
                    <input
                      type="date"
                      id="odeme_tarihi"
                      value={yeniOdeme.odeme_tarihi}
                      onChange={(e) => setYeniOdeme(prev => ({ ...prev, odeme_tarihi: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                  <strong>Not:</strong> Bu ödeme kaydı eklendiğinde, eğer belirtilen sözleşme numarası ve taksit sırası sistemde mevcutsa, ilgili taksitteki ödenen tutar, kalan tutar ve durum bilgileri otomatik olarak güncellenecektir.
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={odemeEkleModalKapat}
                disabled={odemeEkleYukleniyor}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </button>
              <button
                onClick={yeniOdemeKaydet}
                disabled={odemeEkleYukleniyor}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {odemeEkleYukleniyor && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {odemeEkleYukleniyor ? 'Ekleniyor...' : 'Ödeme Ekle'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PaymentList;

