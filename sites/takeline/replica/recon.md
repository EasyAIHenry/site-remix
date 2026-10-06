# Recon map: linear.app homepage (web)

Scope: the marketing homepage only, as a design system to build on. Not the app, not any other page.
For: a brand-new fictional product (Takeline, a production tool for AI-video teams) that borrows the *system*, not the brand.
Date: 2026-10-07

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | marketing homepage, desktop 1440x900 | https://linear.app/ | full page + 12 viewport slices, read at human speed (one visit) |
| 2 | marketing homepage, mobile 390x844 | https://linear.app/ | full page + 7 slices |
| 3 | computed styles in the browser | https://linear.app/ | measured like a colour picker would: font sizes, weights, line heights, border colours, radii. No source code, bundles or network calls saved |

Screenshots stay in the private lab folder. None are in this repo.

## Core loop (for a homepage)

Land, read one sentence, see the product working, scroll through four "chapters" that each pair a big two-word title with a live-looking product mock, then hit a closing call to action.

## Section inventory (desktop page is ~9,960px tall)

| ID | section | what it does | key components | states seen |
| --- | --- | --- | --- | --- |
| S01 | header | fixed, 73px, transparent with a 20px backdrop blur and a 1px hairline at 8% white | wordmark, 6 nav links as 13px pills, divider, quiet log-in link, light pill CTA | default, scrolled (same), mobile (logo + 2 buttons + menu) |
| S02 | hero | 64px/64px headline, two lines, left aligned; 15px muted subline left with a "new feature" link on the same baseline at the right | display heading, text link with arrow, app mock (sidebar + detail + floating agent panel) in a 16px-radius frame that runs off the fold, soft grey light under it | load (fades up), mobile (headline wraps to 4 lines, mock bleeds off the right edge) |
| S03 | logo wall | 7 customer wordmarks in one row, mono uppercase caption under them | wordmark row, mono caption | static |
| S04 | statement | one paragraph at h2 size (48px), first sentence bright, the rest muted | two-tone paragraph | static |
| S05 | principles | 3 columns divided by vertical hairlines; each has a mono "figure" label, a line-art isometric drawing, a 15px title and 15px muted body | figure label, line illustration, column divider | static |
| S06-S09 | four chapters | each starts with a full-bleed hairline, then a 2-column split: 48px two-line title left, ~24px lede + "learn more" right (right column starts at the page's halfway line). Then a large product mock with faded edges, then a "Features" label with two short link lists split by a vertical hairline, each item with a + icon | split head, lede, text link, product mock, feature link list | hover on list items |
| S10 | changelog | 48px title, a horizontal rule with 4 dots (newest in a warm accent), 4 columns of title / two-line excerpt / mono date, "view all" link | timeline, mono date | static |
| S11 | testimonials | two large colour cards (one wide pastel gradient, one narrow neon), 32px quotes, company mark + name/role row, then a stat sentence with a link at the right | quote card | static |
| S12 | closing CTA | centred 72px two-line headline, light pill + dark pill buttons, lots of air | CTA pair | static |
| S13 | footer | hairline, mark top-left, 5 link columns at 13px, legal row | link column | hover |

## Flows

```
F01 Visitor understands the product and starts
    S02 hero -> S06..S09 chapters -> S12 CTA -> sign-up
    happy path clicks: 1 (header CTA is always on screen)
    edge: mobile menu, reduced motion, slow network (fonts/images)
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button (pill) | light (primary), dark (secondary), small (header) | default, hover, focus, active | S01, S12 |
| Nav link (pill) | header, footer column | default, hover, focus | S01, S13 |
| Text link with arrow | lede link, news link, view-all | default, hover (arrow shifts) | S02, S06-S11 |
| Display / h2 / lede / body / mono label | type roles | n/a | all |
| Product mock frame | hero app, chapter mock | static, animated (typing, progress) | S02, S06-S09 |
| Feature link list | two columns with divider | hover | S06-S09 |
| Line figure | 3 drawings | static | S05 |
| Timeline item | newest, older | static | S10 |
| Quote card | wide gradient, narrow solid | static | S11 |
| Footer column | n/a | hover | S13 |

## Measured system (feeds replica-design)

- Background near-black, one step lighter surface for panels, ~5 grey text roles (bright, secondary, muted, subtle, faint).
- Hairlines are white at 5%, 8% and 12% opacity. 8% is by far the most used border.
- Type: one sans family, weight ~510 for headings (a variable font in between regular and medium), tight negative tracking (-0.022em on display and h2), body 15px/24px, small 13px, labels 12px mono uppercase.
- Scale: 72 / 64 / 48 / 24 / 20 / 15 / 13 / 12.
- Layout: 1280px content with 80px gutters at 1440. Two-column split puts the right column at the halfway line. Sections ~160px top padding.
- Radii: pills (9999px) for buttons and nav, 8 / 12 / 16 for panels.
- Motion: reveal on scroll (fade + small rise), product mocks have masked edges, a soft light under the hero frame.
- Accent: one brand colour (a blue-violet) used sparingly. Recorded as the `accent` role only; not used.

## Inferred data model

Not applicable: this is a static marketing page. Content is hard-coded per section.

## Feature matrix

See `features.csv`. Must: 20, should: 5, could: 2 (both skipped), plus 1 added (bento grid).

## What cannot be cloned (and was not)

- The logo, wordmark, product name, product screenshots and icons.
- The copy. Every word on the Takeline page is new.
- Customer logos and testimonials (real companies and people). Takeline uses invented studios and is labelled as fictional.
- The licensed typeface. Takeline uses Geist and Geist Mono (SIL Open Font License) from Google Fonts.
- The brand colour. Takeline's accent is an ember orange from a different hue family.

## Size

S (a few hours): one page, 13 sections, no backend.
