# 🗄️ Çoklu Veritabanı Test Aracı

Bu proje, farklı veritabanı türlerine bağlanıp SQL sorguları çalıştırabileceğiniz modern bir web uygulamasıdır.

## ✨ Özellikler

- **🔥 Supabase** - Cloud PostgreSQL veritabanı
- **🐬 MySQL** - Açık kaynak ilişkisel veritabanı
- **🐘 PostgreSQL** - Gelişmiş açık kaynak veritabanı
- **📱 SQLite** - Dosya tabanlı veritabanı
- **🪟 SQL Server** - Microsoft veritabanı sistemi

### 🚀 Temel Özellikler

- ✅ Gerçek zamanlı bağlantı testi
- ✅ SQL sorgu çalıştırma
- ✅ Sonuçları tablo halinde görüntüleme
- ✅ Hata mesajları ve başarı bildirimleri
- ✅ Responsive tasarım
- ✅ Örnek sorgu butonları
- ✅ Çalışma süresi ölçümü

## 🛠️ Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Sunucuyu başlatın:**
```bash
npm start
```

3. **Geliştirme modunda çalıştırın:**
```bash
npm run dev
```

4. **Tarayıcıda açın:**
```
http://localhost:3000
```

## 📊 Desteklenen Veritabanları

### 🔥 Supabase
```javascript
{
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 🐬 MySQL
```javascript
{
  "host": "localhost",
  "port": "3306",
  "database": "test_db",
  "username": "root",
  "password": "password"
}
```

### 🐘 PostgreSQL
```javascript
{
  "host": "localhost",
  "port": "5432",
  "database": "postgres",
  "username": "postgres",
  "password": "password"
}
```

### 📱 SQLite
```javascript
{
  "database": "database.db"
}
```

### 🪟 SQL Server
```javascript
{
  "host": "localhost",
  "port": "1433",
  "database": "master",
  "username": "sa",
  "password": "password"
}
```

## 💻 Kullanım

### 1. Veritabanı Seçimi
- Üst kısımdaki veritabanı türü butonlarından birini seçin
- İlgili bağlantı formu otomatik olarak görünecektir

### 2. Bağlantı Ayarları
- Seçilen veritabanı türüne göre gerekli bilgileri girin
- "🔗 Bağlantıyı Test Et" butonuna tıklayın

### 3. SQL Sorguları
- Bağlantı başarılı olduktan sonra SQL sorgularınızı yazın
- Örnek sorgu butonlarını kullanabilirsiniz
- "▶️ Sorguyu Çalıştır" butonuna tıklayın

### 4. Sonuçları İnceleme
- Sorgu sonuçları tablo halinde görüntülenir
- Hata durumunda detaylı hata mesajı gösterilir
- Çalışma süresi ölçülür

## 📝 Örnek Sorgular

### Bağlantı Testi
```sql
SELECT 1
```

### Veritabanı Bilgileri
```sql
SELECT current_database(), current_user
```

### Tabloları Listele
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
```

### Veri Sorgulama
```sql
SELECT * FROM users LIMIT 5
```

## 🔧 API Endpoints

### Bağlantı Testi
```
POST /api/test-connection
Content-Type: application/json

{
  "type": "supabase|mysql|postgresql|sqlite|sqlserver",
  "config": { ... }
}
```

### Sorgu Çalıştırma
```
POST /api/execute-query
Content-Type: application/json

{
  "type": "supabase|mysql|postgresql|sqlite|sqlserver",
  "config": { ... },
  "query": "SELECT * FROM users"
}
```

## 📁 Proje Yapısı

```
dbtest/
├── public/                 # Frontend dosyaları
│   ├── index.html         # Ana HTML dosyası
│   ├── styles.css         # CSS stilleri
│   ├── script.js          # Frontend JavaScript
│   └── README.md          # Bu dosya
├── server.js              # Express.js backend
├── package.json           # Node.js bağımlılıkları
└── .env                   # Ortam değişkenleri (opsiyonel)
```

## 🔒 Güvenlik

- **⚠️ Önemli:** Bu araç geliştirme/test amaçlıdır
- Üretim ortamında kullanmayın
- Hassas veritabanı bilgilerini güvenli şekilde saklayın
- CORS ayarlarını kontrol edin

## 🚨 Önemli Notlar

### Desteklenen Sorgu Türleri
- ✅ SELECT sorguları
- ✅ Basit JOIN'ler
- ✅ COUNT, SUM, AVG gibi agregasyon fonksiyonları
- ✅ WHERE, ORDER BY, LIMIT koşulları

### Desteklenmeyen Sorgu Türleri
- ❌ INSERT, UPDATE, DELETE (güvenlik nedeniyle)
- ❌ DDL komutları (CREATE, ALTER, DROP)
- ❌ Karmaşık stored procedure'lar
- ❌ Transaction komutları

### Veritabanı Özel Notları

#### Supabase
- Anon Key kullanın (Service Role Key değil)
- Row Level Security (RLS) ayarlarını kontrol edin
- CORS ayarlarını yapılandırın

#### MySQL
- SSL bağlantısı gerekebilir
- Kullanıcı yetkilerini kontrol edin
- Port 3306 varsayılandır

#### PostgreSQL
- SSL bağlantısı gerekebilir
- pg_hba.conf dosyasını kontrol edin
- Port 5432 varsayılandır

#### SQLite
- Dosya yolu doğru olmalı
- Dosya okuma/yazma izinleri gerekli
- Mutlak yol kullanmanız önerilir

#### SQL Server
- Windows Authentication desteklenmez
- SQL Server Authentication kullanın
- Port 1433 varsayılandır

## 🐛 Sorun Giderme

### Yaygın Hatalar

1. **Bağlantı Hatası**
   - Host, port ve kimlik bilgilerini kontrol edin
   - Firewall ayarlarını kontrol edin
   - Veritabanı servisinin çalıştığından emin olun

2. **CORS Hatası**
   - Backend sunucusunun çalıştığından emin olun
   - Port 3000'in açık olduğunu kontrol edin

3. **Yetki Hatası**
   - Kullanıcı yetkilerini kontrol edin
   - Veritabanı erişim izinlerini kontrol edin

### Debug Modu

Geliştirme modunda çalıştırmak için:
```bash
npm run dev
```

Bu mod otomatik yeniden başlatma özelliği sağlar.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Teşekkürler

- [Express.js](https://expressjs.com/) - Web framework
- [Supabase](https://supabase.com/) - Cloud database
- [MySQL2](https://github.com/sidorares/node-mysql2) - MySQL driver
- [pg](https://node-postgres.com/) - PostgreSQL driver
- [sqlite3](https://github.com/mapbox/node-sqlite3) - SQLite driver
- [mssql](https://github.com/tediousjs/node-mssql) - SQL Server driver

---

**🚀 Çoklu Veritabanı Test Aracı v2.0** - Geliştirme ve test süreçlerinizi kolaylaştırır!
