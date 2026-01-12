/**
 * Status yönetimi için sabitler ve yardımcı fonksiyonlar
 */

export const STATUS = {
  ODENDI: 0,
  ODEME_BEKLIYOR: 1,
  KISMI_ODENDI: 2
};

export const STATUS_LABELS = {
  [STATUS.ODENDI]: 'Ödendi',
  [STATUS.ODEME_BEKLIYOR]: 'Ödeme Bekliyor',
  [STATUS.KISMI_ODENDI]: 'Kısmi Ödendi'
};

export const STATUS_COLORS = {
  [STATUS.ODENDI]: 'bg-green-100 text-green-800',
  [STATUS.ODEME_BEKLIYOR]: 'bg-blue-100 text-blue-800',
  [STATUS.KISMI_ODENDI]: 'bg-yellow-100 text-yellow-800'
};

/**
 * Ödeme durumuna göre status hesaplar
 * @param {number} odenenTutar - Ödenen tutar
 * @param {number} kalanTutar - Kalan tutar
 * @returns {number} Status değeri
 */
export const calculateStatus = (odenenTutar, kalanTutar) => {
  if (kalanTutar === 0) {
    return STATUS.ODENDI;
  } else if (odenenTutar > 0 && kalanTutar > 0) {
    return STATUS.KISMI_ODENDI;
  }
  return STATUS.ODEME_BEKLIYOR;
};

/**
 * Status badge component için props döndürür
 * @param {number} status - Status değeri
 * @returns {Object} Label ve color
 */
export const getStatusBadge = (status = STATUS.ODEME_BEKLIYOR) => {
  return {
    label: STATUS_LABELS[status],
    color: STATUS_COLORS[status]
  };
};

