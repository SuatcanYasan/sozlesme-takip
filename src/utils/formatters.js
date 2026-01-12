/**
 * Para birimi formatlama fonksiyonu
 * @param {number} tutar - Formatlanacak tutar
 * @returns {string} Formatlanmış para birimi (₺)
 */
export const formatPara = (tutar) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(tutar);
};

/**
 * Tarih formatlama fonksiyonu
 * @param {Object} timestamp - Firebase Timestamp objesi
 * @returns {string} Formatlanmış tarih (gün ay, yıl)
 */
export const formatTarih = (timestamp) => {
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

/**
 * Kısa tarih formatlama fonksiyonu (gün/ay/yıl)
 * @param {Object} timestamp - Firebase Timestamp objesi
 * @returns {string} Formatlanmış kısa tarih
 */
export const formatKisaTarih = (timestamp) => {
  if (!timestamp) return '-';

  try {
    const tarih = timestamp.toDate();
    return tarih.toLocaleDateString('tr-TR');
  } catch (error) {
    console.error('Tarih formatlama hatası:', error);
    return '-';
  }
};

