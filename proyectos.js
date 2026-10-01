/* ============================================================
   WEBIA — /proyectos
   Todo lo que se ve del sistema de Admify aquí es INVENTADO:
   nombres, unidades, edificios y montos son de ejemplo.
   ============================================================ */
(function () {
  "use strict";
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduce = mq("(prefers-reduced-motion: reduce)");
  var fine = mq("(hover: hover) and (pointer: fine)");
  function safe(fn, n) { try { fn(); } catch (e) { console.warn("[" + n + "]", e); } }
  var money = function (v) { return "$" + Math.round(v).toLocaleString("en-US"); };

  /* ---------- Admify: datos de ejemplo ---------- */
  var OWN = [
    ["TA1203", "Mariana del Valle", 5, 5, 15, 250, 1250, 180, 1430, 3186, 13624, true],
    ["TA1504", "Luis Herrera",      4, 4, 15, 250, 1000, 120, 1120, 2640, 11284, false],
    ["RB405",  "Sofía Ramírez",     6, 6, 18, 280, 1680, 210, 1890, 4212, 15486, true],
    ["RB702",  "Daniel Moreno",     3, 3, 15, 250,  750,  95,  845, 1890,  8015, false],
    ["PN908",  "Camila Vega",       7, 6, 15, 250, 1500, 240, 1740, 4510, 18760, false],
    ["PN1101", "Andrés Ponce",      2, 2, 20, 300,  600,  60,  660, 1420,  4980, true],
    ["DA210",  "Valeria Ruiz",      5, 5, 15, 250, 1250, 150, 1400, 3020, 12840, false],
    ["DA315",  "Jorge Salinas",     4, 3, 15, 250,  750, 130,  880, 2380, 10115, false],
    ["LC607",  "Paula Méndez",      6, 6, 18, 280, 1680, 205, 1885, 3960, 14272, true],
    ["LC812",  "Ricardo Lara",      3, 3, 15, 250,  750,  80,  830, 1710,  7210, false]
  ];

  function appBar() {
    return '<div class="am-app"><span>☰ Menú</span><span class="am-logo"><i></i>Admify.</span>' +
      '<span>Período</span><span class="am-sel">Oct ▾</span><span class="am-sel">2026 ▾</span>' +
      '<span class="am-btn g">+ Añadir CSV nuevo</span><span class="am-btn ghost">⇪ Cambiar CSV</span>' +
      '<span class="am-user">🔒 Ana · Salir</span></div>';
  }

  function viewCuentas() {
    var rows = OWN.map(function (o) {
      return '<tr><td class="unit"><b>' + o[0] + '</b>' + (o[11] ? '<em>preliminar</em>' : '') + '</td>' +
        '<td>' + o[1] + '</td><td class="num">' + o[2] + '</td><td class="num">' + o[3] + '</td>' +
        '<td class="num">' + o[4] + '</td><td class="num">' + o[5] + '</td>' +
        '<td class="num">' + money(o[6]) + '</td><td class="num">' + money(o[7]) + '</td>' +
        '<td class="num">' + money(o[8]) + '</td><td class="num">' + money(o[9]) + '</td>' +
        '<td class="num saldo">' + money(o[10]) + '</td>' +
        '<td class="act">Ver / PDF<i>✓ Cerrar mes</i></td></tr>';
    }).join("");
    return '<div class="am">' + appBar() + '<div class="am-body">' +
      '<div class="am-kpis"><div class="am-kpi"><small>↗ Ingreso bruto del mes</small><b>$412,380</b></div>' +
      '<div class="am-kpi dark"><small>Comisión Admify (su ingreso)</small><b>$61,857</b></div>' +
      '<div class="am-kpi"><small>A pagar a propietarios</small><b>$198,640</b></div></div>' +
      '<div class="am-alert amber"><b>Oct 2026 todavía no cierra — no mandes estos estados</b><br>Faltan reservas y salidas por llegar, así que los números van a cambiar. Cierra el mes y sube el CSV antes de entregar.</div>' +
      '<div class="am-alert blue"><b>112 reservas en 31 departamentos</b> todavía no vienen en el CSV de Airbnb: sus montos salen del channel manager y están marcadas como <b>preliminar</b>. Se reemplazan solas al subir el CSV.<br>Del channel contra el CSV: de <b>214</b> reservas que ya vienen en los dos, <b>213</b> cuadran al peso y <b>1 no</b>.</div>' +
      '<div class="am-alert red"><b>⚠ 4 departamento(s) llevan semanas sin una sola salida</b><br>TA1504 — última salida el 2026-08-02 (hace 60 días) · RB702 — última salida el 2026-08-21 (hace 41 días) · PN1101 — última salida el 2026-09-03 (hace 28 días) · LC812 — cero salidas registradas</div>' +
      '<div class="am-alert gray">ⓘ <b>3 unidad(es) dadas de alta que aún no se publican</b> — DA410 · LC905 · TA1802 — no es una falla: les falta el anuncio en Airbnb.</div>' +
      '<div class="am-tools"><span>38 unidades · 74 CSVs guardados</span><span class="am-search">🔍 Buscar propiedad…</span>' +
      '<span class="am-btn navy push">PDF de cada una (38)</span><span class="am-btn green">✓ Cerrar mes</span><span class="am-btn line">🔒 Bloqueo de fecha</span></div>' +
      '<table class="am-table"><thead><tr><th>UNIDAD</th><th>PROPIETARIO</th><th class="num">RES</th><th class="num">SAL</th><th class="num">COM %</th><th class="num">LIMP/SAL</th><th class="num">LIMPIEZA</th><th class="num">INSUMOS</th><th class="num">GASTOS</th><th class="num">COMISIÓN</th><th class="num">SALDO PROPIETARIO</th><th></th></tr></thead><tbody>' +
      rows + '</tbody></table></div></div>';
  }

  function viewCalendario() {
    var letters = ["J","V","S","D","L","M","M","J","V","S","D","L","M","M","J","V","S","D","L","M","M"];
    var days = '<div class="am-row days"><span></span>' + letters.map(function (l, i) {
      return '<span>' + l + '<b>' + (i + 1) + '</b></span>';
    }).join("") + '</div>';
    var G = [
      ["Torre Altavista (TA)", [
        ["TA1203", [[1,3,"air","Ana"],[4,8,"air","Carlos M."],[10,14,"air","Lucía"],[16,21,"air","Bruno R."]]],
        ["TA1504", [[2,6,"air","Elena"],[8,9,"op",""],[12,18,"air","Hugo P."]]],
        ["TA1802", [[1,21,"block","Sin publicar"]]]
      ]],
      ["Residencial Bosque (RB)", [
        ["RB405", [[1,5,"air","Julia"],[6,11,"air","Raúl S."],[13,17,"own","Propietario"],[18,21,"air","Inés"]]],
        ["RB702", [[3,4,"mnt","Mant."],[7,12,"air","Óscar"],[15,20,"air","Marta L."]]]
      ]],
      ["Punta Norte (PN)", [
        ["PN908", [[1,2,"air","Gael"],[3,9,"air","Alma T."],[11,15,"air","Leo"],[17,21,"air","Rosa"]]],
        ["PN1101", [[5,8,"air","Saúl"],[10,11,"op",""],[14,19,"air","Vera C."]]]
      ]],
      ["Distrito Arcos (DA)", [
        ["DA210", [[2,7,"air","Iker"],[9,13,"air","Paz"],[15,21,"air","Joel M."]]],
        ["DA315", [[1,4,"air","Dana"],[6,6,"op",""],[8,16,"air","Ciro F."],[18,20,"air","Luz"]]]
      ]]
    ];
    var body = G.map(function (g) {
      return '<div class="am-row grp">' + g[0] + '</div>' + g[1].map(function (u) {
        var cells = "";
        for (var d = 1; d <= 21; d++) cells += '<span class="d" style="grid-column:' + (d + 1) + '"></span>';
        var pills = u[1].map(function (p) {
          return '<span class="am-pill ' + p[2] + '" style="grid-column:' + (p[0] + 1) + ' / ' + (p[1] + 2) + '">' + p[3] + '</span>';
        }).join("");
        return '<div class="am-row"><span class="u" style="grid-row:1;grid-column:1">' + u[0] + '</span>' + cells + pills + '</div>';
      }).join("");
    }).join("");
    return '<div class="am">' + appBar() + '<div class="am-body">' +
      '<div class="am-cal-head"><h4>📅 Calendario</h4><span class="am-chip on">Todos los departamentos</span><span class="am-chip">Precios y bloqueos</span><span class="am-chip">Ver un departamento</span><span class="am-chip">Noches bloqueadas</span></div>' +
      '<div class="am-legend"><span><i style="background:#FF5A5F"></i>Airbnb</span><span><i style="background:#F59E0B"></i>Estancia del propietario</span><span><i style="background:#3B82F6"></i>Mantenimiento</span><span><i style="background:#8B5CF6"></i>Operativo</span><span><i style="background:#94A3B8"></i>Bloqueado</span></div>' +
      '<div style="text-align:center;font-weight:700;font-size:13px">1 al 21 de octubre</div>' +
      '<div class="am-grid">' + days + body + '</div></div></div>';
  }

  function viewStats() {
    var m = ["may","jun","jul","ago","sep","oct","nov","dic","ene","feb","mar","abr","may","jun","jul","ago","sep","oct"];
    var v = [182,198,240,226,251,268,312,298,276,301,334,352,341,368,395,388,412,406];
    var max = 440, W = 900, H = 190, bw = 30, gap = (W - bw * v.length) / (v.length - 1);
    var bars = v.map(function (val, i) {
      var h = Math.round((val / max) * 140), x = Math.round(i * (bw + gap)), y = 160 - h;
      var c = Math.round(h * 0.2);
      return '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + h + '" rx="4" fill="#4C6EF5"/>' +
        '<rect x="' + (x + bw * 0.25) + '" y="' + (160 - c) + '" width="' + (bw * 0.5) + '" height="' + c + '" rx="3" fill="#22A06B"/>' +
        '<text x="' + (x + bw / 2) + '" y="' + (y - 5) + '" font-size="9" text-anchor="middle" fill="#7A8499">$' + val + 'k</text>' +
        '<text x="' + (x + bw / 2) + '" y="176" font-size="9.5" text-anchor="middle" fill="#5A6480">' + m[i] + '</text>';
    }).join("");
    var hb = function (cls, rows, mx) {
      return rows.map(function (r) {
        return '<div class="am-hb ' + cls + '"><small>' + r[0] + '</small><span style="width:' + Math.round((r[1] / mx) * 100) + '%"></span><b>' + money(r[1]) + '</b></div>';
      }).join("");
    };
    return '<div class="am">' + appBar() + '<div class="am-body">' +
      '<div class="am-cal-head"><h4>↗ Estadísticas · historial completo</h4></div>' +
      '<div class="am-kpis" style="grid-template-columns:repeat(4,1fr)">' +
      '<div class="am-kpi"><small>INGRESOS NETOS (24 MESES)</small><b>$8,214,560</b></div>' +
      '<div class="am-kpi"><small>COMISIÓN ADMIFY</small><b>$1,642,912</b></div>' +
      '<div class="am-kpi"><small>SALIDAS (LIMPIEZAS)</small><b>3,412</b></div>' +
      '<div class="am-kpi"><small>DEPARTAMENTOS CON ACTIVIDAD</small><b>54</b></div></div>' +
      '<div class="am-bars"><h5>Ingresos netos y comisión por mes</h5><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + bars + '</svg></div>' +
      '<div class="am-split"><div><h5>Ingresos por edificio (acumulado)</h5>' +
      hb("", [["Torre Altavista", 2418300], ["Residencial Bosque", 1864950], ["Punta Norte", 1322410], ["Distrito Arcos", 986700], ["Loft Central", 622200]], 2418300) +
      '</div><div><h5>Gastos capturados por categoría</h5>' +
      hb("o", [["Limpieza", 412600], ["Lavandería", 188300], ["Insumos", 96450], ["Mantenimiento", 74900], ["Servicios", 52180]], 412600) +
      '</div></div></div></div>';
  }

  function initAdmify() {
    var map = { cuentas: viewCuentas, calendario: viewCalendario, stats: viewStats };
    $$("[data-admify]").forEach(function (p) {
      var fn = map[p.getAttribute("data-admify")];
      if (fn) p.innerHTML = fn();
    });
    fitMocks();
    window.addEventListener("resize", fitMocks);
  }
  // el mock está diseñado a 760px; en pantallas angostas se escala completo
  function fitMocks() {
    $$(".pj-screen").forEach(function (s) {
      $$(".am", s).forEach(function (am) {
        var w = s.clientWidth;
        am.style.zoom = w && w < 760 ? (w / 760).toFixed(3) : "";
      });
    });
  }

  /* ---------- pestañas ---------- */
  function initTabs() {
    $$("[data-pj-tabs]").forEach(function (tabs) {
      var media = tabs.closest(".pj-media");
      var screen = $("[data-pj-screen]", media);
      var win = $(".pj-win", media);
      var btns = $$("button", tabs);
      var panes = $$(".pj-pane", screen);
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () {
          btns.forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
          panes.forEach(function (p, j) { p.classList.toggle("on", j === i); });
          screen.scrollTop = 0;
          if (win) win.classList.remove("scrolled");
          fitMocks();
        });
      });
    });
    $$("[data-pj-screen]").forEach(function (s) {
      var win = s.closest(".pj-win");
      s.addEventListener("scroll", function () { if (s.scrollTop > 30 && win) win.classList.add("scrolled"); }, { passive: true });
    });
  }

  /* ---------- sitios en vivo ---------- */
  function initLive() {
    $$(".pj-live").forEach(function (box) {
      var url = box.getAttribute("data-live");
      var btn = $(".pj-explore", box);
      function activate() {
        if (box.classList.contains("on")) return;
        var f = document.createElement("iframe");
        f.src = url;
        f.title = "Sitio en vivo";
        f.setAttribute("loading", "eager");
        f.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        var shield = document.createElement("div");
        shield.className = "pj-shield";
        shield.innerHTML = "<span>Clic para seguir explorando</span>";
        shield.addEventListener("click", function () { box.classList.remove("shielded"); });
        box.appendChild(f);
        box.appendChild(shield);
        box.classList.add("on");
        box.setAttribute("data-lenis-prevent", "");
        box.addEventListener("mouseleave", function () { box.classList.add("shielded"); });
      }
      if (btn) btn.addEventListener("click", activate);
      // en celular: tocar abre el sitio real en otra pestaña
      box.addEventListener("click", function (e) {
        if (fine || box.classList.contains("on") || e.target.closest(".pj-explore")) return;
        window.open(url, "_blank", "noopener");
      });
    });
  }

  /* ---------- entradas + índice activo ---------- */
  function initReveal() {
    var cases = $$("[data-pj]");
    if (!cases.length) return;
    if (reduce || !("IntersectionObserver" in window)) { cases.forEach(function (c) { c.classList.add("in"); }); return; }
    document.documentElement.classList.add("js-pj");
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    cases.forEach(function (c) { io.observe(c); });
    // por si el navegador no corre el observer (pestaña en segundo plano)
    setTimeout(function () {
      cases.forEach(function (c) { var r = c.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) c.classList.add("in"); });
    }, 1200);
  }
  function initIndex() {
    var idx = $("[data-pj-index]");
    if (!idx || !("IntersectionObserver" in window)) return;
    var links = $$("a", idx);
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var a = byId[e.target.id];
        if (!a) return;
        links.forEach(function (l) { l.classList.toggle("on", l === a); });
        var left = a.offsetLeft - idx.clientWidth / 2 + a.clientWidth / 2;
        idx.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("[data-pj]").forEach(function (c) { io.observe(c); });
  }

  /* ---------- scroll suave + anclas ---------- */
  var lenis = null;
  function initLenis() {
    if (reduce || !fine || !window.Lenis) return;
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      e.preventDefault();
      history.replaceState(null, "", a.getAttribute("href"));
      if (lenis) lenis.scrollTo(el, { offset: -118, duration: 1.2 });
      else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  }
  function initNav() {
    var nav = $("[data-pj-nav]");
    if (!nav) return;
    var on = false;
    function check() { var w = window.scrollY > 20; if (w !== on) { on = w; nav.classList.toggle("is-stuck", on); } }
    check();
    window.addEventListener("scroll", check, { passive: true });
  }

  function boot() {
    safe(initAdmify, "admify");
    safe(initTabs, "tabs");
    safe(initLive, "live");
    safe(initReveal, "reveal");
    safe(initIndex, "index");
    safe(initLenis, "lenis");
    safe(initAnchors, "anchors");
    safe(initNav, "nav");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
