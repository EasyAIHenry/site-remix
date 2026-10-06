import sys, glob
from PIL import Image
d, prefix, out, per = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 6
files = sorted(glob.glob(f"{d}/{prefix}-s*.png"))
ims = [Image.open(f).convert("RGB") for f in files]
w = 300; ims = [im.resize((w, int(im.height * w / im.width))) for im in ims]
for k in range(0, len(ims), per):
    chunk = ims[k:k+per]
    sheet = Image.new("RGB", (len(chunk) * (w + 10), max(i.height for i in chunk)), (60, 60, 60))
    for j, im in enumerate(chunk): sheet.paste(im, (j * (w + 10), 0))
    sheet.save(out.replace(".png", f"-{k//per}.png"))
    print(out.replace(".png", f"-{k//per}.png"))
