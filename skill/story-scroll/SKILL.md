---
name: story-scroll
description: >-
  Builds a cinematic scroll website that tells one story: Claude writes the
  story first, AI makes the film (first and last frame as stills, then an
  image-to-video model fills the motion), and the page plays that film as you
  scroll, with every line of text and every animation timed to the story.
  Then a creative-director review loop until it clears an award-site bar. Use
  when the user says "make a scroll website", "website that tells a story",
  "site where it builds as I scroll", "cinematic landing page", or
  "/story-scroll".
---

# story-scroll

Claude builds generic websites when you ask for a website. It builds great
ones when you give it a story to tell. The order matters: story, then film,
then page, then review.

## 1. Story first (no code yet)

Write `BRIEF.md` with:
- **The one moment**: the sentence a visitor would say to a friend ("you scroll and the ramen builds itself").
- **The spine**: one device that carries the whole page. Kuroyu: a clock runs from 08:00 to 23:40 as the bowl builds. The Hollow House: a 1926 police case file you walk into.
- **The beats**: every section as story beat → what moves → the exact words. If a section isn't part of the story, cut it.
- **Feel**: palette (one accent), type direction, what it must never look like.

## 2. The film

For each scroll act, make the **first and last frame as stills**, then animate between them. The last frame of the scroll lands exactly on your hero shot.

1. Hero still (the end state), photoreal, lots of empty space for text beside it.
2. Start still from the hero as an image reference: "Exactly the same photograph… the only change: …".
3. Image-to-video with start + end frame (we used Kling 3.0 pro, 10 s, sound off on Higgsfield: 15 credits a clip).
4. Look at a 1 fps contact sheet before you use it. Re-roll if the camera drifts or parts morph.

All prompts we used are in `docs/PROMPTS.md`.

## 3. The page

- Turn each clip into an image sequence (WebP, 24 fps, ~1600 px desktop, a phone crop) drawn to a canvas by scroll progress. Smoother than scrubbing a video, works on phones.
- GSAP ScrollTrigger + Lenis. Pin each act. Preload the first frames, then coarse-to-fine.
- Every label and line lands on the exact frame its moment happens (read times off a 0.25 s contact sheet).
- Page colour sampled from the film, edges feathered, film grain ~5%, so the film sits in the page with no box.
- Text beside the subject, never on it. One accent colour. Reduced motion shows stills + all the words.

## 4. The review loop (the part that made it good)

Record a real scroll video on desktop and phone. Then have a separate reviewer, briefed as the executive creative director of an award-winning web studio, watch it frame by frame and return scores plus a must-fix list with exact values. Fix, re-record, review again until it says SHIP.

What the reviews caught on these two sites:
- A dead first screen (nothing moved for 700 px of scroll).
- The clock disagreeing with the labels.
- Chapters cross-fading into muddy double exposures (fade to black instead).
- The scare face shown five times before the scare, so it no longer scared.
- A sprint that froze then jumped (ease it over 680 ms).

Both sites went from 4/10 to 7.5/10 "Site of the Day" in three rounds.

## Never
- Start with code or a template.
- Bake text into the film. Real HTML on top.
- Ship without the scroll recording and at least two review rounds.
