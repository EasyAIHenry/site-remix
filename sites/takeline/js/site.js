/* Takeline: page motion. Works without GSAP (IntersectionObserver reveals);
   GSAP + ScrollTrigger add the scroll-scrubbed hero tilt and statement highlight. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  doc.classList.add("js");

  /* header state + mobile menu */
  var hdr = document.querySelector(".hdr");
  var onScroll = function () { hdr.classList.toggle("is-scrolled", window.scrollY > 8); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  var menuBtn = document.querySelector(".menu-btn");
  menuBtn.addEventListener("click", function () {
    var open = hdr.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  });
  document.querySelectorAll(".mnav a").forEach(function (a) {
    a.addEventListener("click", function () { hdr.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; });
  });

  /* split hero title into words */
  var title = document.querySelector("[data-split]");
  if (title) {
    var wi = 0;
    Array.prototype.slice.call(title.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
        var s = document.createElement("span");
        s.className = "w"; s.style.setProperty("--wi", wi++); s.textContent = part;
        frag.appendChild(s);
      });
      title.replaceChild(frag, node);
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { title.classList.add("is-in"); }); });
  }

  /* line-art figures: measure paths for draw-in */
  document.querySelectorAll(".draw path, .draw circle").forEach(function (p) {
    var len = Math.ceil(p.getTotalLength ? p.getTotalLength() : 400);
    if (p.getAttribute("stroke-dasharray")) return; // keep authored dashes
    p.style.setProperty("--len", len);
  });
  document.querySelectorAll(".bars i").forEach(function (b, i) { b.style.setProperty("--bi", i); });

  /* reveals: stagger siblings, fire once */
  var revealables = document.querySelectorAll("[data-reveal], .cl, .scene--compare, .tile");
  var groups = new Map();
  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    var p = el.parentElement; var n = groups.get(p) || 0;
    el.style.setProperty("--rd", (n * 90) + "ms"); groups.set(p, n + 1);
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in"); io.unobserve(e.target);
      if (e.target.querySelectorAll) e.target.querySelectorAll("[data-count]").forEach(countUp);
      if (e.target.matches("[data-count]")) countUp(e.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
  revealables.forEach(function (el) { io.observe(el); });
  document.querySelectorAll(".logos, .voices__foot").forEach(function (el) { io.observe(el); });

  /* count-up numbers */
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    var to = +el.dataset.count; if (reduce) { el.textContent = to.toLocaleString("en-US"); return; }
    var t0 = performance.now(), d = 1400;
    (function tick(t) {
      var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(to * e).toLocaleString("en-US");
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* typewriters (Director panel, brief composer is static, command bar) */
  function typer(el, loop) {
    var text = el.dataset.typer; if (reduce) return;
    var caret = document.createElement("span"); caret.className = "caret";
    var i = 0;
    function step() {
      el.textContent = text.slice(0, i); el.appendChild(caret);
      if (i < text.length) { i++; setTimeout(step, 28 + Math.random() * 40); }
      else if (loop) { setTimeout(function () { i = 0; step(); }, 3200); }
    }
    step();
  }
  var typeIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { typer(e.target, true); typeIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-typer]").forEach(function (el) { typeIO.observe(el); });

  /* live progress: render queue bars creep forward and loop */
  if (!reduce) {
    var bars = document.querySelectorAll(".queue .bar i, .rq .bar i, .tag--prog .bar i");
    setInterval(function () {
      bars.forEach(function (b) {
        var p = parseFloat(getComputedStyle(b).getPropertyValue("--p")) || 0;
        p = p >= 0.98 ? 0.08 : Math.min(0.99, p + 0.01 + Math.random() * 0.025);
        b.style.setProperty("--p", p.toFixed(3));
      });
      var pct = document.querySelector(".take.is-rendering figcaption .mono-dim");
      var first = bars[0]; if (pct && first) pct.textContent = Math.round(parseFloat(first.style.getPropertyValue("--p")) * 100) + "%";
    }, 420);

    /* synced playhead across compare takes */
    var compare = document.querySelector(".scene--compare");
    var ph = 0.24;
    setInterval(function () {
      ph += 0.0035; if (ph > 1) ph = 0;
      if (compare) compare.style.setProperty("--ph", (ph * 100).toFixed(2) + "%");
    }, 40);

    /* approval keys press in turn */
    var keys = document.querySelectorAll(".key"), ki = 0;
    setInterval(function () {
      keys.forEach(function (k) { k.classList.remove("is-press"); });
      if (keys[ki]) keys[ki].classList.add("is-press");
      ki = (ki + 1) % (keys.length + 1);
    }, 900);
  }

  /* spotlight on bento tiles */
  document.querySelectorAll(".tile").forEach(function (t) {
    t.addEventListener("pointermove", function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", (e.clientX - r.left) + "px");
      t.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* statement: wrap words so scroll can light them */
  var stmt = document.querySelector("[data-words]");
  var words = [];
  if (stmt) {
    Array.prototype.slice.call(stmt.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
        var s = document.createElement("span"); s.className = "sw"; s.textContent = part; frag.appendChild(s); words.push(s);
      });
      stmt.replaceChild(frag, node);
    });
  }

  /* GSAP layer (optional) */
  function withGsap() {
    if (!window.gsap || !window.ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    var app = document.querySelector(".app");
    var mobile = window.matchMedia("(max-width: 720px)").matches;
    if (app && !mobile) {
      gsap.fromTo(app, { rotateX: 18, y: 32, scale: 0.95 }, {
        rotateX: 0, y: 0, scale: 1, ease: "none",
        scrollTrigger: { trigger: ".stage", start: "top 92%", end: "top 22%", scrub: 0.6 }
      });
      gsap.fromTo(".stage__glow", { opacity: 0.25, scaleX: 0.7 }, {
        opacity: 0.9, scaleX: 1, ease: "none",
        scrollTrigger: { trigger: ".stage", start: "top 90%", end: "top 20%", scrub: true }
      });
      gsap.to(".director", { y: -36, ease: "none", scrollTrigger: { trigger: ".stage", start: "top 60%", end: "bottom top", scrub: true } });
    }
    gsap.to(".hero__aura", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    if (words.length) {
      gsap.set(words, { color: "var(--c-text-muted)" });
      gsap.to(words, {
        color: "var(--c-text)", stagger: 0.08, ease: "none",
        scrollTrigger: { trigger: stmt, start: "top 78%", end: "bottom 45%", scrub: 0.4 }
      });
    }
    gsap.utils.toArray(".scene").forEach(function (s) {
      gsap.fromTo(s.parentElement, { y: 48 }, { y: -16, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: true } });
    });
    gsap.fromTo(".cta__glow", { scale: 0.6, opacity: 0.3 }, { scale: 1.1, opacity: 1, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "center center", scrub: true } });
  }
  if (document.readyState === "complete") withGsap(); else window.addEventListener("load", withGsap);
})();
