/* Kuroyu 黒湯. One night at the counter, told by the clock.
   Scroll drives everything: three AI clips drawn to canvases as image sequences,
   a 24-hour clock that holds on each label's time and rolls between them,
   labels that land on the frame their part lands.
   Timings are in "v" units (1 v = 1% of the viewport height of scroll) inside each act.
   Each act after the first cross-fades in over the last 60 v of the act before it. */
(() => {
  'use strict';
  const html = document.documentElement;
  if (!html.classList.contains('motion')) return;
  if (!window.gsap || !window.ScrollTrigger) { html.classList.replace('motion', 'rm'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const REC = /[?&]rec\b/.test(location.search);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (v, a, b) => clamp((v - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const eo = (k) => 1 - Math.pow(1 - k, 3);
  const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const pw = (keys, x) => {
    if (x <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [x1, y1] = keys[i];
      if (x <= x1) { const [x0, y0] = keys[i - 1]; return y0 + (y1 - y0) * ((x - x0) / (x1 - x0 || 1)); }
    }
    return keys[keys.length - 1][1];
  };
  const isMob = () => innerWidth <= 760;
  let MOB = isMob();
  const BGS = '#0a0807';
  const BGA = (a) => `rgba(10,8,7,${a})`;
  const XFADE = 60;   // v: how long each incoming act takes to cross-fade in

  // Show an element with a 0..1 amount. Writes only when the value changes.
  function show(el, k, dy = 0, base = '', scale = 0) {
    k = clamp(k);
    const key = k.toFixed(3);
    if (el._k === key) return;
    el._k = key;
    el.style.opacity = key;
    el.style.visibility = k <= 0.001 ? 'hidden' : 'visible';
    if (dy || scale || base) {
      const ty = (1 - eo(k)) * dy;
      const sc = scale ? ` scale(${(1 + (1 - eo(k)) * scale).toFixed(4)})` : '';
      el.style.transform = `${base} translate3d(0,${ty.toFixed(2)}px,0)${sc}`;
    }
  }
  const fadeStage = (stage, k) => { const s = k.toFixed(3); if (stage._o !== s) { stage.style.opacity = s; stage._o = s; } };

  /* ---------------- the narrator: a 24-hour clock ---------------- */
  const clockEl = $('.clock'), clockT = $('.clock__t'), clockC = $('.clock__c');
  let cT = '', cC = '', cHide = null;
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (m) => { m = ((Math.floor(m + 1e-6) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  function setClock(m, cap) {
    const s = fmt(m);
    if (s !== cT) { clockT.textContent = s; cT = s; }
    if (cap !== cC) { clockC.textContent = cap; cC = cap; }
  }
  function hideClock(h) { if (h !== cHide) { clockEl.style.opacity = h ? '0' : '1'; cHide = h; } }

  /* ---------------- frame sequences ---------------- */
  // Source frames are 1912x1080. Phone sets are square crops.
  const CROPS = {
    'build-d': { x: 0, y: 0, w: 1912, h: 1080 }, 'build-m': { x: 402, y: 0, w: 1080, h: 1080 },
    'lift-d': { x: 0, y: 0, w: 1912, h: 1080 }, 'lift-m': { x: 310, y: 0, w: 1080, h: 1080 },
    'broth-d': { x: 0, y: 0, w: 1912, h: 1080 }, 'broth-m': { x: 420, y: 0, w: 1080, h: 1080 },
  };
  const films = [];
  class Seq {
    constructor(name, n) {
      this.name = name; this.n = n; this.set = `${name}-${MOB ? 'm' : 'd'}`; this.crop = CROPS[this.set];
      this.imgs = new Array(n); this.ok = new Uint8Array(n); this.req = new Uint8Array(n);
    }
    url(i) { return `assets/frames/${this.set}/${String(i).padStart(3, '0')}.webp`; }
    stride(st) { const o = []; for (let i = 0; i < this.n; i += st) o.push(i); if (st > 1) o.push(this.n - 1); return o; }
    get(i) {
      if (this.ok[i]) return this.imgs[i];
      for (let d = 1; d < this.n; d++) {
        if (i - d >= 0 && this.ok[i - d]) return this.imgs[i - d];
        if (i + d < this.n && this.ok[i + d]) return this.imgs[i + d];
      }
      return null;
    }
  }
  const build = new Seq('build', 241), lift = new Seq('lift', 241), broth = new Seq('broth', 121);
  const queue = []; let inflight = 0; const MAX = 6;
  function pump() {
    while (inflight < MAX && queue.length) {
      const [s, i] = queue.shift();
      if (s.ok[i] || s.req[i]) continue;
      s.req[i] = 1; inflight++;
      const img = new Image();
      img.decoding = 'async';
      img.src = s.url(i);
      const done = (good) => { if (good) { s.imgs[i] = img; s.ok[i] = 1; films.forEach((f) => { if (f.uses.includes(s)) f.need = true; }); } inflight--; pump(); };
      img.decode().then(() => done(true), () => done(img.complete && img.naturalWidth > 0));
    }
  }
  function want(s, i) { if (!s.ok[i] && !s.req[i]) { queue.unshift([s, i]); pump(); } }
  [[build, 24], [build, 8], [lift, 24], [build, 4], [lift, 8], [broth, 8], [build, 2], [build, 1], [lift, 4], [broth, 2], [lift, 2], [lift, 1], [broth, 1]]
    .forEach(([s, st]) => s.stride(st).forEach((i) => queue.push([s, i])));
  queue.unshift([build, 35]);   // the cold open frame
  pump();

  /* ---------------- canvas film renderer ---------------- */
  // A layer is { seq, i, f, a }. f is a framing: source point (fx, fy) placed at screen (ax, ay), s screen px per source px.
  // soft 0..1 widens the edge feathers and the vignette so the clip's rectangle never shows.
  const sx = (f, x) => f.ax + (x - f.fx) * f.s;
  const sy = (f, y) => f.ay + (y - f.fy) * f.s;
  const zoom = (f, z) => ({ ...f, s: f.s * z });
  class Film {
    constructor(canvas, uses) {
      this.cv = canvas; this.ctx = canvas.getContext('2d', { alpha: false }); this.uses = uses;
      this.W = 0; this.H = 0; this.DPR = 1; this.need = true; this.key = '';
      films.push(this);
    }
    size() {
      const st = this.cv.parentElement;
      this.W = st.clientWidth; this.H = st.clientHeight;
      this.DPR = Math.min(window.devicePixelRatio || 1, MOB ? 2 : 1.5);
      this.cv.width = Math.round(this.W * this.DPR); this.cv.height = Math.round(this.H * this.DPR);
      this.need = true; this.key = '';
    }
    draw(layers, opt, key) {
      if (!this.need && key === this.key) return;
      this.need = false; this.key = key;
      const { ctx, W, H, DPR } = this;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      ctx.fillStyle = BGS; ctx.fillRect(0, 0, W, H);
      layers.forEach((L, n) => {
        if (!L || L.a <= 0) return;
        const img = L.seq.get(L.i);
        if (!img) return;
        const c = L.seq.crop, f = L.f;
        const dw = c.w * f.s, dh = c.h * f.s, dx = f.ax + (c.x - f.fx) * f.s, dy = f.ay + (c.y - f.fy) * f.s;
        // 'lighten' over the page colour lifts the clip's pure black to the page black: no box.
        ctx.globalCompositeOperation = n === 0 ? 'lighten' : 'source-over';
        ctx.globalAlpha = L.a;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.globalCompositeOperation = 'source-over';
        this.feather({ dx, dy, dw, dh }, f, L.soft == null ? 1 : L.soft, L.vig || [942, 600], L.a);
      });
      ctx.globalAlpha = 1;
      if (opt.scrim > 0) {
        const g = ctx.createLinearGradient(0, 0, MOB ? 0 : W * 0.55, MOB ? H : 0);
        if (MOB) { g.addColorStop(0, BGA(0.7 * opt.scrim)); g.addColorStop(0.2, BGA(0)); g.addColorStop(0.7, BGA(0)); g.addColorStop(1, BGA(0.85 * opt.scrim)); }
        else { g.addColorStop(0, BGA(0.88 * opt.scrim)); g.addColorStop(0.55, BGA(0.5 * opt.scrim)); g.addColorStop(1, BGA(0)); }
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
    }
    feather(r, f, soft, vig, a) {
      const { ctx, W, H } = this;
      ctx.globalAlpha = a;
      const fl = r.dw * lerp(0.16, 0.30, soft), fr = r.dw * lerp(0.10, 0.22, soft), ft = r.dh * lerp(0.12, 0.32, soft), fb = r.dh * lerp(0.16, 0.30, soft);
      const band = (x0, y0, x1, y1, rx, ry, rw, rh) => {
        const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, BGA(1)); g.addColorStop(1, BGA(0));
        ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh);
      };
      ctx.fillStyle = BGS;
      if (r.dx > 0) ctx.fillRect(0, 0, r.dx, H);
      if (r.dx + r.dw < W) ctx.fillRect(r.dx + r.dw, 0, W - r.dx - r.dw, H);
      if (r.dy > 0) ctx.fillRect(0, 0, W, r.dy);
      if (r.dy + r.dh < H) ctx.fillRect(0, r.dy + r.dh, W, H - r.dy - r.dh);
      // feather only the edges that are actually on screen
      if (r.dx > -0.02 * W) band(r.dx, 0, r.dx + fl, 0, r.dx, 0, fl, H);
      if (r.dx + r.dw < W * 1.02) band(r.dx + r.dw, 0, r.dx + r.dw - fr, 0, r.dx + r.dw - fr, 0, fr, H);
      if (r.dy > -0.02 * H) band(0, r.dy, 0, r.dy + ft, 0, r.dy, W, ft);
      if (r.dy + r.dh < H * 1.02) band(0, r.dy + r.dh, 0, r.dy + r.dh - fb, 0, r.dy + r.dh - fb, W, fb);
      if (soft > 0) {
        const cx = sx(f, vig[0]), cy = sy(f, vig[1]);
        const g = ctx.createRadialGradient(cx, cy, 1912 * f.s * 0.20, cx, cy, 1912 * f.s * 0.80);
        g.addColorStop(0, BGA(0)); g.addColorStop(0.6, BGA(0.55 * soft)); g.addColorStop(1, BGA(soft));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ---------------- act 1: one bowl, 08:00 to 23:42 and back ---------------- */
  const A1 = $('#bowl'), stage1 = $('.stage', A1);
  const film1 = new Film($('.film', A1), [build, lift]);
  const glow = $('.glow', A1), steam = $('.steam', A1), svg = $('.leaders', A1), logEl = $('.log', A1), nowEl = $('.now', A1);
  const intro = $('.copy--intro', A1), sub = $('.sub', A1), cue = $('.cue', A1), markEl = $('.copy--mark', A1);
  const liftWord = $('.lift__word', A1), liftA = $('.lift__a', A1);
  const rewEl = $('.copy--rewind', A1), rewT = $('.rewind__t', A1);
  const SVGNS = 'http://www.w3.org/2000/svg';
  const items = $$('.log__i', A1).map((el, i) => {
    el.style.setProperty('--i', i);
    const part = el.dataset.part ? el.dataset.part.split(',').map(Number) : null;
    const it = { el, at: parseFloat(el.dataset.at), part, time: $('time', el).textContent, text: $('span', el).textContent, span: $('span', el) };
    if (part) {
      it.path = document.createElementNS(SVGNS, 'path'); it.path.setAttribute('pathLength', '1');
      it.ring = document.createElementNS(SVGNS, 'circle'); it.ring.setAttribute('r', '5'); it.ring.setAttribute('class', 'ring');
      it.dot = document.createElementNS(SVGNS, 'circle'); it.dot.setAttribute('r', '3.2');
      svg.append(it.path, it.ring, it.dot);
    }
    return it;
  });

  // Clip time (s) at each scroll v. Starts at 1.45 s: the empty bowl with the stream about to enter.
  const BUILD_T = [[0, 1.45], [150, 3.3], [200, 4.05], [262, 5.05], [312, 5.7], [368, 6.55], [430, 7.8], [460, 8.2]];
  // The clock holds on each label's time, then rolls to the next just before that part lands.
  const CLOCK_T = [[0, 480], [1.75, 480], [2.95, 480], [3.25, 840], [3.75, 840], [4.0, 1290], [4.7, 1290], [5.0, 1418], [6.2, 1418], [6.5, 1419], [7.5, 1419], [7.75, 1420]];
  // Act 1 marks (v): build done, served hold, crossfade into the lift clip, the lift clip's own hard cut (frame 103),
  // lift done, crossfade back to the finished bowl, bowl un-built (frame 37), end (act 2 fades in over the last 60).
  const T1 = { build: 460, served: 540, xfade: 568, cut: 740, lift: 1010, back: 1050, rewound: 1165, end: 1250 };
  const REW_FRAME = 37;

  function framing(kind, W, H) {
    if (!MOB) {
      // tall desktop windows (e.g. 900x1600 for vertical video): bigger bowl, centred under the headline
      if (kind === 'build' && H > W * 1.3) return { fx: 942, fy: 575, s: W * 0.52 / 885, ax: W * 0.47, ay: H * 0.55 };
      if (kind === 'build') return { fx: 942, fy: 575, s: Math.min(H * 0.94 / 1080, W * 0.40 / 885), ax: W * 0.585, ay: H * 0.53 };
      return { fx: 770, fy: 520, s: Math.max(H / 1080, W * 0.8 / 1912) * 1.04, ax: W * 0.64, ay: H * 0.5 };
    }
    if (kind === 'build') return { fx: 942, fy: 590, s: W * 1.16 / 1080, ax: W * 0.5, ay: H * 0.52 };   // whole rim, ~10px air each side
    const f = { fx: 775, fy: 470, s: W * 1.5 / 1080, ax: W * 0.5, ay: H * 0.5 };
    const dy = f.ay - f.fy * f.s;            // drawn top of the source frame
    if (dy > -0.04 * H) f.ay -= dy + 0.04 * H; // never let the source top show inside the viewport
    return f;
  }

  function sizeFilm1() {
    film1.size();
    svg.setAttribute('viewBox', `0 0 ${film1.W} ${film1.H}`);
    items.forEach((it) => {
      const fs = parseFloat(getComputedStyle(it.span).fontSize) || 24;
      it.lx = logEl.offsetLeft + it.el.offsetLeft + it.span.offsetLeft - 14;
      it.ly = logEl.offsetTop + it.el.offsetTop + it.span.offsetTop + fs * 0.6;
    });
  }

  let lastActive = -2;
  function act1(v, active) {
    const W = film1.W, H = film1.H, fb = framing('build', W, H), fc = framing('close', W, H);
    const zBuild = v < T1.build ? lerp(0.955, 1.0, eio(seg(v, 0, T1.build))) : lerp(1.0, 1.10, eio(seg(v, T1.build, T1.served)));
    let layers, t = 10.04, scrim = 0, f = zoom(fb, zBuild);
    if (v < T1.served) {
      t = v < T1.build ? pw(BUILD_T, v) : lerp(8.2, 10.04, seg(v, T1.build, T1.served));
      layers = [{ seq: build, i: Math.min(240, Math.round(t * 24)), f, a: 1 }];
    } else if (v < T1.xfade) {
      layers = [{ seq: build, i: 240, f, a: 1 }, { seq: lift, i: 0, f, a: seg(v, T1.served, T1.xfade) }];
    } else if (v < T1.cut) {
      f = zoom(fb, lerp(1.10, 1.24, eio(seg(v, T1.xfade, T1.cut))));
      layers = [{ seq: lift, i: Math.round(pw([[T1.xfade, 0], [T1.cut, 102]], v)), f, a: 1 }];
    } else if (v < T1.lift) {
      f = zoom(fc, lerp(1.0, 1.05, seg(v, T1.cut, T1.lift)));
      layers = [{ seq: lift, i: Math.min(240, 103 + Math.round(seg(v, T1.cut, T1.lift - 10) * 137)), f, a: 1, soft: 0.25, vig: [780, 560] }];
      scrim = 1;
    } else if (v < T1.back) {
      // dip through black: the lift goes out, then the finished bowl comes up. Never both at once.
      const k = seg(v, T1.lift, T1.back);
      f = zoom(fb, 1.06);
      layers = k < 0.5
        ? [{ seq: lift, i: 240, f: zoom(fc, 1.05), a: 1 - k * 2, soft: 0.25, vig: [780, 560] }]
        : [{ seq: build, i: 240, f, a: k * 2 - 1 }];
      scrim = 0;
    } else {
      const k = eio(seg(v, T1.back, T1.rewound));
      f = zoom(fb, lerp(1.06, 0.955, k));
      layers = [{ seq: build, i: Math.round(lerp(240, REW_FRAME, k)), f, a: 1 }];
    }
    layers.forEach((L) => want(L.seq, L.i));
    const key = layers.map((L) => `${L.seq.name}${L.i}:${L.a.toFixed(3)}:${L.f.s.toFixed(5)}:${L.f.ax.toFixed(1)}:${L.f.ay.toFixed(1)}`).join('|') + `|${scrim.toFixed(3)}|${W}x${H}`;
    film1.draw(layers, { scrim }, key);

    // labels: the one whose part has landed, by clip time
    let ai = -1;
    if (v < T1.served) items.forEach((it, n) => { if (t >= it.at) ai = n; });
    if (ai !== lastActive) {
      items.forEach((it, n) => {
        it.el.classList.toggle('on', n === ai);
        it.el.classList.toggle('prev', ai > 0 && n < ai && n >= ai - 2);
        if (it.path) {
          it.path.classList.toggle('on', n === ai);
          it.path.classList.toggle('old', n !== ai && n < ai);
          it.dot.classList.toggle('on', n === ai); it.ring.classList.toggle('on', n === ai);
        }
      });
      if (ai >= 0) {
        $('time', nowEl).textContent = items[ai].time; $('span', nowEl).textContent = items[ai].text;
        nowEl.classList.remove('swap'); void nowEl.offsetWidth; nowEl.classList.add('swap');
      }
      lastActive = ai;
    }
    const labelsOut = 1 - seg(v, 458, 490);
    show(nowEl, ai >= 0 ? labelsOut : 0);
    show(logEl, labelsOut);
    svg.style.opacity = labelsOut.toFixed(3);
    if (ai >= 0 && items[ai].path) {
      const it = items[ai], px = sx(f, it.part[0]), py = sy(f, it.part[1]);
      if (!MOB) it.path.setAttribute('d', `M${px.toFixed(1)} ${py.toFixed(1)} L${(it.lx - 46).toFixed(1)} ${it.ly.toFixed(1)} L${it.lx.toFixed(1)} ${it.ly.toFixed(1)}`);
      it.dot.setAttribute('cx', px.toFixed(1)); it.dot.setAttribute('cy', py.toFixed(1));
      it.ring.setAttribute('cx', px.toFixed(1)); it.ring.setAttribute('cy', py.toFixed(1));
    }
    if (MOB) nowEl.style.setProperty('--now-y', `${Math.round(sy(f, 935) + 14)}px`);

    // steam blooms when it's served and thins as the chopsticks go in
    const so = seg(v, 360, 480) * (1 - seg(v, T1.xfade + 40, T1.xfade + 140)) * 0.6;
    steam.style.setProperty('--so', so.toFixed(3));
    if (so > 0) {
      const w = 760 * f.s, h = 620 * f.s;
      steam.style.setProperty('--sw', `${w.toFixed(0)}px`); steam.style.setProperty('--sh', `${h.toFixed(0)}px`);
      steam.style.setProperty('--sx', `${sx(f, 560).toFixed(0)}px`); steam.style.setProperty('--sy', `${(sy(f, 470) - h).toFixed(0)}px`);
    }
    // the bowl catches the light when it's served
    const gl = seg(v, 420, 465) * (1 - seg(v, T1.served, T1.xfade + 30));
    glow.style.opacity = gl.toFixed(3);
    if (gl > 0) glow.style.transform = `translate3d(${sx(f, 942).toFixed(0)}px,${sy(f, 560).toFixed(0)}px,0) translate(-50%,-50%) scale(${f.s.toFixed(3)})`;

    // words
    show(cue, 1 - seg(v, 2, 14));
    show(sub, seg(v, 140, 175), 14);
    show(intro, 1 - seg(v, 432, 468), 0);
    show(markEl, seg(v, 466, 502) * (1 - seg(v, T1.served + 8, T1.xfade + 10)), 26, MOB || H > W * 1.3 ? '' : 'translateY(-50%)');
    const liftOut = 1 - seg(v, T1.lift - 20, T1.lift + 10);
    show(liftWord, seg(v, T1.cut, T1.cut + 12) * liftOut, 0, '', 0.06);   // "Lift." lands on the clip's cut
    show(liftA, seg(v, T1.cut + 58, T1.cut + 94) * liftOut, 16);

    // the rewind: the bowl un-builds while the clock spins back to 08:00
    const rk = eio(seg(v, T1.back, T1.rewound));
    const rm = v < T1.served ? pw(CLOCK_T, t) : v < T1.back ? pw([[T1.served, 1420], [T1.xfade, 1421], [T1.lift - 80, 1422]], v) : lerp(1422, 480, rk);
    const rewShow = seg(v, T1.back - 10, T1.back + 14) * (1 - seg(v, T1.rewound + 2, T1.end - XFADE - 2));
    show(rewEl, rewShow, 0, MOB ? '' : 'translateY(-50%)');
    if (rewShow > 0) { const s = fmt(rm); if (rewT.textContent !== s) rewT.textContent = s; }
    if (active) {
      hideClock(rewShow > 0.2);
      setClock(rm, v < 428 ? 'Eighteen hours' : v < T1.xfade - 15 ? 'Served' : v < T1.lift ? 'First lift' : 'Back to the morning');
    }
  }

  /* ---------------- act 2: why it's white ---------------- */
  // The boil keeps boiling: the clip plays on its own (seamless crossfade loop) and scroll pushes it forward.
  const A2 = $('#broth'), stage2 = $('.stage', A2);
  const film2 = new Film($('.film', A2), [broth]);
  const brothH = $('.h2', A2), brothL = $$('.broth__l', A2);
  const LOOP_X = 16, LOOP_L = 121 - LOOP_X;
  let t0 = performance.now();
  function act2(v, active) {
    fadeStage(stage2, seg(v, 0, XFADE) * (1 - seg(v, 300 - XFADE, 300 - XFADE * 0.5)));
    const W = film2.W, H = film2.H;
    const z = lerp(1.14, 1.0, eo(seg(v, 0, 300)));
    const f = MOB
      ? { fx: 960, fy: 560, s: W * 1.2 / 1080 * z, ax: W * 0.5, ay: H * 0.33 }
      : { fx: 980, fy: 600, s: Math.max(H / 1080, W * 0.72 / 1912) * 1.04 * z, ax: W * 0.64, ay: H * 0.5 };
    const p = (((performance.now() - t0) / 1000) * 24 + v * 0.5) % LOOP_L;
    const pi = Math.floor(p);
    const layers = pi < LOOP_X
      ? [{ seq: broth, i: pi + LOOP_L, f, a: 1, vig: [980, 600] }, { seq: broth, i: pi, f, a: (p / LOOP_X), vig: [980, 600] }]
      : [{ seq: broth, i: pi, f, a: 1, vig: [980, 600] }];
    layers.forEach((L) => want(L.seq, L.i));
    const key = layers.map((L) => `${L.i}:${L.a.toFixed(2)}`).join('|') + `|${f.s.toFixed(5)}|${W}x${H}`;
    film2.draw(layers, { scrim: MOB ? 0 : 1 }, key);
    const out = 1 - seg(v, 205, 232);   // clear the words before the regulars cross-fade in
    show(brothH, seg(v, 40, 80) * out, 22);
    show(brothL[0], seg(v, 90, 125) * out, 16);
    show(brothL[1], seg(v, 160, 195) * out, 16);
    if (active) setClock(pw([[0, 480], [150, 480], [178, 840]], v), 'The broth');
  }

  /* ---------------- act 3: the regulars ---------------- */
  const A3 = $('#menu'), stage3 = $('.stage', A3), track = $('.track', A3), bowls = $$('.bowl', A3);
  let maxX = 0, centers = [], clockKeys = [[0, 1425]], M = { fade: 0, roll: 0, travel: 0, span: 1 };
  function sizeMenu() {
    track.style.transform = 'none';
    const vh = innerHeight;
    const lastTxt = bowls[bowls.length - 1].querySelector('.bowl__txt');
    const gut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gut')) || 20;
    maxX = Math.max(0, lastTxt.getBoundingClientRect().right - innerWidth + gut * 2);
    // px of scroll: cross-fade in, finish rolling the clock on the title, travel, short hold, next act cross-fades in
    M = { fade: vh * 0.6, roll: vh * 0.35, travel: maxX, hold: vh * 0.2, out: vh * 0.6 };
    M.span = M.roll + M.travel + M.hold + M.out;
    A3.style.height = `${Math.round(M.span + vh)}px`;
    centers = bowls.map((b) => b.offsetLeft + b.offsetWidth / 2);
    const c0 = innerWidth / 2;
    clockKeys = [[c0, 1425], ...bowls.map((b, i) => [Math.max(c0 + 1 + i, Math.min(centers[i], maxX + c0)), parseFloat(b.dataset.min)])];
  }
  let lastBowl = -2;
  function act3(p, active) {
    const ly = p * M.span;
    fadeStage(stage3, seg(ly, M.fade * 0.5, M.fade) * (1 - seg(ly, M.span - M.out, M.span - M.out * 0.5)));
    const x = seg(ly, 0, M.roll + M.travel) * maxX;
    track.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
    const c = x + innerWidth / 2;
    let near = -1, best = innerWidth * 0.32;
    bowls.forEach((b, i) => {
      const d = centers[i] - c;
      if (Math.abs(d) < best) { best = Math.abs(d); near = i; }
      const img = b._img || (b._img = $('img', b));
      img.style.transform = `translate3d(${(-d * 0.05).toFixed(1)}px,0,0) scale(1.08)`;
    });
    if (near !== lastBowl) { bowls.forEach((b, i) => b.classList.toggle('dim', near >= 0 && i !== near)); lastBowl = near; }
    if (active) {
      const m = ly < M.roll ? lerp(840, 1425, eio(seg(ly, 0, M.roll))) : pw(clockKeys, c);
      setClock(m, c > centers[0] - innerWidth * 0.25 && ly >= M.roll ? 'The regulars' : 'Back to the counter');
    }
  }

  /* ---------------- act 4: last bowl ---------------- */
  const A4 = $('#last'), stage4 = $('.stage', A4), lastImg = $('.last__img img', A4), lastH = $$('.h2 .ln > span', A4), facts = $$('.facts > div', A4);
  const night = document.createElement('div'); night.className = 'last__night'; stage4.append(night);
  function act4(v, active) {
    fadeStage(stage4, seg(v, XFADE * 0.5, XFADE) * (1 - seg(v, 300 - XFADE, 300 - XFADE * 0.5)));
    lastImg.style.transform = `scale(${lerp(1.16, 1.0, eo(seg(v, 0, 300))).toFixed(4)})`;
    lastH.forEach((s, i) => { const k = eo(seg(v, 50 + i * 14, 94 + i * 14)); s.style.transform = `translate3d(0,${((1 - k) * 105).toFixed(1)}%,0)`; });
    facts.forEach((el, i) => show(el, seg(v, 100 + i * 16, 134 + i * 16), 14));
    night.style.opacity = (seg(v, 175, 225) * 0.7).toFixed(3);   // the lights go down as the clock reaches two
    if (active) setClock(pw([[40, 1540], [215, 1560]], v), v >= 215 ? 'Lights off' : 'Last bowl');
  }

  /* ---------------- act 5: close ---------------- */
  const A5 = $('#close'), stage5 = $('.stage', A5), closeH = $('.close__h', A5), btn = $('.btn', A5);
  let booked = false;
  function act5(v, active) {
    fadeStage(stage5, seg(v, XFADE * 0.5, XFADE));
    show(closeH, seg(v, 50, 85), 24);
    show(btn, seg(v, 66, 100), 18);
    if (active) setClock(booked ? 2520 : pw([[30, 1560], [130, 2520]], v), 'Doors at six');
  }
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (booked) return;
    booked = true;
    btn.textContent = 'See you at six. (Concept, no bookings.)';
    btn.classList.add('done');
    setClock(2520, 'Doors at six');
  });

  /* ---------------- wiring ---------------- */
  const acts = [
    { el: A1, d: T1.end, fn: act1, v: true },
    { el: A2, d: 300, fn: act2, v: true, live: true },
    { el: A3, fn: act3, v: false },
    { el: A4, d: 300, fn: act4, v: true },
    { el: A5, d: 160, fn: act5, v: true },
  ];
  acts.forEach((a) => {
    if (a.d) a.el.style.setProperty('--d', a.d);
    a.st = ScrollTrigger.create({ trigger: a.el, start: 'top top', end: 'bottom bottom' });
    a.last = null;
  });
  function sizeAll() { sizeFilm1(); film2.size(); acts.forEach((a) => (a.last = null)); }
  ScrollTrigger.addEventListener('refreshInit', () => { MOB = isMob(); sizeMenu(); });
  ScrollTrigger.addEventListener('refresh', sizeAll);
  new ResizeObserver(() => { if (stage1.clientHeight !== film1.H || stage1.clientWidth !== film1.W) sizeAll(); }).observe(stage1);

  let lenis = null;
  if (!REC && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a === btn) return;
    const id = a.getAttribute('href');
    const t = id.length > 1 && document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    // land where the close has fully faded in
    const y = id === '#close' ? acts[4].st.start + innerHeight * 1.45 : t.getBoundingClientRect().top + scrollY;
    if (lenis) lenis.scrollTo(y, { duration: 2.2 }); else scrollTo(0, y);
  });

  let prevActive = -1;
  function tick() {
    const y = window.scrollY, vh = innerHeight;
    let activeIdx = 0;
    acts.forEach((a, i) => { if (y >= a.st.start - 2) activeIdx = i; });
    if (activeIdx !== prevActive) { acts[activeIdx].last = null; prevActive = activeIdx; }
    acts.forEach((a, i) => {
      const span = Math.max(1, a.st.end - a.st.start);
      const p = clamp((y - a.st.start) / span);
      const isActive = i === activeIdx;
      const near = y > a.st.start - vh * 1.2 && y < a.st.end + vh * 1.2;
      if (!near) { a.last = null; return; }
      const key = `${p.toFixed(5)}|${isActive}`;
      const film = i === 0 ? film1 : null;
      if (key === a.last && !a.live && !(film && film.need)) return;
      a.last = key;
      a.fn(a.v ? p * a.d : p, isActive);
    });
    if (activeIdx !== 0) hideClock(false);
  }
  sizeFilm1();
  film2.size();
  sizeMenu();
  ScrollTrigger.refresh();
  gsap.ticker.add(tick);
  tick();
  window.__kuroyu = { acts, film1, film2, build, lift, broth, lenis, T1, M: () => M };
})();
