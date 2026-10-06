---
name: site-remix
description: >-
  Builds a front end that looks designed, not generated. Claude studies a site
  that is already great (its layout, spacing, type scale, colour roles, motion,
  every section), writes that down as design tokens, checks the text is
  readable, then builds a brand-new original site on that system: your name,
  your words, your colours, nothing of theirs left. Use when the user says
  "build me a website that looks like X", "make my site look like Linear /
  Stripe / Apple", "my Claude websites all look the same", "remix this site",
  "steal the design system of", or "/site-remix".
---

# site-remix

Claude on its own builds the same page every time: a purple gradient, a big
centred headline, three cards. The fix is not a better prompt. It is a
reference. Give Claude a real system to work from and it builds to that bar.

What you take from the reference is the **system**: proportions, spacing
rhythm, type scale, how sections are laid out, how things move. That is how
good design works and nobody owns it. What you never take is listed in step 4.

All working files go in `remix/` in the project. Target screenshots go in
`remix/target/`, which stays out of git. The `tools/` and `templates/` named
below sit next to this file: copy them into the project first
(`cp -R <this skill folder>/tools <this skill folder>/templates .`).

## Step 1. Capture the reference

```bash
node tools/capture.mjs https://linear.app remix/target
```

Full page and one shot per screen height, at desktop 1440 px and phone 390 px.
Needs Playwright once: `npm i -D playwright && npx playwright install chromium`.

## Step 2. Recon: write the page down

Open the screenshots and fill `remix/recon.md`:

- **Sections**, top to bottom: what each one does (hero, proof, feature grid,
  product shot, testimonial, pricing, footer), its layout (columns, alignment,
  full bleed or contained) and its height on desktop.
- **Components**: buttons, nav, cards, badges, inputs, tabs. Every state you
  can see, plus hover, focus and disabled.
- **Motion**: what moves on load, on scroll, on hover. Durations and easing.
- **The one idea**: the single thing that makes this site feel premium. Name it.
  Most great sites have one (a lit hero, hairline borders, a gradient that
  breathes, huge type). Your build keeps that idea and re-makes it.

## Step 3. System: turn it into tokens

Measure, don't guess. Zoom into the screenshots.

- **Colour roles**, not colours: `bg`, `surface`, `surface-2`, `border`,
  `text`, `text-muted`, `accent`, `on-accent`. Real sites use 5 to 7 greys.
- **Type scale**: sizes, line heights, weights, letter spacing. Snap to a scale.
- **Spacing**: almost always a 4 or 8 base. Write the scale and the section
  padding.
- **Radius, shadow, borders**: two or three of each.
- **Layout**: max width, grid columns, gutters, breakpoints, nav height.

Write `remix/tokens.json` (see `templates/tokens.json`) and generate
`tokens.css` custom properties from it. Components only ever use the roles.
Then check every text colour on every background it sits on:

```bash
python3 tools/contrast.py remix/tokens.json
```

It fails (exit 1) under WCAG AA: 4.5:1 body text, 3:1 large text and UI.
Fix it in the tokens, never per component.

## Step 4. Make it yours

Before a line of code, decide the brand:

- **Name** that is not an existing brand (search it, check the .com and the
  Instagram handle).
- **Accent colour** that is clearly not theirs. Swap the values in
  `tokens.json`, keep the role names, run `contrast.py` again.
- **Copy**: every headline, label and button written fresh for your product.
- **Fonts**: open fonts only (Inter, Geist, Manrope, IBM Plex, Instrument
  Serif). Many big sites use licensed fonts.
- **Icons**: an open set (Lucide, Phosphor, Tabler), inline SVG.
- **Visuals**: product shots built in HTML/CSS, or images you made.

Never take: their logo, icons, illustrations, photos, video, copy, product
names, brand colour, font files or code. Write it all from scratch.

List their names, product names, taglines, brand hex values, font names and
image hosts in `remix/leftovers.txt`, one per line. You will sweep for them.

## Step 5. Build

Section by section, in the order of `recon.md`. For each one:

1. Build it from the tokens only (no raw hex, no magic numbers).
2. Screenshot it at 1440 and 390 next to the reference section.
3. Fix spacing, alignment and type until the rhythm matches. Not the content:
   the rhythm.

Motion last. Respect `prefers-reduced-motion`. Zero console errors.

## Step 6. Check

```bash
python3 tools/leftovers.py remix/leftovers.txt site/     # must print CLEAN
python3 tools/contrast.py remix/tokens.json              # must exit 0
node tools/capture.mjs http://localhost:8080 remix/build # same sizes as the target
```

Put `remix/target/` and `remix/build/` screenshots side by side and run three
rounds of critique and fix: spacing rhythm, type, alignment, contrast, motion,
mobile. Only show it to anyone after round three.

## Output

A site folder that opens from `index.html`, `remix/recon.md`, `remix/tokens.json`,
`tokens.css`, a clean contrast report, a CLEAN leftovers sweep, and before/after
screenshots that stay on your machine.
