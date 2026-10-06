#!/usr/bin/env python3
"""Readable-text check for a site-remix token file. Standard library only.

    python3 contrast.py remix/tokens.json
    python3 contrast.py "#8a8f98" "#08090a"

tokens.json needs a "color" object of role -> hex and a "checks" list:
    [["text", "bg"], ["text-muted", "surface", "large"], ["border-strong", "bg", "ui"]]
"large" = 24px+ (or 18.66px+ bold), "ui" = borders, icons, focus rings.

WCAG 2.2 AA: body 4.5:1, large and ui 3:1. Exits 1 if anything fails.
"""
import json
import sys

AA = {"body": 4.5, "large": 3.0, "ui": 3.0}


def rgb(hex_value):
    h = hex_value.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    if len(h) != 6:
        raise SystemExit("not a 6-digit hex colour: %s" % hex_value)
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def lum(hex_value):
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb(hex_value)]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a, b):
    hi, lo = sorted((lum(a), lum(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def main(argv):
    if len(argv) == 3 and argv[1].startswith("#"):
        r = ratio(argv[1], argv[2])
        print("%.2f:1  body %s  large %s" % (r, "PASS" if r >= 4.5 else "FAIL", "PASS" if r >= 3 else "FAIL"))
        return 0 if r >= 4.5 else 1
    if len(argv) != 2:
        print(__doc__)
        return 2
    tokens = json.load(open(argv[1]))
    colors = tokens.get("color", {})
    checks = tokens.get("checks", [])
    if not checks:
        raise SystemExit("add a \"checks\" list to %s" % argv[1])
    failed = 0
    print("%-22s %-14s %-6s %8s  %s" % ("text", "on", "kind", "ratio", "AA"))
    for item in checks:
        fg, bg = item[0], item[1]
        kind = item[2] if len(item) > 2 else "body"
        if fg not in colors or bg not in colors:
            print("%-22s %-14s missing role" % (fg, bg))
            failed += 1
            continue
        r = ratio(colors[fg], colors[bg])
        ok = r >= AA[kind]
        failed += 0 if ok else 1
        print("%-22s %-14s %-6s %7.2f:1  %s" % (fg, bg, kind, r, "PASS" if ok else "FAIL (needs %.1f)" % AA[kind]))
    print("\n%d checks, %d failing" % (len(checks), failed))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
