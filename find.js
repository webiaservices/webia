/* ============================================================
   WEBIA — capa "FIND" v3. Se carga DESPUÉS de main.js.
   Sin módulos. Cada bloque aislado en try/catch.
   ============================================================ */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduce = mq("(prefers-reduced-motion: reduce)");
  var finePointer = mq("(hover: hover) and (pointer: fine)");

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------- 1. SMOOTH SCROLL (Lenis + GSAP) -------------- */
  function initLenis() {
    if (reduce || !finePointer || !window.Lenis) return;
    var lenis = new window.Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      autoRaf: false
    });
    window.__lenis = lenis;

    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- 2. NAV: fondo al bajar ----------------------- */
  function initNavStuck() {
    var nav = $(".nav");
    if (!nav) return;
    var on = false;
    function check() {
      var want = window.scrollY > 48;
      if (want !== on) { on = want; nav.classList.toggle("is-stuck", on); }
    }
    check();
    window.addEventListener("scroll", check, { passive: true });
  }

  /* ---------- 3. HERO: palabras que entran ----------------- */
  function initHeroWords() {
    var title = $(".hv-title");
    if (!title || reduce) return;
    var words = $$(".w", title);
    if (!words.length) return;
    var EASE = "cubic-bezier(.22,1,.36,1)";
    words.forEach(function (w, i) {
      w.style.transition =
        "opacity .72s " + EASE + " " + (0.16 + i * 0.055) + "s," +
        "transform .95s " + EASE + " " + (0.16 + i * 0.055) + "s";
    });
    $$("[data-hv-up]").forEach(function (el, i) {
      el.style.transition =
        "opacity .8s " + EASE + " " + (0.52 + i * 0.1) + "s," +
        "transform .8s " + EASE + " " + (0.52 + i * 0.1) + "s";
    });
    var root = document.documentElement;
    root.classList.add("js-hv");
    // setTimeout (no rAF): corre aunque la pestaña esté en segundo plano
    setTimeout(function () { root.classList.add("hv-in"); }, 70);
    setTimeout(function () { root.classList.add("hv-in"); }, 1200);
  }

  /* ---------- 4. HERO: la imagen sigue al mouse ------------ */
  function initHeroMouse() {
    if (reduce || !finePointer || !window.gsap) return;
    var img = $("[data-hv-visual] img");
    var hero = $(".hero-v2");
    if (!img || !hero) return;
    var gx = window.gsap.quickTo(img, "x", { duration: 1.1, ease: "power3.out" });
    var gy = window.gsap.quickTo(img, "y", { duration: 1.1, ease: "power3.out" });
    hero.addEventListener("mousemove", function (e) {
      var nx = e.clientX / window.innerWidth - 0.5;
      var ny = e.clientY / window.innerHeight - 0.5;
      gx(nx * -22);
      gy(ny * -12);
    });
    hero.addEventListener("mouseleave", function () { gx(0); gy(0); });
  }

  /* ---------- 5. HERO → TELÓN DE MARCA (pin + scrub) ------- */
  function initHeroScene() {
    var pin = $(".hv-pin");
    if (!pin || reduce) return;
    if (!window.gsap || !window.ScrollTrigger) return;

    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    // en celular la barra de direcciones cambia el alto: no recalcular por eso
    window.ScrollTrigger.config({ ignoreMobileResize: true });

    var hint    = $(".hv-scroll");
    var copy    = $("[data-hv-copy]");
    var visual  = $("[data-hv-visual]");
    var under   = $("[data-hv-under]");
    var curtain = $("[data-hv-curtain]");
    var edgeIn  = $("[data-hv-edge-in]");
    var edgeOut = $("[data-hv-edge-out]");
    var brand   = $(".hv-brand");
    var fill    = $("[data-hv-fill]");
    var letters = $$(".hv-knock .hv-l > span");
    var spark   = $("[data-hv-spark]");
    var tags    = $$(".hv-over .hv-tag span");
    var nav     = $(".nav");
    if (!copy || !visual || !curtain || !brand || !letters.length) return;

    var isLive = false, isDark = false;
    function setLive(v) { if (v !== isLive) { isLive = v; curtain.classList.toggle("is-live", v); } }
    function setDark(v) { if (v !== isDark) { isDark = v; if (nav) nav.classList.toggle("nav--dark", v); } }

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: "+=230%",
        pin: true,
        scrub: window.__lenis ? 0.45 : 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var p = self.progress;
          setLive(p > 0.1 && p < 0.997);
          setDark(p > 0.33 && p < 0.97);
        },
        onLeave: function () { setLive(false); setDark(false); },
        onLeaveBack: function () { setLive(false); setDark(false); }
      }
    });

    tl.to(hint, { opacity: 0, duration: 0.05 }, 0)
      .to(copy, { yPercent: -22, opacity: 0, ease: "power2.in", duration: 0.26 }, 0)
      .to(visual, { scale: 1.2, yPercent: -4, duration: 0.42 }, 0)

      // el telón sube
      .fromTo(curtain, { clipPath: "inset(100% 0% 0% 0%)" },
                       { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 0.26 }, 0.14)
      .fromTo(edgeIn, { yPercent: 100 }, { yPercent: 0, ease: "power2.inOut", duration: 0.26 }, 0.14)
      .fromTo(edgeIn, { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.14)
      .to(edgeIn, { opacity: 0, duration: 0.04 }, 0.37)

      // detrás del telón: limpiar para la salida
      .set(visual, { opacity: 0 }, 0.41)
      .set(under, { opacity: 1 }, 0.41)

      // el relleno vive todo el tiempo
      .fromTo(fill, { scale: 1.24, xPercent: -5 }, { scale: 1, xPercent: 5, duration: 0.86 }, 0.14)

      // letras suben una por una
      .fromTo(letters, { yPercent: 118 },
                       { yPercent: 0, ease: "power3.out", duration: 0.17, stagger: 0.032 }, 0.25)
      .fromTo(spark, { scale: 0, rotation: -140, opacity: 0, transformOrigin: "50% 50%" },
                     { scale: 1, rotation: 0, opacity: 1, ease: "back.out(2.2)", duration: 0.12 }, 0.44)
      .fromTo(tags, { opacity: 0, y: 14 },
                    { opacity: 1, y: 0, ease: "power2.out", duration: 0.1, stagger: 0.025 }, 0.47)
      .fromTo(brand, { scale: 1 }, { scale: 1.04, duration: 0.3 }, 0.55)

      // salida: el telón se va hacia arriba
      .fromTo(curtain, { clipPath: "inset(0% 0% 0% 0%)" },
                       { clipPath: "inset(0% 0% 100% 0%)", ease: "power2.inOut", duration: 0.15, immediateRender: false }, 0.85)
      .to(brand, { yPercent: -16, ease: "power2.in", duration: 0.15 }, 0.85)
      .fromTo(edgeOut, { yPercent: 100 }, { yPercent: 0, ease: "power2.inOut", duration: 0.15 }, 0.85)
      .fromTo(edgeOut, { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0.85)
      .to(edgeOut, { opacity: 0, duration: 0.02 }, 0.98);
  }

  /* ---------- 6. SERVICIOS: palabra que se rellena --------- */
  function initSvcRows() {
    var rows = $$(".svc-row");
    if (!rows.length) return;
    if (!("IntersectionObserver" in window) || reduce) {
      rows.forEach(function (r) { r.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.3, rootMargin: "0px 0px -8% 0px" });
    rows.forEach(function (r) { io.observe(r); });
  }

  /* ---------- 7. PREVIEW QUE SIGUE AL CURSOR --------------
     Proyectos (sobre la fila) y Servicios (sobre toda la fila).
     Al hacer scroll se actualiza según lo que quede bajo el mouse. */
  function initPreviews() {
    if (reduce || !finePointer) return;
    var targets = [];
    $$("#trabajo .work-row[data-preview]").forEach(function (row) {
      var head = row.querySelector(".work-head");
      if (head) targets.push({ el: head, src: row.getAttribute("data-preview"),
        skip: function () { return head.getAttribute("aria-expanded") === "true"; }, closeOnClick: true });
    });
    $$(".svc-row[data-preview]").forEach(function (row) {
      targets.push({ el: row.querySelector(".svc-big") || row, src: row.getAttribute("data-preview"),
        skip: function () { return false; }, closeOnClick: false });
    });
    if (!targets.length) return;

    var box = document.createElement("div");
    box.className = "wk-float";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = '<div class="wk-float-in"><img alt="" decoding="async"></div>';
    document.body.appendChild(box);
    var img = box.querySelector("img");
    targets.forEach(function (t) { var i = new Image(); i.src = t.src; });   // precarga

    var x = 0, y = 0, tx = -999, ty = -999, raf = 0, shown = false, flip = false, current = null;
    function loop() {
      x += (tx - x) * 0.17;
      y += (ty - y) * 0.17;
      box.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      if (shown || Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) raf = requestAnimationFrame(loop);
      else raf = 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    function aim(e) {
      tx = e.clientX; ty = e.clientY;
      var want = tx > window.innerWidth * 0.6;
      if (want !== flip) { flip = want; box.classList.toggle("flip", flip); }
    }
    function show(t) {
      if (t.skip()) { hide(); return; }
      if (img.getAttribute("src") !== t.src) img.src = t.src;
      if (!shown && !raf) { x = tx; y = ty; }
      current = t; shown = true; box.classList.add("on"); kick();
    }
    function hide() { current = null; shown = false; box.classList.remove("on"); }

    targets.forEach(function (t) {
      t.el.addEventListener("mouseenter", function (e) { aim(e); show(t); });
      t.el.addEventListener("mousemove", function (e) { aim(e); if (!shown) show(t); kick(); });
      t.el.addEventListener("mouseleave", function () { if (current === t) hide(); });
      if (t.closeOnClick) t.el.addEventListener("click", hide);
    });

    window.addEventListener("scroll", function () {
      if (tx < 0) return;
      var under = document.elementFromPoint(tx, ty);
      var found = null;
      if (under) for (var i = 0; i < targets.length; i++) { if (targets[i].el.contains(under)) { found = targets[i]; break; } }
      if (found) { if (found !== current) show(found); }
      else if (shown) hide();
    }, { passive: true });
  }

  /* ---------- 7b. SERVICIOS: todas las palabras del mismo tamaño,
       la más larga ("Automatización") define el tamaño que cabe ---- */
  function initFitWords() {
    var heads = $$(".svc-big");
    if (!heads.length) return;
    function fit() {
      heads.forEach(function (h) { h.style.fontSize = ""; });
      var base = parseFloat(getComputedStyle(heads[0]).fontSize);
      var ratio = 1;
      heads.forEach(function (h) {
        var word = h.querySelector(".base");
        if (!word) return;
        var need = word.getBoundingClientRect().width;
        var avail = h.clientWidth;
        if (need > 0 && avail > 0) ratio = Math.min(ratio, avail / need);
      });
      if (ratio < 1) {
        var size = Math.floor(base * ratio * 0.97);
        heads.forEach(function (h) { h.style.fontSize = size + "px"; });
      }
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
    var t = 0, lastW = window.innerWidth;
    function later() {
      if (window.innerWidth === lastW) return;   // en celular, la barra de direcciones no cuenta
      lastW = window.innerWidth;
      clearTimeout(t); t = setTimeout(fit, 150);
    }
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener("resize", later);
  }

  /* ---------- 8. Refrescar medidas al cargar fotos --------- */
  function initRefresh() {
    if (!window.ScrollTrigger) return;
    var t = 0;
    function later() { clearTimeout(t); t = setTimeout(function () { window.ScrollTrigger.refresh(); }, 120); }
    window.addEventListener("load", later);
    $$("img").forEach(function (im) {
      if (!im.complete) im.addEventListener("load", later, { once: true });
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  }

  function boot() {
    safe(initLenis,       "initLenis");
    safe(initNavStuck,    "initNavStuck");
    safe(initHeroWords,   "initHeroWords");
    safe(initHeroMouse,   "initHeroMouse");
    safe(initFitWords,    "initFitWords");
    safe(initHeroScene,   "initHeroScene");
    safe(initSvcRows,     "initSvcRows");
    safe(initPreviews,    "initPreviews");
    safe(initRefresh,     "initRefresh");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
