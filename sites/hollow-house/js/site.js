/* The Hollow House · Case No. 1926-1031
   One pinned film (approach + hallway) drawn to a canvas from WebP frames by scroll,
   the scare at the end of the hall, and the torch in the evidence rooms.

   Every beat lives in TIMELINE below. Film time T is in seconds of footage:
   approach 0 to 10, hallway 10.04 on. She lands at 19.2, the face holds to 21.4, black to 24. */
(() => {
  'use strict';

  const root = document.documentElement;
  const MOTION = root.classList.contains('motion');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };

  // ---------------------------------------------------------------- timeline
  const TIMELINE = {
    fps: 24,
    clipFrames: 241,                 // approach frames 000..240; the hallway follows from G 241
    lastFrame: 461,                  // hallway 220: the last frame before the cut to her face
    trigger: 18.29,                  // hallway 8.25 s: she starts to run. The lunge plays itself from here.
    land: 19.2,                      // G 461: she hits the lens
    faceEnd: 21.4,                   // hard cut to black
    end: 24,
    // [scroll units (vh), film time T]. Slow where a line is read or the door opens, fast where she moves.
    keys: [
      [0, 0], [80, 0.7], [170, 1.28], [260, 1.88], [330, 2.7], [350, 2.9], [450, 3.7], [500, 4.4], [550, 5.5],
      [620, 7.6], [690, 10.0], [790, 13.4], [890, 16.25], [970, 17.7], [1015, 18.29], [1030, 19.2],
      [1070, 21.4], [1073, 21.6], [1130, 24],
    ],
    // candles going out, one at a time: [from T, ellipse width %, height %]. The dark closes from the edges onto her.
    dark: [[14.2, 95, 90], [14.7, 80, 82], [15.2, 66, 70], [15.7, 54, 60], [16.2, 46, 54]],
    subliminalStep: 3,               // the step that carries her face for two film frames
    // the constable's clock between labelled cues: [T, minutes past 11]
    clock: [[0, 40], [1.9, 41], [5.9, 47], [10, 50], [10.7, 52], [14, 56], [16.45, 58], [18.29, 59]],
    lungeMs: 680,
    lungePow: 1.7,                   // she visibly accelerates; no stall, no pop
    cutOnRunMs: 120,                 // the last typed line goes when she starts to run
    lungeNeed: [438, 461],           // frames that must be loaded before she runs
    lungeWaitMs: 1500,
    impact: { red: 83, black: 42 },  // ms: two film frames of red, one of black, then the face
    shake: { steps: 10, stepMs: 32, px: 40, scale: 0.12, blurSteps: 2 },
    face: { from: 1.12, to: 1.28, toPortrait: 1.16, jitterMs: 300 },
    unlockMs: 350,                   // scroll comes back this long after the face
  };
  const TRAVEL = TIMELINE.keys[TIMELINE.keys.length - 1][0];
  const LAST_FRAME = TIMELINE.lastFrame;

  // ---------------------------------------------------------------- textures
  function texture(size, paint) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    paint(c.getContext('2d'), size);
    return `url(${c.toDataURL('image/png')})`;
  }
  root.style.setProperty('--grain', texture(160, (x, s) => {
    const d = x.createImageData(s, s);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0);
  }));
  root.style.setProperty('--wear', texture(160, (x, s) => {
    x.fillStyle = '#000'; x.fillRect(0, 0, s, s);
    x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 260; i++) {
      x.globalAlpha = 0.35 + Math.random() * 0.65;
      x.beginPath(); x.arc(Math.random() * s, Math.random() * s, 0.4 + Math.random() * 2.2, 0, 7); x.fill();
    }
  }));

  // ---------------------------------------------------------------- close button
  const btn = $('.close .btn');
  if (btn) btn.addEventListener('click', () => { $('#cl-note').textContent = 'No tickets yet. The Hollow House is a concept.'; });

  if (!MOTION) return; // still mode: the document is already complete

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // ---------------------------------------------------------------- elements
  const film = $('.film');
  const stage = $('.film__stage');
  const shake = $('.film__shake');
  const canvas = $('.film__canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const poster = $('.film__poster');
  const darkEl = $('.film__dark');
  const face = $('.film__face');
  const flash = $('.film__flash');
  const black = $('.film__black');
  const walk = $('.walk');
  const hud = $('.hud');
  const hudT = $('.hud__t');
  const hudLoad = $('.hud__load');
  const hudPct = $('.hud__load b');
  film.style.setProperty('--film-len', TRAVEL + 40);

  // typewriter lines: one span per character, a hidden full copy for screen readers
  function splitType(el) {
    const text = el.textContent;
    el.textContent = '';
    const sr = document.createElement('span');
    sr.textContent = text;
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    for (const ch of text) { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; vis.appendChild(c); }
    el._chars = [...vis.children];
    el._caret = document.createElement('span');
    el._caret.className = 'caret';
    vis.prepend(el._caret);
    el.append(sr, vis);
    el._shown = 0;
  }
  function setTyped(el, n) {
    if (n === el._shown) return;
    const lo = Math.min(n, el._shown), hi = Math.max(n, el._shown);
    for (let i = lo; i < hi; i++) el._chars[i].classList.toggle('on', i < n);
    el._shown = n;
    if (n > 0) el._chars[n - 1].after(el._caret); else el._chars[0].before(el._caret);
    el.classList.toggle('typing', n > 0 && n < el._chars.length);
  }
  function typeOut(el, msPerChar = 42) {      // time-based typing, for things the reader triggers
    let n = 0;
    const id = setInterval(() => { setTyped(el, ++n); if (n >= el._chars.length) clearInterval(id); }, msPerChar);
  }
  $$('.tw').forEach(splitType);

  const cues = $$('.cue').map((el) => ({
    el,
    in: parseFloat(el.dataset.in),
    out: el.dataset.out ? parseFloat(el.dataset.out) : Infinity,
    type: el.dataset.type ? parseFloat(el.dataset.type) : 0,
    clock: el.dataset.clock ? parseInt(el.dataset.clock, 10) : null,
    cutOnRun: 'cutOnRun' in el.dataset,
    tw: el.classList.contains('cue--sub') ? null : $(':scope > .tw, :scope .note .tw', el) || $(':scope .tw', el),
    o: -1,
  }));

  // ---------------------------------------------------------------- frames
  const portraitMQ = matchMedia('(max-aspect-ratio: 1/1)');
  let set = portraitMQ.matches ? 'm' : 'd';
  let frames = [];
  let loaded = 0;
  let loadGen = 0;
  const pad = (n) => String(n).padStart(3, '0');
  const srcOf = (G) => `assets/frames/${set}/${G < TIMELINE.clipFrames ? 'a' : 'h'}/${pad(G < TIMELINE.clipFrames ? G : G - TIMELINE.clipFrames)}.webp`;

  function startLoading() {
    const gen = ++loadGen;
    frames = new Array(LAST_FRAME + 1);
    loaded = 0;
    const queued = new Uint8Array(LAST_FRAME + 1);
    const order = [];
    const add = (G) => { if (G >= 0 && G <= LAST_FRAME && !queued[G]) { queued[G] = 1; order.push(G); } };
    for (let G = 0; G <= 24; G++) add(G);                         // 1. the opening and its idle loop
    for (let G = 420; G <= LAST_FRAME; G++) add(G);               // 2. the lunge, frame by frame
    for (const step of [32, 16, 8, 4, 2, 1]) for (let G = 0; G <= LAST_FRAME; G += step) add(G); // 3. coarse to fine
    let next = 0;
    const lanes = set === 'm' ? 4 : 6;
    const pump = () => {
      if (gen !== loadGen || next >= order.length) return;
      const G = order[next++];
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (gen !== loadGen) return;
        frames[G] = img; loaded++;
        if (G === shownFrame || drawnFrame < 0) needsDraw = true;
        const pct = Math.round((loaded / (LAST_FRAME + 1)) * 100);
        hudPct.textContent = pct;
        if (pct >= 100) hudLoad.classList.add('is-done');
        pump();
      };
      img.onerror = pump;
      img.src = srcOf(G);
    };
    for (let i = 0; i < lanes; i++) pump();
  }
  const lungeReady = () => { for (let G = TIMELINE.lungeNeed[0]; G <= TIMELINE.lungeNeed[1]; G++) if (!frames[G]) return false; return true; };

  function nearestLoaded(G) {
    if (frames[G]) return G;
    for (let d = 1; d <= 32; d++) {
      if (frames[G - d]) return G - d;
      if (frames[G + d]) return G + d;
    }
    return -1;
  }

  // ---------------------------------------------------------------- canvas
  // Phone frames are portrait crops of the 1912 px master. The first 72 approach frames carry a wider window
  // (x 700..1540) so the camera can sit right of centre on the gate post, then ease back to the middle.
  const SRC_W = 1912;
  const phoneWindow = (G) => (G < 72 ? [700, 1540] : [652, 1260]);
  const phoneCentre = (G) => lerp(0.64, 0.5, smooth(40, 72, G));
  let cw = 0, ch = 0, drawnFrame = -1, shownFrame = 0, needsDraw = true;
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = Math.round(stage.clientWidth * dpr);
    ch = Math.round(stage.clientHeight * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    ctx.imageSmoothingQuality = 'high';
    needsDraw = true;
  }
  function draw(G) {
    const k = nearestLoaded(G);
    if (k < 0) return;
    if (k === drawnFrame && !needsDraw) return;
    const img = frames[k];
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    let dx = (cw - w) / 2;
    if (set === 'm') {
      const [x0, x1] = phoneWindow(k);
      const u = (phoneCentre(k) * SRC_W - x0) / (x1 - x0);
      dx = clamp(cw / 2 - u * w, cw - w, 0);
    }
    ctx.drawImage(img, dx, (ch - h) / 2, w, h);
    drawnFrame = k;
    needsDraw = k !== G; // keep trying until the exact frame has arrived
    if (!poster.classList.contains('is-gone')) poster.classList.add('is-gone');
  }

  // ---------------------------------------------------------------- scroll to film time
  function filmProgress() {
    if (filmST) return filmST.progress;
    return clamp(-film.getBoundingClientRect().top / (film.offsetHeight - innerHeight));
  }
  function filmTimeFromScroll() {
    const u = filmProgress() * TRAVEL;
    const K = TIMELINE.keys;
    for (let i = 1; i < K.length; i++) {
      if (u <= K[i][0]) {
        const [u0, t0] = K[i - 1], [u1, t1] = K[i];
        return lerp(t0, t1, (u - u0) / (u1 - u0));
      }
    }
    return TIMELINE.end;
  }
  const frameOf = (T) => clamp(Math.round(T * TIMELINE.fps), 0, LAST_FRAME);

  // ---------------------------------------------------------------- the scare
  // armed -> waiting (frames still loading) -> lunging -> impact (red, black) -> fired
  let state = 'armed';
  let phaseStart = 0, waitStart = 0, faceAt = 0;
  let prevScrollT = 0;
  let jumping = false;

  let runAt = 0;
  function startLunge(now) {
    if (lenis) lenis.stop();
    if (!lungeReady()) { state = 'waiting'; waitStart = now; return; }
    state = 'lunging'; phaseStart = now; runAt = now;
  }
  function resetScare() {
    state = 'armed';
    face.classList.remove('is-on');
    face.style.transform = ''; face.style.opacity = '';
    flash.classList.remove('is-red', 'is-black');
    shake.style.transform = ''; shake.style.filter = '';
    if (lenis) lenis.start();
  }
  const impactLog = [];
  function runImpact(now) {            // returns true once the face is up
    const t = now - phaseStart, { red, black: blk } = TIMELINE.impact;
    if (t < red) { if (!flash.classList.contains('is-red')) { flash.classList.add('is-red'); impactLog.push(['red', now]); } return false; }
    if (t < red + blk) { if (!flash.classList.contains('is-black')) { flash.classList.remove('is-red'); flash.classList.add('is-black'); impactLog.push(['black', now]); } return false; }
    flash.classList.remove('is-red', 'is-black');
    face.classList.add('is-on');
    impactLog.push(['face', now]);
    faceAt = now;
    setTimeout(() => { if (lenis) lenis.start(); }, TIMELINE.unlockMs);
    return true;
  }
  function renderShake(now) {
    const { steps, stepMs, px, scale, blurSteps } = TIMELINE.shake;
    if (!faceAt) return;
    const i = Math.floor((now - faceAt) / stepMs);
    if (i >= steps) { if (shake.style.transform) { shake.style.transform = ''; shake.style.filter = ''; } return; }
    const k = 1 - i / steps;
    const sx = (i % 2 ? 1 : -1) * px * k * (0.6 + Math.random() * 0.4);
    const sy = (Math.random() * 2 - 1) * px * k * 0.7;
    shake.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) scale(${(1 + scale * k).toFixed(3)})`;
    shake.style.filter = i < blurSteps ? 'blur(2px)' : '';
  }

  const sub = $('.film__sub');
  function subliminal() {             // one film frame: Eliza flat against the left wall, face turned away
    sub.classList.add('is-on');
    setTimeout(() => sub.classList.remove('is-on'), 1000 / TIMELINE.fps);
  }

  // ---------------------------------------------------------------- candles
  let darkStep = 0, darkPrev = 0, darkChangeAt = 0, darkPainted = '';
  function darkStepAt(T) {
    let n = 0;
    TIMELINE.dark.forEach(([t], i) => { if (T >= t) n = i + 1; });
    return n;
  }
  function setDarkStep(n, now) {
    if (n === darkStep) return;
    if (n > darkStep && n === TIMELINE.subliminalStep && state === 'armed') subliminal();
    darkPrev = darkStep; darkStep = n; darkChangeAt = now;
    canvas.style.filter = 'brightness(1.25)';                 // the flame gutters for one frame
    setTimeout(() => { canvas.style.filter = ''; }, 1000 / TIMELINE.fps);
  }
  function renderDark(now) {
    let n = darkStep;
    const t = now - darkChangeAt;
    if (t < 180) n = [darkPrev, darkStep, darkPrev, darkStep, darkPrev, darkStep][Math.floor(t / 30)] ?? darkStep; // three on/off flickers
    const key = String(n);
    if (key === darkPainted) return;
    darkPainted = key;
    if (n === 0) { darkEl.style.opacity = '0'; return; }
    const [, ew, eh] = TIMELINE.dark[n - 1];
    darkEl.style.setProperty('--ew', ew + '%');
    darkEl.style.setProperty('--eh', eh + '%');
    darkEl.style.opacity = '1';
  }

  // ---------------------------------------------------------------- clock
  let clockText = '';
  function renderClock(T) {
    let text;
    if (T >= TIMELINE.faceEnd) text = 'No further entries';
    else {
      const held = cues.find((c) => c.clock !== null && c.o > 0);
      let m;
      if (held) m = held.clock;
      else {
        const C = TIMELINE.clock;
        m = C[0][1];
        for (let i = 1; i < C.length; i++) {
          if (T < C[i][0]) { m = Math.floor(lerp(C[i - 1][1], C[i][1], (T - C[i - 1][0]) / (C[i][0] - C[i - 1][0]))); break; }
          m = C[i][1];
        }
      }
      text = `11.${m} pm`;
    }
    if (text !== clockText) { clockText = text; hudT.textContent = text; hud.classList.toggle('is-ended', T >= TIMELINE.faceEnd); }
    hud.classList.toggle('is-hidden', T < 0.8);
  }

  // ---------------------------------------------------------------- cues
  const RAMP = 0.1;
  function renderCues(T, now) {
    const running = state === 'lunging' || state === 'impact' || state === 'fired';
    for (const c of cues) {
      let o = clamp((T - c.in) / RAMP) * clamp((c.out - T) / RAMP);
      if (c.cutOnRun && running) o = Math.min(o, runAt ? clamp(1 - (now - runAt) / TIMELINE.cutOnRunMs) : 0);
      else if (c.cutOnRun && state === 'waiting') o = Math.max(o, 1);
      o = Math.round(o * 100) / 100;
      if (o !== c.o) {
        c.o = o;
        c.el.style.opacity = o;
        c.el.style.visibility = o > 0 ? 'visible' : 'hidden';
        c.el.style.transform = `translate3d(0, ${((1 - o) * 14).toFixed(1)}px, 0)`;
        c.el.classList.toggle('is-on', o > 0.5);
      }
      if (c.tw) setTyped(c.tw, Math.round((c.type ? clamp((T - c.in) / c.type) : 1) * c.tw._chars.length));
    }
  }

  // ---------------------------------------------------------------- torch
  const torch = $('.torch');
  const evidence = $('.evidence');
  const exhibits = $$('.exhibit').map((el) => {
    const cs = getComputedStyle(el);
    const num = (v) => parseFloat(cs.getPropertyValue(v)) / 100;
    return {
      el, photo: $('.exhibit__photo', el), ghost: $('.exhibit__ghost', el), note: $('.pencil', el),
      rx: num('--rx'), ry: num('--ry'), nx: num('--nx'), ny: num('--ny'),
      dwell: 0, found: false,
    };
  });
  const tor = { x: innerWidth / 2, y: innerHeight * 0.46, tx: innerWidth / 2, ty: innerHeight * 0.46, mouse: false, tapAt: -1e9, dipUntil: 0, foundDipUntil: 0, on: false };
  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { tor.mouse = true; tor.tx = e.clientX; tor.ty = e.clientY; } }, { passive: true });
  addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { tor.tx = e.clientX; tor.ty = e.clientY; tor.tapAt = performance.now(); } }, { passive: true });
  const wobble = (t, seed) => Math.sin(t / 530 + seed) * 0.6 + Math.sin(t / 290 + seed * 2.3) * 0.3 + Math.sin(t / 170 + seed * 4.1) * 0.1; // smooth, handheld

  function reveal(ex, now) {         // the torch shows what the police photo missed
    ex.found = true;
    ex.el.classList.add('is-found');
    ex.ghost.classList.add('is-flash');
    tor.foundDipUntil = now + 260;
    setTimeout(() => { ex.ghost.classList.remove('is-flash'); ex.ghost.classList.add('is-gone'); typeOut(ex.note); }, 120);
  }

  function renderTorch(now) {
    const er = evidence.getBoundingClientRect();
    const on = er.top < innerHeight * 0.55 && er.bottom > innerHeight * 0.45;
    if (on !== tor.on) { tor.on = on; torch.classList.toggle('is-on', on); evidence.classList.toggle('is-dark', on); }
    if (!on) return;

    // the exhibit nearest the middle of the screen
    let best = null, bd = Infinity;
    for (const ex of exhibits) {
      const r = ex.photo.getBoundingClientRect();
      ex.rect = r;
      const d = Math.abs(r.top + r.height / 2 - innerHeight / 2);
      if (d < bd) { bd = d; best = ex; }
    }

    if (!tor.mouse && now - tor.tapAt > 1800 && best) {   // touch: the beam finds the ring, then the note
      const r = best.rect;
      const p = (innerHeight - r.top) / (innerHeight + r.height);
      const k = best.found ? smooth(0.35, 0.65, p) : 0;
      const fx = lerp(best.rx, best.nx + 0.08, k), fy = lerp(best.ry, best.ny + 0.03, k);
      tor.tx = r.left + r.width * fx + wobble(now, 1) * 12;
      tor.ty = r.top + r.height * fy + wobble(now, 7) * 12;
    }
    tor.x = lerp(tor.x, tor.tx, 0.16);
    tor.y = lerp(tor.y, tor.ty, 0.16);
    const base = innerWidth < 760 ? 210 : 260;
    if (now > tor.dipUntil && Math.random() < 0.004) tor.dipUntil = now + 70 + Math.random() * 90; // a weak battery
    let dip = now < tor.dipUntil ? 0.8 : 1;
    if (now < tor.foundDipUntil) dip = 0.3;
    const rad = base * dip * (1 + 0.02 * Math.sin(now / 83) * Math.sin(now / 31));
    torch.style.setProperty('--x', tor.x.toFixed(1) + 'px');
    torch.style.setProperty('--y', tor.y.toFixed(1) + 'px');
    torch.style.setProperty('--r', rad.toFixed(1) + 'px');

    // ghosts live only inside the beam; holding the beam on one for 700 ms flushes it out
    for (const ex of exhibits) {
      if (ex.found) continue;
      const r = ex.rect;
      if (r.bottom < 0 || r.top > innerHeight) { ex.dwell = 0; continue; }
      const lx = tor.x - r.left, ly = tor.y - r.top;
      ex.ghost.style.setProperty('--lx', lx.toFixed(1) + 'px');
      ex.ghost.style.setProperty('--ly', ly.toFixed(1) + 'px');
      ex.ghost.style.setProperty('--gr', (rad * 0.55).toFixed(1) + 'px');
      // touch: only count while the ring is in the middle of the screen, and hold a beat longer
      if (!tor.mouse) { const cy = r.top + r.height * ex.ry; if (cy < innerHeight * 0.3 || cy > innerHeight * 0.7) { ex.dwell = 0; continue; } }
      const near = Math.hypot(lx / r.width - ex.rx, ly / r.height - ex.ry) < 0.1;
      if (!near) ex.dwell = 0;
      else if (!ex.dwell) ex.dwell = now;
      else if (now - ex.dwell > (tor.mouse ? 700 : 900)) reveal(ex, now);
    }
  }

  // ---------------------------------------------------------------- reveals below the film
  const revealEls = $$('.ev-intro, .exhibit__tag, .entry__head, .permit, .conditions, .close > *:not(.close__late)');
  revealEls.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 18px, 0)';
    el.style.transition = 'opacity 1s cubic-bezier(.23,1,.32,1), transform 1s cubic-bezier(.23,1,.32,1)';
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.transitionDelay = (Math.min(sib, 4) * 60) + 'ms';
      el.style.opacity = '';
      el.style.transform = '';
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  revealEls.forEach((el) => io.observe(el));
  $$('.redact--inline').forEach((el) => {
    new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { el.classList.add('is-on'); o.disconnect(); } }, { rootMargin: '0px 0px -20% 0px' }).observe(el);
  });

  // the close: rest at the bottom for four seconds and the file takes your name. Once.
  const late = $('.close__late');
  const closeStamp = $('.stamp--close');
  let restSince = 0, lateDone = false;
  function renderClose(now) {
    if (lateDone) return;
    const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    if (!atBottom) { restSince = 0; return; }
    if (!restSince) restSince = now;
    if (now - restSince > 4000) {
      lateDone = true;
      closeStamp.textContent = 'Case No. 1926-1031 · 1 new entry';
      late.classList.add('is-armed');
      typeOut(late, 55);
    }
  }

  // ---------------------------------------------------------------- jumps (nav links) never fire the scare
  $$('[data-jump]').forEach((a) => a.addEventListener('click', (e) => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    jumping = true;
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else target.scrollIntoView();
    requestAnimationFrame(() => requestAnimationFrame(() => { jumping = false; }));
  }));

  // ---------------------------------------------------------------- main tick
  const bootAt = performance.now();
  let scrolled = false, lastFace = '';
  function tick(now) {
    const scrollT = filmTimeFromScroll();
    let T = scrollT;
    if (!scrolled && scrollY > 2) scrolled = true;

    if (state === 'armed' && scrollT >= TIMELINE.trigger) {
      const crossed = prevScrollT < TIMELINE.trigger;
      const inView = scrollT < TIMELINE.faceEnd;
      if (crossed && inView && !jumping && document.visibilityState === 'visible') startLunge(now);
      else { state = 'fired'; face.classList.add('is-on'); faceAt = 0; }
    } else if ((state === 'fired' || state === 'waiting') && scrollT < TIMELINE.trigger - 0.25) {
      resetScare();
    }
    prevScrollT = scrollT;

    if (state === 'waiting') {
      T = 18.2;                                    // hold her in the dark until her run has loaded
      if (lungeReady() || now - waitStart > TIMELINE.lungeWaitMs) { state = 'lunging'; phaseStart = now; runAt = now; }
    }
    if (state === 'lunging') {
      const u = clamp((now - phaseStart) / TIMELINE.lungeMs);
      T = lerp(TIMELINE.trigger, TIMELINE.land, Math.pow(u, TIMELINE.lungePow));     // she accelerates into the lens
      if (u >= 1) { state = 'impact'; phaseStart = now; }
    }
    if (state === 'impact') {
      T = TIMELINE.land;
      if (runImpact(now)) state = 'fired';
    } else if (state === 'fired') {
      T = Math.max(scrollT, TIMELINE.land);
    }

    // film frame: an idle breath of fog until the reader first scrolls
    if (!scrolled && scrollT < 0.01) {
      const i = Math.floor((now - bootAt) / 125) % 28;
      shownFrame = i < 15 ? i : 28 - i;
    } else shownFrame = frameOf(Math.min(T, TIMELINE.land));
    if (shownFrame !== drawnFrame || needsDraw) draw(shownFrame);

    // the invitation leaves on the first 20 px
    const wo = clamp(1 - scrollY / 20).toFixed(2);
    if (walk.style.opacity !== wo) walk.style.opacity = wo;

    // candles: the darkness stays through the lunge
    if (state === 'armed') setDarkStep(darkStepAt(T), now);
    renderDark(now);

    // face hold: a push in, with a tremor for the first 300 ms
    if (state === 'fired' && face.classList.contains('is-on')) {
      const fs = lerp(TIMELINE.face.from, set === 'm' ? TIMELINE.face.toPortrait : TIMELINE.face.to, clamp((T - TIMELINE.land) / (TIMELINE.faceEnd - TIMELINE.land)));
      let jx = 0, jy = 0;
      if (faceAt && now - faceAt < TIMELINE.face.jitterMs) { jx = Math.random() * 4 - 2; jy = Math.random() * 4 - 2; }
      const tf = `translate3d(${jx.toFixed(1)}px, ${jy.toFixed(1)}px, 0) scale(${fs.toFixed(4)})`;
      if (tf !== lastFace) { face.style.transform = tf; lastFace = tf; }
    }
    renderShake(now);
    black.classList.toggle('is-on', T >= TIMELINE.faceEnd);

    root.classList.toggle('in-film', filmProgress() < 0.97);
    renderCues(scrollT >= TIMELINE.trigger && (state === 'waiting' || state === 'lunging' || state === 'impact') ? Math.min(T, 18.2) : T, now);
    renderClock(T);
    renderTorch(now);
    renderClose(now);
  }

  // ---------------------------------------------------------------- boot
  let lenis = null, filmST = null;
  function boot() {
    if (window.Lenis) lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      filmST = ScrollTrigger.create({ trigger: film, start: 'top top', end: 'bottom bottom' });
      if (lenis) lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => { if (lenis) lenis.raf(t * 1000); tick(performance.now()); });
      gsap.ticker.lagSmoothing(0);
    } else {
      const loop = (now) => { if (lenis) lenis.raf(now); tick(now); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
    sizeCanvas();
    startLoading();
    // decode the hit images ahead of time so nothing stalls the red, black, face sequence
    [face.querySelector('img'), sub].forEach((img) => { if (img && img.decode) img.decode().catch(() => {}); });
    window.__hollow = { get state() { return state; }, get T() { return filmTimeFromScroll(); }, get loaded() { return loaded; },
      get found() { return exhibits.map((e) => e.found); }, impactLog, lenis, TIMELINE, TRAVEL, LAST_FRAME };
  }

  let rz;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { sizeCanvas(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 120); });
  portraitMQ.addEventListener('change', () => { set = portraitMQ.matches ? 'm' : 'd'; drawnFrame = -1; startLoading(); });

  scrollTo(0, 0);
  boot();
})();
