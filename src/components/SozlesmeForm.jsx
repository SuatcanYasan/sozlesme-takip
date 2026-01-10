import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const SozlesmeForm = ({ onSozlesmeEklendi }) => {
  const [formData, setFormData] = useState({
    isim: '',
    soyisim: '',
    sozlesme_no: '',
    sozlesme_tarihi: '',
    taksit_sayisi: '',
    aylik_tutar: '',
    vade_araligi: ''
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [basari, setBasari] = useState(false);

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
      // Form validasyonu
      if (!formData.isim || !formData.soyisim || !formData.sozlesme_no ||
          !formData.sozlesme_tarihi || !formData.taksit_sayisi ||
          !formData.aylik_tutar || !formData.vade_araligi) {
        throw new Error('Lütfen tüm alanları doldurun');
      }

      // Tarihi Timestamp'e çevir
      const tarih = new Date(formData.sozlesme_tarihi);
      const timestamp = Timestamp.fromDate(tarih);

      // Firestore'a kaydet
      await addDoc(collection(db, 'sozlesmeler'), {
        isim: formData.isim,
        soyisim: formData.soyisim,
        sozlesme_no: formData.sozlesme_no,
        sozlesme_tarihi: timestamp,
        taksit_sayisi: Number(formData.taksit_sayisi),
        aylik_tutar: Number(formData.aylik_tutar),
        vade_araligi: Number(formData.vade_araligi),
        olusturma_tarihi: Timestamp.now()
      });

      // Formu temizle
      setFormData({
        isim: '',
        soyisim: '',
        sozlesme_no: '',
        sozlesme_tarihi: '',
        taksit_sayisi: '',
        aylik_tutar: '',
        vade_araligi: ''
      });

      setBasari(true);

      // Parent component'e bildir
      if (onSozlesmeEklendi) {
        onSozlesmeEklendi();
      }

      // Başarı mesajını 3 saniye sonra kaldır
      setTimeout(() => setBasari(false), 3000);

    } catch (error) {
      console.error('Sözleşme eklenirken hata:', error);
      setHata(error.message || 'Sözleşme eklenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Yeni Sözleşme Ekle
        </h2>

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

            {/* Aylık Tutar */}
            <div>
              <label htmlFor="aylik_tutar" className="block text-sm font-medium text-gray-700 mb-2">
                Aylık Tutar (₺) *
              </label>
              <input
                  type="number"
                  id="aylik_tutar"
                  name="aylik_tutar"
                  value={formData.aylik_tutar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Örn: 1500.00"
                  min="0"
                  step="0.01"
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
          </div>

          {hata && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {hata}
              </div>
          )}

          {basari && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                ✓ Sözleşme başarıyla eklendi!
              </div>
          )}

          <button
              type="submit"
              disabled={yukleniyor}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {yukleniyor ? 'Ekleniyor...' : 'Sözleşme Ekle'}
          </button>
        </form>
      </div>
  );
};

export default SozlesmeForm;

