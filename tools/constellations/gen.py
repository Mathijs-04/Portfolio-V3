"""Grow organic constellation shapes from seeds and draw a contact sheet to pick from.

A shape: `n` labelled stars grown as a wandering chain with the odd branch (uneven segment
lengths, no crossing lines, no star sitting on a line), maybe one closing edge, a random
rotation, plus a few faint unconnected 'dust' stars around it."""
import math, random, json, sys
from PIL import Image, ImageDraw

MIN_GAP = 0.85       # closest two stars of one constellation may be (units)
LINE_CLEAR = 0.38    # no star this close to a line it isn't on
LOOSE = 0.3          # chance a star joins without a line (a member the figure skips)


def seg_point_dist(p, a, b):
    ax, ay = a; bx, by = b; px, py = p
    dx, dy = bx - ax, by - ay
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(ax + t * dx - px, ay + t * dy - py)


def cross(a, b, c, d):
    def o(p, q, r):
        return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
    if a in (c, d) or b in (c, d):
        return False
    return (o(a, b, c) * o(a, b, d) < 0) and (o(c, d, a) * o(c, d, b) < 0)


def ok_edge(pts, edges, i, j):
    a, b = pts[i], pts[j]
    for k, p in enumerate(pts):
        if k not in (i, j) and seg_point_dist(p, a, b) < LINE_CLEAR:
            return False
    for (u, v) in edges:
        if len({u, v, i, j}) == 4 and cross(a, b, pts[u], pts[v]):
            return False
    return True


def grow(seed, n, max_w=5.2, max_h=3.4):
    rnd = random.Random(seed)
    for attempt in range(400):
        pts = [(0.0, 0.0)]
        heads = [rnd.uniform(0, 2 * math.pi)]
        edges = []
        good = True
        linked = [0]
        for i in range(1, n):
            loose = i >= 2 and rnd.random() < LOOSE
            parent = linked[-1]
            if loose or (i >= 3 and rnd.random() < 0.3):
                parent = rnd.choice(linked)
            placed = False
            for _ in range(60):
                ang = heads[parent] + rnd.gauss(0, 0.95)
                length = MIN_GAP + rnd.random() ** 1.5 * (0.7 if loose else 0.85)
                c = (pts[parent][0] + math.cos(ang) * length, pts[parent][1] + math.sin(ang) * length)
                if min(math.dist(c, p) for p in pts) < MIN_GAP:
                    continue
                trial = pts + [c]
                if not loose and not ok_edge(trial, edges, parent, i):
                    continue
                # the new star must not sit on an existing line
                if any(seg_point_dist(c, pts[u], pts[v]) < LINE_CLEAR for u, v in edges):
                    continue
                pts.append(c); heads.append(ang); placed = True
                if not loose:
                    edges.append((parent, i)); linked.append(i)
                break
            if not placed:
                good = False
                break
        if not good:
            continue
        # sometimes close a loop
        if rnd.random() < 0.35:
            cands = [(i, j) for i in linked for j in linked
                     if i < j and (i, j) not in edges and (j, i) not in edges
                     and 1.0 < math.dist(pts[i], pts[j]) < 1.9 and ok_edge(pts, edges, i, j)]
            if cands:
                edges.append(rnd.choice(cands))
        # rotate, normalise
        rot = rnd.uniform(0, 2 * math.pi)
        pts = [(x * math.cos(rot) - y * math.sin(rot), x * math.sin(rot) + y * math.cos(rot)) for x, y in pts]
        mx = min(p[0] for p in pts); my = min(p[1] for p in pts)
        pts = [(x - mx, y - my) for x, y in pts]
        w = max(p[0] for p in pts); h = max(p[1] for p in pts)
        if w > max_w or h > max_h:
            continue
        # brightness: one or two bright, the rest spread out (0..1)
        mags = sorted([rnd.random() ** 1.8 * 0.62 for _ in range(n)], reverse=True)
        mags[0] = rnd.uniform(0.85, 1.0)
        if rnd.random() < 0.5:
            mags[1] = rnd.uniform(0.65, 0.8)
        rnd.shuffle(mags)
        # dust: secondary stars in and around the shape that fill it out (not part of the figure).
        # Drawn after the shape, so changing this never changes the stars or lines of a seed.
        dust = []
        want = rnd.randint(9, 13)
        for _ in range(400):
            if len(dust) >= want:
                break
            base = pts[rnd.randrange(n)]
            ang = rnd.uniform(0, 2 * math.pi)
            r = rnd.uniform(0.3, 1.3)
            d = (base[0] + math.cos(ang) * r, base[1] + math.sin(ang) * r)
            if min(math.dist(d, p) for p in pts) < 0.28:
                continue
            if dust and min(math.dist(d, q[:2]) for q in dust) < 0.25:
                continue
            if any(seg_point_dist(d, pts[u], pts[v]) < 0.18 for u, v in edges):
                continue
            if d[0] < -0.4 or d[1] < -0.4 or d[0] > w + 0.4 or d[1] > h + 0.4:
                continue
            dust.append((d[0], d[1], 0.04 + rnd.random() ** 1.5 * 0.42))
        return dict(seed=seed, stars=[(round(x, 2), round(y, 2), round(m, 2)) for (x, y), m in zip(pts, mags)],
                    lines=edges, dust=[(round(x, 2), round(y, 2), round(m, 2)) for x, y, m in dust],
                    w=round(w, 2), h=round(h, 2))
    return None


def sheet(shapes, path, u=48):
    cols = 6
    cw, ch = int(6.8 * u), int(4.6 * u)
    rows = math.ceil(len(shapes) / cols)
    img = Image.new("RGB", (cols * cw, rows * ch), (8, 8, 9))
    d = ImageDraw.Draw(img)
    for k, s in enumerate(shapes):
        ox, oy = (k % cols) * cw + u * 0.6, (k // cols) * ch + u * 0.7
        P = [(ox + x * u, oy + y * u) for x, y, _ in s["stars"]]
        for a, b in s["lines"]:
            d.line([P[a], P[b]], fill=(55, 55, 58))
        for (x, y, m), p in zip(s["stars"], P):
            r = 1 + m * 2.4
            c = int(120 + 135 * m)
            d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=(c, c, c + 4))
        for x, y, m in s["dust"]:
            p = (ox + x * u, oy + y * u); c = int(60 + 200 * m)
            d.ellipse([p[0] - 0.8, p[1] - 0.8, p[0] + 0.8, p[1] + 0.8], fill=(c, c, c))
        d.text(((k % cols) * cw + 4, (k // cols) * ch + 2), str(s["seed"]), fill=(150, 70, 70))
    img.save(path)


if __name__ == "__main__":
    out = []
    for seed in range(int(sys.argv[1]), int(sys.argv[2])):
        n = 8 + seed % 4
        s = grow(seed, n)
        if s:
            out.append(s)
    json.dump(out, open(sys.argv[3], "w"))
    sheet(out, sys.argv[4])
    print(len(out))
