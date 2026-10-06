import { createRequire } from "node:module";
const require = createRequire(process.env.PW_PKG || (process.cwd() + "/package.json"));
const { chromium } = require("playwright-core");
const round = process.argv[2] || "r1";
const OUT = `${process.env.LAB || "./lab"}/build/${round}`;
const URL = process.argv[3] || "http://localhost:4701/";
const fs = await import("node:fs"); fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const errors = [];
for (const [name, vp, mobile] of [["desktop", {width:1440,height:900}, false], ["mobile", {width:390,height:844}, true]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") errors.push(`${name} console.${m.type()}: ${m.text()}`); });
  page.on("pageerror", e => errors.push(`${name} pageerror: ${e.message}`));
  page.on("requestfailed", r => errors.push(`${name} requestfailed: ${r.url()}`));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/${name}-fold.png` });
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < H; y += vp.height) {
    await page.evaluate(yy => window.scrollTo(0, yy), y);
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `${OUT}/${name}-s${String(i++).padStart(2, "0")}.png` });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(name, "height", H, "slices", i, "h-overflow", overflow);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(errors.length ? errors.join("\n") : "no console errors");
