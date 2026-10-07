# Story-first scroll websites, built with Claude

**If you ask Claude for a website, you get the same purple gradient everyone gets. Give it a story to tell instead.**

Two websites built that way. Each one is a short film that plays as you scroll, and every line of text lands on its moment in the story.

| | The story | What you scroll through |
|---|---|---|
| **[Kuroyu](sites/kuroyu/)** — a late-night ramen counter | *Eighteen hours, one bowl.* A clock narrates one night, 08:00 to 02:00. | An empty bowl fills itself: broth, noodles, egg, chashu, steam. The noodle lift. The bowl un-builds back to 08:00. |
| **[The Hollow House](sites/hollow-house/)** — a Halloween attraction | *The Hollows never left.* A 1926 police case file you walk into. | Through the gate, up the foggy path, the door opens, down the hallway as the candles go out, she runs at you. Then a flashlight shows what's hidden in each room. |

Both products are made up. Open `index.html` to pick one.

**What it cost:** about US$4.60 of Higgsfield credits for all the film and stills of both sites (Kling 3.0 + GPT Image 2.5, at the Plus plan rate). Every prompt is in [`docs/PROMPTS.md`](docs/PROMPTS.md).

---

## How it's done (5 steps)

### 1. Write the story before any code
One device carries the whole page: a clock, a case file, a countdown. Then every section is *story beat → what moves → exact words*. The two briefs are in [`docs/`](docs/).

### 2. Make the first and last frame as stills
- Make the end state first (the finished bowl, the open door).
- Make the start state from it ("exactly the same photograph, the only change: the bowl is empty").

### 3. Make the film between them
Give both stills to Kling 3.0 (10 s, start + end frame, Pro, sound off). It only invents the motion in between, so your scroll lands exactly on the hero shot. Check a 1-frame-per-second contact sheet before you use it.

### 4. Build the page around the film
Claude turns each clip into frames and plays them on a canvas as you scroll (GSAP + Lenis). Every label is timed to the frame its moment happens. Text sits beside the film, never on it.

### 5. Review it like an award jury, then fix
Record a real scroll, then have a second Claude, briefed as a creative director at an award-winning studio, score it and list must-fixes with exact values. Repeat until it says ship.
- Round 1: both sites 4/10.
- Round 3: both sites 7.5/10.

---

## Use the skill

```bash
npx skills@latest add EasyAIHenry/site-remix -g -a claude-code -y
```

Or copy `skill/story-scroll/` into `~/.claude/skills/`. Then: `/story-scroll a website for <your business>`.

## Repo

```
sites/kuroyu/          the ramen site (static, no build step)
sites/hollow-house/    the haunted house site
docs/                  the two story briefs + every image/video prompt
skill/story-scroll/    the Claude skill
```

## Credits
Motion: [GSAP](https://gsap.com), [Lenis](https://lenis.dev). Icons where used: [Lucide](https://lucide.dev) (ISC). Fonts: Google Fonts (SIL OFL). Film and images: AI-generated on Higgsfield. Kuroyu, The Hollow House and everyone in them are made up.

MIT © Henry Chua
