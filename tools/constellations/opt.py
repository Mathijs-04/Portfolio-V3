"""Usage: python tools/constellations/opt.py wide|tall [restarts]   (needs Pillow)

Random-search the placement of the 5 constellations so they clear the title, moon and ridge
on every test viewport, maximising the gap between constellations. Writes <mode>.txt; copy the
result into `at` in src/data/constellations.js. The geometry here mirrors skills.css,
atmosphere.css and base.css (nav height, title, moon, backdrop frame): keep them in sync."""
import math, random, itertools, sys, json
from pathlib import Path
from PIL import Image

HERE = Path(__file__).parent
BG = HERE.parents[1] / "public" / "fx" / "Background.webp"
exec((HERE / "shapes.py").read_text())  # SHAPES, MODES

_a = Image.open(BG).getchannel("A").resize((400, 1512))
PROFILE = []
for cx in range(400):
    t = 1.0
    for cy in range(1512):
        if _a.getpixel((cx, cy)) > 40:
            t = cy / 1512
            break
    PROFILE.append(t)


def geom(vw, vh, mode):
    m = MODES[mode]
    nav = 72
    frame_h = max(0.7 * vh, vw * 1512 / 4535)
    frame_w = frame_h * 4535 / 1512
    frame_x, frame_y = vw - frame_w, vh - frame_h
    fx0, fy0 = vw * m["side"], nav + 8
    fw = vw * (1 - 2 * m["side"])
    fh = (frame_y + m["bottom"] * frame_h) - fy0
    u = min(fw / m["cols"], fh / m["rows"])
    gx = fx0 + (fw - m["cols"] * u) / 2
    gy = fy0
    ms = min(max(56, 0.09 * vw), 104)
    moon = (vw - 0.12 * vw - ms / 2, 0.09 * vh + ms / 2, ms / 2 + 0.8 * ms * 0.5 + 24)
    tl = (vw - min(1240, vw - 32)) / 2
    ttop = nav + min(max(28, 0.06 * vh), 64)
    tsize = min(max(38.4, 0.05 * vw), 57.6)
    title = (tl - 10, ttop - 10, tl + tsize * 2.5 + 10, ttop + tsize + 10)

    def ridge(x):
        f = (x - frame_x) / frame_w
        if f < 0 or f >= 1:
            return vh
        c = int(f * 400)
        return frame_y + min(PROFILE[max(0, c - 4): c + 5]) * frame_h

    return dict(u=u, gx=gx, gy=gy, vw=vw, vh=vh, moon=moon, title=title, ridge=ridge)


def stars(name, x0, y0, mirror):
    pts, _ = SHAPES[name]
    w = max(p[0] for p in pts)
    return [(x0 + ((w - p[0]) if mirror else p[0]), y0 + p[1]) for p in pts]


def evaluate(place, views, verbose=False):
    """Returns (score, issues). score = min inter-constellation gap in units minus penalties."""
    pen = 0.0
    issues = []
    sets = {k: stars(k, *v) for k, v in place.items()}
    gaps = []
    for (k1, s1), (k2, s2) in itertools.combinations(sets.items(), 2):
        gaps.append(min(math.dist(p, q) for p in s1 for q in s2))
    for g in views:
        u = g["u"]
        for k, s in sets.items():
            for x, y in s:
                px, py = g["gx"] + x * u, g["gy"] + y * u
                # keep 0.45u from the screen edges
                e = min(px, g["vw"] - px) / u - 0.6
                if e < 0:
                    pen += -e * 4; issues.append(f"{k} edge")
                t = g["title"]
                dx = max(t[0] - px, 0, px - t[2]); dy = max(t[1] - py, 0, py - t[3])
                dt = math.hypot(dx, dy) / u - 0.6
                if dt < 0:
                    pen += -dt * 4; issues.append(f"{k} title")
                mx, my, mr = g["moon"]
                dm = (math.dist((px, py), (mx, my)) - mr) / u
                if dm < 0:
                    pen += -dm * 4; issues.append(f"{k} moon")
                dr = (g["ridge"](px) - py) / u - 0.9
                if dr < 0:
                    pen += -dr * 4; issues.append(f"{k} ridge")
    score = min(gaps) - pen
    if verbose:
        return score, min(gaps), sorted(set(issues))
    return score


def search(mode, views, iters=4000, restarts=40, seed=1):
    rnd = random.Random(seed)
    m = MODES[mode]
    names = list(SHAPES)
    best = None
    for r in range(restarts):
        place = {}
        for k in names:
            pts = SHAPES[k][0]
            w = max(p[0] for p in pts); h = max(p[1] for p in pts)
            place[k] = (rnd.uniform(0, m["cols"] - w), rnd.uniform(0, m["rows"] - h), rnd.random() < 0.5)
        cur = evaluate(place, views)
        temp = 0.5
        for i in range(iters):
            k = rnd.choice(names)
            x, y, mi = place[k]
            pts = SHAPES[k][0]
            w = max(p[0] for p in pts); h = max(p[1] for p in pts)
            nx = min(max(x + rnd.gauss(0, 0.4), -0.5), m["cols"] - w + 0.5)
            ny = min(max(y + rnd.gauss(0, 0.4), 0), m["rows"] - h)
            nm = (not mi) if rnd.random() < 0.05 else mi
            trial = dict(place); trial[k] = (nx, ny, nm)
            sc = evaluate(trial, views)
            if sc > cur or rnd.random() < math.exp((sc - cur) / max(temp, 1e-3)):
                place, cur = trial, sc
            temp *= 0.999
        if best is None or cur > best[0]:
            best = (cur, dict(place))
    return best


if __name__ == "__main__":
    mode = sys.argv[1]
    vps = [(1280, 800), (1024, 768), (1920, 1080), (2560, 1080), (1440, 900), (1366, 768), (1536, 864)] \
        if mode == "wide" else [(375, 812), (390, 844), (430, 932), (768, 1024), (360, 740)]
    views = [geom(w, h, mode) for w, h in vps]
    sc, place = search(mode, views, restarts=int(sys.argv[2]) if len(sys.argv) > 2 else 30)
    print(evaluate(place, views, verbose=True))
    with open(__file__.replace("opt.py", f"{mode}.txt"), "w") as f:
        for k, (x, y, mi) in place.items():
            f.write(f"{k}: {x:.2f} {y:.2f}{' m' if mi else ''}\n")
    print(open(__file__.replace("opt.py", f"{mode}.txt")).read())
