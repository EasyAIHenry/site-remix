#!/usr/bin/env python3
"""Find anything of the reference site left in your build. Standard library only.

    python3 leftovers.py remix/leftovers.txt site/

leftovers.txt: one term per line (their name, product names, taglines, brand
hex colours, font names, image or CDN hosts). Lines starting with # are notes.
Matching ignores case. Hex colours also match without the #.
Prints every hit with file and line, then CLEAN or the hit count. Exits 1 on hits.
"""
import os
import sys

SKIP_DIRS = {".git", "node_modules", "remix", "target", "build"}
TEXT_EXT = {".html", ".htm", ".css", ".js", ".mjs", ".ts", ".tsx", ".jsx", ".json", ".md", ".svg", ".txt", ".xml"}


def terms(path):
    out = []
    for line in open(path, encoding="utf-8"):
        t = line.strip()
        if t and not t.startswith("#"):
            out.append(t.lower())
        elif t.startswith("#") and len(t) in (4, 7) and all(c in "0123456789abcdefABCDEF" for c in t[1:]):
            out.append(t.lower())
    return out


def main(argv):
    if len(argv) != 3:
        print(__doc__)
        return 2
    words = terms(argv[1])
    hits = 0
    for root, dirs, files in os.walk(argv[2]):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            if os.path.splitext(name)[1].lower() not in TEXT_EXT:
                continue
            path = os.path.join(root, name)
            try:
                lines = open(path, encoding="utf-8").read().lower().splitlines()
            except UnicodeDecodeError:
                continue
            for n, line in enumerate(lines, 1):
                for w in words:
                    if w in line or (w.startswith("#") and w[1:] in line):
                        hits += 1
                        print("%s:%d  %r" % (path, n, w))
    print("CLEAN" if not hits else "\n%d leftover(s) found" % hits)
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
