import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OdemeGrafigi = ({ yenile }) => {
  const [grafikVerisi, setGrafikVerisi] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [toplamGelir, setToplamGelir] = useState(0);
  const [modalAcik, setModalAcik] = useState(false);
  const [seciliAyVerileri, setSeciliAyVerileri] = useState([]);
  const [seciliAyAdi, setSeciliAyAdi] = useState('');
  const [tumVadeler, setTumVadeler] = useState([]);

  const formatPara = (tutar) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(tutar);
  };

  const odemeTarihleriniHesapla = (vadeler) => {
    const aylikOdemeler = {};

    vadeler.forEach((vade) => {
      if (!vade.vade_tarihi || !vade.taksit_tutari || vade.status !== 1) {
        return;
      }

      try {
        const vadeTarihi = vade.vade_tarihi.toDate();
        const tutar = parseFloat(vade.taksit_tutari);

        const yil = vadeTarihi.getFullYear();
        const ay = vadeTarihi.getMonth() + 1;
        const ayAnahtari = `${yil}-${ay.toString().padStart(2, '0')}`;

        const ayAdi = vadeTarihi.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long'
        });

        if (!aylikOdemeler[ayAnahtari]) {
          aylikOdemeler[ayAnahtari] = {
            ay: ayAdi,
            ayAnahtari: ayAnahtari,
            tutar: 0,
            adet: 0
          };
        }

        aylikOdemeler[ayAnahtari].tutar += tutar;
        aylikOdemeler[ayAnahtari].adet += 1;
      } catch (error) {
        console.error('Ödeme tarihi hesaplama hatası:', error, vade);
      }
    });

    const siraliVeriler = Object.keys(aylikOdemeler)
      .sort()
      .map(anahtar => ({
        ay: aylikOdemeler[anahtar].ay,
        ayAnahtari: aylikOdemeler[anahtar].ayAnahtari,
        tutar: Math.round(aylikOdemeler[anahtar].tutar),
        adet: aylikOdemeler[anahtar].adet
      }));

    const toplam = siraliVeriler.reduce((sum, item) => sum + item.tutar, 0);
    setToplamGelir(toplam);

    return siraliVeriler;
  };

  const verileriYukle = async () => {
    setYukleniyor(true);
    setHata('');

    try {
      const querySnapshot = await getDocs(collection(db, 'sozlesmeler'));
      const vadeListesi = [];

      querySnapshot.forEach((doc) => {
        vadeListesi.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('Toplam vade sayısı:', vadeListesi.length);
      console.log('Örnek vade verisi:', vadeListesi[0]);
      console.log('Status 1 olan vadeler:', vadeListesi.filter(v => v.status === 1).length);

      setTumVadeler(vadeListesi);
      const grafikVerisi = odemeTarihleriniHesapla(vadeListesi);
      console.log('Grafik verisi:', grafikVerisi);
      setGrafikVerisi(grafikVerisi);
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      setHata('Grafik verileri yüklenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    verileriYukle();
  }, [yenile]);

  const handleBarClick = (data) => {
    if (!data || !data.ayAnahtari) return;

    const ayAnahtari = data.ayAnahtari;
    const ayVadeleri = tumVadeler.filter(vade => {
      if (!vade.vade_tarihi || vade.status !== 1) return false;

      try {
        const vadeTarihi = vade.vade_tarihi.toDate();
        const yil = vadeTarihi.getFullYear();
        const ay = vadeTarihi.getMonth() + 1;
        const vadeAyAnahtari = `${yil}-${ay.toString().padStart(2, '0')}`;

        return vadeAyAnahtari === ayAnahtari;
      } catch (error) {
        return false;
      }
    });

    setSeciliAyAdi(data.ay);
    setSeciliAyVerileri(ayVadeleri);
    setModalAcik(true);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].payload.ay}</p>
          <p className="text-green-600 font-bold font-number">{formatPara(payload[0].value)}</p>
          <p className="text-sm text-gray-600 font-number">{payload[0].payload.adet} ödeme</p>
        </div>
      );
    }
    return null;
  };

  if (yukleniyor) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Grafik yükleniyor...</span>
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

  if (grafikVerisi.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Aylık Gelir Projeksiyonu
        </h2>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-4 text-gray-600">Henüz grafik verisi yok</p>
          <p className="text-sm text-gray-500 mt-1">Sözleşme eklendiğinde burada görüntülenecek</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-700">
              Aylık Gelir Projeksiyonu
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Sözleşme ödemelerine göre aylık gelir tahmini
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Toplam Beklenen Gelir</p>
            <p className="text-lg md:text-[18px] font-bold text-green-600 font-number">
              {formatPara(toplamGelir)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm md:text-[14px] text-gray-600">Toplam Ödeme Dönemi</p>
            <p className="text-base md:text-[18px] font-bold text-blue-600 font-number">{grafikVerisi.length} Ay</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm md:text-[14px] text-gray-600">Aylık Ortalama</p>
            <p className="text-base md:text-[18px] font-bold text-green-600 font-number">
              {formatPara(toplamGelir / grafikVerisi.length)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm md:text-[14px] text-gray-600">Toplam Ödeme Sayısı</p>
            <p className="text-base md:text-[18px] font-bold text-purple-600 font-number">
              {grafikVerisi.reduce((sum, item) => sum + item.adet, 0)} Adet
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={grafikVerisi}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <XAxis
              dataKey="ay"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="tutar"
              fill="#3b82f6"
              name="Gelir (₺)"
              radius={[8, 8, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ay
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ödeme Sayısı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Toplam Tutar
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {grafikVerisi.map((veri, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {veri.ay}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 font-number">
                    {veri.adet} Ödeme
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 font-number">
                  {formatPara(veri.tutar)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {modalAcik && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setModalAcik(false)}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-bold text-gray-900">
                    {seciliAyAdi} - Ödeme Detayları
                  </h3>
                  <button
                    onClick={() => setModalAcik(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4">
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-[14px] text-gray-600">Toplam Ödeme</p>
                      <p className="text-[18px] font-bold text-blue-600 font-number">{seciliAyVerileri.length} Adet</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-[14px] text-gray-600">Toplam Tutar</p>
                      <p className="text-[18px] font-bold text-green-600 font-number">
                        {formatPara(seciliAyVerileri.reduce((sum, v) => sum + (v.taksit_tutari || 0), 0))}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-[14px] text-gray-600">Kalan Tutar</p>
                      <p className="text-[18px] font-bold text-purple-600 font-number">
                        {formatPara(seciliAyVerileri.reduce((sum, v) => sum + (v.kalan_tutar || 0), 0))}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Sözleşme No
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            İsim Soyisim
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Vade Tarihi
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Taksit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tutar
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Kalan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {seciliAyVerileri.map((vade) => (
                          <tr key={vade.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {vade.sozlesme_no}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {vade.isim} {vade.soyisim}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {vade.vade_tarihi ? new Date(vade.vade_tarihi.toDate()).toLocaleDateString('tr-TR') : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {vade.taksit_sira}/{vade.toplam_taksit}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600 font-number">
                              {formatPara(vade.taksit_tutari || 0)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-orange-600 font-number">
                              {formatPara(vade.kalan_tutar || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setModalAcik(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OdemeGrafigi;

