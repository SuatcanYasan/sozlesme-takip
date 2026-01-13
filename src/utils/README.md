# Utils/Helpers Klasörü

Bu klasör, projede tekrar eden kodları merkezi bir yerden yönetmek için oluşturulmuştur.

## 📁 Dosya Yapısı

```
src/utils/
├── index.js              # Tüm utility fonksiyonlarının merkezi export noktası
├── formatters.js         # Para ve tarih formatlama fonksiyonları
├── validators.js         # Validasyon fonksiyonları
├── constants.js          # Sabitler ve status yönetimi
├── helpers.js            # Genel yardımcı fonksiyonlar
└── firebaseHelpers.js    # Firebase işlem helper'ları
```

## 📚 Fonksiyonlar

### formatters.js
- `formatCurrency(tutar)` - Para birimi formatlar (₺)
- `formatDate(timestamp)` - Firebase Timestamp'i formatlar (uzun format)
- `formatShortDate(timestamp)` - Firebase Timestamp'i formatlar (kısa format)

### validators.js
- `isPositiveNumber(value)` - Pozitif sayı kontrolü
- `isValidDate(dateString)` - Geçerli tarih kontrolü
- `areFieldsFilled(formData, requiredFields)` - Form alan doluluğu kontrolü

### constants.js
- `STATUS` - Status değerleri (ODENDI: 0, ODEME_BEKLIYOR: 1, KISMI_ODENDI: 2)
- `STATUS_LABELS` - Status etiketleri
- `STATUS_COLORS` - Status renkleri (Tailwind CSS)
- `calculateStatus(odenenTutar, kalanTutar)` - Status hesaplama
- `getStatusBadge(status)` - Status badge props döndürür

### helpers.js
- `calculateRemainingAmount(taksit)` - Kalan tutar hesaplama
- `paginateData(data, currentPage, itemsPerPage)` - Sayfalama
- `calculateTotalPages(totalItems, itemsPerPage)` - Toplam sayfa sayısı
- `debounce(func, wait)` - Debounce fonksiyonu

### firebaseHelpers.js
- `fetchCollectionData(db, collection, getDocs, collectionName)` - Collection veri çekme
- `getUniqueValues(array, key)` - Benzersiz değer filtreleme

## 🎯 Kullanım

### Tek Import
```javascript
import { 
  formatCurrency, 
  formatDate, 
  STATUS, 
  calculateRemainingAmount,
  isPositiveNumber
} from '../utils';
```

### Örnek Kullanımlar

#### Para Formatlama
```javascript
const tutar = 1500;
const formatted = formatCurrency(tutar); // "1.500 ₺"
```

#### Status Yönetimi
```javascript
const status = calculateStatus(1000, 500); // STATUS.PARTIALLY_PAID
const badge = getStatusBadge(status); 
// { label: "Kısmi Ödendi", color: "bg-yellow-100 text-yellow-800" }
```

#### Validasyon
```javascript
if (!isPositiveNumber(tutar)) {
  alert('Geçerli bir tutar girin');
}
```

#### Kalan Tutar Hesaplama
```javascript
const kalan = calculateRemainingAmount(taksit);
// taksit.kalan_tutar !== undefined ? taksit.kalan_tutar : taksit.taksit_tutari
```

## ✅ Avantajlar

1. **DRY Prensibi** - Don't Repeat Yourself
2. **Merkezi Yönetim** - Tek noktadan güncelleme
3. **Tip Güvenliği** - JSDoc ile dökümantasyon
4. **Kolay Test** - İzole edilmiş fonksiyonlar
5. **ESLint Uyumlu** - Best practices
6. **Performans** - Optimize edilmiş helper'lar

## 🔄 Refactor Edilen Dosyalar

- ✅ Dashboard.jsx
- ✅ OdemeListesi.jsx
- ✅ OdemeGrafigi.jsx
- ✅ SozlesmeListesi.jsx

## 📝 Notlar

- Tüm fonksiyonlar JSDoc ile dökümante edilmiştir
- ES6+ syntax kullanılmıştır
- Pure functions prensibi uygulanmıştır
- Side-effect'siz tasarım

