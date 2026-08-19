/* <e39-stage> — Collada araba modelini şeffaf zeminde render eder.
   API: el.setDrift(deg), el.setSpeed(px/frame) */
(function () {
  if (window.customElements && customElements.get("e39-stage")) return;

  class E39Stage extends HTMLElement {
    constructor() {
      super();
      this.drift = 0;
      this.speed = 0;
      this.wheelSpin = 0;
      this._ready = false;
    }

    connectedCallback() {
      if (this._boot) return;
      this._boot = true;
      this.style.display = "block";
      this.style.width = this.style.width || "100%";
      this.canvas = document.createElement("canvas");
      this.canvas.style.cssText = "width:100%;height:100%;display:block";
      this.appendChild(this.canvas);
      this.boot().catch((e) => console.warn("[e39-stage]", e));
    }

    async boot() {
      const base = "https://esm.sh/three@0.160.0";
      const THREE = await import(base);
      const { ColladaLoader } = await import(base + "/examples/jsm/loaders/ColladaLoader.js");
      this.THREE = THREE;

      const renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(1.4, window.devicePixelRatio || 1));
      renderer.shadowMap.enabled = false;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer = renderer;

      const scene = new THREE.Scene();
      this.scene = scene;

      const camera = new THREE.PerspectiveCamera(32, 1.5, 0.1, 100);
      this.camera = camera;

      scene.add(new THREE.HemisphereLight(0xffffff, 0xd9cfc8, 1.05));
      const key = new THREE.DirectionalLight(0xffffff, 2.1);
      key.position.set(4.5, 7, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.9);
      rim.position.set(-6, 3, -4);
      scene.add(rim);

      const pivot = new THREE.Group();
      scene.add(pivot);
      this.pivot = pivot;

      const src = this.getAttribute("src") || "./assets/e39-m5.dae";
      const collada = await new Promise((res, rej) => new ColladaLoader().load(src, res, undefined, rej));
      const model = collada.scene;

      model.traverse((o) => {
        if (o.isMesh) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          const isEdge = mats.some((m) => m && /^edge_color/i.test(m.name || ""));
          if (isEdge || o.isLine || o.isLineSegments) { o.visible = false; return; }
          o.castShadow = false;
          o.receiveShadow = false;
          mats.forEach((m) => {
            if (!m) return;
            m.wireframe = false;
            m.polygonOffset = true;
            m.polygonOffsetFactor = 1;
            if (m.shininess !== undefined) m.shininess = Math.max(m.shininess || 0, 70);
            m.side = THREE.FrontSide;
          });
        }
        if (o.isLine || o.isLineSegments || o.isPoints) o.visible = false;
      });

      const wrap = new THREE.Group();
      wrap.add(model);
      pivot.add(wrap);

      const measure = (obj) => {
        obj.updateMatrixWorld(true);
        const b = new THREE.Box3().setFromObject(obj);
        return { box: b, size: b.getSize(new THREE.Vector3()), center: b.getCenter(new THREE.Vector3()) };
      };

      // 1) en uzun yatay eksen aracın boyu -> X'e çevir
      let m = measure(model);
      if (m.size.z > m.size.x) wrap.rotation.y = Math.PI / 2;

      // 2) ölçekle
      m = measure(wrap);
      const longest = Math.max(m.size.x, m.size.y, m.size.z) || 1;
      const target = 4.6;
      wrap.scale.setScalar(target / longest);

      // 3) merkeze al, yere otur
      m = measure(wrap);
      wrap.position.sub(new THREE.Vector3(m.center.x, m.box.min.y, m.center.z));

      this.baseYaw = parseFloat(this.getAttribute("base-yaw") || "0");
      pivot.rotation.y = this.baseYaw;

      // gövde rengi: modelin kırmızı boyalı panellerini beyaza çevir (stoplar dursun)
      const bodyHex = this.getAttribute("body-color") || this.bodyColor || "#eff0f2";
      if (bodyHex && bodyHex !== "none") {
        const paint = { cc0000: bodyHex, "930000": "#d6d8db" };
        const done = new Set();
        model.traverse((o) => {
          if (!o.isMesh) return;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            if (!m || !m.color || done.has(m)) return;
            const hex = m.color.getHexString();
            if (paint[hex]) {
              m.color.set(paint[hex]);
              if (m.specular) m.specular.setHex(0xffffff);
              if (m.shininess !== undefined) m.shininess = 95;
              done.add(m);
            }
          });
        });
      }

      // 4) kamerayı otomatik çerçevele (3/4 ön-sol görünüm)
      const fit = measure(pivot);
      this.fitCenter = new THREE.Vector3(0, fit.size.y * 0.45, 0);
      const radius = Math.max(fit.size.x, fit.size.y, fit.size.z) * 0.5;
      const dist = (radius / Math.tan((camera.fov * Math.PI) / 360)) * 1.08;
      this.camDir = new THREE.Vector3(-0.78, 0.34, 0.92).normalize();
      camera.position.copy(this.camDir).multiplyScalar(dist).add(this.fitCenter);
      camera.lookAt(this.fitCenter);

      this._ready = true;
      this.resize();
      window.addEventListener("resize", () => this.resize());
      this.loop();
      this.dispatchEvent(new CustomEvent("ready"));
    }

    resize() {
      if (!this._ready) return;
      const w = this.clientWidth || 460;
      const h = this.clientHeight || Math.round(w * 0.66);
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }

    setDrift(deg) { this.drift = deg; }
    setSpeed(v) { this.speed = v; }

    // arka aksın ekran (element) koordinatı — gidiş yönüne göre "arkada" kalan uç
    rearWheelLocal() {
      if (!this._ready) return null;
      const T = this.THREE;
      const b = new T.Box3().setFromObject(this.pivot);
      const size = b.getSize(new T.Vector3());
      const half = Math.max(size.x, size.z) * 0.33;
      const yaw = this.pivot.rotation.y;
      const axis = new T.Vector3(0, 1, 0);
      const w = this.clientWidth, h = this.clientHeight;
      const pts = [new T.Vector3(half, size.y * 0.12, 0), new T.Vector3(-half, size.y * 0.12, 0)].map((p) => {
        const q = p.clone().applyAxisAngle(axis, yaw).project(this.camera);
        return { x: (q.x * 0.5 + 0.5) * w, y: (-q.y * 0.5 + 0.5) * h };
      });
      return pts[0].x > pts[1].x ? pts[0] : pts[1];
    }
    setActive(on) {
      this.active = !!on;
      if (this.active) this.resize();
    }

    loop() {
      const tick = () => {
        this._raf = requestAnimationFrame(tick);
        if (!this._ready) return;
        if (!this.active && this._warm) return;
        this._warm = true;
        const now = performance.now();
        if (this._last && now - this._last < 28) return;
        this._last = now;
        const t = now / 1000;
        const yaw = this.baseYaw + (this.drift * Math.PI) / 180;
        this.pivot.rotation.y += (yaw - this.pivot.rotation.y) * 0.16;
        const roll = (-this.drift / 46) * 0.11;
        this.pivot.rotation.z += (roll - this.pivot.rotation.z) * 0.12;
        this.pivot.position.y = 0;
        this.renderer.render(this.scene, this.camera);
      };
      tick();
    }

    disconnectedCallback() { if (this._raf) cancelAnimationFrame(this._raf); }
  }

  customElements.define("e39-stage", E39Stage);
})();
