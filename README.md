# Ülkü & Umut — Düğün Davetiyesi

Statik davetiye sitesi. Backend yok, build adımı yok — GitHub Pages'e olduğu gibi yüklenir.
Claude Design'daki `Ülkü & Umut Davetiye.dc.html` tasarımının bağımsız (vanilla HTML/CSS/JS) portu.

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Sayfanın tamamı (işaretleme + stiller) |
| `config.js` | **Yayın öncesi doldurulacak ayarlar** |
| `app.js` | Geri sayım, LCV formu, yol tarifi, scroll animasyonu, easter egg |
| `e39-stage.js` | 3D BMW E39 sahnesi (easter egg) |
| `assets/e39-m5.dae` | 3D model — elle eklenmeli, bkz. `assets/OKUBENI.txt` |
| `og-image.png` | WhatsApp/Twitter link önizleme görseli (1200×630) |
| `og-image.html` | Bu görselin kaynağı; değiştirip yeniden üretebilirsin |

## 1. Yayın öncesi doldurulacaklar

**`config.js`**

- `whatsappNumber` — LCV formu bu numaraya WhatsApp mesajı olarak gider.
  Ülke kodu dahil, sadece rakam: `"905321234567"`. Boş bırakılırsa form bilgileri panoya kopyalanır.
- `contactLine` — "Sorularınız için" bölümündeki iletişim satırı.

**`index.html`** — link önizlemesi için 3 yerde geçen `KULLANICI` yerine GitHub kullanıcı adını yaz:

```bash
sed -i '' 's/KULLANICI/github-kullanici-adin/g' index.html
```

## 2. Davet varyantları

Tek site, üç farklı görünüm. Kime hangi linki göndereceğine göre seç:

| Link | Ne gösterir |
|---|---|
| `.../` | İki davet birlikte (varsayılan) |
| `.../?davet=zonguldak` | Sadece 3 Eylül · Kdz. Ereğli |
| `.../?davet=ankara` | Sadece 6 Eylül · Ankara |

Varyant; başlıkları, metinleri, geri sayım hedefini ve LCV seçeneklerini birlikte değiştirir.
Varsayılanı `config.js` içindeki `defaultVariant` belirler.

## 3. Yerelde test

```bash
python3 -m http.server 8765
```

Sonra `http://localhost:8765/` adresini aç. (`file://` ile açmak yerine sunucu kullan —
easter egg'in modül importları `file://` altında çalışmaz.)

## 4. GitHub Pages'e yükleme

Depo **public** olmalı (ücretsiz planda Pages sadece public depolarda çalışır).

```bash
git init -b main
git add -A
git commit -m "feat: davetiye sitesi"
gh repo create ulku-umut-davetiye --public --source=. --push
gh api -X POST repos/:owner/ulku-umut-davetiye/pages -f "source[branch]=main" -f "source[path]=/"
```

Yayın adresi: `https://<kullanici>.github.io/ulku-umut-davetiye/` (ilk yayın 1-2 dakika sürer).

Arayüzden yapmak istersen: depoyu oluşturup dosyaları yükle →
**Settings › Pages › Source: Deploy from a branch › main / (root) › Save**.

Sonraki güncellemeler:

```bash
git add -A && git commit -m "fix: metin güncellemesi" && git push
```

## 5. OG görselini yeniden üretmek

`og-image.html`'i düzenledikten sonra:

```bash
/Applications/Firefox.app/Contents/MacOS/firefox --headless --no-remote \
  --profile /tmp/ffshot --window-size=1200,630 \
  --screenshot "$PWD/og-image.png" "file://$PWD/og-image.html"
```

WhatsApp önizlemeyi önbelleğe alır; görseli değiştirdikten sonra linki test etmek için
sonuna `?v=2` gibi bir parametre ekle.

## Notlar

- LCV verisi tarayıcıda `localStorage` (`uu-lcv-2026`) altında tutulur; sunucuya hiçbir şey gitmez.
  Katılım bildirimleri size WhatsApp mesajı olarak ulaşır.
- Haritalar Google Maps embed iframe'i kullanır; "Yol tarifi al" mobilde yerel harita
  uygulamasını, masaüstünde Google Maps'i açar.
- `prefers-reduced-motion` açık olan cihazlarda scroll animasyonları kapanır.
- GitHub Pages dışında Netlify Drop veya Cloudflare Pages'e de klasörü sürükleyip bırakarak
  ücretsiz yayınlayabilirsin — yapılandırma gerekmez.
