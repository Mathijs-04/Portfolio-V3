"""The shapes picked for the sky (seeds from gen.py's cands.json) and the layout grids.
Keep MODES in sync with LAYOUTS in src/data/constellations.js."""
import json as _json
from pathlib import Path as _Path

_c = {s["seed"]: s for s in _json.load(open(_Path(__file__).with_name("cands.json")))}
PICK = {"A": 106, "B": 118, "C": 126, "D": 131, "E": 102}
SHAPES = {k: ([tuple(p) for p in _c[s]["stars"]], [tuple(e) for e in _c[s]["lines"]]) for k, s in PICK.items()}
MODES = {
    "wide": dict(cols=18, rows=6.8, side=0.03, bottom=0.52),
    "tall": dict(cols=8.4, rows=15, side=0.04, bottom=0.52),
}
