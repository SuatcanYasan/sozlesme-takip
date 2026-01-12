import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const SozlesmeForm = ({ onSozlesmeEklendi }) => {
  const [formData, setFormData] = useState({
    isim: '',
    soyisim: '',
    gsm: '',
    sozlesme_no: '',
    sozlesme_tarihi: '',
    vade_baslangic_tarihi: '',
    taksit_sayisi: '',
    taksit_tutari: '',
    vade_araligi: ''
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [basari, setBasari] = useState(false);
  const [basariMesaji, setBasariMesaji] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    setBasari(false);
    setYukleniyor(true);

    try {
      if (!formData.isim || !formData.soyisim || !formData.sozlesme_no ||
          !formData.sozlesme_tarihi || !formData.vade_baslangic_tarihi ||
          !formData.taksit_sayisi || !formData.taksit_tutari || !formData.vade_araligi) {
        throw new Error('Lütfen tüm alanları doldurun');
      }

      const sozlesmeTarihi = new Date(formData.sozlesme_tarihi);
      const vadeBaslangicTarihi = new Date(formData.vade_baslangic_tarihi);
      const taksitSayisi = Number(formData.taksit_sayisi);
      const taksitTutari = Number(formData.taksit_tutari);
      const vadeAraligi = Number(formData.vade_araligi);

      const taksitKayitlari = [];
      for (let i = 0; i < taksitSayisi; i++) {
        const vadeTarihi = new Date(vadeBaslangicTarihi);
        vadeTarihi.setDate(vadeTarihi.getDate() + (vadeAraligi * i));

        const taksitData = {
          isim: formData.isim,
          soyisim: formData.soyisim,
          gsm: formData.gsm,
          sozlesme_no: formData.sozlesme_no,
          sozlesme_tarihi: Timestamp.fromDate(sozlesmeTarihi),
          vade_baslangic_tarihi: Timestamp.fromDate(vadeBaslangicTarihi),
          vade_tarihi: Timestamp.fromDate(vadeTarihi),
          taksit_sira: i + 1,
          toplam_taksit: taksitSayisi,
          taksit_tutari: taksitTutari,
          odenen_tutar: 0,
          kalan_tutar: taksitTutari,
          vade_araligi: vadeAraligi,
          status: 1,
          olusturma_tarihi: Timestamp.now()
        };

        taksitKayitlari.push(taksitData);
      }

      const kayitPromises = taksitKayitlari.map(taksit =>
        addDoc(collection(db, 'sozlesmeler'), taksit)
      );

      await Promise.all(kayitPromises);

      setFormData({
        isim: '',
        soyisim: '',
        gsm: '',
        sozlesme_no: '',
        sozlesme_tarihi: '',
        vade_baslangic_tarihi: '',
        taksit_sayisi: '',
        taksit_tutari: '',
        vade_araligi: ''
      });

      setBasari(true);
      setBasariMesaji(`${taksitSayisi} adet taksit başarıyla eklendi!`);

      if (onSozlesmeEklendi) {
        onSozlesmeEklendi();
      }

      setTimeout(() => {
        setBasari(false);
        setBasariMesaji('');
      }, 3000);

    } catch (error) {
      console.error('Sözleşme eklenirken hata:', error);
      setHata(error.message || 'Sözleşme eklenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* İsim */}
            <div>
              <label htmlFor="isim" className="block text-sm font-medium text-gray-700 mb-2">
                İsim *
              </label>
              <input
                  type="text"
                  id="isim"
                  name="isim"
                  value={formData.isim}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Örn: Ahmet"
                  required
              />
            </div>

            {/* Soyisim */}
            <div>
              <label htmlFor="soyisim" className="block text-sm font-medium text-gray-700 mb-2">
                Soyisim *
              </label>
              <input
                  type="text"
                  id="soyisim"
                  name="soyisim"
                  value={formData.soyisim}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Örn: Yılmaz"
                  required
              />
            </div>

            {/* Telefon Numarası */}
            <div>
              <label htmlFor="gsm" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası
              </label>
              <input
                  type="tel"
                  id="gsm"
                  name="gsm"
                  value={formData.gsm}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Örn: 0555 123 4567"
              />
            </div>

            {/* Sözleşme No */}
            <div>
              <label htmlFor="sozlesme_no" className="block text-sm font-medium text-gray-700 mb-2">
                Sözleşme No *
              </label>
              <input
                  type="text"
                  id="sozlesme_no"
                  name="sozlesme_no"
                  value={formData.sozlesme_no}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Örn: SZL-2024-001"
                  required
              />
            </div>

            {/* Sözleşme Tarihi */}
            <div>
              <label htmlFor="sozlesme_tarihi" className="block text-sm font-medium text-gray-700 mb-2">
                Sözleşme Tarihi *
              </label>
              <input
                  type="date"
                  id="sozlesme_tarihi"
                  name="sozlesme_tarihi"
                  value={formData.sozlesme_tarihi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
              />
            </div>

            {/* Vade Başlangıç Tarihi */}
            <div>
              <label htmlFor="vade_baslangic_tarihi" className="block text-sm font-medium text-gray-700 mb-2">
                Vade Başlangıç Tarihi *
              </label>
              <input
                  type="date"
                  id="vade_baslangic_tarihi"
                  name="vade_baslangic_tarihi"
                  value={formData.vade_baslangic_tarihi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
              />
            </div>

            {/* Taksit Sayısı */}
            <div>
              <label htmlFor="taksit_sayisi" className="block text-sm font-medium text-gray-700 mb-2">
                Taksit Sayısı *
              </label>
              <input
                  type="number"
                  id="taksit_sayisi"
                  name="taksit_sayisi"
                  value={formData.taksit_sayisi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Örn: 12"
                  min="1"
                  required
              />
            </div>

            {/* Vade Aralığı */}
            <div>
              <label htmlFor="vade_araligi" className="block text-sm font-medium text-gray-700 mb-2">
                Vade Aralığı *
              </label>
              <input
                  type="number"
                  id="vade_araligi"
                  name="vade_araligi"
                  value={formData.vade_araligi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Örn: 3"
                  min="1"
                  required
              />
            </div>
        {/* Taksit Tutar */}
        <div>
          <label htmlFor="taksit_tutari" className="block text-sm font-medium text-gray-700 mb-2">
            Taksit Tutarı (₺) *
          </label>
          <input
              type="number"
              id="taksit_tutari"
              name="taksit_tutari"
              value={formData.taksit_tutari}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Örn: 1500.00"
              min="0"
              step="0.01"
              required
          />
        </div>
          </div>

          {hata && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {hata}
              </div>
          )}

          {basari && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                ✓ {basariMesaji}
              </div>
          )}

          <button
              type="submit"
              disabled={yukleniyor}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {yukleniyor && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {yukleniyor ? 'Ekleniyor...' : 'Sözleşme Ekle'}
          </button>
        </form>
  );
};

export default SozlesmeForm;

