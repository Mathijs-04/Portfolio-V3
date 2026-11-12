"""Usage: python tools/constellations/preview.py wide|tall 1280x800 [more sizes]

Draws the placements in <mode>.txt over the backdrop, with a label-sized box under every star,
as pv-<size>.png next to this script (not committed)."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

D = Path(__file__).parent
exec((D / "opt.py").read_text().split("if __name__")[0].replace("__file__", repr(str(D / "opt.py"))))


def load(mode):
    out = {}
    for line in (D / f"{mode}.txt").read_text().strip().splitlines():
        k, rest = line.split(":")
        v = rest.split()
        out[k.strip()] = (float(v[0]), float(v[1]), len(v) > 2)
    return out


def draw(vw, vh, mode):
    g = geom(vw, vh, mode)
    u = g["u"]
    img = Image.new("RGB", (vw, vh), (5, 5, 5))
    frame_h = max(0.7 * vh, vw * 1512 / 4535); frame_w = frame_h * 4535 / 1512
    bg = Image.open(BG).convert("RGBA").resize((round(frame_w), round(frame_h)))
    r, gg, b, a = bg.split()
    bg = Image.merge("RGBA", (r.point(lambda v: v * .75), gg.point(lambda v: v * .75), b.point(lambda v: v * .75), a.point(lambda v: v * .5)))
    img.paste(bg, (round(vw - frame_w), round(vh - frame_h)), bg)
    d = ImageDraw.Draw(img)
    mx, my, mr = g["moon"]
    d.ellipse([mx - mr, my - mr, mx + mr, my + mr], outline=(60, 60, 70))
    d.rectangle(g["title"], outline=(140, 110, 60))
    for k, (x0, y0, mi) in load(mode).items():
        pts = stars(k, x0, y0, mi)
        px = [(g["gx"] + x * u, g["gy"] + y * u) for x, y in pts]
        for a_, b_ in SHAPES[k][1]:
            d.line([px[a_], px[b_]], fill=(90, 90, 95))
        for (x, y), (_, _, m) in zip(px, SHAPES[k][0]):
            rr = 1 + m
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(235, 238, 245))
            lw = 1.6 * u
            d.rectangle([x - lw / 2, y + 7, x + lw / 2, y + 24], outline=(60, 80, 110))
        d.text((px[0][0] + 6, px[0][1] - 14), k, fill=(200, 80, 80))
    img.save(D / f"pv-{vw}x{vh}.png")


for a in sys.argv[2:]:
    w, h = map(int, a.split("x"))
    draw(w, h, sys.argv[1])
