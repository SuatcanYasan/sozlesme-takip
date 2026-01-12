/**
 * Genel yardımcı fonksiyonlar
 */

/**
 * Kalan tutar hesaplama
 * @param {Object} taksit - Taksit objesi
 * @returns {number} Kalan tutar
 */
export const calculateKalanTutar = (taksit) => {
  return taksit.kalan_tutar !== undefined
    ? taksit.kalan_tutar
    : taksit.taksit_tutari;
};

/**
 * Sayfalama için veri dilimleme
 * @param {Array} data - Tüm veri
 * @param {number} currentPage - Mevcut sayfa
 * @param {number} itemsPerPage - Sayfa başına kayıt
 * @returns {Array} Dilimlenmiş veri
 */
export const paginateData = (data, currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
};

/**
 * Toplam sayfa sayısı hesaplama
 * @param {number} totalItems - Toplam kayıt
 * @param {number} itemsPerPage - Sayfa başına kayıt
 * @returns {number} Toplam sayfa sayısı
 */
export const calculateTotalPages = (totalItems, itemsPerPage) => {
  return Math.ceil(totalItems / itemsPerPage);
};

/**
 * Debounce fonksiyonu
 * @param {Function} func - Çalıştırılacak fonksiyon
 * @param {number} wait - Bekleme süresi (ms)
 * @returns {Function} Debounced fonksiyon
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

