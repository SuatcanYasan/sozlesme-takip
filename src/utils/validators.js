/**
 * Validasyon fonksiyonları
 */

/**
 * Pozitif sayı kontrolü
 * @param {number} value - Kontrol edilecek değer
 * @returns {boolean} Geçerli mi?
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Geçerli tarih kontrolü
 * @param {string} dateString - Kontrol edilecek tarih string'i
 * @returns {boolean} Geçerli mi?
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Form alanlarının dolu olup olmadığını kontrol eder
 * @param {Object} formData - Form verileri
 * @param {Array} requiredFields - Zorunlu alanlar
 * @returns {boolean} Tüm alanlar dolu mu?
 */
export const areFieldsFilled = (formData, requiredFields) => {
  return requiredFields.every(field => formData[field] && formData[field].toString().trim() !== '');
};

