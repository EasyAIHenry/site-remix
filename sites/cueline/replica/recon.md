# Recon map: a large payments company's marketing homepage (web)

Scope: the public homepage only, as a design-system study. Not the product,
not the dashboard, not any logged-in screen.
For: a brand-new, original landing page (Cueline, a fictional creator
payouts product) that reuses the *system*, not the content.
Date: 2026-10-07

Screenshots of the original were taken at 1440x900 and 390x844 and live in a
private lab folder. They are reference only and are not in this repo.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | marketing homepage, desktop | the target's public homepage | 1440 wide, full page + 17 viewport slices |
| 2 | marketing homepage, mobile | same URL | 390 wide, full page + 25 viewport slices |
| 3 | computed sizes in the browser | same page, devtools-style measurement | font sizes, weights, line heights, section heights. Numbers only, no CSS or JS saved |

No logins, no source code, no network logging. Cookie banner declined.

## Core loop (for a marketing page)

Land, understand the claim in one sentence, see proof (logos, numbers),
scan the product in UI pictures, then click a CTA.

## Section inventory (desktop, top to bottom)

| ID | section | measured height | what it does | key components |
| --- | --- | --- | --- | --- |
| S01 | sticky nav | 76 | logo, 5 menu items with chevrons, sign-in ghost button, filled CTA | NavLink, Button (ghost, primary) |
| S02 | hero | ~610 | live counter line, two-tone headline (dark claim + muted continuation), 2 CTAs, a big diagonal animated colour ribbon bleeding off the top-right | Ticker, Display headline, Button pair, Gradient ribbon |
| S03 | logo strip | ~72 | 7 customer wordmarks in one row, hairline borders top and bottom, ribbon continues behind it | LogoWall |
| S04 | product bento | ~2200 | section lede in the two-tone style, then a 3-column card grid with mixed spans, each card a title + an expand button + a product UI picture built from UI (phone, checkout, usage meter, chat, card, globe, table) | BentoCard, ExpandButton, UI mocks |
| S05 | event promo | ~560 | one wide media card with headline + white pill button | MediaCard |
| S06 | dark stats band | ~980 | full-bleed deep navy band, centred headline, 4 stats in a row split by hairlines, particle burst art | StatRow, ParticleArt |
| S07 | segments + stories | ~4500 | enterprise / startup / platform blocks: heading left, short paragraph right, CTA, then story cards, accordion of story rows, 3-up "experts" list with small line icons, 2 promo tiles with gradient art, carousel of tall image cards | SplitHeader, StoryCard, AccordionRow, IconFeature, PromoTile, Carousel |
| S08 | dark developer band | ~2300 | "built for every stack" lede, integration diagram (boxes and lines around a central node), 3 stats over a glowing wave, 3 cards (no-code, directory, code editor with a terminal) | Diagram, StatRow, CodeCard |
| S09 | news / letters | ~1800 | carousel with arrow buttons, wide editorial card | Carousel, ArrowButton |
| S10 | final CTA | ~380 | "ready to start" headline + 2 buttons on the left, 2 icon links on the right | CTA block |
| S11 | footer | ~1100 | pale grey band, 4 dense link columns, locale picker, copyright | FooterColumn |

Page height: 14,631 px desktop, 20,382 px mobile.

## Layout system (measured)

- Page frame: 1264 px wide, centred, drawn with 1px vertical hairlines that
  run the full page height (at x = 88 and x = 1352 on a 1440 viewport).
- Content column: 1232 px (16 px inside the frame on each side).
- Header and section dividers: 1px hairlines in a pale blue-grey.
- Hero copy is inset further (starts ~120 px in from the frame) and sits on
  the left 70 %; the colour ribbon owns the right side and bleeds off-canvas.
- Bento: 3 columns, 16 px gutters, cards span 2+1, then 1+1+1, then a full
  width card. Cards are white with a 1px border and a very soft shadow; the
  art inside bleeds to the card edge on the bottom.
- Sections breathe: ~96 to 128 px between blocks on desktop, ~64 px on mobile.
- Mobile: frame lines disappear, content goes to a 16 px gutter, bento
  collapses to one column, nav becomes a square menu button, CTAs go full width.

## Type (measured, then snapped)

The original uses a licensed geometric grotesk at a **light weight (300)** for
almost every heading. That light weight is the signature, so we keep the
*weight and tracking*, not the font.

| role | desktop | mobile | weight | tracking |
| --- | --- | --- | --- | --- |
| hero display | 48 / 1.15 | 34 / 1.03 | 300 | -0.02em |
| section lede (h2) | 32 / 1.1 | 22 / 1.2 | 300 | -0.02em |
| card title (h3) | 26 / 1.12 | 20 / 1.2 | 300 | -0.01em |
| big stat | 48 / 1.03 | 34 | 300 | -0.02em |
| body large | 18 / 1.4 | 16 | 300 | 0 |
| body | 16 / 1.4 | 16 | 300-400 | 0 |
| nav / small | 14 / 1.4 | 14 | 400 | 0 |
| UI-mock text | 9 to 12 | same | 300-400 | slight negative |
| code | 12 / 2.0 mono | same | 500 | 0 |

Pattern used everywhere: **dark claim sentence, then a muted grey
continuation sentence in the same size** ("X. Y and Z."). Two colours, one
size, no bold.

## Colour roles (measured)

| role | what it is on the original |
| --- | --- |
| bg | pure white |
| surface | very pale blue-grey (footer, tiles) |
| border | pale blue-grey hairline |
| text | very dark navy, not black |
| text-muted | mid blue-grey (continuation sentences) |
| text-body | slightly darker blue-grey (paragraphs) |
| accent | a saturated violet-blue (buttons, links) |
| dark band | deep navy |
| hero ribbon | a warm multi-stop gradient (orange, pink, violet, blue) |

Rebrand note: the accent and the ribbon colours are the trade dress. Both get
replaced (see brand.md).

## Components

| component | variants | states | used in |
| --- | --- | --- | --- |
| Button | primary (filled accent), secondary (white, hairline), on-dark (white fill) | default, hover (chevron nudges right), focus, active | S01, S02, S07, S10 |
| NavLink | with chevron, plain | hover, focus, open | S01 |
| Ticker | label + live number | counting | S02 |
| Gradient ribbon | hero | animated, reduced-motion still | S02 |
| LogoWall | row of 7 marks | static, marquee on mobile | S03 |
| BentoCard | wide, narrow, full | default, hover lift, expand button | S04 |
| UI mock | phone, checkout form, meter, bar chart, chat, card, table | static, subtle loop | S04 |
| StatRow | 3 or 4 stats with hairline dividers | count-up on enter | S06, S08 |
| SplitHeader | heading left, paragraph right, CTA | - | S07 |
| IconFeature | line icon, bold lead-in + muted text, link | - | S07 |
| CodeCard | editor with line numbers + terminal | typing loop | S08 |
| Carousel | arrow buttons | prev/next disabled | S07, S09 |
| FooterColumn | heading + link list | hover | S11 |

## Feature matrix

See `features.csv`. Must: 10, should: 6, could: 3, skip: 3.

## Out of scope

- The customer logos, photos, videos and case-study content (theirs).
- The event promo with a real speaker photo.
- The book / letters editorial content.
- The exact ribbon artwork and particle globe (we write our own shader).
- The licensed typeface.

## Size

11 sections, 1 page, about 13 reusable components. Hard parts: the
animated gradient in the hero (needs a shader that looks premium, not a CSS
blob), the density and polish of the UI mocks, and keeping the hairline grid
aligned at every breakpoint. Size: S (one long session).
