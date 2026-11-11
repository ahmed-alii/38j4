// Axis-aligned rectangle helpers. A rect is [x1, z1, x2, z2] with x1 < x2, z1 < z2.

function grid(adds, subs) {
  const all = [...adds, ...subs];
  const xs = [...new Set(all.flatMap((r) => [r[0], r[2]]))].sort((a, b) => a - b);
  const zs = [...new Set(all.flatMap((r) => [r[1], r[3]]))].sort((a, b) => a - b);
  const inside = (r, x, z) => x > r[0] && x < r[2] && z > r[1] && z < r[3];
  const filled = [];
  for (let i = 0; i < xs.length - 1; i++) {
    filled.push([]);
    for (let j = 0; j < zs.length - 1; j++) {
      const cx = (xs[i] + xs[i + 1]) / 2, cz = (zs[j] + zs[j + 1]) / 2;
      filled[i].push(adds.some((r) => inside(r, cx, cz)) && !subs.some((r) => inside(r, cx, cz)));
    }
  }
  return { xs, zs, filled };
}

/** Union of `adds` minus `subs`, as non-overlapping rects. */
export function subtractRects(adds, subs = []) {
  const { xs, zs, filled } = grid(adds, subs);
  const out = [];
  let prev = new Map();
  for (let j = 0; j < zs.length - 1; j++) {
    const next = new Map();
    let i = 0;
    while (i < xs.length - 1) {
      if (!filled[i][j]) { i++; continue; }
      const i0 = i;
      while (i < xs.length - 1 && filled[i][j]) i++;
      const key = `${i0}-${i}`;
      const p = prev.get(key);
      if (p && p[3] === zs[j]) { p[3] = zs[j + 1]; next.set(key, p); }
      else { const r = [xs[i0], zs[j], xs[i], zs[j + 1]]; out.push(r); next.set(key, r); }
    }
    prev = next;
  }
  return out;
}

export const rectArea = (r) => (r[2] - r[0]) * (r[3] - r[1]);
export const areaOf = (rects) => rects.reduce((s, r) => s + rectArea(r), 0);
export const unionArea = (rects) => areaOf(subtractRects(rects));

/**
 * Boundary segments of (adds − subs). `keep(inner, outer)` receives the centre points of the
 * filled cell and of the empty neighbour and decides whether that edge is wanted.
 * Returns merged segments {x1, z1, x2, z2, nx, nz} where (nx, nz) points outwards.
 */
export function boundaryEdges(adds, subs = [], keep = () => true) {
  const { xs, zs, filled } = grid(adds, subs);
  const nI = xs.length - 1, nJ = zs.length - 1;
  const isF = (i, j) => i >= 0 && j >= 0 && i < nI && j < nJ && filled[i][j];
  const cc = (i, j) => [(xs[Math.max(0, Math.min(i, nI - 1))] + xs[Math.max(0, Math.min(i, nI - 1)) + 1]) / 2 + (i < 0 ? -1 : i >= nI ? 1 : 0),
    (zs[Math.max(0, Math.min(j, nJ - 1))] + zs[Math.max(0, Math.min(j, nJ - 1)) + 1]) / 2 + (j < 0 ? -1 : j >= nJ ? 1 : 0)];
  const segs = [];
  for (let i = 0; i < nI; i++) for (let j = 0; j < nJ; j++) {
    if (!filled[i][j]) continue;
    const c = cc(i, j);
    const sides = [
      [i - 1, j, -1, 0, [xs[i], zs[j], xs[i], zs[j + 1]]],
      [i + 1, j, 1, 0, [xs[i + 1], zs[j], xs[i + 1], zs[j + 1]]],
      [i, j - 1, 0, -1, [xs[i], zs[j], xs[i + 1], zs[j]]],
      [i, j + 1, 0, 1, [xs[i], zs[j + 1], xs[i + 1], zs[j + 1]]],
    ];
    for (const [ni, nj, nx, nz, s] of sides) {
      if (isF(ni, nj)) continue;
      // a point just outside the edge, at its midpoint
      const outer = [nx ? s[0] + nx * 0.05 : (s[0] + s[2]) / 2, nz ? s[1] + nz * 0.05 : (s[1] + s[3]) / 2];
      if (!keep(c, outer)) continue;
      segs.push({ x1: s[0], z1: s[1], x2: s[2], z2: s[3], nx, nz });
    }
  }
  // merge collinear neighbours with the same normal
  segs.sort((a, b) => a.nx - b.nx || a.nz - b.nz || (a.nx ? a.x1 - b.x1 || a.z1 - b.z1 : a.z1 - b.z1 || a.x1 - b.x1));
  const out = [];
  for (const s of segs) {
    const p = out[out.length - 1];
    if (p && p.nx === s.nx && p.nz === s.nz) {
      if (s.nx && p.x1 === s.x1 && p.z2 === s.z1) { p.z2 = s.z2; continue; }
      if (s.nz && p.z1 === s.z1 && p.x2 === s.x1) { p.x2 = s.x2; continue; }
    }
    out.push({ ...s });
  }
  return out;
}

export const inRects = (rects, x, z, eps = 0) => rects.some((r) => x > r[0] - eps && x < r[2] + eps && z > r[1] - eps && z < r[3] + eps);
