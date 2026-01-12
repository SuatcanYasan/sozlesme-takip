# 📋 Sözleşme Yönetim Paneli

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Firebase Firestore ve React ile geliştirilmiş modern, responsive sözleşme yönetim sistemi**

[Özellikler](#-özellikler) • [Kurulum](#-hızlı-başlangıç) • [Kullanım](#-kullanım) • [Yapı](#-proje-yapısı)

</div>

---

## 🚀 Özellikler

### 📝 Sözleşme Yönetimi
- ➕ **Sözleşme Ekleme** - Kolay ve hızlı form ile sözleşme girişi
- 📊 **Listele & Görüntüle** - Tablo formatında tüm sözleşmeleri görüntüleme
- 🗑️ **Güvenli Silme** - Onay dialogu ile sözleşme silme
- 🔄 **Gerçek Zamanlı Senkronizasyon** - Firebase Firestore entegrasyonu
- 📈 **Gelir Projeksiyonu** - Aylık gelir grafiği ve ödeme takvimi
- 🔘 **Durum Yönetimi** - Sözleşmeleri aktif/kapalı olarak işaretleme
- 🔍 **Gelişmiş Arama** - Her sütun için özel arama filtreleri
- 📄 **Pagination** - Sayfa başına 10 kayıt ile kolay navigasyon
### 🎨 Kullanıcı Arayüzü
- ✨ Modern ve profesyonel tasarım (Tailwind CSS)
- 📱 Tam responsive (Mobile-first yaklaşım)
- 🎯 Kullanıcı dostu form validasyonu
- ⚡ Hızlı ve akıcı animasyonlar
- 🌈 Gradient arka plan ve gölge efektleri

### 💼 İş Mantığı
- 📅 Otomatik tarih formatlaması (Türkçe)
- 💰 TL para birimi formatlaması
- 🧮 Toplam tutar hesaplama (Taksit Sayısı × Taksit Tutarı)
- 🔐 Firebase Timestamp desteği
- ✅ Hata yönetimi ve kullanıcı geri bildirimleri

---

## 📦 Teknolojiler

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **React** | 18.2.0 | UI Framework |
| **Firebase** | 10.7.1 | Backend & Database (SDK v10+ Modular) |
| **Firestore** | - | NoSQL Veritabanı |
| **Vite** | 5.0.8 | Build Tool & Dev Server |
| **Tailwind CSS** | 3.4.0 | Utility-First CSS Framework |
| **PostCSS** | 8.4.32 | CSS Processing |

---

## ⚡ Hızlı Başlangıç

### 1️⃣ Projeyi Klonlayın

```bash
git clone https://github.com/yourusername/sozlesme-takip.git
cd sozlesme-takip
```

### 2️⃣ Bağımlılıkları Yükleyin

```bash
npm install
```

### 3️⃣ Firebase Yapılandırması

#### a) Firebase Projesi Oluşturun

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. **"Add project"** butonuna tıklayın
3. Proje adı girin (örn: `sozlesme-takip`)
4. Google Analytics (isteğe bağlı)
5. **"Create project"** butonuna tıklayın

#### b) Web App Ekleyin

1. Proje genel bakışında **"</>**" (Web) ikonuna tıklayın
2. App nickname: `Sozlesme Takip Web`
3. **"Register app"** butonuna tıklayın
4. Firebase SDK config bilgilerini kopyalayın

#### c) Firestore Database Oluşturun

1. Sol menüden **"Build"** → **"Firestore Database"**
2. **"Create database"** butonuna tıklayın
3. Location seçin (örn: `europe-west3` - Frankfurt)
4. **"Start in test mode"** seçeneğini seçin
5. **"Enable"** butonuna tıklayın

#### d) Environment Variables Ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

`.env` dosyasını açın ve Firebase config değerlerinizi ekleyin:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4️⃣ Uygulamayı Başlatın

```bash
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açın 🎉

---

## 🎯 Kullanım

### Sözleşme Ekleme

1. Formdaki tüm alanları doldurun:
   - **Sözleşme No:** Örn: `SZL-2026-001`
   - **Sözleşme Tarihi:** Date picker'dan seçin
   - **Taksit Sayısı:** Örn: `12`
   - **Vade Aralığı:** Örn: `3` (ay cinsinden)
   - **Taksit Tutar:** Örn: `5000.00`
2. **"Sözleşme Ekle"** butonuna tıklayın
3. Başarı mesajını görün ✅

### Sözleşmeleri Görüntüleme

- Eklenen tüm sözleşmeler otomatik olarak tabloda listelenir
- Tarihler Türkçe formatında (örn: "11 Ocak 2026")
- Tutarlar TL sembolü ile (örn: "₺5.000,00")
- Toplam tutar otomatik hesaplanır

### 🔍 Arama ve Filtreleme

- **Her Sütun İçin Arama:** Her sütunun altında arama kutusu bulunur
- **Gerçek Zamanlı Filtreleme:** Yazdıkça sonuçlar anında filtrelenir
- **Durum Filtresi:** Aktif/Kapalı sözleşmeleri seçerek filtreleyebilirsiniz
- **Aramaları Temizle:** Tek tıkla tüm aramaları sıfırlayın

### 📄 Pagination (Sayfalama)

- **Sayfa Başına 10 Kayıt:** Liste otomatik olarak sayfalara bölünür
- **Navigasyon Butonları:**
  - İlk / Son sayfa
  - Önceki / Sonraki sayfa
  - Direkt sayfa numarasına tıklama
- **Akıllı Sayfa Gösterimi:** Çok fazla sayfa varsa "..." ile kısaltılır
- **Kayıt Sayacı:** "1-10 arası gösteriliyor (Toplam 25 kayıt)"

### Sözleşme Durumu

- **Aktif/Kapalı Toggle:** Her sözleşmenin yanındaki durum butonuna tıklayın
- **Görsel Gösterge:** Yeşil (Aktif) / Gri (Kapalı)
- **Tek Tıkla Değiştir:** Butona tıklayarak durumu hemen güncelleyin

### Sözleşme Silme

1. Silmek istediğiniz sözleşmenin yanındaki **"Sil"** butonuna tıklayın
2. Onay dialogunda **"Tamam"** seçin
3. Sözleşme listeden kaldırılır 🗑️

### Gelir Projeksiyonu Grafiği 📈

**Ödeme Tarihi Hesaplama Mantığı:**
- **İlk Ödeme:** Sözleşme Tarihi + Vade Aralığı
- **Sonraki Ödemeler:** Bir önceki ödeme + Vade Aralığı
- **Tekrar Sayısı:** Taksit Sayısı

**Örnek Hesaplama:**
```
Sözleşme Tarihi: 1 Ocak 2026
Vade Aralığı: 5 gün
Taksit Sayısı: 3
Taksit Tutarı: 1000 ₺

Ödeme Tarihleri:
1. Ödeme: 6 Ocak 2026  → 1000 ₺
2. Ödeme: 11 Ocak 2026 → 1000 ₺
3. Ödeme: 16 Ocak 2026 → 1000 ₺
```

**Grafik Özellikleri:**
- 📊 Aylara göre gruplandırılmış gelir grafiği
- 💰 Her ay için toplam gelir ve ödeme sayısı
- 📈 İnteraktif bar chart (hover ile detaylar)
- 📋 Tablo formatında detaylı görünüm
- 🧮 Aylık ortalama ve toplam istatistikler

---

## 📁 Proje Yapısı

```
sozlesme-takip/
├── public/                          # Statik dosyalar
├── src/
│   ├── components/
│   │   ├── SozlesmeForm.jsx        # Sözleşme ekleme formu
│   │   └── SozlesmeListesi.jsx     # Sözleşme listesi tablosu
│   ├── App.jsx                      # Ana uygulama bileşeni
│   ├── firebase.js                  # Firebase yapılandırması (env'den)
│   ├── main.jsx                     # React giriş noktası
│   └── index.css                    # Tailwind CSS
├── .env                             # Environment variables (git'e dahil değil)
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore kuralları
├── index.html                       # Ana HTML
├── vite.config.js                   # Vite yapılandırması
├── tailwind.config.js               # Tailwind yapılandırması
├── postcss.config.js                # PostCSS yapılandırması
├── package.json                     # Bağımlılıklar ve scriptler
└── README.md                        # Proje dokümantasyonu
```

---

## 📊 Firestore Veri Yapısı

**Koleksiyon:** `sozlesmeler`

```javascript
{
  isim: "Ahmet",                         // string
  soyisim: "Yılmaz",                     // string
  sozlesme_no: "SZL-2026-001",           // string
  sozlesme_tarihi: Timestamp,            // Firebase Timestamp
  taksit_sayisi: 12,                     // number
  vade_araligi: 3,                       // number (ay cinsinden)
  taksit_tutari: 5000.00,                  // number
  olusturma_tarihi: Timestamp            // Firebase Timestamp (otomatik)
}
```

### Örnek Döküman

```json
{
  "isim": "Ahmet",
  "soyisim": "Yılmaz",
  "sozlesme_no": "SZL-2026-001",
  "sozlesme_tarihi": "2026-01-11T00:00:00Z",
  "taksit_sayisi": 12,
  "vade_araligi": 3,
  "taksit_tutari": 5000,
  "status": 1,
  "olusturma_tarihi": "2026-01-11T10:30:00Z"
}
```

---

## 🛠️ Komutlar

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Production build oluştur
npm run build

# Build'i önizle
npm run preview

# Bağımlılıkları yükle
npm install
```

---

## 🔒 Güvenlik

### Firestore Güvenlik Kuralları

⚠️ **Test Mode** şu anda aktif (herkes okuyup yazabilir). Production için aşağıdaki kuralları kullanın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sozlesmeler/{document} {
      // Sadece authenticated kullanıcılar okuyup yazabilir
      allow read, write: if request.auth != null;
    }
  }
}
```

### Environment Variables Güvenliği

- ✅ `.env` dosyası `.gitignore`'da
- ✅ API keys Git'e yüklenmiyor
- ✅ `.env.example` sadece template içeriyor
- ⚠️ Production'da Firebase Security Rules mutlaka güncelleyin

---

## 🎨 Özelleştirme

### Renk Teması Değiştirme

`tailwind.config.js` dosyasını düzenleyin:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',    // Mavi
        secondary: '#6366F1',  // İndigo
        // Kendi renklerinizi ekleyin
      },
    },
  },
}
```

### Form Alanları Ekleme

`src/components/SozlesmeForm.jsx` dosyasından yeni input alanları ekleyebilirsiniz:

```jsx
// Örnek: Telefon numarası alanı ekle
<input
  type="tel"
  name="telefon"
  value={formData.telefon}
  onChange={handleChange}
  placeholder="Telefon"
/>
```

**Not:** Mevcut formda isim, soyisim, sözleşme no, tarih, taksit sayısı ve Taksit Tutar alanları bulunmaktadır.

---

## 🐛 Sorun Giderme

### Firebase Bağlantı Hatası

**Sorun:** `Firebase: Error (auth/invalid-api-key)`

**Çözüm:**
- `.env` dosyasındaki API key'leri kontrol edin
- Firebase Console'dan doğru değerleri aldığınızdan emin olun
- Dev server'ı yeniden başlatın (`Ctrl+C` sonra `npm run dev`)

### Sözleşme Eklenmiyor

**Sorun:** Form submit ediliyor ama Firestore'a kaydedilmiyor

**Çözüm:**
- Firestore Database'in **enabled** olduğunu kontrol edin
- Test mode'da başlattığınızdan emin olun
- Tarayıcı console'unda (F12) hata mesajlarını kontrol edin
- Network sekmesinde Firebase isteklerini inceleyin

### Tailwind CSS Çalışmıyor

**Sorun:** Stiller uygulanmıyor

**Çözüm:**
```bash
# Bağımlılıkları yeniden yükle
npm install

# Cache'i temizle
rm -rf node_modules .vite
npm install

# Sunucuyu yeniden başlat
npm run dev
```

---

## 🚀 Geliştirme Önerileri

Projeyi daha da geliştirmek için:

- [ ] **Authentication** - Firebase Auth ile kullanıcı girişi
- [ ] **Düzenleme** - Sözleşmeleri güncelleme özelliği
- [ ] **Arama** - Sözleşme no veya tarih ile arama
- [ ] **Filtreleme** - Tarih aralığı, tutar vb. filtreleme
- [ ] **Sıralama** - Tablo kolonlarına göre sıralama
- [ ] **Pagination** - Sayfa sayfa listeleme
- [ ] **Export** - Excel/PDF'e aktarma
- [ ] **Dashboard** - İstatistikler ve grafikler
- [ ] **Bildirimler** - Taksit hatırlatmaları
- [ ] **Multi-language** - i18n desteği

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen aşağıdaki adımları izleyin:

1. Bu repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

---

## 📞 İletişim & Destek

Sorularınız veya önerileriniz için:

- 📧 Email: suatcanysn@gmail.com
- 🐛 Issue: [GitHub Issues](https://github.com/SuatcanYasan/sozlesme-takip/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/SuatcanYasan/sozlesme-takip/discussions)

---

## ⭐ Star History

Projeyi beğendiyseniz yıldız vermeyi unutmayın! ⭐

---

<div align="center">

**Geliştirici Notu:** Bu proje Firebase SDK v10+ modular yapısını kullanmaktadır.

Made with ❤️ using React + Firebase + Tailwind CSS

[⬆ Başa Dön](#-sözleşme-yönetim-paneli)

</div>

