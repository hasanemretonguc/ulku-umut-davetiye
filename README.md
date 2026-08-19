# Ülkü & Umut — Düğün Davetiyesi

Statik davetiye sitesi. Backend yok, build adımı yok — GitHub Pages'e olduğu gibi yüklenir.
Claude Design'daki `Ülkü & Umut Davetiye.dc.html` tasarımının bağımsız (vanilla HTML/CSS/JS) portu.

**Yayında:** https://hasanemretonguc.github.io/ulku-umut-davetiye/

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Sayfanın tamamı (işaretleme + stiller) |
| `config.js` | Ayarlar — düzenlenecek tek dosya |
| `app.js` | Geri sayım, yol tarifi, scroll animasyonu, easter egg |
| `e39-stage.js` | 3D BMW E39 sahnesi (easter egg) |
| `assets/e39-m5.dae` | 3D model — elle eklenmeli, bkz. `assets/OKUBENI.txt` |
| `og-image.png` | WhatsApp/Twitter link önizleme görseli (1200×630) |
| `og-image.html` | Bu görselin kaynağı; değiştirip yeniden üretebilirsin |

Sayfa akışı: hero (isimler + geri sayım) → davet kartları + haritalar → kıyafet / ulaşım / iletişim → footer.
Katılım bildirme formu yok; katılım bilgisi toplanmıyor.

## Ayarlar — `config.js`

- `contactLine` — "Sorularınız için" bölümündeki iletişim satırı. Boş bırakılırsa o satır görünmez.
- `countdownTarget` — geri sayım hedefi. Boş = varyanta göre otomatik.
- `defaultVariant` — URL'de parametre yokken hangi varyant açılsın.
- `easterEgg` — `false` yaparsan 3D sahne hiç yüklenmez.

## Davet varyantları

Tek site, üç farklı görünüm. Kime hangi linki göndereceğine göre seç:

| Link | Ne gösterir |
|---|---|
| `.../` | İki davet birlikte (varsayılan) |
| `.../?davet=zonguldak` | Sadece 3 Eylül · Kdz. Ereğli |
| `.../?davet=ankara` | Sadece 6 Eylül · Ankara |

Varyant; başlıkları, metinleri, geri sayım hedefini ve kıyafet notunu birlikte değiştirir.

## Yerelde test

```bash
python3 -m http.server 8765
```

Sonra `http://localhost:8765/` adresini aç. (`file://` ile açmak yerine sunucu kullan —
easter egg'in modül importları `file://` altında çalışmaz.)

Easter egg'i denerken sekme **önde** olmalı: arka planda `requestAnimationFrame` durur,
animasyon oynamaz.

## Yayına alma

Pages `main` / root'tan yayında. Değişiklik sonrası:

```bash
git add -A && git commit -m "fix: metin güncellemesi" && git push
```

İlk kurulum arayüzden yapılacaksa: **Settings › Pages › Source: Deploy from a branch › main / (root)**.
Depo public olmalı — ücretsiz planda Pages şartı.

## OG görselini yeniden üretmek

`og-image.html`'i düzenledikten sonra:

```bash
/Applications/Firefox.app/Contents/MacOS/firefox --headless --no-remote \
  --profile /tmp/ffshot --window-size=1200,630 \
  --screenshot "$PWD/og-image.png" "file://$PWD/og-image.html"
```

WhatsApp önizlemeyi önbelleğe alır; görseli değiştirdikten sonra linki test etmek için
sonuna `?v=2` gibi bir parametre ekle.

## Notlar

- `index.html` içinde `<meta name="robots" content="noindex, nofollow">` var: link paylaşımı
  çalışır, arama motorlarına düşmez. İstemezsen o satırı sil.
- Haritalar Google Maps embed iframe'i kullanır; "Yol tarifi al" mobilde yerel harita
  uygulamasını, masaüstünde Google Maps'i açar.
- `prefers-reduced-motion` açık olan cihazlarda scroll animasyonları kapanır.
- GitHub Pages dışında Netlify Drop veya Cloudflare Pages'e de klasörü sürükleyip bırakarak
  ücretsiz yayınlayabilirsin — yapılandırma gerekmez.
