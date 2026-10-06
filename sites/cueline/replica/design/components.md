# Cueline components

Every component uses the custom properties in `tokens.css`. Icons are Lucide
(ISC/MIT), inlined as SVG. Copy is Cueline's own.

```
Button
  variants  primary (accent fill), secondary (white, hairline border), on-ink (white fill on dark), ghost-link
  sizes     sm 36px (nav), md 44px (hero and sections)
  states    default, hover (darker fill + chevron slides 3px right), active (1px down),
            focus-visible (2px white + 2px accent ring), disabled (n/a on a marketing page)
  tokens    bg accent / accent-hover, text on-accent, radius sm (6), font 16/500
  a11y      real <a> or <button>, chevron is aria-hidden, focus ring always visible
  used on   S01, S02, S04, S07, S08, S10

NavLink
  variants  with chevron (opens nothing, decorative), plain
  states    default text, hover text-muted, focus-visible ring
  tokens    font sm/400, text
  mobile    hidden below 900px, replaced by MenuButton + slide-down panel
  a11y      <nav aria-label>, menu button has aria-expanded + aria-controls, Esc closes

Ticker (hero counter)
  content   "Paid out to creators today" + a live dollar number
  states    counting (rAF), reduced-motion (static number)
  tokens    xs/500 text + text-muted number, tabular-nums
  a11y      aria-live="off" (decorative motion), number readable as text

GradientRibbon (hero art)
  build     own WebGL fragment shader: domain-warped noise flowing along a diagonal band,
            mapped to deep -> lagoon -> mint -> lime -> sun, fine streaks + grain
  states    animating, paused when off-screen, reduced-motion = one still frame,
            no-WebGL = CSS conic/linear gradient fallback
  a11y      canvas aria-hidden, no text on top of busy colour

LogoWall
  content   7 made-up marks (simple geometric glyph + wordmark), grey (text-muted)
  states    static row on desktop, auto-scroll marquee on mobile, paused for reduced motion
  a11y      list with aria-label "Teams paying creators with Cueline"; each mark has a visually hidden name

BentoCard
  variants  wide (span 2), narrow (span 1), full (span 3)
  parts     h3 title, ExpandButton (top-right, 36px square, accent-soft), UI mock area that bleeds
  states    default, hover (border-strong + slight lift on the mock), focus-within ring
  tokens    bg, border, radius lg (12), shadow card, padding 24
  mobile    single column, mock scales down with transform

UI mocks (all HTML/CSS, no images)
  DealInbox   brand brief row list with status pills (Draft / Signed / Paid)
  Contract    e-sign panel with deliverables, usage window, rate
  SplitPay    payout split to editor / manager / you, with a ring chart (SVG)
  RateCard    rate calculator with a slider and a live number
  Invoice     invoice + "auto-reminder sent" timeline
  Globe-ish   dot-matrix map of payout currencies (canvas)
  MediaKit    a public media-kit page in a browser frame
  states      subtle loops (status flips to Paid, bars grow) only when on screen

StatRow
  variants  4-up on dark band, 3-up in developer band
  parts     big number (stat/300), label (sm, on-ink-muted), hairline dividers
  states    count-up on first view (once), reduced motion = final number
  mobile    2x2 grid

SplitHeader
  parts     h3 + CTA left, paragraph right
  mobile    stacks

StoryCard
  parts     gradient art tile (CSS), creator type, metric pair, link with chevron
  states    hover: art shifts, link chevron slides

IconFeature
  parts     24px Lucide icon in a hairline square, bold lead-in + muted sentence, link
  used on   S07, S10

CodeCard
  parts     window chrome, file tab, line numbers, highlighted code, terminal strip
  states    terminal lines type in once when visible; reduced motion shows them all
  tokens    ink-surface bg, mono 12/2.0
  a11y      real <pre><code>, copy is selectable

Diagram
  parts     central Cueline node, 6 satellite pills, SVG connector lines with travelling dots
  states    dots animate; reduced motion = static lines

FooterColumn
  parts     heading (sm/500), link list (sm/300 text-body)
  tokens    surface bg, border top
```
