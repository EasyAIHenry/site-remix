# Build log

| ID | date | status | notes |
| --- | --- | --- | --- |
| S01 header | 2026-10-07 | done | fixed, blur, hairline; mobile sheet menu added in QA round 3 (first version let the hero show through) |
| S02 hero | 2026-10-07 | done | app mock is all HTML/CSS, frames are CSS gradients + clip-path skylines; GSAP tilt-to-flat on scroll; headline lengthened in round 4 to fill the hero like the original's |
| S03 logos | 2026-10-07 | done | fictional studios as typeset wordmarks, marquee |
| S04 statement | 2026-10-07 | done | words light up with scroll (GSAP scrub) |
| S05 principles | 2026-10-07 | done | figure 1 redrawn in round 2 (stacked plates were a tangle of overlapping diamonds) |
| S06 brief + board | 2026-10-07 | done | kanban hidden on mobile, brief card stays |
| S07 generate + compare | 2026-10-07 | done | frames cut from 16:9 to 2:1 in round 2 (panel was taller than the viewport) |
| S08 review + deliver | 2026-10-07 | done | notes panel clipped on mobile until the grid got minmax(0,1fr) |
| S09 bento | 2026-10-07 | done | last row left a hole (2+1 / 1+1+1 / 2); integration tile became a full-width row; visual heights equalised in round 8 |
| S10 changelog | 2026-10-07 | done | |
| S11 voices | 2026-10-07 | done | |
| S12 CTA | 2026-10-07 | done | |
| S13 footer | 2026-10-07 | done | mark was vertically centred; pinned to the top in round 2 |

Harder than expected: the brand sweep can never be clean on the bare name, because the target's name is a CSS keyword (`linear-gradient`). Solved with a second checker (`sweep-keywords.py`) that proves every hit is the keyword.
