// Build an inline <svg> sprite of Lucide icons (ISC licence) and inject it into index.html between markers.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const LUCIDE = (process.env.LUCIDE_ICONS || "node_modules/lucide/dist/esm/icons/").replace(/\/?$/, "/"); // folder of lucide ESM icon files (npm i lucide)
const html = process.argv[2];
const names = [...new Set([...fs.readFileSync(html, "utf8").matchAll(/#i-([a-z0-9-]+)/g)].map(m => m[1]))].sort();
const syms = [];
for (const n of names) {
  const f = LUCIDE + n + ".js";
  if (!fs.existsSync(f)) { console.error("MISSING icon", n); process.exitCode = 1; continue; }
  const mod = await import(pathToFileURL(path.resolve(f)).href);
  const inner = mod.default.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k])=>k!=="key").map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  syms.push(`<symbol id="i-${n}" viewBox="0 0 24 24">${inner}</symbol>`);
}
const sprite = `<!--ICONS:START--><svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${syms.join("")}</defs></svg><!--ICONS:END-->`;
let src = fs.readFileSync(html, "utf8").replace(/<!--ICONS:START-->[\s\S]*?<!--ICONS:END-->/, sprite);
fs.writeFileSync(html, src);
console.log("icons:", names.length, names.join(" "));
