#!/usr/bin/env python3
"""Second opinion on a bare-word sweep.

The target's name is also a CSS keyword (linear-gradient, the `linear` timing
function, SVG linearGradient), so sweep.py --avoid "<name>" can never come back
clean on a stylesheet. This runs that sweep and checks every hit line by line:
anything that is NOT one of those keywords is printed and the script exits 1.

    python3 replica/sweep-keywords.py .            # from the site folder
"""
import json, re, subprocess, sys, os

SWEEP = os.path.expanduser("~/.claude/skills/replica-brand/sweep.py")
root = sys.argv[1] if len(sys.argv) > 1 else "."
out = subprocess.run([sys.executable, SWEEP, root, "--avoid", "Linear", "--json"], capture_output=True, text=True).stdout
hits = json.loads(out) if out.strip().startswith("[") else []
counts, other = {}, []
for h in hits:
    if not h["line"]:
        other.append((h["file"], 0, h["text"])); continue
    line = open(os.path.join(root, h["file"]), encoding="utf-8").read().splitlines()[h["line"] - 1]
    for m in re.finditer(r"linear[\w-]*", line, re.I):
        tok, ctx = m.group(0).lower(), line[m.start():m.start() + 24]
        if tok in ("linear-gradient", "lineargradient"):
            counts[tok] = counts.get(tok, 0) + 1
        elif re.match(r"linear(\s+(infinite|forwards|both|\d)|\"|')", ctx, re.I):
            counts["linear (timing)"] = counts.get("linear (timing)", 0) + 1
        else:
            other.append((h["file"], h["line"], ctx))
print("bare-word hits:", len(hits), "| CSS/SVG keyword uses:", counts)
if other:
    print("NOT keywords, fix these:"); [print("  %s:%s  %s" % o) for o in other]; sys.exit(1)
print("Clean: every hit is a CSS/SVG keyword, nothing of the original's name.")
