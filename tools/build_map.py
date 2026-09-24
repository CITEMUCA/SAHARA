"""Génère la carte du Royaume à partir des 12 régions officielles.

Sources : geoBoundaries (OpenStreetMap)
  - MAR ADM1 : 12 régions, dont les 3 régions des Provinces du Sud

Sortie :
  public/assets/map/morocco-map.js

Usage : python tools/build_map.py
"""
import json
import math
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, "tools")
OUT_MAP = os.path.join(ROOT, "public", "assets", "map", "morocco-map.js")

WIDTH = 1000
PAD = 40
TOLERANCE = 0.02
REF_LAT = 29.0
KX = math.cos(math.radians(REF_LAT))

REGIONS = {
    "Tangier-Tetouan-Al Hoceima": ("tta", False),
    "Oriental": ("ori", False),
    "Fez-Meknes": ("fm", False),
    "Rabat-Salé-Kenitra": ("rsk", False),
    "Béni Mellal-Khénifra": ("bmk", False),
    "Casablanca-Settat": ("cs", False),
    "Marrakech-Safi": ("ms", False),
    "Drâa-Tafilalet": ("dt", False),
    "Souss-Massa": ("sm", False),
    "Guelmim-Oued Noun": ("gon", True),
    "Laâyoune-Sakia El Hamra": ("lse", True),
    "Dakhla-Oued Ed-Dahab": ("dod", True),
}

CITIES = [
    ("rabat", 34.0209, -6.8416, "capital"),
    ("casablanca", 33.5731, -7.5898, "city"),
    ("tanger", 35.7595, -5.8340, "city"),
    ("fes", 34.0181, -5.0078, "city"),
    ("oujda", 34.6814, -1.9086, "city"),
    ("marrakech", 31.6295, -7.9811, "host"),
    ("agadir", 30.4278, -9.5981, "city"),
    ("guelmim", 28.9870, -10.0574, "south"),
    ("tantan", 28.4378, -11.1031, "south"),
    ("laayoune", 27.1253, -13.1625, "south"),
    ("smara", 26.7384, -11.6719, "south"),
    ("boujdour", 26.1300, -14.4847, "south"),
    ("dakhla", 23.6848, -15.9580, "south"),
    ("lagouira", 20.93, -17.05, "south"),
]


# --------------------------------------------------------------------------- géométrie
def perp_dist(p, a, b):
    (x, y), (x1, y1), (x2, y2) = p, a, b
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(x - x1, y - y1)
    t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
    return math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))


def simplify(points, tol):
    if len(points) < 3:
        return points
    stack = [(0, len(points) - 1)]
    keep = {0, len(points) - 1}
    while stack:
        s, e = stack.pop()
        dmax, idx = 0, None
        for i in range(s + 1, e):
            d = perp_dist(points[i], points[s], points[e])
            if d > dmax:
                dmax, idx = d, i
        if idx is not None and dmax > tol:
            keep.add(idx)
            stack.append((s, idx))
            stack.append((idx, e))
    return [points[i] for i in sorted(keep)]


def outer_rings(geom):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    return [[(lon, lat) for lon, lat in poly[0]] for poly in polys]


def load(name):
    with open(os.path.join(TOOLS, name), encoding="utf-8") as f:
        return json.load(f)


def path_d(rings):
    d = ""
    for pts in rings:
        if len(pts) >= 3:
            d += "M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z"
    return d


# --------------------------------------------------------------------------- données
def morocco_rings():
    out = []
    for feat in load("mar_adm1.geojson")["features"]:
        rid, south = REGIONS[feat["properties"]["shapeName"]]
        rings = [simplify(r, TOLERANCE) for r in outer_rings(feat["geometry"])]
        out.append((rid, south, [r for r in rings if len(r) >= 4]))
    return out


def build_map(mar):
    lons = [p[0] for _, _, rs in mar for r in rs for p in r]
    lats = [p[1] for _, _, rs in mar for r in rs for p in r]
    minx, maxx = min(lons) * KX, max(lons) * KX
    miny, maxy = -max(lats), -min(lats)
    scale = (WIDTH - 2 * PAD) / (maxx - minx)
    height = round((maxy - miny) * scale + 2 * PAD)

    def proj(lon, lat):
        return ((lon * KX - minx) * scale + PAD, (-lat - miny) * scale + PAD)

    regions = [
        {"id": rid, "south": south, "d": path_d([[proj(*p) for p in r] for r in rs])}
        for rid, south, rs in mar
    ]

    cities = []
    for cid, lat, lon, kind in CITIES:
        x, y = proj(lon, lat)
        cities.append({"id": cid, "x": round(x, 1), "y": round(y, 1), "kind": kind})

    payload = {"width": WIDTH, "height": height, "regions": regions, "cities": cities}
    os.makedirs(os.path.dirname(OUT_MAP), exist_ok=True)
    with open(OUT_MAP, "w", encoding="utf-8") as f:
        f.write("// Généré par tools/build_map.py - ne pas modifier à la main.\n")
        f.write("window.MOROCCO_MAP = ")
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print(f"OK carte {WIDTH}x{height} - {os.path.getsize(OUT_MAP) // 1024} Ko")


if __name__ == "__main__":
    mar = morocco_rings()
    build_map(mar)

