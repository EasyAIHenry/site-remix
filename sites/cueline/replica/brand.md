# Cueline brand

**Cueline** is a fictional product made for a design-system demo. It is not a
real company and takes no money.

One line: sponsorship deals and payouts for creators. Brands send a brief,
the creator sends a rate card, both sign, the post goes live, the money lands
and is split with the editor and manager automatically.

## Name

Idea: a *cue* is the moment you are on; the *line* is the pipeline the deal
runs down, and the money line on the invoice. Short, spellable after one
hearing, says "creator" without saying "creator".

Candidates considered: Cueline, Dealcue, Tallyreel, Fernpay, Pennant.
Fernpay was dropped (too close to an existing dev-tools company called Fern);
Tallyreel was dropped (too close to TallyPay, a payments app). Pennant and
Dealcue were weaker on meaning.

| check | result | date |
| --- | --- | --- |
| web search "Cueline" + payments/creators | no product found; search engines autocorrect it to a luxury fashion house with a similar spelling (different category, but note it) | 2026-10-07 |
| web search "Dealcue" / "Tallyreel" / "Fernpay" | TallyPay and Fern exist, see above | 2026-10-07 |
| cueline.com | registered since 1999 (registry whois) | 2026-10-07 |
| cueline.io | registered May 2026 (registry whois) | 2026-10-07 |
| US trademark (tmsearch.uspto.gov, classes 9, 36, 42) | to run | |
| EU trademark (TMview) | to run | |
| WIPO Global Brand Database | to run | |
| App Store / Play exact name | to run | |
| handles (X, Instagram, TikTok, GitHub) | to run | |

These are screening checks, not legal clearance. The page uses
`.example` domains everywhere (`cueline.example`) so nothing points at a real
site. If this name were ever used for a real product it would need a
trademark search by a lawyer and a different domain.

## Palette

The reference system's accent is a saturated violet-blue on a near-black
navy, with a warm orange-pink-violet hero ribbon. Cueline moves to a
different hue family entirely: **green, teal and sun yellow**, money and
growth rather than violet.

| role | hex | use |
| --- | --- | --- |
| accent | #08775a | buttons, links, focus ring (5.53:1 on white) |
| accent-hover | #065f48 | hover |
| text | #0b201b | deep green-ink, not black |
| text-tint | #2c5e57 | hero continuation sentence |
| text-muted | #5b6f68 | lede continuations, labels |
| ink-bg | #052a22 | dark bands (forest, not navy) |
| ink-accent | #5cf0b8 | code keywords, highlights on dark |
| ribbon | #0a5a63 > #14b8c4 > #3fe0a8 > #c4f25a > #ffcf4a | hero shader, card art |

Contrast: `replica/design/contrast-report.md`, 27 pairs, 0 AA failures.
The reference site's colours are in `brand.json` so the sweep catches any
that survive.

## Logo brief

- Idea: a "C" that is also a cue point: an open arc with a sun-yellow dot
  sitting in the opening, like the playhead on an edit timeline.
- Type: symbol + lowercase wordmark ("cueline", Inter 600, tight tracking).
- Rounded-square tile in a teal-to-mint gradient so it reads at 16px.
- Deliverables: SVG mark (done, `assets/img/favicon.svg`), 1024 app icon,
  1200x630 social image (to do).
- Must not resemble the reference mark: theirs is a plain lowercase
  wordmark with no symbol; ours leads with a symbol and uses a different
  colour family. Checked side by side.

## Voice

Three words: **plain** (not dull), **on your side** (not cheesy),
**precise about money** (not salesy).

| do | don't |
| --- | --- |
| "Brand deals that pay on time." | big abstract claims about infrastructure |
| exact numbers: "$3,900, arrives Thu, Nov 6" | "fast payouts" with no number |
| name the people: editor, manager, studio | "stakeholders", "partners" |
| short second sentence in muted grey | stacked adjectives |
| say what it is not: "not a bank" | imply a licence we do not have |

Most-seen strings, written fresh: "Start free", "See a deal get paid", "Send
contract", "Reply with rate card", "3 payouts sent", "Waiting on Kettlebird",
"Ready to get paid properly?", "Talk to us", "Read the API docs", "Try the
sandbox".

## Made-up logo wall

Northpeak, Kettlebird, Orbitbrew, tidewell, Lumawell, Foldmark, Moonquay.
Each is a simple geometric glyph drawn here plus a wordmark in a system or
open font. None are real companies' marks. Creator names in the mocks
(Smallbatch Kitchen, Ridgeline Films, Pixel & Pine, Ana Ribeiro) are
invented.

## Sweep

```
python3 ~/.claude/skills/replica-brand/sweep.py . --config replica/brand.json
```

Run 1 (2026-10-07): 2 hits. A CSS class `art-f__stripes` matched the
original's name inside an identifier. Renamed to `art-f__lines`.
Run 2: **Clean.** See `PROCESS.md` for the final run.
