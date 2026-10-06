#!/usr/bin/env python3
"""tokens.json -> tokens.css custom properties."""
import json, sys
src, dst = sys.argv[1], sys.argv[2]
t = json.load(open(src))
L = ["/* Generated from replica/design/tokens.json. Edit the JSON, not this file. */", ":root {"]
for k, v in t["color"].items(): L.append(f"  --c-{k}: {v};")
for k, v in t["hairline"].items(): L.append(f"  --line-{k}: {v};")
L.append(f"  --font-sans: {t['font']['sans']};")
L.append(f"  --font-mono: {t['font']['mono']};")
for k, v in t["type"].items():
    L.append(f"  --fs-{k}: {v['size']}px; --lh-{k}: {v['line']}px; --fw-{k}: {v['weight']}; --tr-{k}: {v['tracking']};")
for i, v in enumerate(t["space"]): L.append(f"  --s-{i}: {v}px;")
for k, v in t["layout"].items():
    L.append(f"  --layout-{k}: {v}{'px' if isinstance(v,int) and k!='grid-cols' else ''};")
for k, v in t["radius"].items(): L.append(f"  --r-{k}: {v}px;")
for k, v in t["shadow"].items(): L.append(f"  --shadow-{k}: {v};")
for k, v in t["motion"].items(): L.append(f"  --m-{k}: {v};")
L.append("}")
open(dst, "w").write("\n".join(L) + "\n")
print("wrote", dst, len(L), "lines")
