# Components: Takeline

Every value comes from `tokens.css` (generated from `tokens.json`). Icons are Lucide (ISC licence), inlined as an SVG sprite.

```
Button
  variants  light (primary), dark (secondary)
  sizes     sm 32px (header), md 44px (CTA)
  states    default, hover (light: white + 4px soft ring; dark: one surface step up), active (scale .98), focus-visible (2px accent ring, 3px offset)
  tokens    bg button-light / surface-2, text on-button-light / text, radius pill, font 17/520 (sm 13)
  a11y      real <a> to an in-page anchor; visible focus
  used on   S01, S12

Nav link
  variants  header pill, footer column link, mobile sheet link
  states    default (text-muted), hover (text + 4% fill), focus-visible
  tokens    font sm, radius pill, padding 6/12
  used on   S01, S13

Menu button (mobile only, <=720px)
  states    closed (aria-expanded=false, label "Open menu"), open (full-height sheet, body scroll locked, label "Close menu")
  a11y      <button> with aria-controls="mnav"

Text link with arrow ("more")
  states    default text-muted, hover text + arrow gap grows 6 -> 10px
  used on   hero news link, every chapter lede, changelog, voices

Type roles
  display   64/64 540 -0.026em (mobile 44/48)
  h2        48/48 540 -0.024em (mobile 32/36)
  mega      72/72 540 -0.03em  (closing CTA, mobile 40/44)
  lede      22/32 400 text-2   (mobile 18/27)
  h3        20/26 560
  base      15/24 400 -0.011em
  sm        13/20, xs 12/16, mono-xs 11/16 uppercase +0.06em (labels, dates)

Split head
  layout    2 columns, 64px gap, right column starts at the halfway line; stacks under 960px
  used on   S06-S10

Product mock frame
  tokens    gradient surface-2 -> surface, 1px border at 12% hairline, radius xl (16), shadow panel
  behaviour edge masks fade the bottom/right, ember glow below, parallax drift on scroll (GSAP)
  states    live: typing caret, progress bars that creep and loop, synced playhead, pulsing comment pin
  a11y      hero mock is role="img" with a full description; mocks are decorative otherwise
  used on   S02 (app), S06 (brief + board), S07 (compare + credits), S08 (player + notes)

Status glyph
  variants  todo (subtle ring), prompting (dashed info ring), rendering (accent pie), done (filled success)

Tag / chip
  height 22, radius pill, 1px border, optional 6px colour dot, optional mini progress bar

Feature link list
  two <ul> columns split by a hairline; items 16/22 text-muted with a + icon that turns 90deg and goes accent on hover

Line figure (S05)
  SVG, 1px strokes at 42% warm white, one accent dot; draws in on reveal (stroke-dashoffset), dot pops in last

Bento tile (S09)
  variants  1 col, wide (2 cols), full (3 cols, copy left / visual right)
  states    hover: border brightens, cursor-following ember spotlight
  inside    command palette, key caps, render queue, swatches, sparkline, integration hub

Timeline item (S10)
  dot 11px; newest = accent with glow + ping ring; line draws left -> right on reveal; mono date

Quote card (S11)
  variants  warm (peach gradient + ring art, 2fr), ember (solid + amber corner glow, 1.25fr)
  tokens    text on-quote / on-quote-muted (AA checked), radius lg, min-height 480

Reveal (global)
  [data-reveal]: opacity 0 -> 1, translateY 16px -> 0, blur 6px -> 0 over 900ms expo-out; siblings stagger 90ms
  hero headline: per-word stagger 55ms
  prefers-reduced-motion: all transitions/animations collapse to instant, marquee stops, GSAP layer is skipped
```
