import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

def ensure_dir(path):
    Path(path).mkdir(parents=True, exist_ok=True)

def green_line_mask(rgb):
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)
    return (g > 90) & (g > r * 1.35) & (g > b * 1.35)

def analysis_mask(rgb):
    maxc = np.max(rgb, axis=2)
    bright = maxc > 20
    mask = bright & (~green_line_mask(rgb))
    h, _ = mask.shape
    mask[int(h * 0.82):, :] = False
    return mask

def connected_components(mask):
    h, w = mask.shape
    visited = np.zeros((h, w), dtype=np.uint8)
    comps = []
    nbrs = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or visited[y, x]:
                continue
            stack = [(x, y)]
            visited[y, x] = 1
            pixels = []
            while stack:
                cx, cy = stack.pop()
                pixels.append((cx, cy))
                for dx, dy in nbrs:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h and mask[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = 1
                        stack.append((nx, ny))
            xs = [p[0] for p in pixels]
            ys = [p[1] for p in pixels]
            comps.append({'area': len(pixels), 'bbox': (min(xs), min(ys), max(xs), max(ys)), 'cx': (min(xs)+max(xs))/2.0})
    return comps

def expand_bbox(bbox, w, h, pad=8):
    x0, y0, x1, y1 = bbox
    return (max(0,x0-pad), max(0,y0-pad), min(w-1,x1+pad), min(h-1,y1+pad))

def rgba_from_black_bg(rgb):
    rgb_i = rgb.astype(np.int16)
    maxc = np.max(rgb_i, axis=2)
    alpha = np.clip(((maxc - 8) * 255) / 247, 0, 255).astype(np.uint8)
    return np.dstack([rgb.astype(np.uint8), alpha])

def make_crop_rgba(rgb, bbox):
    x0, y0, x1, y1 = bbox
    crop = rgb[y0:y1+1, x0:x1+1, :].copy()
    rgba = rgba_from_black_bg(crop)
    rgba[green_line_mask(crop), 3] = 0
    return Image.fromarray(rgba, mode='RGBA')

def make_proof_board(source_img, left_img, right_img, title, out_path):
    margin, gap, label_h = 24, 20, 36
    src_w, src_h = source_img.size
    lw, lh = left_img.size
    rw, rh = right_img.size
    panel_h = max(src_h, lh, rh)
    board_w = margin*2 + src_w + lw + rw + gap*2
    board_h = margin*2 + label_h + panel_h
    board = Image.new('RGBA', (board_w, board_h), (0,0,0,255))
    draw = ImageDraw.Draw(board)
    font = ImageFont.load_default()
    draw.text((margin,8), title, fill=(255,255,255,255), font=font)
    y = margin + label_h
    x = margin
    board.alpha_composite(source_img.convert('RGBA'), (x,y))
    draw.text((x,y-18), 'SOURCE', fill=(180,180,180,255), font=font)
    x += src_w + gap
    board.alpha_composite(left_img, (x,y))
    draw.text((x,y-18), 'LEFT', fill=(180,180,180,255), font=font)
    x += lw + gap
    board.alpha_composite(right_img, (x,y))
    draw.text((x,y-18), 'RIGHT', fill=(180,180,180,255), font=font)
    board.save(out_path)

def process_file(file_path, candidate_root, qc_root):
    file_path = Path(file_path)
    category = file_path.parent.name
    img = Image.open(file_path).convert('RGB')
    rgb = np.array(img)
    h, w = rgb.shape[:2]
    comps = connected_components(analysis_mask(rgb))
    comps = [c for c in comps if c['area'] >= max(40, int((w*h)*0.001))]
    comps = sorted(comps, key=lambda c: c['area'], reverse=True)[:2]
    comps = sorted(comps, key=lambda c: c['cx'])
    result = {'source': str(file_path), 'category': category, 'status': 'ok', 'outputs': [], 'notes': []}
    if len(comps) != 2:
        result['status'] = 'manual_qc_required'
        result['notes'].append(f'Expected 2 main eye components, found {len(comps)}')
        return result
    base = file_path.stem.replace('_pair_reference','')
    cat_out = Path(candidate_root) / category
    cat_qc = Path(qc_root) / category
    ensure_dir(cat_out)
    ensure_dir(cat_qc)
    side_images = {}
    for side, comp in [('left', comps[0]), ('right', comps[1])]:
        out_name = f'{base}_{side}_candidate_v001.png'
        bbox = expand_bbox(comp['bbox'], w, h, pad=8)
        out_img = make_crop_rgba(rgb, bbox)
        out_path = cat_out / out_name
        out_img.save(out_path)
        side_images[side] = out_img
        result['outputs'].append(str(out_path))
    proof_path = cat_qc / f'{base}_proof_v001.png'
    make_proof_board(img, side_images['left'], side_images['right'], base, proof_path)
    result['proof'] = str(proof_path)
    return result

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input-root', required=True)
    parser.add_argument('--candidate-root', required=True)
    parser.add_argument('--qc-root', required=True)
    parser.add_argument('--receipt-root', required=True)
    parser.add_argument('--project', required=True)
    args = parser.parse_args()
    input_root = Path(args.input_root)
    candidate_root = Path(args.candidate_root)
    qc_root = Path(args.qc_root)
    receipt_root = Path(args.receipt_root)
    ensure_dir(candidate_root); ensure_dir(qc_root); ensure_dir(receipt_root)
    pngs = sorted(input_root.rglob('*.png'))
    manifest = {'project': args.project, 'system': 'Holofoil', 'mode': 'forensic_pixel_extraction', 'input_root': str(input_root), 'candidate_root': str(candidate_root), 'qc_root': str(qc_root), 'files': []}
    ok_count = 0
    manual_qc_count = 0
    for png in pngs:
        result = process_file(png, candidate_root, qc_root)
        manifest['files'].append(result)
        if result['status'] == 'ok': ok_count += 1
        else: manual_qc_count += 1
    manifest['summary'] = {'input_files': len(pngs), 'ok': ok_count, 'manual_qc_required': manual_qc_count}
    manifest_path = receipt_root / 'forensic-eye-reconstruction-manifest.json'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    print('HOLOFOIL FORENSIC EYE RECONSTRUCTION COMPLETE')
    print(f'Input files: {len(pngs)}')
    print(f'OK: {ok_count}')
    print(f'Manual QC required: {manual_qc_count}')
    print(f'Manifest: {manifest_path}')

if __name__ == '__main__':
    main()