// Section-level layout captures: same 1440x900 window anchored on matching section landmarks in both pages.
import { createRequire } from "node:module";
const require = createRequire(process.env.PW_PKG || (process.cwd() + "/package.json"));
const { chromium } = require("playwright-core");
const round = process.argv[2] || "r5";
const BASE = process.env.LAB || "./lab";
const fs = await import("node:fs");
const pairs = [
  ["principles", { text: "FIG 0.1" }, ".principles .mono-fig"],
  ["chapter", { h2: "Planning" }, "#generate .h2"],
  ["changelog", { h2: "Changelog" }, "#changelog .h2"],
  ["testimonials", { text: "probably build a better product" }, ".quotes"],
  ["footer", { sel: "footer" }, "footer"],
];
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
async function capture(url, outDir, anchorFor) {
  fs.mkdirSync(outDir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 500) { await page.evaluate(yy => scrollTo(0, yy), y); await page.waitForTimeout(250); }
  for (const [name, lin, mine] of pairs) {
    const top = await page.evaluate(anchorFor(lin, mine));
    if (top == null) { console.log("no anchor", name, url); continue; }
    await page.evaluate(t => scrollTo(0, Math.max(0, t - 140)), top);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/${name}.png` });
  }
  await ctx.close();
}
const linAnchor = (lin) => `(() => { let el = null;
  const q = ${JSON.stringify(lin)};
  if (q.sel) el = document.querySelector(q.sel);
  if (q.h2) el = [...document.querySelectorAll("h2")].find(h => h.textContent.includes(q.h2));
  if (q.text) { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.textContent.includes(q.text)) { el = n.parentElement; break; } }
  return el ? el.getBoundingClientRect().top + scrollY : null; })()`;
const mineAnchor = (_, sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); return el ? el.getBoundingClientRect().top + scrollY : null; })()`;
if (!fs.existsSync(`${BASE}/recon/sections/footer.png`)) await capture("https://linear.app/", `${BASE}/recon/sections`, linAnchor);
await capture("http://localhost:4701/", `${BASE}/build/${round}/sections`, mineAnchor);
await browser.close();
console.log("done");
