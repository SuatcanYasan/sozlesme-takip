import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OdemeGrafigi = ({ yenile }) => {
  const [grafikVerisi, setGrafikVerisi] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [toplamGelir, setToplamGelir] = useState(0);

  const formatPara = (tutar) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(tutar);
  };

  const odemeTarihleriniHesapla = (sozlesmeler) => {
    const aylikOdemeler = {};

    sozlesmeler.forEach((sozlesme) => {
      if (!sozlesme.sozlesme_tarihi || !sozlesme.vade_araligi || !sozlesme.taksit_sayisi) {
        return;
      }

      try {
        let odemeTarihi = sozlesme.sozlesme_tarihi.toDate();
        const vadeAraligi = parseInt(sozlesme.vade_araligi);
        const taksitSayisi = parseInt(sozlesme.taksit_sayisi);
        const taksitTutari = parseFloat(sozlesme.taksit_tutari || sozlesme.taksit_tutari);

        for (let i = 0; i < taksitSayisi; i++) {
          odemeTarihi = new Date(odemeTarihi);
          odemeTarihi.setDate(odemeTarihi.getDate() + vadeAraligi);

          const yil = odemeTarihi.getFullYear();
          const ay = odemeTarihi.getMonth() + 1;
          const ayAnahtari = `${yil}-${ay.toString().padStart(2, '0')}`;

          const ayAdi = odemeTarihi.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long'
          });

          if (!aylikOdemeler[ayAnahtari]) {
            aylikOdemeler[ayAnahtari] = {
              ay: ayAdi,
              tutar: 0,
              adet: 0
            };
          }

          aylikOdemeler[ayAnahtari].tutar += taksitTutari;
          aylikOdemeler[ayAnahtari].adet += 1;
        }
      } catch (error) {
        console.error('Ödeme tarihi hesaplama hatası:', error, sozlesme);
      }
    });

    const siraliVeriler = Object.keys(aylikOdemeler)
      .sort()
      .map(anahtar => ({
        ay: aylikOdemeler[anahtar].ay,
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
      const taksitListesi = [];

      querySnapshot.forEach((doc) => {
        taksitListesi.push({
          id: doc.id,
          ...doc.data()
        });
      });

      const grafikVerisi = odemeTarihleriniHesapla(taksitListesi);
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-[16px] font-bold text-gray-800">
              Aylık Gelir Projeksiyonu
            </h2>
            <p className="text-gray-600 mt-1">
              Sözleşme ödemelerine göre aylık gelir tahmini
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm md:text-[14px] text-gray-600">Toplam Beklenen Gelir</p>
            <p className="text-lg md:text-[18px] font-bold text-green-600 font-number">
              {formatPara(toplamGelir)}
            </p>
          </div>
        </div>
      </div>

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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ay"
              angle={-45}
              textAnchor="end"
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
  );
};

export default OdemeGrafigi;

