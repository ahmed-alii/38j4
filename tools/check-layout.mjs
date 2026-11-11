#!/usr/bin/env node
// Layout checker and plan drawer for js/house-data.js.
//
//   node tools/check-layout.mjs [design]             report problems (exit code 1 if any)
//   node tools/check-layout.mjs [design] --svg DIR   also draw a scaled plan of each floor to DIR/<floor>.svg
// design: a file in js/designs (default scheme-a), e.g. `plot39`.
//
// Checks, per floor:
//   - furniture overlapping a wall
//   - furniture overlapping other furniture (rugs excepted)
//   - furniture in the 3 ft clear zone on either side of a door or opening
//   - furniture outside every room
// Plus first-floor covered area against the bye-law limit.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const designName = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'scheme-a';
const src = readFileSync(join(here, `../js/designs/${designName}.js`), 'utf8');
const tmp = join(tmpdir(), `design-${designName}-${process.pid}.mjs`);
writeFileSync(tmp, src);
const { DESIGN } = await import(pathToFileURL(tmp).href);
const HOUSE = Object.fromEntries(Object.entries(DESIGN.HOUSE).filter(([, v]) => v));
console.log(`Design: ${DESIGN.name}`);

const EPS = 0.02;
const DOORS = new Set(['swing', 'double', 'pivot', 'opening', 'slide', 'glassdoor', 'lift']);
const overlap = (a, b, e = EPS) => a[0] < b[2] - e && a[2] > b[0] + e && a[1] < b[3] - e && a[3] > b[1] + e;
const inside = (a, b, e = 0.1) => a[0] >= b[0] - e && a[2] <= b[2] + e && a[1] >= b[1] - e && a[3] <= b[3] + e;
const area = (r) => (r[2] - r[0]) * (r[3] - r[1]);
const fmt = (r) => `[${r.map((v) => +v.toFixed(2)).join(', ')}]`;

function doorZones(o, walls) {
  // wall thickness at this opening (thickest wall on that line)
  let t = 0.375;
  for (const w of walls) {
    const [x1, z1, x2, z2] = w.r;
    const alongX = x2 - x1 >= z2 - z1;
    if ((o.axis === 'x') !== alongX) continue;
    const c1 = alongX ? z1 : x1, c2 = alongX ? z2 : x2;
    const a1 = alongX ? x1 : z1, a2 = alongX ? x2 : z2;
    if (o.at >= c1 - 0.01 && o.at <= c2 + 0.01 && a1 < o.b && a2 > o.a) t = Math.max(t, c2 - c1);
  }
  const d = 3;
  if (o.axis === 'x') return [[o.a, o.at - t / 2 - d, o.b, o.at - t / 2], [o.a, o.at + t / 2, o.b, o.at + t / 2 + d]];
  return [[o.at - t / 2 - d, o.a, o.at - t / 2, o.b], [o.at + t / 2, o.a, o.at + t / 2 + d, o.b]];
}

let problems = 0;
const report = (floor, msg) => { problems++; console.log(`  ✗ [${floor}] ${msg}`); };

for (const [name, fl] of Object.entries(HOUSE)) {
  console.log(`\n${name.toUpperCase()}`);
  const furn = fl.furniture ?? [];
  const solid = furn.filter((p) => p.t !== 'rug');
  for (const p of furn) {
    for (const w of fl.walls) if (overlap(p.r, w.r)) report(name, `${p.t} ${fmt(p.r)} hits wall ${fmt(w.r)}`);
    if (!fl.rooms.some((r) => inside(p.r, r.r))) {
      const host = fl.rooms.find((r) => overlap(p.r, r.r, 0));
      report(name, `${p.t} ${fmt(p.r)} is not fully inside a room${host ? ` (sticks out of ${host.id} ${fmt(host.r)})` : ''}`);
    }
  }
  for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++) {
    if (overlap(solid[i].r, solid[j].r)) report(name, `${solid[i].t} ${fmt(solid[i].r)} overlaps ${solid[j].t} ${fmt(solid[j].r)}`);
  }
  for (const o of fl.openings) {
    if (!DOORS.has(o.type)) continue;
    for (const z of doorZones(o, fl.walls)) for (const p of solid) {
      if (overlap(p.r, z)) report(name, `${p.t} ${fmt(p.r)} blocks the 3 ft in front of the ${o.type} at ${o.axis === 'x' ? 'z' : 'x'}=${o.at} (${o.a}–${o.b})`);
    }
  }
  if (name === 'ground' && fl.enclosed) {
    const e = fl.enclosed.reduce((s, r) => s + area(r), 0);
    const c = fl.roofOutline.reduce((s, r) => s + area(r), 0);
    console.log(`  ground floor: ${e.toFixed(0)} sq ft enclosed, ${c.toFixed(0)} sq ft covered (incl. loggia + porch)`);
  }
  if (name === 'first') {
    // union area of the footprint rects (they do not overlap by construction; check anyway)
    const fp = fl.footprint;
    // footprint rects do not overlap by construction; voids (double height) are not covered area
    const inter = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
    let sum = fp.reduce((s, r) => s + area(r), 0);
    for (let i = 0; i < fp.length; i++) for (let j = i + 1; j < fp.length; j++) sum -= inter(fp[i], fp[j]);
    for (const v of fl.voids ?? []) for (const r of fp) sum -= inter(v, r);
    const limit = 0.75 * (90 - 15.75 - 5.375) * (50 - 2 * 5.375);
    console.log(`  first-floor covered ${sum.toFixed(0)} sq ft of ${limit.toFixed(0)} allowed (${(100 * sum / limit).toFixed(1)}%)`);
    if (sum > limit) report(name, 'first floor is over the 75% limit');
  }
}
console.log(problems ? `\n${problems} problem(s)` : '\nNo problems found');

// ---------------------------------------------------------------- SVG plans
const svgIdx = process.argv.indexOf('--svg');
if (svgIdx > 0) {
  const out = process.argv[svgIdx + 1];
  mkdirSync(out, { recursive: true });
  const S = 14, X0 = 12, Z0 = 2, W = 76, H = 50;
  const px = (x) => (x - X0) * S, pz = (z) => (z - Z0) * S;
  const colors = { bed: '#c9b79c', sofa: '#9fb3c8', sofaL: '#9fb3c8', armchair: '#9fb3c8', counter: '#d9cbb4', island: '#8a8f96', fridge: '#b8bcc0', wc: '#ffffff', vanity: '#d9cbb4', shower: '#cfe3ee', wardrobe: '#d8c3a5', tall: '#d8c3a5', rug: '#efe6d8', dining: '#c9a77c', tv: '#555', desk: '#c9a77c', stools: '#8a8f96', washer: '#fff' };
  for (const [name, fl] of Object.entries(HOUSE)) {
    const parts = [];
    parts.push(`<rect width="${W * S}" height="${H * S}" fill="#fbfaf7"/>`);
    // grid every 5 ft
    for (let x = 15; x <= 85; x += 5) parts.push(`<line x1="${px(x)}" y1="${pz(5)}" x2="${px(x)}" y2="${pz(45)}" stroke="#e5e1d8"/><text x="${px(x) + 2}" y="${pz(4.4)}" font-size="10" fill="#999">${x}</text>`);
    for (let z = 5; z <= 45; z += 5) parts.push(`<line x1="${px(15)}" y1="${pz(z)}" x2="${px(85)}" y2="${pz(z)}" stroke="#e5e1d8"/><text x="${px(13)}" y="${pz(z) + 4}" font-size="10" fill="#999">${z}</text>`);
    for (const r of fl.rooms) {
      parts.push(`<rect x="${px(r.r[0])}" y="${pz(r.r[1])}" width="${(r.r[2] - r.r[0]) * S}" height="${(r.r[3] - r.r[1]) * S}" fill="${r.outdoor ? '#e3efd9' : '#f3efe6'}"/>`);
    }
    for (const p of (fl.furniture ?? [])) {
      const [x1, z1, x2, z2] = p.r;
      parts.push(`<rect x="${px(x1)}" y="${pz(z1)}" width="${(x2 - x1) * S}" height="${(z2 - z1) * S}" fill="${colors[p.t] ?? '#ddd'}" stroke="#666" stroke-width="1" ${p.t === 'rug' ? 'stroke-dasharray="3 3"' : ''}/>`);
      // front edge
      const fe = { n: [x1, z1, x2, z1], s: [x1, z2, x2, z2], e: [x2, z1, x2, z2], w: [x1, z1, x1, z2] }[p.face];
      if (fe && p.t !== 'rug') parts.push(`<line x1="${px(fe[0])}" y1="${pz(fe[1])}" x2="${px(fe[2])}" y2="${pz(fe[3])}" stroke="#c0392b" stroke-width="3"/>`);
      parts.push(`<text x="${px((x1 + x2) / 2)}" y="${pz((z1 + z2) / 2) + 3}" font-size="9" text-anchor="middle" fill="#333">${p.t}</text>`);
    }
    for (const w of fl.walls) parts.push(`<rect x="${px(w.r[0])}" y="${pz(w.r[1])}" width="${(w.r[2] - w.r[0]) * S}" height="${(w.r[3] - w.r[1]) * S}" fill="#2b2f33"/>`);
    for (const o of fl.openings) {
      const door = DOORS.has(o.type);
      const col = door ? '#fbfaf7' : '#7fb3d5';
      const t = 0.9;
      const r = o.axis === 'x' ? [o.a, o.at - t / 2, o.b, o.at + t / 2] : [o.at - t / 2, o.a, o.at + t / 2, o.b];
      parts.push(`<rect x="${px(r[0])}" y="${pz(r[1])}" width="${(r[2] - r[0]) * S}" height="${(r[3] - r[1]) * S}" fill="${col}" ${door ? '' : 'opacity="0.9"'}/>`);
      if (door) for (const z of doorZones(o, fl.walls)) parts.push(`<rect x="${px(z[0])}" y="${pz(z[1])}" width="${(z[2] - z[0]) * S}" height="${(z[3] - z[1]) * S}" fill="#f1c40f" opacity="0.18"/>`);
    }
    for (const r of fl.rooms) {
      if (r.noLabel || !r.name) continue;
      const w = r.r[2] - r.r[0], d = r.r[3] - r.r[1];
      const cx = px((r.r[0] + r.r[2]) / 2), cy = pz(r.r[1]) + 14;
      parts.push(`<text x="${cx}" y="${cy}" font-size="12" font-weight="700" text-anchor="middle" fill="#14202a">${r.name}</text>`);
      parts.push(`<text x="${cx}" y="${cy + 12}" font-size="10" text-anchor="middle" fill="#556">${w.toFixed(1)} × ${d.toFixed(1)} ft</text>`);
    }
    if (fl.courtyard) parts.push(`<text x="${px((fl.courtyard[0] + fl.courtyard[2]) / 2)}" y="${pz(fl.courtyard[3] + 3)}" font-size="11" text-anchor="middle" fill="#2a845a">courtyard opens to the side passage ↓</text>`);
    parts.push(`<text x="10" y="${H * S - 10}" font-size="14" font-weight="700">${name} floor · grid 5 ft · red edge = front of the piece · yellow = 3 ft door clearance</text>`);
    writeFileSync(join(out, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W * S}" height="${H * S}" font-family="Helvetica, Arial, sans-serif">${parts.join('')}</svg>`);
  }
  console.log(`plans written to ${out}`);
}
process.exit(problems ? 1 : 0);
