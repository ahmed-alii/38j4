// The family's two cars, modelled to the makers' published dimensions (metres):
//   Honda Civic, 11th generation sedan (Pakistan, 2022+): 4.678 L × 1.802 W × 1.415 H, wheelbase 2.735,
//     215/50 R17 tyres (Ø 0.647), ground clearance 0.135
//   Toyota Land Cruiser 300 (ZX): 4.985 L × 1.980 W × 1.925 H, wheelbase 2.850,
//     265/55 R20 tyres (Ø 0.800), ground clearance 0.230
// No freely licensed 3D files of either car exist, so each is built here from its side profile:
// the body and the glasshouse are extruded across the width with rounded edges, then pinched in
// at the nose and tail and tapered towards the roof (tumblehome), as real car bodies are.
// Every car's nose points +x and its centre is at x = 0; y = 0 is the ground.

import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// Detailed 3D models of the real cars (models/cars/*.json, glTF binary as base64). They replace
// the drawn cars below once loaded. Both are third-party models used here for private visualisation:
//   civic: an 11th-gen Civic Type R (FL5) with a body kit; "Honda Civic Type R FL5 Custom" by
//     blakebella (Sketchfab), CC BY-NC-ND 4.0. The file is about 9% oversize, so it is scaled to
//     the real 2,735 mm wheelbase.
//   landcruiser: a Land Cruiser 200, adapted from "Land cruise 2016" by ZIRODESIGN, assembled from
//     the parts of github.com/ffaz/landcruiser-3d. Real size (2,850 mm wheelbase).
const REAL = {
  civic: { yaw: -Math.PI / 2, scale: 2.735 / 2.98, paint: ['Paint_Material', 'Coloured_Material'] },
  landcruiser: { yaw: Math.PI, scale: 1, paint: ['paint'] },
};

const SPECS = {
  civic: {
    name: 'Honda Civic (11th gen)',
    L: 4.678, W: 1.802, H: 1.415, rearAxle: 0.993, wheelbase: 2.735, tyreR: 0.3235, rimR: 0.215, track: 1.56, archR: 0.37,
    tumble: 0.2, belt: 0.98,
    // lower body: rear bumper → under the car with two wheel arches → nose → hood → belt line back to the tail
    body: [[0.0, 0.46], [0.07, 0.27], [0.55, 0.2], 'arch0', [1.38, 0.2], [3.34, 0.2], 'arch1', [4.12, 0.2], [4.56, 0.24],
      [4.672, 0.42], [4.66, 0.6], [4.56, 0.74], [4.2, 0.82], [3.7, 0.9], [3.08, 0.965], [2.0, 0.99], [0.92, 1.0], [0.38, 1.02],
      [0.12, 1.0], [0.02, 0.86]],
    archY: 0.3,
    // glasshouse: windscreen, roof, sloping fastback rear window
    cabin: [[3.08, 0.955], [2.62, 1.2], [2.18, 1.385], [1.85, 1.412], [1.3, 1.415], [1.0, 1.37], [0.66, 1.17], [0.44, 1.01]],
    roof: [2.12, 1.05],
    // window pillars across the glasshouse: [x from, x to, colour] (body = paint, black = gloss black)
    pillars: [[2.0, 2.09, 'black'], [0.95, 1.22, 'body']],
    grille: 'civic',
  },
  landcruiser: {
    name: 'Toyota Land Cruiser 300',
    L: 4.985, W: 1.98, H: 1.925, rearAxle: 1.205, wheelbase: 2.85, tyreR: 0.4, rimR: 0.254, track: 1.665, archR: 0.47,
    tumble: 0.09, belt: 1.2,
    body: [[0.0, 0.62], [0.06, 0.42], [0.62, 0.4], 'arch0', [1.68, 0.42], [3.58, 0.42], 'arch1', [4.53, 0.42], [4.88, 0.46],
      [4.975, 0.66], [4.985, 0.95], [4.95, 1.08], [4.84, 1.13], [4.2, 1.16], [3.66, 1.185], [2.0, 1.2], [0.6, 1.21],
      [0.08, 1.21], [0.0, 1.12]],
    archY: 0.43,
    cabin: [[3.66, 1.175], [3.2, 1.55], [2.86, 1.86], [2.6, 1.912], [0.5, 1.925], [0.2, 1.9], [0.1, 1.6], [0.07, 1.2]],
    roof: [2.82, 0.16],
    pillars: [[2.02, 2.12, 'black'], [1.0, 1.1, 'black'], [0.07, 0.42, 'body']],
    grille: 'landcruiser',
  },
};

const mats = {};
function mat(key, make) { return (mats[key] ||= make()); }
const paintMat = (color) => mat(`paint${color}`, () => new THREE.MeshPhysicalMaterial({ color, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 }));
const glassMat = () => mat('glass', () => new THREE.MeshPhysicalMaterial({ color: 0x24323c, metalness: 0.2, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2 }));
const blackMat = () => mat('black', () => new THREE.MeshStandardMaterial({ color: 0x0e0f10, roughness: 0.45 }));
const trimMat = () => mat('trim', () => new THREE.MeshStandardMaterial({ color: 0x1c1d1f, roughness: 0.8 }));
const chromeMat = () => mat('chrome', () => new THREE.MeshStandardMaterial({ color: 0xd8dadc, metalness: 1, roughness: 0.12 }));
const rimMat = () => mat('rim', () => new THREE.MeshStandardMaterial({ color: 0xb9bcc0, metalness: 0.9, roughness: 0.25 }));
const tyreMat = () => mat('tyre', () => new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.92 }));
const headMat = () => mat('head', () => new THREE.MeshStandardMaterial({ color: 0xeef4ff, emissive: 0xdfeaff, emissiveIntensity: 0.6, roughness: 0.1, metalness: 0.3 }));
const tailMat = () => mat('tail', () => new THREE.MeshStandardMaterial({ color: 0x8a0d10, emissive: 0x5a0306, emissiveIntensity: 0.8, roughness: 0.15 }));
const plateMat = () => mat('plate', () => new THREE.MeshStandardMaterial({ color: 0xf4f4ee, roughness: 0.5 }));

/** A side-profile shape; 'arch0' / 'arch1' insert a wheel arch over the rear / front axle. */
function profileShape(pts, s) {
  const shape = new THREE.Shape();
  let first = true;
  for (const p of pts) {
    if (typeof p === 'string') {
      const cx = p === 'arch0' ? s.rearAxle : s.rearAxle + s.wheelbase;
      shape.lineTo(cx - s.archR, s.archY);
      shape.absarc(cx, s.archY, s.archR, Math.PI, 0, true);
      continue;
    }
    if (first) { shape.moveTo(p[0], p[1]); first = false; } else shape.lineTo(p[0], p[1]);
  }
  return shape;
}

const smooth = (a, b, t) => { const u = Math.min(1, Math.max(0, (t - a) / (b - a))); return u * u * (3 - 2 * u); };

/** Extrude a profile across `width`, then pinch the ends in plan and taper towards the roof. */
function shell(shape, width, s, { bevel = 0.05, pinch = 0.12, tumble = 0 } = {}) {
  const depth = Math.max(0.01, width - 2 * bevel);
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 4, curveSegments: 20 });
  g.translate(0, 0, -depth / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    let k = 1;
    // rounded nose and tail in plan view
    const end = Math.min(x, s.L - x);
    k *= 1 - pinch * Math.pow(1 - smooth(0, 0.7, end), 2);
    // tumblehome: the glasshouse leans in towards the roof
    if (tumble) k *= 1 - tumble * smooth(s.belt, s.H, y);
    p.setZ(i, p.getZ(i) * k);
  }
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  const m = mergeVertices(g, 1e-4);
  m.computeVertexNormals();
  m.translate(-s.L / 2, 0, 0);
  return m;
}

function wheel(s) {
  const g = new THREE.Group();
  const r = s.tyreR, w = s.tyreR * 0.66, rim = s.rimR;
  // tyre: a lathed cross-section with rounded shoulders
  const pts = [];
  for (let k = 0; k <= 12; k++) {
    const a = -Math.PI / 2 + (k / 12) * Math.PI;
    pts.push(new THREE.Vector2(r - 0.045 + Math.cos(a) * 0.045, Math.sin(a) * (w / 2)));
  }
  pts.unshift(new THREE.Vector2(rim, -w / 2 + 0.01));
  pts.push(new THREE.Vector2(rim, w / 2 - 0.01));
  const tyre = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), tyreMat());
  tyre.rotation.x = Math.PI / 2;
  g.add(tyre);
  // alloy: dished face, spokes and a centre cap, on the outer side (+z)
  const face = new THREE.Mesh(new THREE.CylinderGeometry(rim, rim, 0.03, 36), blackMat());
  face.rotation.x = Math.PI / 2; face.position.z = w / 2 - 0.06; g.add(face);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(rim - 0.008, 0.012, 8, 40), rimMat());
  lip.position.z = w / 2 - 0.02; g.add(lip);
  const n = s.grille === 'civic' ? 10 : 6;
  for (let k = 0; k < n; k++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(rim * 0.92, s.grille === 'civic' ? 0.025 : 0.05, 0.03), rimMat());
    sp.geometry.translate(rim * 0.46, 0, 0);
    sp.rotation.z = (k / n) * Math.PI * 2;
    sp.position.z = w / 2 - 0.035;
    g.add(sp);
  }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.03, 20), rimMat());
  cap.rotation.x = Math.PI / 2; cap.position.z = w / 2 - 0.025; g.add(cap);
  // brake disc behind the spokes
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(rim * 0.8, rim * 0.8, 0.02, 28), mat('disc', () => new THREE.MeshStandardMaterial({ color: 0x6b6d70, metalness: 0.8, roughness: 0.5 })));
  disc.rotation.x = Math.PI / 2; disc.position.z = w / 2 - 0.1; g.add(disc);
  return g;
}

function box(w, h, d, m, x, y, z) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  b.position.set(x, y, z);
  return b;
}

/**
 * @param {'civic'|'landcruiser'} kind
 * @param {number} color paint colour
 */
export function makeCar(kind = 'civic', color = 0xd9dde0) {
  const s = SPECS[kind] ?? SPECS.civic;
  const g = new THREE.Group();
  g.userData = { length: s.L, width: s.W, name: s.name };
  const BEV = 0.07;
  const half = s.L / 2 + BEV * 0.8, hw = s.W / 2; // `half`: the bumper faces, outside the rounded edge
  const paint = paintMat(color);

  // body and glasshouse
  g.add(new THREE.Mesh(shell(profileShape(s.body, s), s.W, s, { bevel: BEV, pinch: kind === 'civic' ? 0.14 : 0.07 }), paint));
  const cabinW = s.W - (kind === 'civic' ? 0.14 : 0.1);
  const cabinShape = new THREE.Shape(s.cabin.map(([x, y]) => new THREE.Vector2(x, y)));
  g.add(new THREE.Mesh(shell(cabinShape, cabinW, s, { bevel: 0.04, pinch: 0.05, tumble: s.tumble }), glassMat()));
  // painted roof panel over the glass, following the same taper
  const [rx, rl] = s.roof;
  const top = (x) => { // roof height of the cabin profile at x (linear between points)
    const c = s.cabin;
    for (let k = 0; k < c.length - 1; k++) {
      const [x1, y1] = c[k], [x2, y2] = c[k + 1];
      if ((x - x1) * (x - x2) <= 0 && x1 !== x2) return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
    }
    return s.H;
  };
  const roofPts = [];
  for (let k = 0; k <= 10; k++) { const x = rx - (k / 10) * (rx - rl); roofPts.push(new THREE.Vector2(x, top(x) + 0.045)); }
  for (let k = 10; k >= 0; k--) { const x = rx - (k / 10) * (rx - rl); roofPts.push(new THREE.Vector2(x, top(x) + 0.0)); }
  g.add(new THREE.Mesh(shell(new THREE.Shape(roofPts), cabinW + 0.02, s, { bevel: 0.02, pinch: 0.05, tumble: s.tumble }), paint));
  // pillars: bands just proud of the glass, running up one side, over the roof and down the other
  for (const [x1, x2, c] of s.pillars) {
    const pts = [new THREE.Vector2(x1, s.belt - 0.03), new THREE.Vector2(x2, s.belt - 0.03)];
    for (let k = 0; k <= 6; k++) { const x = x2 - (k / 6) * (x2 - x1); pts.push(new THREE.Vector2(x, top(x) + 0.04)); }
    g.add(new THREE.Mesh(shell(new THREE.Shape(pts), cabinW + 0.016, s, { bevel: 0.012, pinch: 0.05, tumble: s.tumble }), c === 'body' ? paint : blackMat()));
  }

  // wheels
  const yW = s.tyreR;
  for (const ax of [s.rearAxle, s.rearAxle + s.wheelbase]) {
    for (const side of [-1, 1]) {
      const w = wheel(s);
      w.position.set(ax - half, yW, side * (s.track / 2));
      if (side < 0) w.rotation.y = Math.PI; // alloy face outwards on both sides
      g.add(w);
    }
  }
  // dark wheel-arch liners so the arches read as openings
  for (const ax of [s.rearAxle, s.rearAxle + s.wheelbase]) {
    const liner = new THREE.Mesh(new THREE.CylinderGeometry(s.archR - 0.01, s.archR - 0.01, s.W - 0.2, 24, 1, true, -Math.PI / 2, Math.PI), trimMat());
    liner.rotation.x = Math.PI / 2; liner.rotation.y = Math.PI / 2;
    liner.position.set(ax - half, s.archY, 0); liner.material.side = THREE.DoubleSide;
    g.add(liner);
  }

  if (kind === 'civic') {
    // slim LED headlamps, a low black honeycomb grille with the H badge, full-width tail lamp
    for (const sd of [-1, 1]) {
      const h = box(0.4, 0.07, 0.3, headMat(), half - 0.22, 0.715, sd * (hw - 0.4)); h.rotation.y = sd * 0.42; g.add(h);
      const t = box(0.22, 0.07, 0.32, tailMat(), -half + 0.1, 0.885, sd * (hw - 0.4)); t.rotation.y = -sd * 0.35; g.add(t);
      g.add(box(0.2, 0.09, 0.07, paint, half - 1.62, 0.99, sd * (hw - 0.02)));            // mirror
      g.add(box(0.12, 0.08, 0.03, blackMat(), half - 1.62, 0.99, sd * (hw + 0.005)));
    }
    g.add(box(0.06, 0.16, 1.05, blackMat(), half - 0.02, 0.56, 0));                         // grille
    g.add(box(0.05, 0.05, 0.08, chromeMat(), half + 0.01, 0.62, 0));                         // badge
    g.add(box(0.03, 0.03, 0.9, tailMat(), -half + 0.035, 0.89, 0));                          // light bar
    g.add(box(0.04, 0.11, 0.52, plateMat(), -half + 0.02, 0.62, 0));                         // plates
    g.add(box(0.04, 0.11, 0.52, plateMat(), half - 0.005, 0.42, 0));
    g.add(box(1.95, 0.05, 0.03, trimMat(), -0.05, 0.23, hw - 0.06));                         // sills
    g.add(box(1.95, 0.05, 0.03, trimMat(), -0.05, 0.23, -hw + 0.06));
  } else {
    // the big chrome-barred grille, stacked LED headlamps, black arch flares, side steps, roof rails
    g.add(box(0.06, 0.42, 1.12, blackMat(), half - 0.03, 0.83, 0));
    for (let k = 0; k < 5; k++) g.add(box(0.03, 0.025, 1.1, chromeMat(), half + 0.005, 0.66 + k * 0.085, 0));
    g.add(box(0.03, 0.44, 0.03, chromeMat(), half + 0.005, 0.83, 0.56));
    g.add(box(0.03, 0.44, 0.03, chromeMat(), half + 0.005, 0.83, -0.56));
    g.add(box(0.05, 0.06, 0.24, chromeMat(), half + 0.03, 1.01, 0));                        // TOYOTA bar
    for (const sd of [-1, 1]) {
      g.add(box(0.12, 0.1, 0.36, headMat(), half - 0.06, 0.98, sd * (hw - 0.27)));
      g.add(box(0.1, 0.04, 0.32, headMat(), half - 0.05, 0.9, sd * (hw - 0.27)));
      g.add(box(0.08, 0.3, 0.14, tailMat(), -half + 0.03, 1.0, sd * (hw - 0.24)));
      g.add(box(0.07, 0.04, 0.46, tailMat(), -half + 0.03, 1.16, sd * (hw - 0.42)));
      g.add(box(1.8, 0.07, 0.24, trimMat(), -0.06, 0.38, sd * (hw - 0.05)));                // side step
      g.add(box(2.5, 0.05, 0.05, trimMat(), -0.75, s.H + 0.02, sd * (hw - 0.3)));          // roof rail
      g.add(box(0.25, 0.14, 0.08, paint, half - 1.38, 1.27, sd * (hw + 0.0)));              // mirror
      for (const ax of [s.rearAxle, s.rearAxle + s.wheelbase]) {                            // arch flare
        const fl = new THREE.Mesh(new THREE.TorusGeometry(s.archR + 0.02, 0.035, 6, 24, Math.PI), trimMat());
        fl.position.set(ax - half, s.archY, sd * (hw - 0.02));
        g.add(fl);
      }
    }
    g.add(box(0.06, 0.15, 0.52, plateMat(), -half + 0.0, 0.72, 0));
    g.add(box(0.05, 0.15, 0.52, plateMat(), half + 0.02, 0.52, 0));
    g.add(box(0.1, 0.2, 1.6, trimMat(), half - 0.04, 0.5, 0));                               // lower bumper
    g.add(box(0.1, 0.2, 1.7, trimMat(), -half + 0.04, 0.5, 0));
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.children.forEach((c) => { c.userData.proxy = true; });
  g.userData.realCar = { kind, color };
  return g;
}

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const cache = new Map();
function loadReal(kind) {
  if (!cache.has(kind)) {
    cache.set(kind, fetch(new URL(`../models/cars/${kind}.json`, import.meta.url))
      .then((r) => { if (!r.ok) throw new Error(`${kind}: HTTP ${r.status}`); return r.json(); })
      .then(async ({ glb }) => {
        const bin = Uint8Array.from(atob(glb), (c) => c.charCodeAt(0));
        const scene = (await loader.parseAsync(bin.buffer, '')).scene;
        const R = REAL[kind];
        scene.rotation.y = R.yaw;
        scene.scale.setScalar(R.scale);
        const wrap = new THREE.Group();
        wrap.add(scene);
        wrap.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(wrap);
        // nose at +x, centred across, tyres on the ground
        scene.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
        wrap.userData.length = box.max.x - box.min.x;
        wrap.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = true; o.receiveShadow = true;
          // chrome catches the bright sky photo and blooms; keep its reflections a little softer
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.metalness > 0.6) m.envMapIntensity = 0.75; });
        });
        return wrap;
      }));
  }
  return cache.get(kind);
}

/** Swap every drawn car under `root` for the detailed model, painted in its own colour. */
export async function upgradeCars(root) {
  const cars = [];
  root.traverse((o) => { if (o.userData.realCar && !o.userData.realCar.started) { o.userData.realCar.started = true; cars.push(o); } });
  await Promise.all(cars.map(async (car) => {
    const { kind, color } = car.userData.realCar;
    let model;
    try { model = await loadReal(kind); } catch (e) { console.warn('car', e.message); return; }
    const inst = model.clone(true);
    // pearl and metallic paints: a coloured base coat under a clear coat (kept below the bloom threshold)
    const paint = new THREE.MeshPhysicalMaterial({ color, metalness: 0.25, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.12 });
    inst.traverse((o) => {
      if (!o.isMesh) return;
      const swap = (m) => (REAL[kind].paint.some((n) => m.name === n || m.name.endsWith(n)) ? paint : m);
      o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
    });
    // keep the nose where the drawn car had it, so parking clearances stay as planned
    inst.position.x = car.userData.length / 2 - model.userData.length / 2;
    car.children.filter((c) => c.userData.proxy).forEach((c) => car.remove(c));
    car.add(inst);
  }));
}

export const CAR_SPECS = SPECS;
