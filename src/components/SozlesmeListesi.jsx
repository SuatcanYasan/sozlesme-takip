import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import SozlesmeForm from './SozlesmeForm';

const SozlesmeListesi = ({ yenile, onSozlesmeEklendi }) => {
  const [taksitler, setTaksitler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [mevcutSayfa, setMevcutSayfa] = useState(1);
  const [sayfaBasinaKayit] = useState(10);
  const [aramalar, setAramalar] = useState({
    isim_soyisim: '',
    sozlesme_no: '',
    status: ''
  });
  const [seciliSozlesme, setSeciliSozlesme] = useState(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenTaksit, setDuzenlenenTaksit] = useState(null);
  const [geciciTutar, setGeciciTutar] = useState('');
  const [odemeModalAcik, setOdemeModalAcik] = useState(false);
  const [odemeYapilacakTaksit, setOdemeYapilacakTaksit] = useState(null);
  const [odemeTutari, setOdemeTutari] = useState('');
  const [odemeTarihi, setOdemeTarihi] = useState('');
  const [formModalAcik, setFormModalAcik] = useState(false);

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

  const sozlesmeleriGrupla = () => {
    const gruplananlar = {};

    taksitler.forEach(taksit => {
      const key = taksit.sozlesme_no;

      if (!gruplananlar[key]) {
        gruplananlar[key] = {
          sozlesme_no: taksit.sozlesme_no,
          isim: taksit.isim,
          soyisim: taksit.soyisim,
          sozlesme_tarihi: taksit.sozlesme_tarihi,
          vade_baslangic_tarihi: taksit.vade_baslangic_tarihi,
          taksitler: [],
          toplam_tutar: 0,
          aktif_taksit: 0,
          kapali_taksit: 0
        };
      }

      gruplananlar[key].taksitler.push(taksit);
      gruplananlar[key].toplam_tutar += taksit.taksit_tutari;

      if (taksit.status === 1) {
        gruplananlar[key].aktif_taksit++;
      } else {
        gruplananlar[key].kapali_taksit++;
      }
    });

    return Object.values(gruplananlar);
  };

  const aramaDegistir = (alan, deger) => {
    setAramalar(prev => ({
      ...prev,
      [alan]: deger
    }));
    setMevcutSayfa(1);
  };

  const aramalariTemizle = () => {
    setAramalar({
      isim_soyisim: '',
      sozlesme_no: '',
      status: ''
    });
    setMevcutSayfa(1);
  };

  const gruplananSozlesmeler = sozlesmeleriGrupla();
  const filtrelenmisVeriler = gruplananSozlesmeler.filter(sozlesme => {
    const isimSoyisim = `${sozlesme.isim} ${sozlesme.soyisim}`.toLowerCase();
    const sozlesmeNo = sozlesme.sozlesme_no?.toLowerCase() || '';

    let statusMatch = true;
    if (aramalar.status !== '') {
      const arananStatus = parseInt(aramalar.status);
      statusMatch = sozlesme.taksitler.every(t => t.status === arananStatus);
    }

    return (
      isimSoyisim.includes(aramalar.isim_soyisim.toLowerCase()) &&
      sozlesmeNo.includes(aramalar.sozlesme_no.toLowerCase()) &&
      statusMatch
    );
  });

  const toplamSayfa = Math.ceil(filtrelenmisVeriler.length / sayfaBasinaKayit);
  const baslangicIndex = (mevcutSayfa - 1) * sayfaBasinaKayit;
  const bitisIndex = baslangicIndex + sayfaBasinaKayit;
  const mevcutVeriler = filtrelenmisVeriler.slice(baslangicIndex, bitisIndex);

  const taksitleriYukle = async () => {
    setYukleniyor(true);
    setHata('');

    try {
      const q = query(collection(db, 'sozlesmeler'), orderBy('olusturma_tarihi', 'desc'));
      const querySnapshot = await getDocs(q);

      const taksitListesi = [];
      querySnapshot.forEach((doc) => {
        taksitListesi.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setTaksitler(taksitListesi);
    } catch (error) {
      console.error('Taksitler yüklenirken hata:', error);
      setHata('Veriler yüklenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  const sozlesmeSil = async (sozlesmeNo) => {
    if (!window.confirm(`"${sozlesmeNo}" numaralı sözleşmenin tüm taksitlerini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const silinecekTaksitler = taksitler.filter(t => t.sozlesme_no === sozlesmeNo);
      const silmePromises = silinecekTaksitler.map(taksit =>
        deleteDoc(doc(db, 'sozlesmeler', taksit.id))
      );

      await Promise.all(silmePromises);

      setTaksitler(prev => prev.filter(t => t.sozlesme_no !== sozlesmeNo));
      alert('Sözleşme ve tüm taksitleri başarıyla silindi!');
    } catch (error) {
      console.error('Sözleşme silinirken hata:', error);
      alert('Sözleşme silinirken bir hata oluştu');
    }
  };

  const taksitStatusDegistir = async (taksitId, mevcutStatus) => {
    try {
      const yeniStatus = mevcutStatus === 1 ? 0 : 1;
      await updateDoc(doc(db, 'sozlesmeler', taksitId), {
        status: yeniStatus
      });

      setTaksitler(prev => prev.map(t =>
        t.id === taksitId ? { ...t, status: yeniStatus } : t
      ));
    } catch (error) {
      console.error('Status güncellenirken hata:', error);
      alert('Status güncellenirken bir hata oluştu');
    }
  };

  const taksitTutariGuncelle = async (taksitId, yeniTutar, sozlesmeNo) => {
    try {
      const tutarSayi = parseFloat(yeniTutar);

      if (isNaN(tutarSayi) || tutarSayi <= 0) {
        alert('Lütfen geçerli bir tutar girin');
        return;
      }

      const guncellenecekTaksit = taksitler.find(t => t.id === taksitId);
      const odenenTutar = guncellenecekTaksit?.odenen_tutar || 0;
      const yeniKalanTutar = tutarSayi - odenenTutar;

      await updateDoc(doc(db, 'sozlesmeler', taksitId), {
        taksit_tutari: tutarSayi,
        kalan_tutar: yeniKalanTutar
      });

      setTaksitler(prev => prev.map(t =>
        t.id === taksitId ? { ...t, taksit_tutari: tutarSayi, kalan_tutar: yeniKalanTutar } : t
      ));

      if (seciliSozlesme && seciliSozlesme.sozlesme_no === sozlesmeNo) {
        const guncelTaksitler = taksitler.map(t =>
          t.id === taksitId ? { ...t, taksit_tutari: tutarSayi, kalan_tutar: yeniKalanTutar } : t
        );

        const sozlesmeninTaksitleri = guncelTaksitler.filter(t => t.sozlesme_no === sozlesmeNo);
        const yeniToplamTutar = sozlesmeninTaksitleri.reduce((sum, t) => sum + t.taksit_tutari, 0);

        setSeciliSozlesme(prev => ({
          ...prev,
          taksitler: sozlesmeninTaksitleri,
          toplam_tutar: yeniToplamTutar
        }));
      }

      alert('Taksit tutarı ve kalan tutar başarıyla güncellendi!');
    } catch (error) {
      console.error('Tutar güncellenirken hata:', error);
      alert('Tutar güncellenirken bir hata oluştu');
    }
  };

  const taksitSil = async (taksitId, sozlesmeNo, taksitSira) => {
    if (!window.confirm(`"${sozlesmeNo}" sözleşmesinin ${taksitSira}. taksitini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'sozlesmeler', taksitId));
      setTaksitler(prev => prev.filter(t => t.id !== taksitId));
      alert('Taksit başarıyla silindi!');

      if (seciliSozlesme && seciliSozlesme.sozlesme_no === sozlesmeNo) {
        const kalanTaksitler = taksitler.filter(t =>
          t.sozlesme_no === sozlesmeNo && t.id !== taksitId
        );

        if (kalanTaksitler.length === 0) {
          setModalAcik(false);
          setSeciliSozlesme(null);
        }
      }
    } catch (error) {
      console.error('Taksit silinirken hata:', error);
      alert('Taksit silinirken bir hata oluştu');
    }
  };

  const detayGoster = (sozlesme) => {
    setSeciliSozlesme(sozlesme);
    setModalAcik(true);
  };

  const modalKapat = () => {
    setModalAcik(false);
    setSeciliSozlesme(null);
    setDuzenlenenTaksit(null);
    setGeciciTutar('');
  };

  const tutarDuzenlemeyeBasla = (taksitId, mevcutTutar) => {
    setDuzenlenenTaksit(taksitId);
    setGeciciTutar(mevcutTutar.toString());
  };

  const tutarDuzenlemeIptal = () => {
    setDuzenlenenTaksit(null);
    setGeciciTutar('');
  };

  const tutarKaydet = async (taksitId, sozlesmeNo) => {
    await taksitTutariGuncelle(taksitId, geciciTutar, sozlesmeNo);
    setDuzenlenenTaksit(null);
    setGeciciTutar('');
  };

  const odemeModalAc = (taksit) => {
    setOdemeYapilacakTaksit(taksit);
    setOdemeTutari('');
    const bugun = new Date().toISOString().split('T')[0];
    setOdemeTarihi(bugun);
    setOdemeModalAcik(true);
  };

  const odemeModalKapat = () => {
    setOdemeModalAcik(false);
    setOdemeYapilacakTaksit(null);
    setOdemeTutari('');
    setOdemeTarihi('');
  };

  const odemeKaydet = async () => {
    if (!odemeYapilacakTaksit || !odemeTutari || !odemeTarihi) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const odemeTutariSayi = parseFloat(odemeTutari);

      if (isNaN(odemeTutariSayi) || odemeTutariSayi <= 0) {
        alert('Lütfen geçerli bir tutar girin');
        return;
      }

      const mevcutOdenen = odemeYapilacakTaksit.odenen_tutar || 0;
      const kalanTutar = odemeYapilacakTaksit.kalan_tutar || odemeYapilacakTaksit.taksit_tutari;

      if (odemeTutariSayi > kalanTutar) {
        alert(`Ödeme tutarı kalan tutardan (${formatPara(kalanTutar)}) fazla olamaz`);
        return;
      }

      const yeniOdenenTutar = mevcutOdenen + odemeTutariSayi;
      const yeniKalanTutar = kalanTutar - odemeTutariSayi;

      await updateDoc(doc(db, 'sozlesmeler', odemeYapilacakTaksit.id), {
        odenen_tutar: yeniOdenenTutar,
        kalan_tutar: yeniKalanTutar
      });

      const odemeKaydi = {
        isim: odemeYapilacakTaksit.isim,
        soyisim: odemeYapilacakTaksit.soyisim,
        sozlesme_no: odemeYapilacakTaksit.sozlesme_no,
        taksit_sira: odemeYapilacakTaksit.taksit_sira,
        odeme_tutari: odemeTutariSayi,
        odeme_tarihi: Timestamp.fromDate(new Date(odemeTarihi)),
        olusturma_tarihi: Timestamp.now()
      };

      await addDoc(collection(db, 'odemeler'), odemeKaydi);

      setTaksitler(prev => prev.map(t =>
        t.id === odemeYapilacakTaksit.id
          ? { ...t, odenen_tutar: yeniOdenenTutar, kalan_tutar: yeniKalanTutar }
          : t
      ));

      if (seciliSozlesme && seciliSozlesme.sozlesme_no === odemeYapilacakTaksit.sozlesme_no) {
        const guncelTaksitler = taksitler.map(t =>
          t.id === odemeYapilacakTaksit.id
            ? { ...t, odenen_tutar: yeniOdenenTutar, kalan_tutar: yeniKalanTutar }
            : t
        );

        const sozlesmeninTaksitleri = guncelTaksitler.filter(t => t.sozlesme_no === odemeYapilacakTaksit.sozlesme_no);

        setSeciliSozlesme(prev => ({
          ...prev,
          taksitler: sozlesmeninTaksitleri
        }));
      }

      alert('Ödeme başarıyla kaydedildi!');
      odemeModalKapat();
    } catch (error) {
      console.error('Ödeme kaydedilirken hata:', error);
      alert('Ödeme kaydedilirken bir hata oluştu');
    }
  };

  useEffect(() => {
    taksitleriYukle();
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
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-700">
                Sözleşme Listesi
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Toplam {gruplananSozlesmeler.length} sözleşme • {filtrelenmisVeriler.length} sonuç
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setFormModalAcik(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition duration-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Yeni Sözleşme Ekle</span>
                <span className="sm:hidden">Ekle</span>
              </button>
              {(Object.values(aramalar).some(v => v !== '')) && (
                <button
                  onClick={aramalariTemizle}
                  className="px-3 md:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs md:text-sm font-medium rounded-lg transition duration-200"
                >
                  Aramaları Temizle
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white">
          {gruplananSozlesmeler.length === 0 ? (
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
                    Toplam Tutar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <tr key={sozlesme.sozlesme_no} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sozlesme.isim} {sozlesme.soyisim}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sozlesme.sozlesme_no}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sozlesme.taksitler.length} taksit
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        {formatPara(sozlesme.toplam_tutar)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        {sozlesme.aktif_taksit > 0 && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {sozlesme.aktif_taksit} Aktif
                          </span>
                        )}
                        {sozlesme.kapali_taksit > 0 && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {sozlesme.kapali_taksit} Kapalı
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => detayGoster(sozlesme)}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition duration-200"
                          title="Detayları Görüntüle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => sozlesmeSil(sozlesme.sozlesme_no)}
                          className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition duration-200"
                          title="Sözleşmeyi Sil"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
      </div>

      {modalAcik && seciliSozlesme && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base md:text-[16px] font-bold text-gray-800">
                    {seciliSozlesme.isim} {seciliSozlesme.soyisim}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sözleşme No: <span className="font-semibold">{seciliSozlesme.sozlesme_no}</span>
                  </p>
                </div>
                <button
                  onClick={modalKapat}
                  className="p-2 hover:bg-gray-200 rounded-full transition"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm md:text-[14px] text-gray-600">Sözleşme Tarihi</p>
                  <p className="text-base md:text-[18px] font-bold text-blue-600">
                    {formatTarih(seciliSozlesme.sozlesme_tarihi)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm md:text-[14px] text-gray-600">Vade Başlangıç</p>
                  <p className="text-base md:text-[18px] font-bold text-green-600">
                    {formatTarih(seciliSozlesme.vade_baslangic_tarihi)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm md:text-[14px] text-gray-600">Toplam Tutar</p>
                  <p className="text-base md:text-[18px] font-bold text-purple-600">
                    {formatPara(seciliSozlesme.toplam_tutar)}
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm md:text-[14px] text-gray-600">Toplam Ödenen</p>
                  <p className="text-base md:text-[18px] font-bold text-green-700">
                    {formatPara(seciliSozlesme.taksitler.reduce((sum, t) => sum + (t.odenen_tutar || 0), 0))}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm md:text-[14px] text-gray-600">Toplam Kalan</p>
                  <p className="text-base md:text-[18px] font-bold text-orange-600">
                    {formatPara(seciliSozlesme.taksitler.reduce((sum, t) => sum + (t.kalan_tutar || t.taksit_tutari), 0))}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm md:text-[14px] font-bold text-gray-800 mb-4">
                  Taksit Detayları ({seciliSozlesme.taksitler.length} Adet)
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Taksit
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Vade Tarihi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tutar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ödenen
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Kalan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Vade Aralığı
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Durum
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {seciliSozlesme.taksitler
                        .sort((a, b) => a.taksit_sira - b.taksit_sira)
                        .map((taksit) => (
                        <tr key={taksit.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {taksit.taksit_sira} / {taksit.toplam_taksit}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {formatTarih(taksit.vade_tarihi)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {duzenlenenTaksit === taksit.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={geciciTutar}
                                  onChange={(e) => setGeciciTutar(e.target.value)}
                                  className="w-24 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                  step="0.01"
                                  min="0"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      tutarKaydet(taksit.id, taksit.sozlesme_no);
                                    } else if (e.key === 'Escape') {
                                      tutarDuzenlemeIptal();
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => tutarKaydet(taksit.id, taksit.sozlesme_no)}
                                  className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition"
                                  title="Kaydet"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={tutarDuzenlemeIptal}
                                  className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                                  title="İptal"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {formatPara(taksit.taksit_tutari)}
                                </span>
                                <button
                                  onClick={() => tutarDuzenlemeyeBasla(taksit.id, taksit.taksit_tutari)}
                                  className="p-1 text-blue-600 hover:text-blue-800 transition"
                                  title="Tutarı Düzenle"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-green-600">
                              {formatPara(taksit.odenen_tutar || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-orange-600">
                              {formatPara(taksit.kalan_tutar || taksit.taksit_tutari)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                              {taksit.vade_araligi} gün
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <button
                              onClick={() => taksitStatusDegistir(taksit.id, taksit.status ?? 1)}
                              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition duration-200 ${
                                (taksit.status ?? 1) === 1
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {(taksit.status ?? 1) === 1 ? 'Aktif' : 'Kapalı'}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => odemeModalAc(taksit)}
                                disabled={(taksit.kalan_tutar || taksit.taksit_tutari) <= 0}
                                className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                title="Ödeme Yap"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Ödeme
                              </button>
                              <button
                                onClick={() => taksitSil(taksit.id, taksit.sozlesme_no, taksit.taksit_sira)}
                                className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition duration-200"
                                title="Sil"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={modalKapat}
                className="w-full md:w-auto px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition duration-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {odemeModalAcik && odemeYapilacakTaksit && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base md:text-[16px] font-bold text-gray-800">Ödeme Yap</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {odemeYapilacakTaksit.isim} {odemeYapilacakTaksit.soyisim} - {odemeYapilacakTaksit.sozlesme_no}
                  </p>
                  <p className="text-xs text-gray-500">
                    Taksit {odemeYapilacakTaksit.taksit_sira}/{odemeYapilacakTaksit.toplam_taksit}
                  </p>
                </div>
                <button
                  onClick={odemeModalKapat}
                  className="p-2 hover:bg-gray-200 rounded-full transition"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Taksit Tutarı:</p>
                    <p className="font-bold text-gray-900">{formatPara(odemeYapilacakTaksit.taksit_tutari)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ödenen:</p>
                    <p className="font-bold text-green-600">{formatPara(odemeYapilacakTaksit.odenen_tutar || 0)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Kalan Tutar:</p>
                    <p className="font-bold text-orange-600 text-base md:text-[18px]">
                      {formatPara(odemeYapilacakTaksit.kalan_tutar || odemeYapilacakTaksit.taksit_tutari)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="odemeTutari" className="block text-sm font-medium text-gray-700 mb-2">
                    Ödeme Tutarı (₺) *
                  </label>
                  <input
                    type="number"
                    id="odemeTutari"
                    value={odemeTutari}
                    onChange={(e) => setOdemeTutari(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Örn: 500"
                    step="0.01"
                    min="0"
                    max={odemeYapilacakTaksit.kalan_tutar || odemeYapilacakTaksit.taksit_tutari}
                  />
                </div>

                <div>
                  <label htmlFor="odemeTarihi" className="block text-sm font-medium text-gray-700 mb-2">
                    Ödeme Tarihi *
                  </label>
                  <input
                    type="date"
                    id="odemeTarihi"
                    value={odemeTarihi}
                    onChange={(e) => setOdemeTarihi(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={odemeModalKapat}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition duration-200"
              >
                İptal
              </button>
              <button
                onClick={odemeKaydet}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200"
              >
                Ödemeyi Kaydet
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {formModalAcik && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-[16px] font-bold text-gray-800">Yeni Sözleşme Ekle</h3>
                <button
                  onClick={() => setFormModalAcik(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <SozlesmeForm
                onSozlesmeEklendi={() => {
                  setFormModalAcik(false);
                  taksitleriYukle();
                  if (onSozlesmeEklendi) {
                    onSozlesmeEklendi();
                  }
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SozlesmeListesi;

