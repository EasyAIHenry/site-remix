# Parity report: Takeline vs the target homepage

Tool: `replica-diff/imgdiff.py` in layout mode (edge maps on a grid; colour is ignored on purpose).
Both sides captured with headless Chrome at the same viewport (1440x900 desktop, 390x844 mobile @2x), after a slow scroll so every reveal had fired.
Original screenshots stay in the private lab folder. Only the scores (JSON) are published here.

## Layout scores (final build)

| screen | score | verdict | file |
| --- | --- | --- | --- |
| Desktop fold (header + hero) | **56.8** | partly | `desktop-fold.json` |
| Principles (3 columns) | 50.1 | partly | `section-principles.json` |
| Chapter (split head + mock) | 36.4 | different | `section-chapter.json` |
| Changelog | 65.1 | partly | `section-changelog.json` |
| Testimonials | **75.2** | close | `section-testimonials.json` |
| CTA + footer | 34.3 | different | `section-footer.json` |
| **Average of the six section windows** | **53.0** | partly | |
| Desktop full page | 21.4 | different (6% taller) | `desktop-full.json` |
| Mobile fold | 30.2 | different | `mobile-fold.json` |
| Mobile full page | 17.8 | different (127% taller) | `mobile-full.json` |

How to read this:

- The section windows are the fair comparison. Each one anchors both pages on the same landmark (the section title, the first card) and compares one 1440x900 view.
- Full-page scores are low by design of the tool: one section of a different height shifts everything below it, so every later cell "moves". The page is 6% taller on desktop.
- On mobile the original hides most product mocks and is ~5,900px tall. Takeline keeps its mocks (bled off the right edge) for the screen recording, so it is ~13,300px tall.
- The lowest windows are the ones with the most original content inside the system: the chapter mock (a compare grid + credits chart instead of a roadmap + scatter chart) and the footer (5 short columns vs 5 long ones). The skeletons match: split head, hairline, link columns, legal row.
- The skill's own rule: do not chase pixel parity. Its exact look is its trade dress.

## Feature parity

`python3 parity.py replica/features.csv` → **100.0** (20 of 20 must-haves, 25 counted). Two rows skipped on purpose (real customer logos; a code-diff mock that has no job in a video product). One row added that the original does not have (bento grid). This is a self-scored inventory of homepage patterns, so treat it as a checklist, not a benchmark.

## Behaviour diff

| flow | original | Takeline | keep / fix |
| --- | --- | --- | --- |
| Reach the sign-up | header pill always visible | header pill always visible | keep |
| Mobile nav | menu button | menu button, full-height sheet, scroll lock, aria-expanded | keep |
| Reduced motion | not checked | all motion off, everything visible | keep |
| Product mocks | static or video-like | live HTML: typing, progress, synced playheads, key presses | keep (it is the reel's hook) |

## Verdict

Shippable as a showcase: every must-have pattern is there, contrast passes, sweep is clean, zero console errors. Layout sits at "partly" on purpose: same system, different product.
