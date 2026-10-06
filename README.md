# site-remix

**Make Claude build websites that look designed, not generated.**

If you ask Claude for a landing page, you get the same page every time: a purple gradient, a big centred headline and three cards. The fix isn't a better prompt. It's a reference.

So you point Claude at a site that is already great. It studies the **system** behind it: the grid, the spacing, the type sizes, the colour roles, how sections are laid out, how things move. Then it builds a **brand-new site** on that system, with your name, your words and your colours. Nothing of theirs is left in it.

These two sites were built that way:

| | Studied | Built | Time | Checks |
|---|---|---|---|---|
| **[Takeline](sites/takeline/)** | Linear's homepage system: dark surfaces, hairline borders, glows, product UI in the hero | A production tool for AI-video teams (made up) | ~1 h incl. 8 QA rounds | 27 contrast pairs, 0 fails · 0 leftovers · 0 console errors |
| **[Cueline](sites/cueline/)** | Stripe's homepage system: gradient hero, framed grid, bento cards, dark dev band | Brand-deal payouts for creators (made up) | ~30 min + 6 QA rounds | 27 contrast pairs, 0 fails · 0 leftovers · 0 console errors |

Live: open `index.html` in this repo, or the GitHub Pages link in the sidebar.

Each site folder has a `PROCESS.md` with every prompt and every fix in order, plus the tokens, the component specs and the contrast report.

---

## The 6-step guide

You need [Claude Code](https://claude.com/claude-code), Python 3 and Node.

### 0. Install the skill

```bash
npx skills@latest add EasyAIHenry/site-remix
```

Or copy it by hand:

```bash
git clone https://github.com/EasyAIHenry/site-remix
cp -R site-remix/skill/site-remix ~/.claude/skills/
```

Then, once per project, run `npm i -D playwright && npx playwright install chromium` (it takes the screenshots).

### 1. Pick the reference

Pick one site with a look you'd pay for, not five. Good ones to study: Linear, Stripe, Vercel, Raycast, Arc, Apple product pages. Pick one whose layout suits what you sell.

> **Prompt:** `/site-remix Study https://linear.app (homepage only). I'm building a landing page for <your product, one line>.`

### 2. Recon: Claude writes the page down

It screenshots the site at desktop and phone size, then lists every section top to bottom, every component and its states, and what moves. It also names **the one idea** that makes the site feel premium (Linear: lit product UI on near-black; Stripe: a gradient that moves, inside a framed grid).

The screenshots stay in `remix/target/`, which is git-ignored, because they're someone else's design.

### 3. System: the look becomes numbers

Colour **roles** (background, surface, border, text, muted text, accent), the type scale, the spacing scale, radius, shadows, max width and motion timings all go into `tokens.json`. Every component uses those roles. Then:

```bash
python3 tools/contrast.py remix/tokens.json
```

That checks every text colour on every background it sits on. It fails anything under WCAG AA. This is the step Claude skips on its own, and why its pages often have grey-on-grey text.

### 4. Make it yours

Before any code, decide:

- **Name:** not an existing brand. Search it.
- **Accent colour:** clearly not theirs.
- **Words:** every word written fresh.
- **Fonts:** open fonts only (Inter, Geist, Manrope).
- **Icons:** an open set (Lucide).
- **Product visuals:** built in HTML/CSS.

> **Prompt:** `Name it, pick a palette that is clearly not theirs, rerun contrast.py, and list their name, product names, taglines, brand colours and fonts in remix/leftovers.txt.`

### 5. Build, section by section

> **Prompt:** `Build it section by section from recon.md. Tokens only, no raw hex. After each section, screenshot it at 1440 and 390 next to the reference section and fix the spacing and type until the rhythm matches. Motion last, respect reduced motion.`

### 6. Check, three rounds

```bash
python3 tools/leftovers.py remix/leftovers.txt .     # must print CLEAN
python3 tools/contrast.py remix/tokens.json          # must exit 0
node tools/capture.mjs http://localhost:8080 remix/build
```

> **Prompt:** `Do three rounds: screenshot, critique against the reference for spacing, type, alignment, contrast, motion and mobile, then fix. Zero console errors. Show me after round three.`

---

## What you never take

Their logo, icons, illustrations, photos, video, copy, product names, brand colour, font files and code. What you study is the system: proportions, rhythm, structure, motion. Nobody owns that, it's how good design works. What they own is the brand, and you bring your own.

## Repo

```
skill/site-remix/      the Claude skill: SKILL.md, tools/, templates/tokens.json
sites/takeline/        site 1 + PROCESS.md + its tokens, specs, contrast report
sites/cueline/         site 2 + PROCESS.md + its tokens, specs, contrast report
index.html             picks a site
```

## Credits

Icons: [Lucide](https://lucide.dev) (ISC). Fonts: Inter, Geist and JetBrains Mono (SIL OFL). Motion: [GSAP](https://gsap.com) from cdnjs. Takeline, Cueline and every customer, person and number on these pages are made up.

MIT © Henry Chua
