import { createRequire } from "node:module";
const require = createRequire(process.env.PW_PKG || (process.cwd() + "/package.json"));
const { chromium } = require("playwright-core");
const OUT = `${process.env.LAB || "./lab"}/recon`;
(await import("node:fs")).mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
for (const [name, vp, mobile] of [["desktop", {width:1440,height:900}, false], ["mobile", {width:390,height:844}, true]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.goto("https://linear.app/", { waitUntil: "networkidle", timeout: 60000 }).catch(e=>console.log("goto", e.message));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${name}-fold.png` });
  // slow scroll to trigger reveals
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += vp.height * 0.6) { await page.evaluate(yy => window.scrollTo(0, yy), y); await page.waitForTimeout(350); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
  // per-viewport slices
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < H; y += vp.height) { await page.evaluate(yy => window.scrollTo(0, yy), y); await page.waitForTimeout(600); await page.screenshot({ path: `${OUT}/${name}-s${String(i++).padStart(2,"0")}.png` }); }
  console.log(name, "height", H, "slices", i);
  if (!mobile) {
    // measure the system: computed styles of representative elements
    const m = await page.evaluate(() => {
      const cs = el => { const s = getComputedStyle(el); return { tag: el.tagName, text: (el.innerText||"").slice(0,40), font: s.fontFamily.slice(0,60), size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, color: s.color, bg: s.backgroundColor }; };
      const out = {};
      out.body = cs(document.body);
      out.html_bg = getComputedStyle(document.documentElement).backgroundColor;
      out.h1 = [...document.querySelectorAll("h1")].slice(0,2).map(cs);
      out.h2 = [...document.querySelectorAll("h2")].slice(0,12).map(cs);
      out.h3 = [...document.querySelectorAll("h3")].slice(0,10).map(cs);
      out.p = [...document.querySelectorAll("p")].slice(0,14).map(cs);
      out.buttons = [...document.querySelectorAll("a,button")].filter(e=>e.offsetHeight>24 && e.offsetHeight<56).slice(0,14).map(e=>{const s=getComputedStyle(e);return {...cs(e), h:e.offsetHeight, radius:s.borderRadius, border:s.border, pad:s.padding}});
      out.header = (()=>{const h=document.querySelector("header"); if(!h) return null; const s=getComputedStyle(h); return {h:h.offsetHeight, bg:s.backgroundColor, border:s.borderBottom, backdrop:s.backdropFilter, position:s.position}})();
      out.sections = [...document.querySelectorAll("main > *, section")].slice(0,30).map(e=>{const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return {tag:e.tagName, top:Math.round(r.top+scrollY), h:Math.round(r.height), w:Math.round(r.width), pad:s.padding, bg:s.backgroundColor}});
      // max widths of containers
      const widths = {}; document.querySelectorAll("div").forEach(d=>{const s=getComputedStyle(d); if(s.maxWidth!=="none") widths[s.maxWidth]=(widths[s.maxWidth]||0)+1}); out.maxWidths=widths;
      const borders = {}; document.querySelectorAll("*").forEach(d=>{const s=getComputedStyle(d); if(s.borderTopWidth==="1px" && s.borderTopStyle==="solid") borders[s.borderTopColor]=(borders[s.borderTopColor]||0)+1}); out.borderColors=borders;
      const radii = {}; document.querySelectorAll("*").forEach(d=>{const s=getComputedStyle(d); if(s.borderRadius!=="0px") radii[s.borderRadius]=(radii[s.borderRadius]||0)+1}); out.radii=radii;
      const colors = {}; document.querySelectorAll("p,span,a,h1,h2,h3,h4,li").forEach(d=>{const s=getComputedStyle(d); colors[s.color]=(colors[s.color]||0)+1}); out.textColors=colors;
      const bgs = {}; document.querySelectorAll("*").forEach(d=>{const s=getComputedStyle(d); if(s.backgroundColor!=="rgba(0, 0, 0, 0)") bgs[s.backgroundColor]=(bgs[s.backgroundColor]||0)+1}); out.bgColors=bgs;
      const sizes = {}; document.querySelectorAll("p,span,a,h1,h2,h3,h4,li,button").forEach(d=>{const s=getComputedStyle(d); const k=s.fontSize+"/"+s.lineHeight+"/"+s.fontWeight+"/"+s.letterSpacing; sizes[k]=(sizes[k]||0)+1}); out.typeScale=sizes;
      return out;
    });
    const fs = await import("node:fs");
    fs.writeFileSync(`${OUT}/measure-desktop.json`, JSON.stringify(m, null, 1));
  }
  await ctx.close();
}
await browser.close();
