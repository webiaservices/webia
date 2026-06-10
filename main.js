/* WEBIA — main.js v2 (IIFE, sin módulos)
   Reglas de oro: solo transform/opacity animados, UN solo rAF loop. */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function $(sel, scope) { return (scope || document).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* ----------------------------------------------------------
     UN solo rAF loop — todos los módulos se registran aquí
     ---------------------------------------------------------- */
  var updaters = [];
  function addUpdater(fn) { updaters.push(fn); }
  function startLoop() {
    function loop(t) {
      for (var i = 0; i < updaters.length; i++) updaters[i](t);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ----------------------------------------------------------
     Splash (doble seguridad: CSS 4.5s + JS)
     ---------------------------------------------------------- */
  var splashHidden = false;
  var onSplashOut = [];
  function hideSplash() {
    if (splashHidden) return;
    splashHidden = true;
    var splash = $("[data-splash]");
    if (splash) {
      splash.classList.add("is-out");
      setTimeout(function () { splash.style.display = "none"; }, 900); // libera una capa de GPU de pantalla completa
    }
    onSplashOut.forEach(function (fn) { safe(fn, "splashOut"); });
  }
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) { hideSplash(); return; }
    var minTime = 1500; // deja respirar la animación del logo
    var t0 = performance.now();
    function done() {
      var left = Math.max(0, minTime - (performance.now() - t0));
      setTimeout(hideSplash, left);
    }
    if (document.readyState === "complete") done();
    else window.addEventListener("load", done);
    setTimeout(hideSplash, 4000); // seguridad JS adicional
  }

  /* ----------------------------------------------------------
     Sonido (WebAudio, sin archivos)
     ---------------------------------------------------------- */
  var Sound = {
    ctx: null,
    enabled: true,
    ensure: function () {
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },
    blip: function (freq, dur, vol, type) {
      if (!this.enabled) return;
      var ctx = this.ensure();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    },
    tick: function () { this.blip(1800, 0.05, 0.02, "sine"); },
    click: function () { this.blip(620, 0.11, 0.055, "triangle"); }
  };

  function initSound() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-snd]");
      if (!el) return;
      if (el.getAttribute("data-snd") === "click") Sound.click();
      else Sound.tick();
    });
    if (fineHover) {
      document.addEventListener("mouseover", function (e) {
        var el = e.target.closest('[data-snd], .btn, .nav-links a, .work-head');
        if (!el || el.__sndHover) return;
        el.__sndHover = true;
        Sound.tick();
        setTimeout(function () { el.__sndHover = false; }, 350);
      });
    }
    var toggle = $("[data-sound-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function () {
        Sound.enabled = !Sound.enabled;
        toggle.setAttribute("aria-pressed", String(Sound.enabled));
        if (Sound.enabled) Sound.click();
      });
    }
  }

  /* ----------------------------------------------------------
     Blobs del hero — parallax con transform (cero repaints)
     ---------------------------------------------------------- */
  function initBlobs() {
    var blobs = $$("[data-blob]");
    if (!blobs.length) return;
    var mx = 0, my = 0;
    var state = blobs.map(function (el) {
      return { el: el, f: parseFloat(el.getAttribute("data-blob")) || 0.08, x: 0, y: 0 };
    });
    if (fineHover) {
      document.addEventListener("mousemove", function (e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;   // -1..1
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }
    var heroVisible = true;
    if ("IntersectionObserver" in window) {
      var hero = $(".hero");
      if (hero) new IntersectionObserver(function (en) {
        heroVisible = en[0].isIntersecting;
      }, { threshold: 0 }).observe(hero);
    }
    addUpdater(function () {
      if (!heroVisible) return; // no gastes frames si el hero no se ve
      for (var i = 0; i < state.length; i++) {
        var s = state[i];
        var tx = mx * 120 * s.f * 10;
        var ty = my * 90 * s.f * 10;
        var dx = tx - s.x, dy = ty - s.y;
        if (dx * dx + dy * dy < 0.02) continue; // ya convergió: no re-escribas estilo
        s.x += dx * 0.045;
        s.y += dy * 0.045;
        s.el.style.transform = "translate3d(" + s.x.toFixed(1) + "px," + s.y.toFixed(1) + "px,0)";
      }
    });
  }

  /* ----------------------------------------------------------
     Cursor
     ---------------------------------------------------------- */
  function initCursor() {
    if (!fineHover) return;
    var cursor = $(".cursor");
    var dot = $(".cursor-dot");
    var ring = $(".cursor-ring");
    if (!cursor || !dot || !ring) return;
    var x = 0, y = 0, rx = 0, ry = 0, first = false;

    window.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      dot.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      if (!first) {
        first = true;
        rx = x; ry = y;
        cursor.classList.add("is-ready");
      }
    }, { passive: true });
    document.addEventListener("mousedown", function () { cursor.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { cursor.classList.remove("is-down"); });

    addUpdater(function () {
      var dx = x - rx, dy = y - ry;
      if (dx * dx + dy * dy < 0.04) return; // anillo ya pegado al puntero
      rx += dx * 0.16;
      ry += dy * 0.16;
      ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
    });

    var HOVERABLES = "a, button, input, textarea";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(HOVERABLES)) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(HOVERABLES)) cursor.classList.remove("is-hover");
    });
  }

  /* ----------------------------------------------------------
     Nav: sólida + se esconde al bajar, aparece al subir
     ---------------------------------------------------------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (nav) {
      var lastY = window.scrollY;
      var onScroll = function () {
        var y = window.scrollY;
        nav.classList.toggle("is-solid", y > 30);
        if (y > 400 && y > lastY + 6) nav.classList.add("is-hidden");
        else if (y < lastY - 6 || y < 200) nav.classList.remove("is-hidden");
        lastY = y;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    var burger = $("[data-burger]");
    var menu = $("[data-mobile-menu]");
    if (burger && menu) {
      burger.addEventListener("click", function () {
        var open = menu.classList.toggle("is-open");
        burger.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
      });
      $$("a", menu).forEach(function (a) {
        a.addEventListener("click", function () {
          menu.classList.remove("is-open");
          burger.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ----------------------------------------------------------
     Scroll suave en anclas
     ---------------------------------------------------------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ----------------------------------------------------------
     Split de caracteres (preserva <em> y estructura) — gotcha A.4
     ---------------------------------------------------------- */
  function splitChars(el) {
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    function wrapText(text, extraClass) {
      return text.split(/(\s+)/).map(function (chunk) {
        if (/^\s+$/.test(chunk)) return chunk;
        var chars = chunk.split("").map(function (c) {
          return '<span class="char ' + (extraClass || "") + '" aria-hidden="true">' + c.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</span>";
        }).join("");
        return '<span class="word" style="display:inline-block;white-space:nowrap">' + chars + "</span>";
      }).join("");
    }
    var html = Array.prototype.map.call(el.childNodes, function (node) {
      if (node.nodeType === 3) return wrapText(node.textContent);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var cls = node.className || "";
        return wrapText(node.textContent, cls);
      }
      return "";
    }).join("");
    el.innerHTML = html;
    return $$(".char", el);
  }

  /* ----------------------------------------------------------
     Intro del hero (GSAP) — arranca cuando sale el splash
     ---------------------------------------------------------- */
  function initHeroIntro() {
    if (!window.gsap) return;
    var lines = $$("[data-line]");
    var fades = $$("[data-hero-fade]");
    var kicker = $(".hero-kicker");
    if (!lines.length) return;

    var allChars = [];
    lines.forEach(function (line) {
      line.style.overflow = "clip";
      allChars = allChars.concat(splitChars(line));
    });

    if (reduced) return; // contenido visible, sin coreografía

    gsap.set(allChars, { yPercent: 115, rotate: 4 });
    if (kicker) gsap.set(kicker, { autoAlpha: 0, y: 14 });
    gsap.set(fades, { autoAlpha: 0, y: 26 });

    function play() {
      var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      if (kicker) tl.to(kicker, { autoAlpha: 1, y: 0, duration: 0.7 }, 0);
      tl.to(allChars, {
        yPercent: 0, rotate: 0,
        duration: 1.05,
        stagger: { each: 0.016, from: "start" }
      }, 0.1);
      tl.to(fades, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.75);
    }
    if (splashHidden) play();
    else onSplashOut.push(play);
  }

  /* ----------------------------------------------------------
     Parallax del hero al scrollear
     ---------------------------------------------------------- */
  function initHeroParallax() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    // Solo movimiento (sin opacidad: un scrub de alpha atorado dejaba
    // la portada "gris" al subir rápido)
    gsap.to("[data-hero-inner]", {
      y: -50,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true }
    });
  }

  /* ----------------------------------------------------------
     Manifiesto — palabras que se encienden con el scroll
     ---------------------------------------------------------- */
  function initScrubWords() {
    var el = $("[data-scrub-words]");
    if (!el) return;
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) {
      var cls = "w";
      if (/^Webia/.test(w)) cls += " grad-text";
      return '<span class="' + cls + '">' + w.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</span>";
    }).join(" ");
    if (!window.gsap || !window.ScrollTrigger || reduced) return;
    gsap.fromTo($$(".w", el),
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.04,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "bottom 45%",
          scrub: 0.4
        }
      });
  }

  /* ----------------------------------------------------------
     Reveals (IO + red de seguridad 6s)
     ---------------------------------------------------------- */
  function initReveals() {
    var targets = $$(".reveal");
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -4% 0px" });
    targets.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ----------------------------------------------------------
     Tilt 3D (suave en cards, profundo en mockups)
     ---------------------------------------------------------- */
  function initTilt() {
    if (!fineHover || reduced) return;
    var els = $$("[data-tilt], [data-tilt-deep]");
    els.forEach(function (el) {
      if (el.__tiltBound) return;
      el.__tiltBound = true;
      var deep = el.hasAttribute("data-tilt-deep");
      var max = deep ? 7 : 3.5;
      var s = { rx: 0, ry: 0, trx: 0, try_: 0, active: false };

      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        s.try_ = px * max * 2;
        s.trx = -py * max * 2;
        s.active = true;
      }, { passive: true });
      el.addEventListener("mouseout", function (e) {
        if (el.contains(e.relatedTarget)) return;
        s.trx = 0; s.try_ = 0;
      });

      addUpdater(function () {
        if (!s.active) return;
        s.rx += (s.trx - s.rx) * 0.12;
        s.ry += (s.try_ - s.ry) * 0.12;
        el.style.transform = "perspective(800px) rotateX(" + s.rx.toFixed(2) + "deg) rotateY(" + s.ry.toFixed(2) + "deg)" + (deep ? "" : " translateY(" + (Math.abs(s.rx) + Math.abs(s.ry) > 0.3 ? -4 : 0) + "px)");
        if (Math.abs(s.rx) < 0.02 && Math.abs(s.ry) < 0.02 && s.trx === 0 && s.try_ === 0) {
          el.style.transform = "";
          s.active = false;
        }
      });
    });
  }

  /* ----------------------------------------------------------
     Botones magnéticos
     ---------------------------------------------------------- */
  function initMagnetic() {
    if (!fineHover || reduced) return;
    $$("[data-magnetic]").forEach(function (btn) {
      if (btn.__magBound) return;
      btn.__magBound = true;
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * 0.28;
        var dy = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = "translate(" + dx.toFixed(1) + "px," + (dy - 2).toFixed(1) + "px)";
      }, { passive: true });
      btn.addEventListener("mouseout", function (e) {
        if (btn.contains(e.relatedTarget)) return;
        btn.style.transform = "";
      });
    });
  }

  /* ----------------------------------------------------------
     Screenshots en vivo: al cargar, el mock adopta la imagen
     ---------------------------------------------------------- */
  function initMockShots() {
    $$(".mock-shot").forEach(function (img) {
      function mark() {
        var screen = img.closest(".mock-screen");
        if (screen && img.naturalWidth > 50) screen.classList.add("has-shot");
      }
      if (img.complete && img.naturalWidth > 0) mark();
      else img.addEventListener("load", mark);
    });
  }

  /* ----------------------------------------------------------
     Filas de trabajo (acordeón)
     ---------------------------------------------------------- */
  function initWorkRows() {
    $$("[data-work-row]").forEach(function (row) {
      var head = $(".work-head", row);
      if (!head || head.__bound) return;
      head.__bound = true;
      head.addEventListener("click", function () {
        var open = row.classList.toggle("is-open");
        head.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ----------------------------------------------------------
     Count-up de stats
     ---------------------------------------------------------- */
  function initCounters() {
    var nums = $$("[data-count-to]");
    if (!nums.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var el = entry.target;
        var to = parseFloat(el.getAttribute("data-count-to")) || 0;
        var start = null, dur = 1400;
        function step(t) {
          if (!start) start = t;
          var p = Math.min((t - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(to * eased);
          if (p < 1) requestAnimationFrame(step);
        }
        if (reduced) el.textContent = Math.round(to);
        else requestAnimationFrame(step);
      });
    }, { threshold: 0.01 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     Headers de sección con entrada GSAP (clip + skew sutil)
     ---------------------------------------------------------- */
  function initSectionHeads() {
    if (!window.gsap || !window.ScrollTrigger || reduced) return;
    $$(".section-head h2").forEach(function (h) {
      gsap.from(h, {
        yPercent: 30, autoAlpha: 0, skewY: 2.5,
        duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: h, start: "top 88%" }
      });
      h.classList.remove("reveal"); // evita doble animación
      h.classList.add("is-visible");
    });
  }

  /* ----------------------------------------------------------
     Entradas escalonadas de grids (GSAP)
     ---------------------------------------------------------- */
  function initStaggerGrids() {
    if (!window.gsap || !window.ScrollTrigger || reduced) return;
    [".services-grid", ".testi-grid", ".price-grid", ".process-steps"].forEach(function (sel) {
      var grid = $(sel);
      if (!grid) return;
      var items = Array.prototype.slice.call(grid.children);
      items.forEach(function (el) { el.classList.remove("reveal", "d1", "d2"); el.classList.add("is-visible"); });
      // entrada moderna: blur-up limpio, sin rotaciones
      gsap.from(items, {
        y: 42,
        autoAlpha: 0,
        filter: "blur(14px)",
        scale: 0.985,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.09,
        clearProps: "filter,transform",
        scrollTrigger: { trigger: grid, start: "top 86%" }
      });
    });
  }

  /* ----------------------------------------------------------
     Marquee que reacciona a la velocidad del scroll
     ---------------------------------------------------------- */
  function initMarqueeVelocity() {
    var wrap = $(".marquee");
    if (!wrap || !window.gsap || !window.ScrollTrigger || reduced) return;
    var proxy = { skew: 0 };
    var clamp = gsap.utils.clamp(-10, 10);
    ScrollTrigger.create({
      onUpdate: function (self) {
        var skew = clamp(self.getVelocity() / -150);
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, {
            skew: 0, duration: 0.9, ease: "power3",
            overwrite: true,
            onUpdate: function () { wrap.style.transform = "skewX(" + proxy.skew + "deg)"; }
          });
        }
      }
    });
  }

  /* ----------------------------------------------------------
     Parallax sutil: watermark del footer + mockups
     ---------------------------------------------------------- */
  function initScrollParallax() {
    if (!window.gsap || !window.ScrollTrigger || reduced) return;
    var wm = $(".footer-watermark");
    if (wm) {
      gsap.from(wm, {
        yPercent: 40,
        ease: "none",
        scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: 0.5 }
      });
    }
    $$(".contact-badge").forEach(function (b) {
      gsap.from(b, {
        scale: 0, rotate: -90,
        duration: 0.8, ease: "back.out(1.7)",
        scrollTrigger: { trigger: ".contact", start: "top 70%" }
      });
    });
  }

  /* ----------------------------------------------------------
     WhatsApp / formulario / plan
     ---------------------------------------------------------- */
  function waNumber() { return String(data.whatsapp || "").replace(/\D/g, ""); }
  function waConfigured(n) { return n && !/^521?0{6,}$/.test(n); }

  function initWhatsAppLinks() {
    var n = waNumber();
    if (!waConfigured(n)) return;
    $$("[data-wa-link]").forEach(function (a) {
      a.href = "https://wa.me/" + n + "?text=" + encodeURIComponent("Hola Webia, quiero cotizar mi página web 👋");
    });
  }
  function initPlanButtons() {
    var field = $("[data-plan-field]");
    if (!field) return;
    $$("[data-plan]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        field.value = btn.getAttribute("data-plan") || "";
      });
    });
  }
  function initContactForm() {
    var form = $("[data-contact-form]");
    if (!form) return;
    var ok = $("[data-form-ok]");

    function composeMessage() {
      var f = new FormData(form);
      var plan = f.get("plan");
      return "Hola Webia 👋\n" +
        "Soy " + (f.get("nombre") || "") + ", de " + (f.get("negocio") || "") + ".\n" +
        (plan ? "Me interesa el paquete " + plan + ".\n" : "") +
        "Lo que necesito: " + (f.get("mensaje") || "");
    }

    function sendToEmail() {
      // Envío real al correo vía FormSubmit (sin backend).
      // La primera vez que llegue un envío, FormSubmit manda un correo
      // de activación a esa dirección: hay que darle "Activate".
      if (!data.email || data.email.indexOf("@") < 1) return;
      try {
        var f = new FormData(form);
        fetch("https://formsubmit.co/ajax/" + encodeURIComponent(data.email), {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            _subject: "🟣 Nueva cotización desde webia",
            nombre: f.get("nombre") || "",
            negocio: f.get("negocio") || "",
            plan: f.get("plan") || "(sin plan elegido)",
            mensaje: f.get("mensaje") || ""
          })
        }).catch(function () {});
      } catch (_) {}
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      sendToEmail(); // llega al correo de Webia
      var msg = composeMessage();
      var n = waNumber();
      var url = waConfigured(n)
        ? "https://wa.me/" + n + "?text=" + encodeURIComponent(msg) // llega a tu WhatsApp
        : "mailto:" + (data.email || "webiaservices@gmail.com") +
          "?subject=" + encodeURIComponent("Quiero mi página con Webia") +
          "&body=" + encodeURIComponent(msg);
      window.open(url, "_blank");
      if (ok) ok.hidden = false;
    });

    var emailBtn = $("[data-send-email]");
    if (emailBtn) {
      emailBtn.addEventListener("click", function () {
        if (!form.reportValidity()) return;
        sendToEmail();
        location.href = "mailto:" + (data.email || "webiaservices@gmail.com") +
          "?subject=" + encodeURIComponent("Quiero mi página con Webia") +
          "&body=" + encodeURIComponent(composeMessage());
        if (ok) ok.hidden = false;
      });
    }
  }

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  function boot() {
    safe(initSplash, "initSplash");
    safe(initSound, "initSound");
    safe(initBlobs, "initBlobs");
    safe(initCursor, "initCursor");
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initMockShots, "initMockShots");
    safe(initWorkRows, "initWorkRows");
    safe(initCounters, "initCounters");
    safe(initTilt, "initTilt");
    safe(initMagnetic, "initMagnetic");
    safe(initWhatsAppLinks, "initWhatsAppLinks");
    safe(initPlanButtons, "initPlanButtons");
    safe(initContactForm, "initContactForm");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroIntro, "initHeroIntro");
      safe(initHeroParallax, "initHeroParallax");
      safe(initScrubWords, "initScrubWords");
      safe(initSectionHeads, "initSectionHeads");
      safe(initStaggerGrids, "initStaggerGrids");
      safe(initMarqueeVelocity, "initMarqueeVelocity");
      safe(initScrollParallax, "initScrollParallax");
    } else {
      safe(initScrubWords, "initScrubWords"); // sin GSAP: solo wrap, texto visible
    }

    startLoop();
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
