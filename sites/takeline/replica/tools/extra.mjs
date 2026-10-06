// extra QA: mobile menu open, reduced motion render, file:// load with console capture
import { createRequire } from "node:module";
const require = createRequire(process.env.PW_PKG || (process.cwd() + "/package.json"));
const { chromium } = require("playwright-core");
const OUT = `${process.env.LAB || "./lab"}/build/${process.argv[2]||"r3"}`;
const fs = await import("node:fs"); fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const errs = [];
// mobile menu
let ctx = await browser.newContext({ viewport: {width:390,height:844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
let p = await ctx.newPage(); p.on("pageerror", e => errs.push("menu " + e.message));
await p.goto("http://localhost:4701/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
await p.click(".menu-btn"); await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/mobile-menu.png` });
await ctx.close();
// reduced motion: everything visible without scrolling animations
ctx = await browser.newContext({ viewport: {width:1440,height:900}, reducedMotion: "reduce" });
p = await ctx.newPage(); p.on("pageerror", e => errs.push("reduced " + e.message));
await p.goto("http://localhost:4701/", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
await p.evaluate(() => window.scrollTo(0, 3000)); await p.waitForTimeout(600);
await p.screenshot({ path: `${OUT}/desktop-reduced-motion.png` });
const hidden = await p.evaluate(() => [...document.querySelectorAll("[data-reveal]")].filter(e => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && getComputedStyle(e).opacity < 0.9; }).length);
console.log("reduced-motion: in-view reveal elements still hidden =", hidden);
await ctx.close();
// file://
ctx = await browser.newContext({ viewport: {width:1440,height:900} });
p = await ctx.newPage();
p.on("console", m => { if (m.type()==="error") errs.push("file console: " + m.text()); });
p.on("pageerror", e => errs.push("file " + e.message));
await p.goto(`${process.env.SITE_FILE_URL}`, { waitUntil: "load" }); await p.waitForTimeout(1500);
const ok = await p.evaluate(() => ({ gsap: !!window.gsap, st: !!window.ScrollTrigger, icons: document.querySelectorAll("symbol").length, font: document.fonts.check("16px Geist") }));
console.log("file:// ", JSON.stringify(ok));
await p.screenshot({ path: `${OUT}/desktop-file-protocol.png` });
await ctx.close(); await browser.close();
console.log(errs.length ? errs.join("\n") : "no errors");
