import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image


def ensure_dir(p):
    Path(p).mkdir(parents=True, exist_ok=True)


def trim_outer_guides(rgb):
    """Remove only obvious border/guide columns at the extreme edges.
    Never remove by hue because trait pixels may legitimately be green.
    """
    h, w, _ = rgb.shape
    keep = np.ones(w, dtype=bool)
    edge = max(1, int(round(w * 0.08)))
    # Inspect only extreme left/right strips for near-solid vertical guide columns.
    for x in list(range(edge)) + list(range(max(0, w-edge), w)):
        col = rgb[:, x, :].astype(np.int16)
        lum = col.max(axis=1)
        greenish = (col[:,1] > 70) & (col[:,1] > col[:,0] * 1.25) & (col[:,1] > col[:,2] * 1.20)
        occupied = np.mean((lum > 25) & greenish)
        if occupied > 0.45:
            keep[x] = False
    xs = np.where(keep)[0]
    if xs.size == 0:
        return rgb
    return rgb[:, xs[0]:xs[-1]+1, :]


def content_columns(rgb):
    # Source-preserving occupancy. No hue deletion, no alpha conversion.
    lum = rgb.max(axis=2)
    return np.sum(lum > 18, axis=0)


def find_pair_split(rgb):
    """Find a low-occupancy valley near center. This separates two observed eye objects
    without cutting by a fixed midpoint.
    """
    occ = content_columns(rgb)
    w = len(occ)
    lo, hi = int(w * 0.35), int(w * 0.65)
    if hi <= lo:
        return w // 2
    smooth = np.convolve(occ.astype(float), np.ones(5)/5.0, mode="same")
    return int(lo + np.argmin(smooth[lo:hi]))


def bbox_nonblack(rgb, x0, x1, pad=3):
    crop = rgb[:, x0:x1, :]
    lum = crop.max(axis=2)
    ys, xs = np.where(lum > 18)
    if xs.size == 0:
        return None
    left = max(0, x0 + int(xs.min()) - pad)
    right = min(rgb.shape[1], x0 + int(xs.max()) + 1 + pad)
    top = max(0, int(ys.min()) - pad)
    bottom = min(rgb.shape[0], int(ys.max()) + 1 + pad)
    return (left, top, right, bottom)


def save_exact_crop(rgb, bbox, out_path):
    l, t, r, b = bbox
    Image.fromarray(rgb[t:b, l:r, :], mode="RGB").save(out_path, optimize=False)


def process(src, out_root):
    src = Path(src)
    style = src.parent.name
    img = Image.open(src).convert("RGB")
    original = np.array(img)
    rgb = trim_outer_guides(original)
    split = find_pair_split(rgb)

    left_box = bbox_nonblack(rgb, 0, split)
    right_box = bbox_nonblack(rgb, split, rgb.shape[1])

    base = src.stem.replace("_pair_reference_v001", "")
    style_root = Path(out_root) / style
    ensure_dir(style_root)

    rec = {
        "source": str(src),
        "style": style,
        "mode": "SOURCE_EXACT_CROP",
        "synthetic_redraw": False,
        "recolor": False,
        "generative_fill": False,
        "alpha_invention": False,
        "split_x": split,
        "outputs": [],
        "status": "SOURCE_EXACT_ONLY",
        "mint_quality": False,
        "note": "Exact visible source pixels only. This is a reconstruction input, not a mint master."
    }

    if left_box:
        p = style_root / f"{base}__left__source_exact_v001.png"
        save_exact_crop(rgb, left_box, p)
        rec["outputs"].append(str(p))
    if right_box:
        p = style_root / f"{base}__right__source_exact_v001.png"
        save_exact_crop(rgb, right_box, p)
        rec["outputs"].append(str(p))

    if len(rec["outputs"]) != 2:
        rec["status"] = "MANUAL_SEGMENTATION_REQUIRED"

    return rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input-root", required=True)
    ap.add_argument("--output-root", required=True)
    ap.add_argument("--receipt-root", required=True)
    ap.add_argument("--project", required=True)
    args = ap.parse_args()

    input_root = Path(args.input_root)
    output_root = Path(args.output_root)
    receipt_root = Path(args.receipt_root)
    ensure_dir(output_root)
    ensure_dir(receipt_root)

    records = [process(p, output_root) for p in sorted(input_root.rglob("*.png"))]
    summary = {
        "project": args.project,
        "system": "Holofoil",
        "stage": "SOURCE_EXACT_TRAIT_ISOLATION",
        "rule": "Preserve visible source pixels. No synthetic redraw. No hue-based guide removal.",
        "mint_quality_claim": False,
        "records": records
    }
    out = receipt_root / "source-exact-eye-isolation-manifest.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print("HOLOFOIL SOURCE-EXACT EYE ISOLATION COMPLETE")
    print(f"Files processed: {len(records)}")
    print(f"Manifest: {out}")
    print("NOTE: outputs are source-exact inputs, NOT mint masters.")


if __name__ == "__main__":
    main()
