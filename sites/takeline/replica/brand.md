# Brand: Takeline

**Concept:** the production system for AI-video teams. Briefs, prompts, takes and sign-off on one timeline.
**Audience:** creators and small studios who ship generated video every week (ads, reels, music videos).
**Status:** fictional. Built as a design-system study. Not a real company.

## Name

Candidates considered: Takeline, Framestack, Reelyard, Cutfold, Shotwise.

Picked **Takeline**: a "take" is one attempt at a shot (every AI generation is a take), and "line" is the timeline the whole page is about. Two syllables, spellable after hearing it once. No overlap in sound, look or meaning with the target site's name, and no pun on it.

### Checks

| check | result | date |
| --- | --- | --- |
| web search "Takeline" app video | no product by that name found; nearby names exist ("TakeOne", "Takes", "Takl") but differ | 2026-10-07 |
| web search "Framestack" | close to an existing AI video tool name (FramePack), dropped | 2026-10-07 |
| web search "Reelyard" | nothing exact, but several "Reely-" apps, dropped | 2026-10-07 |
| whois takeline.com | registered since 2011 (held at a domain reseller) | 2026-10-07 |
| whois takeline.app / takeline.video | no record returned by the local whois; not confirmed either way | 2026-10-07 |
| US trademark (USPTO, classes 9 and 42) | to run | |
| EU trademark (EUIPO / TMview) | to run | |
| WIPO Global Brand Database | to run | |
| App Store / Play exact name | to run | |
| handles (X, Instagram, TikTok, GitHub) | to run | |

These are screening checks, not legal clearance. Fine for a fictional demo; a real launch needs a trademark lawyer.

## Palette

Written into the same token roles replica-design measured. Only the values changed.

| role | value | note |
| --- | --- | --- |
| bg | `#0a0908` | warm near-black (the target's is a cool near-black) |
| surface / surface-2 / surface-3 | `#121110` / `#1a1816` / `#22201d` | warm steps |
| text / text-2 | `#f5f2ee` / `#d6d0c9` | paper-warm whites |
| text-muted / text-subtle | `#9b948c` / `#8a837b` | both AA on bg |
| accent | `#ff6a3d` | **ember**: the "recording" light, a different hue family from the target's blue-violet |
| accent-2 | `#ffb35c` | amber, for glows and gradients |
| success / warning / danger / info | `#5fd49a` / `#f5c451` / `#ff6b6b` / `#7ab8ff` | status only |
| quote-warm / quote-ember | `#ffc9a8` / `#ff7a4d` | testimonial cards |

Contrast: `python3 contrast.py tokens.json` → 27 pairs, **0 failing AA**. Report in `design/contrast-report.txt`.

The target's brand colour and its measured greys are in `brand.json` so the sweep catches them if any survive.

## Logo brief

- **Idea:** two takes, slightly offset: the one in front is the keeper; an ember dot is the record light.
- **Mark type:** symbol + wordmark ("Takeline" set in Geist 600, tight tracking).
- **Works at:** 16px favicon (`assets/favicon.svg`) and large app icon.
- **Must not resemble the target's mark:** the target uses a circle filled with diagonal stripes. Takeline uses two rounded rectangles and a dot. No shared shape, colour pair or letterform trick (checked side by side).
- Deliverables made: inline SVG mark, `assets/favicon.svg`. Still to make for a real launch: 1024 app icon, 1200x630 social image.

## Voice

Three words: **direct** (not blunt), **crafty** (not jargon), **calm** (not sleepy).

| do | don't |
| --- | --- |
| "Clear forty takes before lunch." | "Supercharge your workflow." |
| Name the real object: shot, take, seed, frame. | Say "assets" or "content" when you mean a shot. |
| One idea per sentence. | Stack three benefits with commas. |
| Plain verbs: run, pick, ship. | "Leverage", "unlock", "empower". |
| Numbers that a studio would track. | Vague superlatives. |

Most-seen strings, written fresh in that voice: "Start free", "Book a demo", "Log in", "Run every AI video project like a real production", "Briefs, prompts, takes and sign-off on one timeline.", "See the board", "How runs work", "Try a guest review", "Every update", "Studio stories", "Your next reel starts on one timeline."

## Sweep

```bash
python3 ~/.claude/skills/replica-brand/sweep.py . --config replica/brand.json
# Clean. Nothing of the original's name, domain or colours found.   (exit 0)

python3 ~/.claude/skills/replica-brand/sweep.py . --avoid "Linear"
# 39 hits, exit 1. Every one is the CSS keyword: 42x linear-gradient, 2x SVG linearGradient,
# 4x the "linear" animation timing. Proved line by line with replica/sweep-keywords.py.
```

Also checked by eye: favicon, page title, meta description, footer, alt/aria labels.
