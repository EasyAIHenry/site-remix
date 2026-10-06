# How this page was made

**The idea:** Claude builds weak front ends when it designs from nothing. So don't ask it to "make a nice landing page". Point it at the best-designed site you can find, have it reverse-engineer that site's design *system* (grid, type scale, spacing, surfaces, borders, glows, motion), then build a brand-new site on top of that system. New product, new name, new words, new colours, own visuals.

- **Target system:** the linear.app homepage (homepage only).
- **Result:** Takeline, a fictional production tool for AI-video teams. `index.html` + `css/` + `js/`, no build step. Opens from `file://` and from GitHub Pages.
- **Skills used, in order:** `replica-recon` → `replica-design` → `replica-build` → `replica-brand` → `replica-diff` (the Replica skill pack, scoped down from "clone an app" to "one marketing page").
- **Total time:** about an hour of agent time (00:08 → 01:06 on 7 Oct 2026, plus ~10 min writing these docs), including 8 screenshot rounds.

Everything the steps produced is in `replica/`. The screenshots of the original are **not** in this repo: they stay in a private lab folder, because they are someone else's design.

---

## What you need

- Claude Code with the five replica skills installed (`~/.claude/skills/replica-*`).
- Python 3.8+ (the skill tools are standard library only).
- Node + `playwright-core` and Google Chrome, for screenshots. (`npm i playwright-core` in any folder; point `PW_PKG` at that folder's `package.json`.)
- Optional: `npm i lucide` if you want to rebuild the icon sprite.

---

## Step 0: set the rules first (2 min)

The prompt that started it (paraphrased):

> Build one showcase landing page. Target system: linear.app, homepage only. Output: a brand-new original website (new fictional product, new name, new copy, new colours, own icons and visuals) built on its design system: layout grid, type scale, spacing, dark surfaces, hairline borders, gradient glows, motion feel. Follow the replica skills in order, reading each SKILL.md first: recon, design, build, brand, diff. Scope them down to a single marketing page. Never copy its code, images, icons, logo, fonts or text. Icons: Lucide. Static site, GSAP from cdnjs allowed, respect reduced motion, works at 390px and 1440px. At least 3 rounds of screenshot → critique → fix before anyone sees it.

Why the rules matter: the skills rebuild **what a site does and how it is laid out**, never what it owns. Saying it up front stops the model "helpfully" reusing a logo or a headline.

## Step 1: `/replica-recon` (6 min)

Prompt: *"Run replica-recon on linear.app, homepage only. Make a section inventory and a component list. Screenshot desktop 1440 and mobile 390, full page and per viewport."*

What happened:

1. Captured the page with headless Chrome (`replica/tools/recon.mjs`): one visit, slow scroll so every reveal fires, a full-page shot and one shot per viewport, desktop and mobile. Saved to the private lab folder only.
2. Measured the system from the live page the way a colour picker would: computed font sizes, weights, line heights, letter spacing, border colours, radii, max widths. No source code, scripts or network calls were saved.
3. Wrote `replica/recon.md`: 13 sections (S01 header … S13 footer), what each does, its components, what changes on mobile, and a "what cannot be cloned" list (logo, copy, customer logos, licensed font, brand colour).

Key findings that drove everything else: 8%-white hairlines everywhere, a 2-column split whose right column starts exactly at the halfway line, 64/48/72px headings with tight negative tracking at a ~510 weight, 15px/24px body, pill buttons, product mocks that bleed off the fold.

## Step 2: `/replica-design` (6 min)

Prompt: *"Run replica-design. Write tokens.json with roles, generate tokens.css, write components.md, run contrast.py until zero AA failures."*

1. `replica/design/tokens.json`: colour **roles** (bg, surface ×3, border, text ×4, accent, status colours…), the type scale, spacing, layout numbers, radii, shadows, hairlines, motion. Values are already Takeline's own (warm near-black instead of a cool one, ember accent instead of the target's blue-violet).
2. `python3 replica/tools/tokens2css.py replica/design/tokens.json css/tokens.css`: every token becomes a CSS custom property. Components only ever use the variables.
3. Contrast:
   ```bash
   python3 ~/.claude/skills/replica-design/contrast.py replica/design/tokens.json
   # 27 pairs, 0 failing AA
   ```
   Passed first time because the muted greys were picked against the measured ratios, not by eye. Report: `replica/design/contrast-report.txt`.
4. `replica/design/components.md`: every component with variants, states, tokens and accessibility notes.

Font swap: the target uses a licensed typeface. Takeline uses **Geist** and **Geist Mono** (open licence, Google Fonts). Same job (a neutral grotesk with a mono for labels), different file.

## Step 3: `/replica-brand`, part 1: the name (3 min)

Done before building so no placeholder name ever lands in the code.

- 5 candidates, quick web searches: "Framestack" sat too close to an existing AI-video tool, "Reelyard" next to several "Reely-" apps. **Takeline** had no product match.
- `whois takeline.com`: registered (since 2011, at a reseller). Fine for a fictional demo. Trademark searches are listed as "to run" in `replica/brand.md`, never assumed.

## Step 4: `/replica-build` (15 min)

Prompt: *"Build it with replica-build: tokens only, every word fresh, Lucide icons inline, product mocks in HTML/CSS, GSAP for scroll scrubbing, IntersectionObserver reveals that work without GSAP, reduced motion respected."*

- `index.html`: 13 sections mapped 1:1 to the recon inventory, each with Takeline's own content (a shot board, multi-model take comparison, frame-accurate review, a bento grid, changelog, two testimonial cards from invented people, CTA, footer). A footer line says the product and people are fictional.
- All "generated video frames" are CSS: gradients for the sky, `clip-path` polygons for the skylines. No images at all.
- Icons: `replica/tools/icons.mjs` scans the HTML for `#i-name`, pulls those 42 icons from the Lucide package and injects one inline SVG sprite. An inline sprite (not an external `.svg`) is what keeps icons working from `file://`.
- `js/site.js`: header state, mobile menu, word-by-word hero reveal, scroll reveals, line-drawing figures, count-ups, typing caret, live progress bars, synced playheads, key-press loop, cursor spotlight on bento tiles. GSAP adds the hero tilt-to-flat, the statement words lighting up as you scroll, and parallax on mocks.

## Step 5: QA rounds (screenshot → critique → fix), ~30 min over 8 rounds

Each round: serve the folder (`python3 -m http.server 4701`), run `replica/tools/shoot.mjs rN` (fold, every viewport slice, full page, desktop and mobile, console errors, horizontal overflow), then compare slice by slice with the target's slices.

| round | found | fixed |
| --- | --- | --- |
| 1 | bento grid left a hole in the last row; integration "hub" icons clipped off the tile; compare frames made the panel taller than the screen; the first line figure was a tangle of overlapping diamonds; footer mark floated mid-column; mobile notes panel clipped | full-width integration tile; hub nodes placed on an ellipse by hand; frames 16:9 → 2:1; redrew the figure with front edges only; pinned the mark; `minmax(0,1fr)` grid on mobile |
| 2 | a CSS find-and-replace had duplicated a desktop rule into the tablet block, so the full-width tile stayed 2 columns on phones | removed the duplicate, added proper tablet rules |
| 3 | mobile menu let the hero text show through; header had no hairline at the top (the original always shows one); feature lists a size too big | solid full-height sheet + scroll lock + aria label swap; hairline on load; 17 → 16px |
| 4 | hero headline only filled ~40% of the width (the original's fills ~60%), hero looked empty on the right | longer headline: "Run every AI video project / like a real production" |
| 5-6 | mobile page much longer than needed | tighter mobile chapter padding and mock spacing |
| 7 | command palette clipped at the top of its tile | let the palette set the tile height |
| 8 | bento headings in row 1 no longer lined up | one fixed visual height for every tile |

Every round also checked: zero console errors, zero horizontal overflow, reduced motion leaves nothing hidden, and the page works from `file://` (GSAP, icons and fonts all load).

## Step 6: `/replica-brand`, part 2: the sweep (3 min)

```bash
python3 ~/.claude/skills/replica-brand/sweep.py . --config replica/brand.json
```

`replica/brand.json` lists the target's product names, 20 of its distinctive copy phrases, its domains, its brand colour and its measured greys.

The catch: the target's name is also a CSS keyword (`linear-gradient`). So a bare-name sweep can never be clean on a stylesheet. `replica/sweep-keywords.py` runs that sweep anyway and checks every hit line by line. All 39 lines are `linear-gradient`, SVG `linearGradient` or the `linear` timing function. Nothing else.

Run the sweep from inside the site folder. This file (PROCESS.md) names the target on purpose, so it will show up as hits. Only the shipped files (`index.html`, `css/`, `js/`, `assets/`) need to be clean, and they are.

Also checked by eye: title, meta description, favicon, alt and aria labels.

## Step 7: `/replica-diff` (5 min)

```bash
python3 ~/.claude/skills/replica-diff/imgdiff.py lab/recon/desktop-fold.png lab/build/r8/desktop-fold.png --json
python3 ~/.claude/skills/replica-diff/parity.py replica/features.csv
```

- Full-page diffs are misleading (one taller section shifts everything under it), so `replica/tools/sections.mjs` also captures matching 1440x900 windows on both pages, anchored on the same landmark (section title or first card).
- **Layout: 56.8 on the desktop fold, 53.0 averaged over six section windows ("partly")**, 75.2 on the testimonials. That is the target: same skeleton, different product. The tool ignores colour on purpose, and the skill says not to chase pixel parity.
- **Feature parity: 100** (20/20 must-have homepage patterns, 2 skipped on purpose, 1 added).
- Full table: `replica/diffs/scores.md`.

---

## Repeat it on another site

1. Pick a site whose *design* you admire. Homepage only.
2. Run the five skills in this order, and say "one marketing page, not an app" to each.
3. Name and recolour **before** you build.
4. Build with tokens only. If you type a hex code into a component, it belongs in `tokens.json` instead.
5. Do at least three screenshot rounds against the original's slices. Fix spacing and alignment before you touch effects.
6. Sweep, then diff. Publish the scores, never the original's screenshots.

## Files

```
index.html            the page
css/tokens.css        generated from replica/design/tokens.json
css/site.css          components and sections (uses tokens only)
js/site.js            motion (works without GSAP; GSAP adds scroll scrubbing)
assets/favicon.svg    Takeline mark
replica/recon.md            section inventory + measured system
replica/features.csv        homepage pattern checklist (parity input)
replica/design/tokens.json  roles + values
replica/design/tokens.css   same as css/tokens.css
replica/design/components.md
replica/design/contrast-report.txt
replica/brand.md / brand.json
replica/sweep-keywords.py   proves the bare-name sweep hits are CSS keywords
replica/diffs/              layout scores (JSON) + scores.md
replica/build-log.md
replica/tools/              tokens2css.py, icons.mjs, recon.mjs, shoot.mjs, sections.mjs, extra.mjs, sheet.py
```

Tool env vars: `PW_PKG` (path to a package.json next to playwright-core), `CHROME` (Chrome binary), `LAB` (private folder for screenshots, default `./lab`, keep it out of git), `SITE_FILE_URL` (for the `file://` check), `LUCIDE_ICONS` (folder of Lucide ESM icons).
