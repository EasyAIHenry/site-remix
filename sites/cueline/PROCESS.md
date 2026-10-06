# How this page was made

**Cueline** is a made-up product (brand deals and payouts for creators). The
page is built on the *design system* of Stripe's homepage, reverse-engineered
with the Replica skill pack for Claude. Nothing of Stripe's was copied: no
code, no images, no icons, no logo, no font, no words. What carried over is
the system: the layout grid, the type scale, the two-tone headlines, the
bento cards, the dark bands, the spacing.

The point: Claude on its own builds generic front ends. Give it a measured
design system from a site you admire and it builds something that looks
designed.

Total time: about 30 minutes of Claude working, one session, 7 Oct 2026.

## What you need

- Claude Code with five skills from the Replica pack installed in
  `~/.claude/skills/`: `replica-recon`, `replica-design`, `replica-build`,
  `replica-brand`, `replica-diff`. They are plain folders with a `SKILL.md`
  and a few standard-library Python tools. Scan any skill before you install
  it.
- Python 3.8+, Google Chrome, and Playwright (only for screenshots).

## The steps, in order

Each step below is the prompt I gave, what the skill did, and what got fixed
after the check.

### 1. Recon: map the target (about 6 min)

> Read `~/.claude/skills/replica-recon/SKILL.md`. Scope: the stripe.com
> homepage only, as a design-system study for a new marketing page. Take
> screenshots at 1440 and 390 wide (full page and every viewport), list every
> section top to bottom, every repeated component, and measure the type and
> spacing. Write `replica/recon.md` and `replica/features.csv`.

- Screenshots went to a private lab folder, **not** this repo. They are
  reference only.
- Measured in the browser: section heights, font sizes, weights, line
  heights, letter spacing. Numbers only. No CSS or JavaScript was read or
  saved. The cookie banner was declined.
- Found: 11 sections, ~13 components, a 1264px frame drawn with hairlines,
  light (300) weight headings everywhere, and the "dark claim, muted
  continuation" headline pattern.
- Output: `replica/recon.md`, `replica/features.csv` (23 rows: 10 must,
  6 should, 3 could, 3 skipped with reasons, e.g. their customer logos).

### 2. Design: turn measurements into tokens (about 4 min)

> Read `~/.claude/skills/replica-design/SKILL.md`. Turn the recon into
> `replica/design/tokens.json` with colour *roles*, the type scale, spacing,
> radius, shadow, motion and layout. Use an open font (Inter) instead of
> their licensed one. Give it my own palette now (green, teal, sun yellow;
> no violet or blurple). Write `tokens.css` and `components.md`, then run
> `contrast.py` until there are zero AA failures.

```
python3 ~/.claude/skills/replica-design/contrast.py replica/design/tokens.json
```

- First run: 25 pairs, 0 failing.
- Fixed after: the hero continuation colour needed its own role
  (`text-tint`). Added it, re-ran: **27 pairs, 0 failing AA**
  (`replica/design/contrast-report.md`).
- After the layout diff (step 5) the display size went from 52 to the
  measured 48px. Contrast re-run: still 0 failures.

### 3. Build: write the page fresh (about 6 min)

> Read `~/.claude/skills/replica-build/SKILL.md`. Build one static page
> (`index.html`, `assets/css`, `assets/js`, no build step, works from
> `file://`) section by section from the recon map, using only the tokens.
> Fictional product: Cueline, creator brand deals and payouts. Write your
> own WebGL shader for the hero ribbon, build every product picture in
> HTML/CSS, Lucide icons inline, made-up logos only, respect
> prefers-reduced-motion, 390 and 1440 wide.

What got built, mapped to the recon sections:

| recon | Cueline |
| --- | --- |
| S01 nav | logo, 5 links, sign in, Start free; menu panel on mobile |
| S02 hero | live payout ticker, two-tone headline, 2 CTAs, WebGL silk ribbon (`assets/js/ribbon.js`) |
| S03 logo strip | 7 invented marks on a frosted strip, marquee on mobile |
| S04 bento | 6 cards: deal inbox + contract, rate card, split payouts, invoices, currency globe (canvas), media kit |
| S06 dark band | skewed forest band, 4 count-up stats, live waveform canvas |
| S07 segments | split header, 3 creator stories, 3 icon features |
| S08 developers | skewed dark band, code editor + typing terminal, integration diagram, 3 stats |
| S10 / S11 | final CTA with 2 icon links, footer columns |

### 4. QA rounds: screenshot, critique against the target, fix

Each round: Playwright screenshots of the build at 1440 and 390, compared
side by side with the recon shots, then fixes. Console errors and
horizontal overflow were checked every round (0 every time).

**Round 1**
- Hero headline ran to 5 lines (target is 4). Cut the continuation.
- Ribbon looked like grass: too many hairline streaks. Lowered the fringe
  and fine-noise strength, widened the streak scale so it reads as silk.
- Card A art was invisible behind the mocks. Moved the gradient swoosh to
  bleed above the browser window, like the target's first card.
- Globe was sparse and pale. Denser dots.
- Story cards were just big initials. Replaced with a frosted "paid" chip.
- Mobile: the studio paragraph came before its heading. Rebuilt the split
  header with grid areas.
- Developer band: stats too close to the skewed bottom edge. More padding.

**Round 2**
- Added thin bright silk threads to the shader.
- Globe was a cropped blob: shrank it, gave it a solid sphere and a rim.
- Checked: mobile menu (open, Esc closes, focus returns), keyboard focus
  ring, reduced motion (ribbon draws one still frame, counters show final
  numbers), and loading from `file://`. All fine.

**Round 3 (after the layout diff)**
- Hero rhythm matched to the measured scale: ticker, 48px headline,
  button gap, logo strip position. Hero viewport layout score 42.3 -> 48.5.
- Section lede widened to 880px so it wraps like the target.
- Bento row 2 made taller.
- Canvases went blank after a resize while off-screen. They now redraw
  one frame on resize.
- Frame hairlines on the dark bands now fade in and out instead of
  stopping hard.
- Added a fifth row to the media-kit table to fill dead space.

### 5. Brand: name, palette, sweep (about 3 min)

> Read `~/.claude/skills/replica-brand/SKILL.md`. Write `replica/brand.md`
> and `replica/brand.json` (the target's name, product names, domains and
> brand colours to avoid), then run the sweep until it is clean.

```
python3 ~/.claude/skills/replica-brand/sweep.py . --config replica/brand.json
```

- Name checks run: web searches and registry whois (see `brand.md`). Both
  cueline.com and cueline.io are taken, so the page only uses
  `cueline.example`. Trademark searches are marked "to run".
- Sweep run 1: **2 hits**. A CSS class called `art-f__stripes` contained
  the target's name inside an identifier. Renamed to `art-f__lines`.
- Sweep run 2 on the site files: **Clean.**
- Final sweep over the whole folder: 5 hits, all inside this `PROCESS.md`,
  which names the target on purpose. Sweep over the shipped files
  (`index.html` + `assets/`): **Clean.**

### 6. Diff: score it (about 2 min)

> Read `~/.claude/skills/replica-diff/SKILL.md`. Crop each section of the
> target and of Cueline at 1440 wide and run `imgdiff.py` on each pair, plus
> the mobile hero. Then `parity.py` with the feature matrix and the layout
> JSONs.

```
python3 ~/.claude/skills/replica-diff/imgdiff.py orig-hero.png clone-hero.png --json > replica/diffs/hero.json
python3 ~/.claude/skills/replica-diff/parity.py replica/features.csv --visual replica/diffs/*.json
```

| section | layout score |
| --- | --- |
| S02-S03 hero + logo strip (desktop) | 53.2 |
| S04 product bento | 36.7 |
| S06 dark stats band | 26.3 |
| S08 developer band | 20.2 |
| S10-S11 CTA + footer | 33.5 |
| S02 hero (mobile) | 34.0 |

**Parity 84.3 / 100.** Features 96.9 (all 11 must-haves done), layout 34.0.

The layout number is low on purpose. The diff compares edge maps, and every
picture, word and mock here is different; the developer and footer sections
are also much shorter. The skill itself says not to chase pixel parity with
the original: its exact look is its trade dress. The feature score is the
one that matters. Full report: `replica/parity.md`.

## Files

```
index.html
assets/css/tokens.css      design tokens as custom properties
assets/css/styles.css      the page, tokens only
assets/js/ribbon.js        WebGL hero ribbon (own shader)
assets/js/main.js          nav, reveals, counters, globe + waveform canvases
assets/img/favicon.svg     Cueline mark
replica/recon.md           section + component inventory, measured scale
replica/features.csv       feature matrix (filled in)
replica/design/            tokens.json, tokens.css, components.md, contrast-report.md
replica/brand.md, brand.json
replica/parity.md, replica/diffs/*.json
```

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 4702
```

GSAP (from cdnjs) adds the scroll parallax on the bento mocks; everything
else works without it. Fonts come from Google Fonts (Inter, JetBrains Mono).

## Credits

- Icons: Lucide (ISC licence), inlined.
- Fonts: Inter and JetBrains Mono (SIL Open Font Licence).
- Every brand, creator and number on the page is invented.
