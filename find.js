/* ============================================================
   WEBIA — capa "FIND". Se carga DESPUÉS de main.js.
   Sin módulos, sin dependencias nuevas. Todo guardado en try.
   ============================================================ */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------- 1. NAV: fondo sólido al bajar ---------------- */
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

  /* ---------- 2. HERO: palabras que entran ----------------- */
  function initHeroWords() {
    var title = $(".hv-title");
    if (!title) return;
    var words = $$(".w", title);
    if (!words.length || reduce) return;

    var root = document.documentElement;
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

    root.classList.add("js-hv");
    // setTimeout (no rAF): sigue corriendo aunque la pestaña esté en segundo plano,
    // así el texto nunca se queda invisible.
    setTimeout(function () { root.classList.add("hv-in"); }, 70);
    // cinturón y tirantes
    setTimeout(function () { root.classList.add("hv-in"); }, 1200);
  }

  /* ---------- 3. HERO: escena con scroll (pin) ------------- */
  function initHeroScene() {
    var pin = $(".hv-pin");
    if (!pin || reduce) return;
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.innerWidth < 760) return;          // en móvil se queda estático

    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    var copy   = $("[data-hv-copy]");
    var visual = $("[data-hv-visual]");
    var mark   = $("[data-hv-mark]");
    var dim    = $("[data-hv-dim]");
    var fade   = $("[data-hv-fade]");
    var hint   = $(".hv-scroll");
    if (!copy || !visual || !mark) return;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: "+=260%",
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tl.to(hint,   { opacity: 0, duration: 0.06 }, 0)
      .to(copy,   { yPercent: -16, scale: 0.9, opacity: 0, ease: "power2.in", duration: 0.34 }, 0)
      .to(visual, { scale: 3.05, yPercent: -16, ease: "none", duration: 0.78 }, 0)
      .to(dim,    { opacity: 0.88, ease: "power1.inOut", duration: 0.3 }, 0.2)
      .fromTo(mark,
              { opacity: 0, scale: 0.68 },
              { opacity: 1, scale: 1.06, ease: "none", duration: 0.52 }, 0.26)
      .to(mark,   { scale: 1.34, ease: "none", duration: 0.2 }, 0.78)
      .to(fade,   { opacity: 1, ease: "power1.in", duration: 0.17 }, 0.83)
      .to(dim,    { opacity: 0, ease: "power1.in", duration: 0.17 }, 0.83);
  }

  /* ---------- 4. SERVICIOS: palabra que se rellena --------- */
  function initSvcRows() {
    var rows = $$(".svc-row");
    if (!rows.length) return;
    if (!("IntersectionObserver" in window) || reduce) {
      rows.forEach(function (r) { r.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.32, rootMargin: "0px 0px -8% 0px" });
    rows.forEach(function (r) { io.observe(r); });
  }

  /* ---------- 5. Refrescar ScrollTrigger al cargar fotos --- */
  function initRefresh() {
    if (!window.ScrollTrigger) return;
    window.addEventListener("load", function () {
      window.ScrollTrigger.refresh();
    });
    $$("img").forEach(function (im) {
      if (!im.complete) {
        im.addEventListener("load", function () {
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }, { once: true });
      }
    });
  }

  function boot() {
    safe(initNavStuck,  "initNavStuck");
    safe(initHeroWords, "initHeroWords");
    safe(initHeroScene, "initHeroScene");
    safe(initSvcRows,   "initSvcRows");
    safe(initRefresh,   "initRefresh");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
