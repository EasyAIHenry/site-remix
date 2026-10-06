// Screenshot a page at desktop and phone size: full page plus one shot per screen.
// Usage: node capture.mjs <url> <out-dir>
// Needs: npm i -D playwright && npx playwright install chromium
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [url, out] = process.argv.slice(2);
if (!url || !out) {
  console.log("usage: node capture.mjs <url> <out-dir>");
  process.exit(2);
}

const sizes = { desktop: [1440, 900], phone: [390, 844] };
const browser = await chromium.launch();

for (const [name, [width, height]] of Object.entries(sizes)) {
  const dir = path.join(out, name);
  fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

  // Scroll to the bottom once so lazy images and scroll reveals load.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += height / 2) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(dir, "full.png"), fullPage: true });
  for (let i = 0, y = 0; y < total; i++, y += height) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(dir, `screen-${String(i).padStart(2, "0")}.png`) });
  }
  console.log(`${name}: ${dir}`);
  await page.close();
}

await browser.close();
