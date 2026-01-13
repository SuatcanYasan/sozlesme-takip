export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '-';

  try {
    const date = timestamp.toDate();
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Tarih formatlama hatası:', error);
    return '-';
  }
};

export const formatShortDate = (timestamp) => {
  if (!timestamp) return '-';

  try {
    const date = timestamp.toDate();
    return date.toLocaleDateString('tr-TR');
  } catch (error) {
    console.error('Tarih formatlama hatası:', error);
    return '-';
  }
};

