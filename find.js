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

  /* ---------- 4. HERO: el producto reacciona al mouse ------ */
  function initHeroMouse() {
    if (reduce || !finePointer || !window.gsap) return;
    var win = $("[data-ui-win]");
    var phone = $("[data-ui-phone]");
    var hero = $(".hero-v2");
    if (!win || !phone || !hero) return;
    var ry = window.gsap.quickTo(win, "rotationY", { duration: 1.2, ease: "power3.out" });
    var px = window.gsap.quickTo(phone, "x", { duration: 1.1, ease: "power3.out" });
    var py = window.gsap.quickTo(phone, "y", { duration: 1.1, ease: "power3.out" });
    hero.addEventListener("mousemove", function (e) {
      var nx = e.clientX / window.innerWidth - 0.5;
      var ny = e.clientY / window.innerHeight - 0.5;
      ry(nx * 4);
      px(nx * -18);
      py(ny * -12);
    });
    hero.addEventListener("mouseleave", function () { ry(0); px(0); py(0); });
  }

  /* ---------- 4a. HERO en celular: el producto empieza justo debajo del texto */
  function initHeroLayout() {
    var stage = $(".hv-stage");
    var copy = $("[data-hv-copy]");
    var visual = $("[data-hv-visual]");
    if (!stage || !copy || !visual) return;
    var lastW = 0;
    function place() {
      if (window.innerWidth >= 1024) { visual.style.removeProperty("--hv-top"); return; }
      var top = copy.getBoundingClientRect().bottom - stage.getBoundingClientRect().top + 14;
      visual.style.setProperty("--hv-top", Math.round(top) + "px");
    }
    place();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener("load", place);
    window.addEventListener("resize", function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth; place();
    });
  }

  /* ---------- 4c. TRABAJO: el nombre "vuela" a la página del caso */
  function initWorkLinks() {
    $$('#trabajo a.work-head[href^="/proyectos"]').forEach(function (a) {
      a.addEventListener("click", function () {
        $$(".work-name").forEach(function (n) { n.style.viewTransitionName = ""; });
        var n = a.querySelector(".work-name");
        if (n) n.style.viewTransitionName = "pj-title";
      });
    });
  }

  /* ---------- 4b. HERO: el dashboard cobra vida ------------ */
  function initUI() {
    var scene = $("[data-ui]");
    if (!scene || reduce) return;
    scene.classList.add("ui-js");
    var started = false;
    function start() {
      if (started) return;
      started = true;
      scene.classList.add("ui-on");

      // números que cuentan
      $$("[data-ui-count]", scene).forEach(function (el) {
        var to = parseFloat(el.getAttribute("data-ui-count"));
        var dec = parseInt(el.getAttribute("data-ui-dec") || "0", 10);
        var pre = el.getAttribute("data-ui-pre") || "";
        var dur = 1700, t0 = 0;
        function fmt(v) { return pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("es-MX")); }
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = fmt(0);
        requestAnimationFrame(step);
        setTimeout(function () { el.textContent = fmt(to); }, dur + 500);   // por si rAF se pausa
      });

      // el chat: los mensajes llegan uno por uno
      var msgs = $$(".ui-msg", scene);
      var typing = $(".ui-typing", scene);
      var at = [500, 1500, 2900, 3900];
      msgs.forEach(function (m, i) {
        setTimeout(function () { m.classList.add("show"); }, at[i] || (i * 1000 + 500));
      });
      if (typing) setTimeout(function () { typing.classList.add("show"); }, (at[msgs.length - 1] || 4000) + 900);
    }
    // arranca cuando termina la entrada del título
    setTimeout(start, 950);
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
    var win     = $("[data-ui-win]");
    var phone   = $("[data-ui-phone]");
    var curtain = $("[data-hv-curtain]");
    var edgeIn  = $("[data-hv-edge-in]");
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

    // 1) escena fijada: producto → telón → "webia"
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: "+=170%",
        pin: true,
        scrub: window.__lenis ? 0.45 : 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    var desk = window.matchMedia("(min-width: 1024px)").matches;
    tl.to(hint, { opacity: 0, duration: 0.05 }, 0)
      .to(copy, { yPercent: -22, opacity: 0, ease: "power2.in", duration: 0.3 }, 0)
      .to(visual, { yPercent: desk ? -4 : -6, duration: 0.5 }, 0);
    if (win && desk) tl.fromTo(win, { rotationX: 6 }, { rotationX: 0, duration: 0.34 }, 0);
    if (phone) tl.to(phone, { yPercent: desk ? -8 : -6, duration: 0.42 }, 0);

    tl.fromTo(curtain, { clipPath: "inset(100% 0% 0% 0%)" },
                       { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 0.3 }, 0.18)
      .fromTo(edgeIn, { yPercent: 100 }, { yPercent: 0, ease: "power2.inOut", duration: 0.3 }, 0.18)
      .fromTo(edgeIn, { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.18)
      .to(edgeIn, { opacity: 0, duration: 0.05 }, 0.45)
      .set(visual, { opacity: 0 }, 0.5)
      .fromTo(fill, { scale: 1.24, xPercent: -5 }, { scale: 1, xPercent: 5, duration: 0.82 }, 0.18)
      .fromTo(letters, { yPercent: 118 },
                       { yPercent: 0, ease: "power3.out", duration: 0.2, stagger: 0.04 }, 0.32)
      .fromTo(spark, { scale: 0, rotation: -140, opacity: 0, transformOrigin: "50% 50%" },
                     { scale: 1, rotation: 0, opacity: 1, ease: "back.out(2.2)", duration: 0.14 }, 0.56)
      .fromTo(tags, { opacity: 0, y: 14 },
                    { opacity: 1, y: 0, ease: "power2.out", duration: 0.12, stagger: 0.03 }, 0.6)
      .fromTo(brand, { scale: 1 }, { scale: 1.03, duration: 0.25 }, 0.75);

    var st = tl.scrollTrigger;

    // 2) sin hueco: al soltarse, el bloque oscuro sube como una sección más
    //    y el contenido entra directo. La palabra se queda un poquito atrás (profundidad).
    gsap.fromTo(brand, { y: 0, opacity: 1 }, {
      y: function () { return window.innerHeight * 0.3; },
      opacity: 0.25,
      ease: "none",
      scrollTrigger: {
        start: function () { return st.end; },
        end: function () { return st.end + window.innerHeight; },
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    // 3) nav oscuro y animación del relleno mientras el bloque oscuro esté en pantalla
    window.ScrollTrigger.create({
      start: function () { return st.start; },
      end: function () { return st.end + window.innerHeight - 72; },
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        var y = self.scroll() - st.start;
        var D = st.end - st.start;
        setLive(y > D * 0.12);
        setDark(y > D * 0.4);
      },
      onLeave: function () { setLive(false); setDark(false); },
      onLeaveBack: function () { setLive(false); setDark(false); }
    });
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
    safe(initHeroLayout,  "initHeroLayout");
    safe(initHeroMouse,   "initHeroMouse");
    safe(initUI,          "initUI");
    safe(initWorkLinks,   "initWorkLinks");
    safe(initFitWords,    "initFitWords");
    safe(initHeroScene,   "initHeroScene");
    safe(initSvcRows,     "initSvcRows");
    safe(initPreviews,    "initPreviews");
    safe(initRefresh,     "initRefresh");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
