/* Cueline page behaviour: nav, reveals, counters, small UI loops, globe and wave art.
   Every loop pauses off-screen. prefers-reduced-motion shows final states. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  if (!reduce) root.classList.add("js");

  function onVisible(el, cbIn, cbOut, opts) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { cbIn(); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) cbIn(e); else if (cbOut) cbOut(e); });
    }, opts || { threshold: 0.15 }).observe(el);
  }
  function once(el, cb, opts) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { cb(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); cb(); } });
    }, opts || { threshold: 0.3 });
    io.observe(el);
  }

  /* nav: scrolled state + mobile menu */
  var nav = document.querySelector(".nav");
  function navState() { nav.classList.toggle("is-scrolled", window.scrollY > 8); }
  navState(); window.addEventListener("scroll", navState, { passive: true });
  var menuBtn = document.querySelector(".nav__menu");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuBtn.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-menu");
    menu.hidden = !open;
    nav.classList.toggle("is-scrolled", open || window.scrollY > 8);
  }
  menuBtn.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* reveals: staggered within each parent */
  if (!reduce) {
    var groups = new Map();
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      var p = el.parentElement; var i = groups.get(p) || 0; groups.set(p, i + 1);
      el.style.transitionDelay = Math.min(i, 5) * 80 + "ms";
      once(el, function () { el.classList.add("is-in"); }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    });
  }

  /* hero ticker */
  var tick = document.getElementById("ticker");
  if (tick) {
    var val = Number(tick.dataset.start);
    var fmt = new Intl.NumberFormat("en-US");
    var tickTimer = 0;
    var step = function () { val += Math.floor(Math.random() * 380 + 40); tick.textContent = "$" + fmt.format(val); };
    if (!reduce) onVisible(tick, function () { if (!tickTimer) tickTimer = setInterval(step, 90); }, function () { clearInterval(tickTimer); tickTimer = 0; });
  }

  /* count-up stats */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10);
    var pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    var render = function (v) { el.textContent = pre + v.toFixed(dec) + suf; };
    if (reduce) { render(end); return; }
    render(0);
    once(el, function () {
      var t0 = performance.now(), dur = 1600;
      (function f(now) {
        var k = Math.min(1, (now - t0) / dur); var e = 1 - Math.pow(1 - k, 4);
        render(end * e); if (k < 1) requestAnimationFrame(f);
      })(t0);
    }, { threshold: 0.6 });
  });

  /* rate card slider loop */
  var rate = document.querySelector(".rate");
  if (rate && !reduce) {
    var rateEl = rate.querySelector("[data-rate]"), rt = 0, rp = 0, rRaf = 0;
    var rLoop = function (now) {
      if (!rt) rt = now; var t = (now - rt) / 1000;
      var p = 0.56 + 0.16 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1);
      rate.style.setProperty("--p", (p * 100).toFixed(1) + "%");
      var v = Math.round((900 + p * 2700) / 50) * 50;
      if (v !== rp) { rp = v; rateEl.textContent = "$" + v.toLocaleString("en-US"); }
      rRaf = requestAnimationFrame(rLoop);
    };
    onVisible(rate, function () { cancelAnimationFrame(rRaf); rRaf = requestAnimationFrame(rLoop); }, function () { cancelAnimationFrame(rRaf); });
  }

  /* bars grow in */
  var bars = document.querySelector(".bars");
  if (bars && !reduce) {
    bars.querySelectorAll("i").forEach(function (b) { b.style.transform = "scaleY(0)"; });
    once(bars, function () {
      bars.querySelectorAll("i").forEach(function (b, i) {
        b.style.transition = "transform .9s cubic-bezier(.16,1,.3,1) " + (i * 45) + "ms";
        requestAnimationFrame(function () { b.style.transform = "scaleY(1)"; });
      });
    });
  }

  /* invoice pill: Due -> Paid, and split toast pop */
  var pill = document.querySelector("[data-flip]");
  if (pill && !reduce) {
    var paid = true, pTimer = 0;
    var flip = function () {
      paid = !paid;
      pill.textContent = paid ? "Paid" : "Due Oct 8";
      pill.className = "pill " + (paid ? "pill--paid" : "pill--due");
      document.querySelector(".timeline .is-paid, .timeline li:last-child").style.opacity = paid ? 1 : .35;
    };
    onVisible(pill, function () { if (!pTimer) pTimer = setInterval(flip, 2200); }, function () { clearInterval(pTimer); pTimer = 0; });
  }
  var toast = document.querySelector(".toast");
  if (toast && !reduce && window.gsap) {
    onVisible(toast, function () {
      gsap.fromTo(toast, { y: 18, opacity: 0, xPercent: -50, x: 0 }, { y: 0, opacity: 1, xPercent: -50, duration: .7, ease: "back.out(1.6)", delay: .3 });
    }, null, { threshold: 0.9 });
  }

  /* terminal typing */
  var term = document.querySelector(".term");
  if (term && !reduce) {
    var lines = term.querySelectorAll("[data-type]");
    var texts = Array.prototype.map.call(lines, function (l) { return l.textContent; });
    lines.forEach(function (l) { l.textContent = " "; });
    once(term, function () {
      var li = 0;
      (function typeLine() {
        if (li >= lines.length) return;
        var el = lines[li], txt = texts[li], c = 0;
        var iv = setInterval(function () {
          c += 2; el.textContent = txt.slice(0, c);
          if (c >= txt.length) { clearInterval(iv); li++; setTimeout(typeLine, 380); }
        }, 22);
      })();
    }, { threshold: 0.5 });
  }

  /* logo marquee on small screens: duplicate the row so the loop is seamless */
  var row = document.querySelector(".logos__row");
  if (row && !reduce) {
    Array.prototype.slice.call(row.children).forEach(function (li) {
      var c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.classList.add("mark--dup"); row.appendChild(c);
    });
  }

  /* subtle parallax on bento mocks (GSAP if present) */
  if (window.gsap && window.ScrollTrigger && !reduce && window.innerWidth >= 900) {
    gsap.registerPlugin(ScrollTrigger);
    [[".phone", -36], [".browser--contract", 22], [".request", -40], [".browser--kit", 18]].forEach(function (p) {
      var el = document.querySelector(p[0]); if (!el) return;
      gsap.fromTo(el, { y: -p[1] }, { y: p[1], ease: "none", scrollTrigger: { trigger: el.closest(".card"), start: "top bottom", end: "bottom top", scrub: true } });
    });
  }

  /* ---------- globe: rotating dot sphere with payout arcs (2D canvas) ---------- */
  (function globe() {
    var cv = document.getElementById("globe"); if (!cv) return;
    var ctx = cv.getContext("2d"); var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pts = [], W = 0, H = 0, R = 0, cx = 0, cy = 0, rot = 0.6, raf = 0, running = false;
    // pseudo-continents: a smooth noise field on the sphere, not a real map
    function nz(x, y, z) { return Math.sin(x * 4.6 + y * 2.2) * Math.cos(y * 3.4 - z * 4.1) + Math.sin(z * 5.2 + x * 1.9) * .6 + Math.sin(y * 6.3 + x * 2.7 - z) * .3; }
    for (var lat = -80; lat <= 80; lat += 3.4) {
      var phi = lat * Math.PI / 180, ring = Math.max(6, Math.round(105 * Math.cos(phi)));
      for (var j = 0; j < ring; j++) {
        var lam = j / ring * Math.PI * 2;
        var x = Math.cos(phi) * Math.cos(lam), y = Math.sin(phi), z = Math.cos(phi) * Math.sin(lam);
        if (nz(x, y, z) > -0.08) pts.push([x, y, z]);
      }
    }
    var hubs = [[0.62, 0.42], [-0.15, 0.9], [0.3, 2.4], [-0.4, 3.6], [0.85, 4.6], [0.1, 5.4]].map(function (h) {
      return [Math.cos(h[0]) * Math.cos(h[1]), Math.sin(h[0]), Math.cos(h[0]) * Math.sin(h[1])];
    });
    var arcs = [[0, 2], [1, 3], [4, 5], [2, 5], [0, 4]];
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W * 0.4, H * 0.44); cx = W * 0.5; cy = H * 0.46;
    }
    function proj(p) {
      var c = Math.cos(rot), s = Math.sin(rot);
      var x = p[0] * c - p[2] * s, z = p[0] * s + p[2] * c, y = p[1];
      var tilt = -0.35, ct = Math.cos(tilt), st = Math.sin(tilt);
      var y2 = y * ct - z * st, z2 = y * st + z * ct;
      return [cx + x * R, cy - y2 * R, z2];
    }
    function slerp(a, b, t) {
      var d = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
      var s = Math.sin(d) || 1, k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
      var lift = 1 + Math.sin(t * Math.PI) * 0.18;
      return [(a[0] * k1 + b[0] * k2) * lift, (a[1] * k1 + b[1] * k2) * lift, (a[2] * k1 + b[2] * k2) * lift];
    }
    var t0 = performance.now();
    function frame(now) {
      var t = (now - t0) / 1000;
      if (!reduce) rot = 0.6 + t * 0.12;
      ctx.clearRect(0, 0, W, H);
      // limb glow
      var g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.08);
      g.addColorStop(0, "rgba(63,224,168,0.10)"); g.addColorStop(0.9, "rgba(20,184,196,0.10)"); g.addColorStop(1, "rgba(20,184,196,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2); ctx.fill();
      var sg = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
      sg.addColorStop(0, "rgba(255,255,255,0.95)"); sg.addColorStop(1, "rgba(227,245,238,0.9)");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(8,119,90,0.18)"; ctx.lineWidth = 1; ctx.stroke();
      for (var i = 0; i < pts.length; i++) {
        var q = proj(pts[i]); if (q[2] < 0) continue;
        var a = 0.35 + q[2] * 0.65;
        ctx.fillStyle = "rgba(8,119,90," + (a * 0.9).toFixed(3) + ")";
        var sz = 1.4 + q[2] * 1.2; ctx.fillRect(q[0] - sz / 2, q[1] - sz / 2, sz, sz);
      }
      // arcs with travelling heads
      for (var k = 0; k < arcs.length; k++) {
        var A = hubs[arcs[k][0]], B = hubs[arcs[k][1]];
        var ph = reduce ? 0.7 : ((t * 0.32 + k * 0.23) % 1.4);
        ctx.beginPath(); var started = false;
        for (var u = 0; u <= 1.0001; u += 0.04) {
          var p = proj(slerp(A, B, u)); if (p[2] < -0.1) { started = false; continue; }
          if (!started) { ctx.moveTo(p[0], p[1]); started = true; } else ctx.lineTo(p[0], p[1]);
        }
        ctx.strokeStyle = "rgba(20,184,196,0.35)"; ctx.lineWidth = 1; ctx.stroke();
        if (ph <= 1) {
          var hp = proj(slerp(A, B, ph));
          if (hp[2] > -0.1) {
            ctx.fillStyle = "#ffcf4a"; ctx.beginPath(); ctx.arc(hp[0], hp[1], 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "rgba(255,207,74,0.25)"; ctx.beginPath(); ctx.arc(hp[0], hp[1], 8, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      for (var m = 0; m < hubs.length; m++) {
        var hq = proj(hubs[m]); if (hq[2] < 0) continue;
        ctx.fillStyle = "#08775a"; ctx.beginPath(); ctx.arc(hq[0], hq[1], 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(8,119,90,.35)"; ctx.beginPath(); ctx.arc(hq[0], hq[1], 7, 0, Math.PI * 2); ctx.stroke();
      }
      if (!reduce && running) raf = requestAnimationFrame(frame);
    }
    size(); window.addEventListener("resize", function () { cancelAnimationFrame(raf); size(); frame(performance.now()); });
    frame(performance.now());
    if (reduce) return;
    onVisible(cv, function () { running = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }, function () { running = false; cancelAnimationFrame(raf); }, { threshold: 0 });
  })();

  /* ---------- wave: a glowing audio-waveform horizon on the dark band ---------- */
  (function wave() {
    var cv = document.getElementById("wave"); if (!cv) return;
    var ctx = cv.getContext("2d"); var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, raf = 0, t0 = performance.now(), running = false;
    function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) {
      var t = reduce ? 3 : (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      var mid = H * 0.5, step = W < 600 ? 5 : 4;
      for (var x = 0; x <= W; x += step) {
        var u = x / W;
        var env = Math.pow(Math.sin(Math.PI * u), 1.6);
        var a = Math.sin(u * 13 + t * 1.3) * 0.5 + Math.sin(u * 31 - t * 2.1) * 0.3 + Math.sin(u * 71 + t * 3.3) * 0.2;
        var hgt = (0.18 + 0.82 * Math.abs(a)) * env * H * 0.46;
        var hue = u; // lagoon -> mint -> lime -> sun across
        var r = Math.round(20 + 235 * Math.max(0, hue - 0.5) * 2 * 0.95), gch = Math.round(184 + 40 * Math.sin(hue * Math.PI)), b = Math.round(196 - 130 * hue);
        var grad = ctx.createLinearGradient(0, mid - hgt, 0, mid + hgt);
        grad.addColorStop(0, "rgba(" + r + "," + gch + "," + b + ",0)");
        grad.addColorStop(0.5, "rgba(" + r + "," + gch + "," + b + ",0.85)");
        grad.addColorStop(1, "rgba(" + r + "," + gch + "," + b + ",0)");
        ctx.fillStyle = grad;
        ctx.fillRect(x, mid - hgt, 1.4, hgt * 2);
      }
      // horizon glow line
      var lg = ctx.createLinearGradient(0, 0, W, 0);
      lg.addColorStop(0, "rgba(92,240,184,0)"); lg.addColorStop(0.5, "rgba(92,240,184,0.55)"); lg.addColorStop(1, "rgba(255,207,74,0)");
      ctx.fillStyle = lg; ctx.fillRect(0, mid - 0.5, W, 1);
      ctx.globalCompositeOperation = "source-over";
      if (!reduce && running) raf = requestAnimationFrame(frame);
    }
    size(); window.addEventListener("resize", function () { cancelAnimationFrame(raf); size(); frame(performance.now()); });
    frame(performance.now());
    if (reduce) return;
    onVisible(cv, function () { running = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }, function () { running = false; cancelAnimationFrame(raf); }, { threshold: 0 });
  })();
})();
