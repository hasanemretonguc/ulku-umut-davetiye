/* Ülkü & Umut davetiye — statik sürüm (Claude Design .dc.html portu) */
(function () {
  "use strict";

  var CFG = window.DAVET_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };
  var LS_KEY = "uu-lcv-2026";

  /* ───────── davet varyantı ───────── */
  function variant() {
    var q = "";
    try {
      var sp = new URLSearchParams(location.search);
      q = (sp.get("davet") || sp.get("d") || sp.get("konum") || "").toLowerCase();
      if (!q && location.hash) {
        var h = location.hash.replace("#", "").toLowerCase();
        if (["ankara", "zonguldak", "eregli", "ereğli", "ikisi", "both"].indexOf(h) > -1) q = h;
      }
    } catch (e) {}
    var v = q || (CFG.defaultVariant || "ikisi").toLowerCase();
    if (["zonguldak", "eregli", "ereğli", "kdz", "1"].indexOf(v) > -1) return "zonguldak";
    if (["ankara", "2"].indexOf(v) > -1) return "ankara";
    return "ikisi";
  }

  var V = variant();
  var both = V === "ikisi";
  var showE1 = both || V === "zonguldak";
  var showE2 = both || V === "ankara";

  var COPY = {
    e1Kicker: both ? "Birinci gün · Kdz. Ereğli" : "Davet · Kdz. Ereğli",
    e2Kicker: both ? "İkinci gün · Ankara" : "Davet · Ankara",
    heroPlaceLine: both ? "Eylül 2026 · Kdz. Ereğli & Ankara"
      : (showE1 ? "3 Eylül 2026 · Kdz. Ereğli" : "6 Eylül 2026 · Ankara"),
    footerLine: both ? "Eylül 2026 · Kdz. Ereğli & Ankara"
      : (showE1 ? "3 Eylül 2026 · Kdz. Ereğli" : "6 Eylül 2026 · Ankara"),
    introKicker: both ? "İki ayrı davet" : "Tarih & mekân",
    introTitle: both ? "Sizi iki güne de bekliyoruz" : "Sizi bu güne bekliyoruz",
    introText: both
      ? "Kutlamamız iki şehirde, iki ayrı günde gerçekleşecek. Dilediğiniz güne — ya da ikisine de — katılabilirsiniz; aşağıdaki formda seçmeniz yeterli."
      : (showE1
        ? "3 Eylül Perşembe akşamı Kdz. Ereğli'de, Tepe Park'ta bir araya geliyoruz. Konumu haritadan görebilir, yol tarifini tek dokunuşla açabilirsiniz."
        : "6 Eylül Pazar günü Ankara'da, Altın Koru Düğün Salonu'nda bir araya geliyoruz. Konumu haritadan görebilir, yol tarifini tek dokunuşla açabilirsiniz."),
    rsvpLabel: both ? "Hangi güne katılacaksınız?" : "Katılımınız",
    dressText: showE1
      ? "Şık, davete uygun kıyafetler. Açık alanda olacağımız için akşam serinliğine karşı hafif bir üst kat işinize yarayabilir."
      : "Şık, gündüz davetine uygun kıyafetler. Bahçe alanında olacağımız için rahat ayakkabıları öneririz."
  };

  /* ───────── durum ───────── */
  var s = { name: "", phone: "", e1: false, e2: false, adults: 1, kids: 0, note: "", status: "" };
  try {
    var saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (saved) for (var k in saved) if (k in s) s[k] = saved[k];
  } catch (e) {}

  if (!showE1) s.e1 = false;
  if (!showE2) s.e2 = false;
  if (!showE1) s.e2 = true;
  if (!showE2) s.e1 = true;

  function persist() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        name: s.name, phone: s.phone, e1: s.e1, e2: s.e2,
        adults: s.adults, kids: s.kids, note: s.note
      }));
    } catch (e) {}
  }

  /* ───────── statik metinleri bas ───────── */
  function setText(id, v) { var el = $(id); if (el) el.textContent = v; }

  setText("heroPlaceLine", COPY.heroPlaceLine);
  setText("footerLine", COPY.footerLine);
  setText("introKicker", COPY.introKicker);
  setText("introTitle", COPY.introTitle);
  setText("introText", COPY.introText);
  setText("e1Kicker", COPY.e1Kicker);
  setText("e2Kicker", COPY.e2Kicker);
  setText("rsvpLabel", COPY.rsvpLabel);
  setText("dressText", COPY.dressText);
  setText("contactLine", CFG.contactLine || "");

  if (!showE1) { ["cardE1", "toggleE1"].forEach(function (id) { var el = $(id); if (el) el.remove(); }); }
  if (!showE2) { ["cardE2", "toggleE2"].forEach(function (id) { var el = $(id); if (el) el.remove(); }); }

  /* ───────── form bağla ───────── */
  function syncForm() {
    if ($("name")) $("name").value = s.name;
    if ($("phone")) $("phone").value = s.phone;
    if ($("note")) $("note").value = s.note;
    setText("adults", String(s.adults));
    setText("kids", String(s.kids));
    [["e1", s.e1], ["e2", s.e2]].forEach(function (p) {
      var box = $(p[0] + "Box"), tick = $(p[0] + "Tick"), btn = $("toggle" + p[0].toUpperCase());
      if (box) box.style.background = p[1] ? "#8d4453" : "transparent";
      if (tick) tick.style.opacity = p[1] ? "1" : "0";
      if (btn) btn.setAttribute("aria-pressed", p[1] ? "true" : "false");
    });
    setText("statusText", s.status);
  }

  function bindInput(id, key) {
    var el = $(id);
    if (!el) return;
    el.addEventListener("input", function () {
      s[key] = el.value;
      if (key === "name") { s.status = ""; setText("statusText", ""); }
      persist();
    });
  }
  bindInput("name", "name");
  bindInput("phone", "phone");
  bindInput("note", "note");

  function onClick(id, fn) { var el = $(id); if (el) el.addEventListener("click", fn); }

  onClick("toggleE1", function () { s.e1 = !s.e1; s.status = ""; persist(); syncForm(); });
  onClick("toggleE2", function () { s.e2 = !s.e2; s.status = ""; persist(); syncForm(); });
  onClick("incAdults", function () { s.adults = Math.min(20, s.adults + 1); persist(); syncForm(); });
  onClick("decAdults", function () { s.adults = Math.max(0, s.adults - 1); persist(); syncForm(); });
  onClick("incKids", function () { s.kids = Math.min(20, s.kids + 1); persist(); syncForm(); });
  onClick("decKids", function () { s.kids = Math.max(0, s.kids - 1); persist(); syncForm(); });

  /* ───────── yol tarifi ───────── */
  function openMap(query) {
    var q = encodeURIComponent(query);
    var ua = navigator.userAgent || "";
    var web = "https://www.google.com/maps/search/?api=1&query=" + q;
    if (/iPad|iPhone|iPod/.test(ua)) { location.href = "maps://?q=" + q; return; }
    if (/Android/.test(ua)) {
      var t = Date.now();
      location.href = "geo:0,0?q=" + q;
      setTimeout(function () { if (Date.now() - t < 1800) window.open(web, "_blank"); }, 900);
      return;
    }
    window.open(web, "_blank");
  }
  onClick("map1", function () { openMap("Tepe Park, Ören, 67300 Kdz. Ereğli / Zonguldak"); });
  onClick("map2", function () { openMap("Altın Koru Düğün Salonları, Hasköy, Şht. Ömer Halisdemir Blv No:144, 06300 Altındağ/Ankara"); });

  /* ───────── gönder ───────── */
  onClick("submit", function () {
    if (!s.name.trim()) { s.status = "Lütfen adınızı yazın."; setText("statusText", s.status); return; }
    if (!s.e1 && !s.e2) { s.status = "Lütfen katılacağınız günü seçin."; setText("statusText", s.status); return; }
    var gun = [s.e1 ? "03 Eylül Kdz. Ereğli" : null, s.e2 ? "06 Eylül Ankara" : null].filter(Boolean).join(" + ");
    var lines = [
      "Ülkü & Umut — Katılım Bildirimi",
      "Ad Soyad: " + s.name.trim(),
      s.phone.trim() ? "Telefon: " + s.phone.trim() : null,
      "Katılım: " + gun,
      "Yetişkin: " + s.adults + " · Çocuk: " + s.kids,
      s.note.trim() ? "Not: " + s.note.trim() : null
    ].filter(Boolean);
    var text = lines.join("\n");
    var num = String(CFG.whatsappNumber || "").replace(/[^0-9]/g, "");
    if (num) {
      window.open("https://wa.me/" + num + "?text=" + encodeURIComponent(text), "_blank");
      s.status = "Teşekkürler " + s.name.trim().split(" ")[0] + "! WhatsApp penceresinden mesajı göndermeniz yeterli.";
    } else {
      try { navigator.clipboard.writeText(text); } catch (e) {}
      s.status = "Teşekkürler! Bilgileriniz kopyalandı — çifte iletebilirsiniz.";
    }
    setText("statusText", s.status);
  });

  /* ───────── geri sayım ───────── */
  var autoTarget = (V === "ankara") ? "2026-09-06T14:00:00+03:00" : "2026-09-03T19:00:00+03:00";
  var target = new Date(CFG.countdownTarget || autoTarget).getTime();

  function tickCountdown() {
    var d = Math.max(0, target - Date.now());
    var days = Math.floor(d / 86400000); d -= days * 86400000;
    var hours = Math.floor(d / 3600000); d -= hours * 3600000;
    var mins = Math.floor(d / 60000); d -= mins * 60000;
    var secs = Math.floor(d / 1000);
    var p = function (n) { return String(n).padStart(2, "0"); };
    setText("cdDays", String(days));
    setText("cdHours", p(hours));
    setText("cdMins", p(mins));
    setText("cdSecs", p(secs));
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ───────── scroll reveal ───────── */
  (function reveal() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!nodes.length) return;
    var show = function (n) { n.style.opacity = "1"; n.style.transform = "none"; };
    var io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    }
    nodes.forEach(function (n, i) {
      if (n.getBoundingClientRect().top < window.innerHeight * 0.92) { show(n); return; }
      n.style.opacity = "0";
      n.style.transform = "translateY(26px)";
      n.style.transitionDelay = (i % 3) * 0.09 + "s";
      if (io) io.observe(n); else show(n);
    });
    // fail-visible: gözlemci hiç çalışmazsa her şey görünür olsun
    setTimeout(function () { nodes.forEach(show); }, 4000);
  })();

  /* ───────── easter egg: UMUT × 10 ───────── */
  (function egg() {
    if (CFG.easterEgg === false) return;
    var umut = $("umut");
    var layer = document.querySelector("[data-carlayer]");
    var car = document.querySelector("[data-car]");
    if (!umut || !layer || !car) return;

    var hits = 0, armed = false, running = false, raf = null, failsafe = null;

    function arm() {
      if (armed) return;
      armed = true;
      var sh = car.querySelector("[data-carshadow]");
      if (sh) sh.style.display = "block";
      var stage = document.createElement("e39-stage");
      stage.setAttribute("src", "./assets/e39-m5.dae");
      stage.setAttribute("base-yaw", "0");
      stage.setAttribute("body-color", "#f0f1f3");
      stage.style.cssText = "width:100%; aspect-ratio:16/9; display:block";
      car.appendChild(stage);
      var sc = document.createElement("script");
      sc.src = "./e39-stage.js";
      document.head.appendChild(sc);
    }

    umut.addEventListener("click", function () {
      hits += 1;
      // 7. tıklamada 3D sahneyi indirmeye başla (kimse tıklamazsa hiç indirilmez)
      if (hits === 7) arm();
      if (hits < 10 || running) return;
      hits = 0;
      arm();
      waitAndRun();
    });

    function waitAndRun() {
      if (running) return;
      running = true;
      var t0 = Date.now();
      (function poll() {
        var stage = car.querySelector("e39-stage");
        if (stage && stage._ready) { running = false; run(stage); return; }
        if (Date.now() - t0 > 12000) { running = false; return; }  // model yok/yüklenmedi: sessizce vazgeç
        setTimeout(poll, 150);
      })();
    }

    function run(stage) {
      running = true;
      layer.style.opacity = "1";

      var puffs = Array.prototype.slice.call(document.querySelectorAll("[data-puff]"));
      var skids = Array.prototype.slice.call(document.querySelectorAll("[data-skid]"));
      if (stage.setActive) stage.setActive(true);

      var dur = 6200, t0 = performance.now();
      var pi = 0, si = 0, lastPuff = 0, lastSkid = 0;

      function finish() {
        clearTimeout(failsafe);
        if (raf) cancelAnimationFrame(raf);
        running = false;
        layer.style.opacity = "0";
        if (stage.setActive) stage.setActive(false);
      }
      // kare hiç ilerlemezse (sekme gizli / iş parçacığı meşgul) kilitli kalmasın
      failsafe = setTimeout(finish, dur + 2000);

      function frame(now) {
        var p = Math.min(1, (now - t0) / dur);
        var vw = window.innerWidth, vh = window.innerHeight;
        var w = car.offsetWidth || Math.min(vw * 0.72, 620);
        var hh = car.offsetHeight || w * 0.5625;
        // sağdan sola sabit hızda, yay çizerek
        var x = (vw + w * 0.2) - p * (vw + w * 1.2);
        var arc = Math.min(110, vh * 0.13);
        var y = (vh - hh) / 2 + arc * 0.5 - Math.sin(p * Math.PI) * arc;
        // viraja girer gibi: açı yavaş yavaş açılır, tepede en savruk, çıkışta toplanır
        var drift = 20 + 26 * Math.sin(p * Math.PI) + 4 * Math.sin(p * Math.PI * 5);

        if (stage.setDrift) { stage.setDrift(drift); stage.setSpeed(0); }
        var tilt = 5.5 * Math.cos(p * Math.PI);
        car.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + tilt.toFixed(2) + "deg)";

        var rw = stage.rearWheelLocal ? stage.rearWheelLocal() : null;
        var rx = x + (rw ? rw.x : w * 0.72);
        var ry = y + (rw ? rw.y : hh * 0.66);

        if (now - lastSkid > 45 && skids.length) {
          lastSkid = now;
          var sk = skids[si++ % skids.length];
          sk.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0) rotate(" + (drift * 0.35).toFixed(2) + "deg)";
          sk.animate(
            [{ opacity: 0.42 }, { opacity: 0.34, offset: 0.35 }, { opacity: 0 }],
            { duration: 2300, easing: "ease-out", fill: "forwards" }
          );
        }

        if (now - lastPuff > 70 && puffs.length) {
          lastPuff = now;
          var puff = puffs[pi++ % puffs.length];
          var from = "translate3d(" + rx.toFixed(1) + "px," + (ry - 6).toFixed(1) + "px,0) scale(.4)";
          var to = "translate3d(" + (rx + w * 0.22).toFixed(1) + "px," + (ry - 54).toFixed(1) + "px,0) scale(2.1)";
          puff.style.transform = from;
          puff.animate(
            [{ opacity: 0.75, transform: from }, { opacity: 0, transform: to }],
            { duration: 1700, easing: "ease-out", fill: "forwards" }
          );
        }

        if (p < 1) raf = requestAnimationFrame(frame);
        else finish();
      }
      raf = requestAnimationFrame(frame);
    }
  })();

  syncForm();
})();
