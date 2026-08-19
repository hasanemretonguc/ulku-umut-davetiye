/* ── Davetiye ayarları ──────────────────────────────────────────────
   Sadece bu dosyayı düzenlemen yeterli. Yayınlamadan önce doldur.
   ------------------------------------------------------------------ */
window.DAVET_CONFIG = {

  // LCV formu buraya WhatsApp mesajı olarak gider.
  // Ülke kodu dahil, sadece rakam. Örn: "905321234567"
  // Boş bırakılırsa form bilgileri panoya kopyalanır.
  whatsappNumber: "",

  // "Sorularınız için" bölümünde görünen iletişim satırı.
  contactLine: "Telefon numaranızı buraya ekleyin",

  // Geri sayım hedefi. Boş = davet varyantına göre otomatik
  // (Ereğli 03.09.2026 19:00, Ankara 06.09.2026 14:00).
  // Elle vermek istersen ISO: "2026-09-03T19:00:00+03:00"
  countdownTarget: "",

  // Varsayılan varyant: "ikisi" | "zonguldak" | "ankara"
  // URL ile geçersiz kılınır:  ?davet=ankara   ?davet=zonguldak   ?davet=ikisi
  defaultVariant: "ikisi",

  // 3D easter egg (UMUT yazısına 10 kez tıkla).
  // assets/e39-m5.dae dosyası yoksa kapalı bırak.
  easterEgg: true
};
