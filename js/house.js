// Builds a house design (see js/designs/*.js, all in feet) into the scene (metres).

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FT, fmtSqft } from './units.js';
import { worldUV, tex, label, makeTree, makePerson } from './site.js';
import { makeCar } from './cars.js';
import { subtractRects, boundaryEdges, unionArea, inRects } from './geom.js'; // eslint-disable-line no-unused-vars
import { foliage } from './foliage.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CATALOG, TYPE_MODEL } from './catalog.js';

const M = (f) => f * FT;

/** box from feet coordinates [x1, y1, z1, x2, y2, z2] → geometry in metres */
function fbox(x1, y1, z1, x2, y2, z2) {
  const g = new THREE.BoxGeometry(M(Math.abs(x2 - x1)), M(Math.abs(y2 - y1)), M(Math.abs(z2 - z1)));
  g.translate(M((x1 + x2) / 2), M((y1 + y2) / 2), M((z1 + z2) / 2));
  return g;
}
function fplane(r, y) {
  const g = new THREE.PlaneGeometry(M(r[2] - r[0]), M(r[3] - r[1]));
  g.rotateX(-Math.PI / 2);
  g.translate(M((r[0] + r[2]) / 2), M(y), M((r[1] + r[3]) / 2));
  return g;
}
const fmtShort = (f) => {
  const q = Math.round(f * 4) / 4; // nearest 3″
  const ft = Math.floor(q), inch = Math.round((q - ft) * 12);
  return inch ? `${ft}′${inch}″` : `${ft}′`;
};

// ---------------------------------------------------------------- materials
const linLoader = new THREE.TextureLoader();
const linCache = new Map();
/** non-colour texture (normal / roughness map) */
function texLin(name) {
  if (!linCache.has(name)) {
    const t = linLoader.load(`textures/${name}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    linCache.set(name, t);
  }
  return linCache.get(name);
}
/** material from a Poly Haven set: <id>.jpg, <id>_nor.jpg, <id>_rough.jpg */
function pbr(id, o = {}) {
  return new THREE.MeshStandardMaterial({
    map: tex(id), normalMap: texLin(`${id}_nor`), roughnessMap: texLin(`${id}_rough`),
    normalScale: new THREE.Vector2(o.normal ?? 1, o.normal ?? 1), roughness: 1, ...o.params,
  });
}
function makeMaterials() {
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, ...o });
  const jaali = jaaliTexture();
  return {
    stucco: pbr('white_stucco', { normal: 0.6, params: { color: 0xfff8ee } }),
    brick: std({ map: tex('red_brick_03'), color: 0xe7b9a0, roughness: 0.9 }),
    kashi: std({ map: kashiTexture(), roughness: 0.25, metalness: 0.05 }),
    lime: pbr('white_stucco', { normal: 0.3, params: { color: 0xf7f0e2 } }),
    teak: std({ map: tex('wood_floor'), color: 0x8a5634, roughness: 0.55 }),
    stuccoInt: pbr('white_stucco', { normal: 0.35, params: { color: 0xf8f3ea } }),
    limestone: pbr('large_sandstone_blocks_01', { normal: 0.9, params: { color: 0xf3e6cf } }),
    terracotta: pbr('terracotta_floor_tiles', { normal: 0.7 }),
    oak: pbr('oak_wood_planks', { normal: 0.6, params: { color: 0x9a6a44 } }),
    parquet: pbr('herringbone_parquet', { normal: 0.5, params: { color: 0xd9b48a } }),
    iron: std({ color: 0x1e1f21, roughness: 0.55, metalness: 0.6 }),
    shutter: std({ color: 0x5f7a6a, roughness: 0.7 }),
    pot: std({ color: 0xb5643c, roughness: 0.9 }),
    flower: std({ color: 0xc2257a, roughness: 0.9, flatShading: true }),
    lantern: new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffb860, emissiveIntensity: 7, roughness: 0.4 }),
    poolTile: std({ color: 0x8fc7d6, roughness: 0.3, side: THREE.DoubleSide }),
    encaustic: std({ map: encausticTexture(), roughness: 0.6 }),
    bulb: new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffd27a, emissiveIntensity: 9 }),
    ext: std({ color: 0xf5f3ee, roughness: 0.92 }),
    int: std({ color: 0xf0ebe3, roughness: 0.95 }),
    rcc: std({ map: tex('concrete'), color: 0xc9c6c0 }),
    wood: std({ map: tex('wood_floor'), color: 0xc98f5a, roughness: 0.7 }),
    stone: std({ map: tex('large_sandstone_blocks_01'), color: 0xf0e6d6 }),
    band: std({ map: tex('grey_plaster_02'), color: 0x8e9296 }),
    ceiling: std({ color: 0xf7f5f0, roughness: 0.95 }),
    slabTop: std({ map: tex('concrete'), color: 0xd9d6d0 }),
    marble: std({ map: tex('marble_01'), color: 0xfbf8f2, roughness: 0.25 }),
    floorWood: std({ map: tex('wood_floor'), color: 0xd8b48c, roughness: 0.55 }),
    tile: std({ map: tex('concrete'), color: 0xe9e5de, roughness: 0.4 }),
    paving: std({ map: tex('rectangular_paving'), color: 0xe8dcc8 }),
    granite: std({ map: tex('granite_tile'), color: 0xb9b9b9, roughness: 0.35 }),
    grass: std({ map: tex('leafy_grass'), color: 0xc8d8a0 }),
    soil: std({ color: 0x5a4632, roughness: 1 }),
    carpet: std({ color: 0x5a3434, roughness: 1 }),
    rubber: std({ color: 0x3a3d40, roughness: 0.95 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xa7c2cf, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.22, reflectivity: 0.9, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.03, depthWrite: false, side: THREE.DoubleSide }),
    frame: std({ color: 0x2b2e31, roughness: 0.5, metalness: 0.4 }),
    doorWood: std({ map: tex('wood_floor'), color: 0xa8774f, roughness: 0.6 }),
    mainDoor: std({ map: tex('wood_floor'), color: 0x6b4630, roughness: 0.5 }),
    steel: std({ color: 0xb8bcc0, roughness: 0.35, metalness: 0.8 }),
    water: new THREE.MeshPhysicalMaterial({ color: 0x2f86a6, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.82, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.5, side: THREE.DoubleSide }),
    jaali: new THREE.MeshStandardMaterial({ map: jaali, alphaTest: 0.5, color: 0xf3efe7, roughness: 0.9, side: THREE.DoubleSide }),
    jaaliTeak: new THREE.MeshStandardMaterial({ map: jaali, alphaTest: 0.5, color: 0x8a5634, roughness: 0.6, side: THREE.DoubleSide }),
    jaaliBrick: new THREE.MeshStandardMaterial({ map: jaali, alphaTest: 0.5, color: 0xc77b5c, roughness: 0.9, side: THREE.DoubleSide }),
    solar: std({ color: 0x1d2a44, roughness: 0.2, metalness: 0.6 }),
    tank: std({ color: 0x2d2f33, roughness: 0.7 }),
    fabric: std({ color: 0xcfc6b8, roughness: 1 }),
    fabricDark: std({ color: 0x55606b, roughness: 1 }),
    furnWood: std({ color: 0x8b6243, roughness: 0.6 }),
    furnLight: std({ color: 0xcaa77d, roughness: 0.6 }),
    white: std({ color: 0xf2f2f0, roughness: 0.4 }),
    black: std({ color: 0x232527, roughness: 0.4 }),
    top: std({ color: 0xeae6de, roughness: 0.2 }),
    leaf: std({ color: 0x4f7a3a, roughness: 0.95, flatShading: true }),
    rug: std({ color: 0xc9b9a0, roughness: 1 }),
    linen: std({ color: 0xf5f2ec, roughness: 0.95 }),
    duvet: std({ color: 0xe9e3d8, roughness: 0.95 }),
    throw: std({ color: 0x9a8f7e, roughness: 1 }),
    headboard: std({ color: 0xbfae96, roughness: 0.95 }),
    rope: std({ color: 0xd8c49a, roughness: 1 }),
    joinery: std({ color: 0xe8e0d2, roughness: 0.45 }),
    brass: std({ color: 0xb08d57, roughness: 0.35, metalness: 0.9 }),
    shade: std({ color: 0xf3ead8, roughness: 0.9, emissive: 0xffe2b0, emissiveIntensity: 0.25, side: THREE.DoubleSide }),
    green: std({ color: 0x2f6b46, roughness: 0.9 }),
  };
}

/** Multani kashi tiles: cobalt and turquoise floral stars on white glaze, one 1 ft tile per repeat. */
function kashiTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#f4f1e8'; x.fillRect(0, 0, 128, 128);
  const star = (cx, cy, r, col) => {
    x.fillStyle = col; x.beginPath();
    for (let k = 0; k < 16; k++) { const a = (k * Math.PI) / 8, rr = k % 2 ? r * 0.45 : r; x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); }
    x.closePath(); x.fill();
  };
  // four-petal lattice between tiles, eight-point stars at the centres
  for (const [cx, cy] of [[0, 0], [128, 0], [0, 128], [128, 128]]) star(cx, cy, 30, '#1f4f9c');
  star(64, 64, 34, '#1f4f9c'); star(64, 64, 18, '#3fa7b5'); star(64, 64, 7, '#f4f1e8');
  x.strokeStyle = '#1f4f9c'; x.lineWidth = 5;
  for (const [cx, cy] of [[64, 0], [0, 64], [128, 64], [64, 128]]) { x.beginPath(); x.ellipse(cx, cy, 14, 14, 0, 0, Math.PI * 2); x.stroke(); }
  x.fillStyle = '#3fa7b5';
  for (const [cx, cy] of [[64, 0], [0, 64], [128, 64], [64, 128]]) { x.beginPath(); x.arc(cx, cy, 6, 0, Math.PI * 2); x.fill(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

/** Patterned encaustic cement tiles (cream, terracotta, slate blue), one 1 ft tile per repeat. */
function encausticTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#efe6d4'; x.fillRect(0, 0, 256, 256);
  const C = ['#b9533a', '#3f5f7a', '#d9a066'];
  x.save(); x.translate(128, 128);
  for (let k = 0; k < 8; k++) {           // eight-point star of petals
    x.rotate(Math.PI / 4);
    x.fillStyle = C[k % 2];
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(26, -40, 0, -96); x.quadraticCurveTo(-26, -40, 0, 0); x.fill();
  }
  x.fillStyle = C[2]; x.beginPath(); x.arc(0, 0, 18, 0, Math.PI * 2); x.fill();
  x.restore();
  x.fillStyle = C[1];                      // corner quarter-rosettes that join into a lattice
  for (const [cx, cy] of [[0, 0], [256, 0], [0, 256], [256, 256]]) { x.beginPath(); x.arc(cx, cy, 34, 0, Math.PI * 2); x.fill(); }
  x.strokeStyle = '#3f5f7a'; x.lineWidth = 6; x.strokeRect(3, 3, 250, 250);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Geometric jaali: an 8-point-star lattice cut out of a plaster screen. */
function jaaliTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#fff';
  x.fillRect(0, 0, 256, 256);
  x.globalCompositeOperation = 'destination-out';
  const star = (cx, cy, r) => {
    x.beginPath();
    for (let k = 0; k < 16; k++) {
      const a = (k * Math.PI) / 8 + Math.PI / 8;
      const rr = k % 2 ? r * 0.62 : r;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
    x.fill();
  };
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) star(64 + i * 128, 64 + j * 128, 46);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    x.beginPath(); x.arc(i * 128, j * 128, 16, 0, Math.PI * 2); x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------- furniture (feet in, metres out)
// Each piece is its footprint rect r = [x1, z1, x2, z2] and `face`, the direction its front
// faces. Pieces are modelled in local space with the front towards +z and the back towards −z,
// W along local x and D along local z, then rotated into place.
//
// Pieces with a real model in js/catalog.js are built as "slots": a group holding a simple
// stand-in, swapped for the real model once it has loaded (see furnish()). The rest are drawn
// here, kept slim and lifted on legs like real furniture so the floor reads under them.
const FACE_ROT = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
const SLOT_ALIGN = { sofa: 'back', armchair: 'centre', console: 'back', nightstand: 'back', chair: 'centre' };
let potSeed = 0;
function furniture(f, y, mat) {
  const g = new THREE.Group();
  const [x1, z1, x2, z2] = f.r;
  const ns = f.face === 'n' || f.face === 's' || !f.face;
  const W = ns ? x2 - x1 : z2 - z1;
  const D = ns ? z2 - z1 : x2 - x1;
  let tgt = g; // where B() puts boxes
  const soft = (m) => m === mat.fabric || m === mat.fabricDark || m === mat.white || m === mat.carpet || m === mat.linen || m === mat.headboard;
  const B = (w, h, d, m, px = 0, py = 0, pz = 0) => {
    const minD = Math.min(M(w), M(h), M(d));
    const rad = Math.min(soft(m) ? 0.05 : 0.008, minD * 0.45);
    const geo = minD > 0.02 ? new RoundedBoxGeometry(M(w), M(h), M(d), soft(m) ? 3 : 1, rad) : new THREE.BoxGeometry(M(w), M(h), M(d));
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(M(px), M(py + h / 2), M(pz));
    mesh.castShadow = true; mesh.receiveShadow = true;
    tgt.add(mesh);
    return mesh;
  };
  // four slim legs under a w × d top (feet)
  const legs = (w, d, h, m, t = 0.14, inset = 0.15, px = 0, pz = 0) => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(t, h, t, m, px + sx * (w / 2 - inset - t / 2), 0, pz + sz * (d / 2 - inset - t / 2));
  };
  // a slot for a real model: (px, pz) its centre and rot its turn in this piece's frame (feet)
  const slot = (id, w, d, px, pz, rot, opts = {}) => {
    const s = new THREE.Group();
    s.position.set(M(px), M(opts.y ?? 0), M(pz)); s.rotation.y = rot;
    s.userData.slot = { id, w: M(w), d: M(d), align: opts.align ?? 'centre', scale: opts.scale, hang: opts.hang };
    g.add(s);
    if (opts.proxy) { const prev = tgt; tgt = s; opts.proxy(); tgt = prev; s.children.forEach((c) => { c.userData.proxy = true; }); }
    return s;
  };
  // dining chair with its back towards local −z of its own frame, turned by rot
  const chair = (px, pz, rot, id = 'dining_chair_02') => slot(id, 1.45, 1.9, px, pz, rot, {
    proxy: () => { B(1.4, 0.2, 1.4, mat.fabric, 0, 1.45, 0); B(1.4, 1.5, 0.15, mat.fabric, 0, 1.65, -0.62); legs(1.4, 1.4, 1.45, mat.furnWood, 0.1, 0.05); },
  });
  let model = f.model === false ? null : (f.model ?? TYPE_MODEL[f.t]);
  let turn = 0; // quarter turn when a long model goes into a footprint that is deeper than wide
  if (f.t === 'coffee' && !f.model) {
    // pick the table that suits the footprint: round for a square, long for a long one, else a side table
    const mx = Math.max(W, D), mn = Math.min(W, D);
    model = mn >= 3.9 ? 'coffee_table_round_01' : (mx >= 3.6 && mn >= 1.8 ? 'modern_coffee_table_01' : 'side_table_01');
  }
  if (model === 'modern_coffee_table_01' && D > W) turn = Math.PI / 2;
  if (f.t === 'console' && !f.model && W < 7.4) model = null; // too short for the 8 ft sideboard: draw a slim console
  if (model && CATALOG[model]) {
    // the whole footprint is one real piece (sofa, armchair, coffee table, side table, sideboard…)
    const proxy = {
      sofa: () => { B(W, 0.9, D - 0.1, mat.fabric, 0, 0.45, 0.05); B(W, 1.3, 0.6, mat.fabric, 0, 1.0, -D / 2 + 0.3); legs(W, D, 0.45, mat.black, 0.12, 0.2); },
      armchair: () => { B(W, 0.8, D, mat.fabric, 0, 0.5, 0); B(W, 1.3, 0.4, mat.fabric, 0, 1.0, -D / 2 + 0.2); legs(W, D, 0.5, mat.black, 0.12, 0.15); },
      coffee: () => { B(W, 0.1, D, mat.top, 0, 1.3, 0); legs(W, D, 1.3, mat.black, 0.1, 0.2); },
      nightstand: () => { B(W, 0.9, D, mat.furnLight, 0, 0.9, 0); legs(W, D, 0.9, mat.furnLight, 0.12, 0.05); },
      console: () => { B(W, 1.8, D, mat.furnWood, 0, 0.4, 0); legs(W, D, 0.4, mat.black, 0.12, 0.2); },
      chair: () => { B(W * 0.9, 0.2, D * 0.8, mat.fabric, 0, 1.45, 0); legs(W * 0.9, D * 0.8, 1.45, mat.furnWood, 0.1, 0.05); },
    }[f.t];
    slot(model, turn ? D : W, turn ? W : D, 0, 0, turn, { align: f.align ?? SLOT_ALIGN[f.t] ?? 'centre', proxy: proxy ?? (() => B(W, 1.5, D, mat.fabric)) });
    if (f.t === 'nightstand' && f.lamp !== false) {
      // a small linen-shaded lamp on top
      B(0.35, 0.9, 0.35, mat.brass ?? mat.black, 0, 1.85, -0.1);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(M(0.42), M(0.55), M(0.75), 20, 1, true), mat.shade); sh.position.set(0, M(3.0), M(-0.1)); g.add(sh);
    }
  } else {
    switch (f.t) {
      case 'sofa': case 'armchair': // model switched off: slim upholstered stand-in on legs
        B(W, 0.9, D - 0.1, mat.fabric, 0, 0.45, 0.05); B(W, 1.3, 0.6, mat.fabric, 0, 1.0, -D / 2 + 0.3); legs(W, D, 0.45, mat.black, 0.12, 0.2);
        break;
      case 'coffee': B(W, 0.1, D, mat.top, 0, 1.3, 0); legs(W, D, 1.3, mat.black, 0.1, 0.2); break;
      case 'rug': { const m = new THREE.Mesh(new THREE.BoxGeometry(M(W), M(0.03), M(D)), mat.rug); m.position.y = M(0.02); m.receiveShadow = true; g.add(m); break; }
      case 'dining':
      case 'table':
      case 'table6': { // table on four legs, chairs (real models) on the long sides
        const outdoor = f.t === 'table6';
        const tw = W - 0.4, td = D - 3.6;
        B(tw, 0.14, td, outdoor ? mat.oak : (f.t === 'dining' ? mat.oak : mat.furnLight), 0, 2.36, 0);
        legs(tw, td, 2.36, outdoor ? mat.iron : mat.furnWood, 0.22, 0.35);
        const n = Math.max(1, Math.floor(tw / 2.3));
        const cid = outdoor ? 'painted_wooden_chair_01' : 'dining_chair_02';
        for (let k = 0; k < n; k++) {
          const px = -tw / 2 + (tw / n) * (k + 0.5);
          chair(px, -td / 2 - 0.55, 0, cid);       // back side, facing the table
          chair(px, td / 2 + 0.55, Math.PI, cid);  // front side, facing the table
        }
        if (f.ends) { chair(-tw / 2 - 0.9, 0, Math.PI / 2, cid); chair(tw / 2 + 0.9, 0, -Math.PI / 2, cid); }
        break;
      }
      case 'console': B(W, 0.12, D, mat.furnWood, 0, 2.5, 0); legs(W, D, 2.5, mat.furnWood, 0.14, 0.05); break;
      case 'counter': B(W, 0.35, D - 0.25, mat.black, 0, 0, -0.1); B(W, 2.45, D - 0.05, mat.joinery, 0, 0.35, 0); B(W, 0.12, D, mat.top, 0, 2.8, 0); break;
      case 'island': B(W - 0.3, 0.35, D - 0.6, mat.black, 0, 0, 0); B(W - 0.3, 2.5, D - 0.3, mat.furnWood, 0, 0.35, 0); B(W, 0.15, D, mat.top, 0, 2.85, 0); break;
      case 'stools': {
        const n = Math.max(1, Math.floor(W / 1.8));
        for (let k = 0; k < n; k++) {
          const px = -W / 2 + (W / n) * (k + 0.5);
          const seat = new THREE.Mesh(new THREE.CylinderGeometry(M(0.6), M(0.6), M(0.15), 20), mat.oak); seat.position.set(M(px), M(2.4), 0); seat.castShadow = true; g.add(seat);
          const post = new THREE.Mesh(new THREE.CylinderGeometry(M(0.06), M(0.06), M(2.35), 8), mat.black); post.position.set(M(px), M(1.18), 0); g.add(post);
          const base = new THREE.Mesh(new THREE.CylinderGeometry(M(0.55), M(0.55), M(0.05), 20), mat.black); base.position.set(M(px), M(0.03), 0); g.add(base);
        }
        break;
      }
      case 'fridge': B(W, 6, D, mat.steel); break;
      case 'washer': B(W, 2.8, D, mat.white); break;
      case 'tv': {
        // low sideboard (real model) with a wall-hung 65″ screen above it
        if (W >= 7.4 && D >= 1.6) slot('modern_wooden_cabinet', W, D, 0, 0, 0, { align: 'back', proxy: () => B(W, 2.0, D, mat.furnWood) });
        else { B(W, 1.5, D, mat.furnWood, 0, 0.4, 0); legs(W, D, 0.4, mat.black, 0.12, 0.15); }
        const sw = Math.min(W * 0.75, 4.8);
        const scr = new THREE.Mesh(new THREE.BoxGeometry(M(sw), M(sw * 0.5625), M(0.1)), mat.black);
        scr.position.set(0, M(4.6), M(-D / 2 + 0.06)); g.add(scr);
        break;
      }
      case 'bed': {
        // low upholstered platform bed: legs, frame, mattress, duvet, pillows and a tall padded headboard
        B(W - 0.2, 0.75, D - 0.6, mat.headboard, 0, 0.35, 0.25);
        legs(W - 0.2, D - 0.6, 0.35, mat.furnWood, 0.18, 0.4, 0, 0.25);
        B(W - 0.4, 0.8, D - 0.9, mat.linen, 0, 1.1, 0.3);
        B(W - 0.3, 0.12, (D - 0.9) * 0.62, mat.duvet, 0, 1.9, 0.3 + (D - 0.9) * 0.19);
        B(W - 0.3, 0.14, 1.2, mat.throw, 0, 1.92, D / 2 - 1.3);
        const pw = (W - 1.0) / 2;
        for (const sx of [-1, 1]) B(pw, 0.45, 1.1, mat.linen, sx * (pw / 2 + 0.15), 1.9, -D / 2 + 1.25);
        B(W, 4.0, 0.35, mat.headboard, 0, 0, -D / 2 + 0.17);
        break;
      }
      case 'nightstand': B(W, 0.9, D, mat.furnLight, 0, 0.9, 0); legs(W, D, 0.9, mat.furnLight, 0.12, 0.05); break;
      case 'wardrobe': case 'tall': {
        // flush light joinery to the ceiling line, with door gaps and slim pulls
        B(W, 0.3, D - 0.1, mat.black, 0, 0, -0.05);
        B(W, 7.7, D, mat.joinery, 0, 0.3, 0);
        const n = Math.max(1, Math.round(W / 1.75));
        for (let k = 1; k < n; k++) B(0.03, 7.5, 0.05, mat.black, -W / 2 + (W / n) * k, 0.4, D / 2);
        for (let k = 0; k < n; k++) B(0.06, 1.6, 0.08, mat.brass ?? mat.steel, -W / 2 + (W / n) * (k + 0.5) + (k % 2 ? -0.35 : 0.35), 3.2, D / 2 + 0.03);
        break;
      }
      case 'shelf': {
        // open shelving: two sides and five boards
        B(0.1, 7, D, mat.furnWood, -W / 2 + 0.05); B(0.1, 7, D, mat.furnWood, W / 2 - 0.05);
        for (let k = 0; k < 5; k++) B(W - 0.2, 0.1, D, mat.furnWood, 0, 0.3 + k * 1.65, 0);
        break;
      }
      case 'wc': B(W * 0.55, 1.3, D - 0.8, mat.white, 0, 0, 0.35); B(W * 0.8, 1.5, 0.5, mat.white, 0, 1.4, -D / 2 + 0.3); break;
      case 'vanity': {
        B(W, 1.6, D - 0.1, mat.furnWood, 0, 1.0, 0.05); B(W, 0.12, D, mat.top, 0, 2.6, 0);
        const mir = new THREE.Mesh(new THREE.BoxGeometry(M(W * 0.9), M(2.6), M(0.06)), mat.glass); mir.position.set(0, M(4.8), M(-D / 2 + 0.05)); g.add(mir);
        break;
      }
      case 'shower': {
        B(W, 0.15, D, mat.white);
        const p = new THREE.Mesh(new THREE.BoxGeometry(M(W), M(6.5), M(0.05)), mat.glass); p.position.set(0, M(3.5), M(D / 2)); g.add(p);
        break;
      }
      case 'desk': {
        B(W, 0.12, D, mat.oak, 0, 2.4, 0); legs(W, D, 2.4, mat.black, 0.12, 0.1);
        slot('desk_lamp_arm_01', 1, 1, W / 2 - 0.8, -D / 2 + 0.6, Math.PI * 0.85, { y: 2.52, scale: 1 });
        break;
      }
      case 'chair': chair(0, 0, 0); break;
      case 'lounger': B(W, 0.25, D, mat.white, 0, 0.9, 0); B(W, 1.6, 0.25, mat.white, 0, 1.1, -D / 2 + 0.6); legs(W, D, 0.9, mat.oak, 0.15, 0.2); break;
      case 'planter': {
        const h = f.h ?? 1.5;
        B(W, h, D, mat.band);
        B(W - 0.4, 0.1, D - 0.4, mat.soil, 0, h, 0);
        const n = Math.max(2, Math.round((W * D) / 6));
        const bl = [];
        for (let k = 0; k < n; k++) {
          const u = (k + 0.5) / n;
          bl.push({ x: M(W >= D ? (u - 0.5) * (W - 1) : 0), y: M(h + 0.9), z: M(W >= D ? 0 : (u - 0.5) * (D - 1)), r: M(0.9 + (k % 3) * 0.25) });
        }
        g.add(foliage(bl, 'leaf', 0.8));
        break;
      }
      case 'pool': B(W, 2.5, D, mat.furnWood); B(W - 0.6, 0.1, D - 0.6, mat.green, 0, 2.5, 0); break;
      case 'theatre': {
        const rows = 3, rd = D / rows, per = Math.max(1, Math.floor(W / 3.6));
        for (let r = 0; r < rows; r++) {
          const pz = D / 2 - rd * (r + 0.5), py = r * 0.6; // row 0 at the front
          if (r) B(W, py, rd, mat.carpet, 0, 0, pz);
          for (let k = 0; k < per; k++) {
            const px = -W / 2 + (W / per) * (k + 0.5);
            B(3, 1.5, 3, mat.carpet, px, py, pz); B(3, 1.6, 0.6, mat.carpet, px, py + 1.5, pz - 1.2);
          }
        }
        break;
      }
      case 'screen': B(W, 6.5, D, mat.white, 0, 2.5, 0); break;
      case 'treadmill': B(W, 0.6, D, mat.black); B(W, 4, 0.3, mat.black, 0, 0.6, D / 2 - 0.15); break;
      case 'bench': B(W, 0.3, D, mat.headboard, 0, 1.25, 0); legs(W, D, 1.25, mat.black, 0.12, 0.1); break;
      case 'charpai': // woven-rope day bed on turned legs
        B(W, 0.18, D, mat.teak, 0, 1.3, 0); B(W - 0.35, 0.06, D - 0.35, mat.rope, 0, 1.42, 0); legs(W, D, 1.3, mat.teak, 0.25, 0.0);
        break;
      case 'pot': {
        // a real potted plant (two species, alternating), at its true size
        const id = f.plant ?? (potSeed++ % 2 ? 'potted_plant_02' : 'potted_plant_01');
        const s = slot(id, W, D, 0, 0, (potSeed * 2.1) % (Math.PI * 2), {
          scale: f.h ? f.h / 4.4 : 1,
          proxy: () => {
            const h = 2.2;
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(M(Math.min(W, D) / 2), M(Math.min(W, D) / 2.8), M(h), 16), mat.pot);
            pot.position.y = M(h / 2); pot.castShadow = true; tgt.add(pot);
          },
        });
        void s;
        break;
      }
      default: break;
    }
  }
  g.position.set(M((x1 + x2) / 2), M(y), M((z1 + z2) / 2));
  g.rotation.y = FACE_ROT[f.face ?? 's'];
  return g;
}

// ---------------------------------------------------------------- arches
/** Extrude a 2D shape (u along the wall, v up, feet) through the wall thickness and place it. */
function wallShape(shape, alongX, c1, c2) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: c2 - c1, bevelEnabled: false, curveSegments: 18 });
  if (alongX) g.translate(0, 0, c1);
  else { g.rotateY(-Math.PI / 2); g.translate(c2, 0, 0); }
  g.scale(FT, FT, FT);
  return g;
}
/** The wall above a round arch: from the springing line up to yTop, with the semicircle cut out. */
function spandrelShape(a, b, ySpring, yTop) {
  const R = (b - a) / 2, mid = (a + b) / 2;
  const s = new THREE.Shape();
  s.moveTo(a, yTop); s.lineTo(a, ySpring);
  for (let k = 1; k <= 24; k++) { const t = Math.PI - (Math.PI * k) / 24; s.lineTo(mid + R * Math.cos(t), ySpring + R * Math.sin(t)); }
  s.lineTo(b, yTop); s.lineTo(a, yTop);
  return s;
}
/** Rectangle-plus-semicircle (an arched pane) from y0 to the apex. */
function archPaneShape(a, b, y0, ySpring) {
  const R = (b - a) / 2, mid = (a + b) / 2;
  const s = new THREE.Shape();
  s.moveTo(a, y0); s.lineTo(b, y0); s.lineTo(b, ySpring);
  for (let k = 1; k <= 24; k++) { const t = (Math.PI * k) / 24; s.lineTo(mid + R * Math.cos(t), ySpring + R * Math.sin(t)); }
  s.lineTo(a, y0);
  return s;
}
/** A thin semicircular frame (ring) at the top of an arched opening. */
function archRingShape(a, b, ySpring, w) {
  const R = (b - a) / 2, mid = (a + b) / 2;
  const s = new THREE.Shape();
  s.moveTo(b, ySpring);
  for (let k = 1; k <= 24; k++) { const t = (Math.PI * k) / 24; s.lineTo(mid + R * Math.cos(t), ySpring + R * Math.sin(t)); }
  s.lineTo(a + w, ySpring);
  for (let k = 23; k >= 1; k--) { const t = (Math.PI * k) / 24; s.lineTo(mid + (R - w) * Math.cos(t), ySpring + (R - w) * Math.sin(t)); }
  s.lineTo(b - w, ySpring); s.lineTo(b, ySpring);
  return s;
}
/** Rounded rectangle in plan (x, z) for pools. */
function roundedRect(x1, z1, x2, z2, r) {
  const s = new THREE.Shape();
  s.moveTo(x1 + r, z1); s.lineTo(x2 - r, z1); s.absarc(x2 - r, z1 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x2, z2 - r); s.absarc(x2 - r, z2 - r, r, 0, Math.PI / 2, false);
  s.lineTo(x1 + r, z2); s.absarc(x1 + r, z2 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x1, z1 + r); s.absarc(x1 + r, z1 + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

// ---------------------------------------------------------------- builder
/**
 * opts.offsetZFt: place the house this many feet south of the current plot (e.g. 50 = next plot south).
 * opts.context:  a neighbour shown for context only (no ground holes, not walked in or measured).
 */
export function buildHouse(scene, site, d, design, opts = {}) {
  const { HOUSE, LEVELS, STAIR, LIFT, SUNKEN, ROOF, YARD } = design;
  const FEAT = design.FEATURES ?? {};
  const STYLE = design.STYLE ?? {};
  const mat = makeMaterials();
  const extMat = (level) => STYLE.ext?.[level] ?? 'ext';
  const intMat = STYLE.int ?? 'int';
  const railMat = STYLE.railing ?? 'glass';
  const groups = {
    basement: new THREE.Group(), ground: new THREE.Group(), first: new THREE.Group(), roof: new THREE.Group(),
    yard: new THREE.Group(), yardPlain: new THREE.Group(), yardBasement: new THREE.Group(),
  };
  groups.basementGF = new THREE.Group(); // GF pieces that only exist with a basement
  groups.noBasementGF = new THREE.Group();
  groups.ground.add(groups.basementGF, groups.noBasementGF);
  const labelGroups = {};
  for (const k of ['basement', 'ground', 'first', 'roof']) { labelGroups[k] = new THREE.Group(); groups[k].add(labelGroups[k]); }

  const surfaces = []; // walkable: {r:[x1,z1,x2,z2] ft, y ft | yA/yB along x, level}
  const colliders = []; // {minX,maxX,minZ,maxZ (m), minY, maxY (m), level}
  const pickables = [];

  // merged geometry buckets per level and material
  const buckets = new Map();
  const put = (level, matKey, geo, opts = {}) => {
    const key = `${level}|${matKey}|${opts.noShadow ? 1 : 0}`;
    if (!buckets.has(key)) buckets.set(key, { level, matKey, geos: [], opts });
    buckets.get(key).geos.push(geo);
  };
  // foliage blobs (feet in), turned into instanced leaf cards per level when everything is built
  const leafBlobs = new Map();
  const blob = (level, kind, x, y, z, r) => {
    const key = `${level}|${kind}`;
    if (!leafBlobs.has(key)) leafBlobs.set(key, []);
    leafBlobs.get(key).push({ x: M(x), y: M(y), z: M(z), r: M(r) });
  };
  const addCollider = (r, y0, y1, level) => colliders.push({
    minX: M(r[0]), maxX: M(r[2]), minZ: M(r[1]), maxZ: M(r[3]), minY: M(y0), maxY: M(y1), level,
  });
  /** a 3′6″ railing along the thin rect r (feet), standing on y */
  function railing(level, r, y) {
    if (railMat === 'iron') {
      const alongX = r[2] - r[0] >= r[3] - r[1];
      const len = alongX ? r[2] - r[0] : r[3] - r[1];
      const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
      put(level, 'iron', alongX ? fbox(r[0], y + 3.3, cz - 0.08, r[2], y + 3.5, cz + 0.08) : fbox(cx - 0.08, y + 3.3, r[1], cx + 0.08, y + 3.5, r[3]));
      put(level, 'iron', alongX ? fbox(r[0], y + 0.25, cz - 0.04, r[2], y + 0.35, cz + 0.04) : fbox(cx - 0.04, y + 0.25, r[1], cx + 0.04, y + 0.35, r[3]));
      const n = Math.max(2, Math.round(len / 0.42));
      for (let k = 0; k <= n; k++) {
        const p = (alongX ? r[0] : r[1]) + (len * k) / n;
        put(level, 'iron', alongX ? fbox(p - 0.035, y, cz - 0.035, p + 0.035, y + 3.3, cz + 0.035) : fbox(cx - 0.035, y, p - 0.035, cx + 0.035, y + 3.3, p + 0.035));
      }
    } else {
      put(level, 'glass', fbox(r[0], y, r[1], r[2], y + 3.5, r[3]), { noShadow: true });
      put(level, 'frame', fbox(r[0] - 0.05, y + 3.4, r[1] - 0.05, r[2] + 0.05, y + 3.55, r[3] + 0.05));
    }
    addCollider(r, y, y + 3.5, level);
  }

  // ---- walls + openings
  const filled = new Set();
  function buildWalls(level, data, y0, y1) {
    const H = y1 - y0;
    for (const w of data.walls) {
      const [x1, z1, x2, z2] = w.r;
      const alongX = (x2 - x1) >= (z2 - z1);
      const a1 = alongX ? x1 : z1, a2 = alongX ? x2 : z2;
      const c1 = alongX ? z1 : x1, c2 = alongX ? z2 : x2;
      const mine = data.openings
        .filter((o) => o.axis === (alongX ? 'x' : 'z') && o.at >= c1 - 0.01 && o.at <= c2 + 0.01 && o.b > a1 && o.a < a2)
        .map((o) => ({ o, a: Math.max(o.a, a1), b: Math.min(o.b, a2) }))
        .sort((p, q) => p.a - q.a);
      const matKey = w.m ?? (w.rcc ? 'rcc' : (w.ext ? extMat(level) : intMat));
      const pieces = [];
      const push = (p1, p2, ya, yb) => {
        if (p2 - p1 < 0.01 || yb - ya < 0.01) return;
        pieces.push(alongX ? [p1, ya, c1, p2, yb, c2] : [c1, ya, p1, c2, yb, p2]);
      };
      let cur = a1;
      for (const m of mine) {
        push(cur, m.a, y0, y1);
        if (m.o.sill > 0) push(m.a, m.b, y0, y0 + m.o.sill);
        if (m.o.arch) put(level, matKey, worldUV(wallShape(spandrelShape(m.a, m.b, y0 + m.o.head, y1), alongX, c1, c2), 1.5));
        else if (m.o.head < H) push(m.a, m.b, y0 + m.o.head, y1);
        cur = Math.max(cur, m.b);
        if (!filled.has(m.o)) { filled.add(m.o); fillOpening(level, m.o, alongX, (c1 + c2) / 2, c2 - c1, y0); }
      }
      push(cur, a2, y0, y1);
      // an outer wall in a face material (brick) gets a limewashed lining on its inside face
      let inSide = 0;
      const lining = w.ext && !w.m && STYLE.lining;
      if (lining) {
        const inside = data.enclosed ?? data.footprint ?? [];
        const am = (a1 + a2) / 2;
        const test = (c) => inside.some((r) => (alongX ? am > r[0] && am < r[2] && c > r[1] && c < r[3] : c > r[0] && c < r[2] && am > r[1] && am < r[3]));
        const lo = test(c1 - 0.1), hi = test(c2 + 0.1);
        inSide = lo && !hi ? -1 : hi && !lo ? 1 : 0;
      }
      for (const p of pieces) {
        if (inSide) {
          // p = [x1, y1, z1, x2, y2, z2]; the cross axis is z for walls along x, x otherwise
          const ci = alongX ? [2, 5] : [0, 3];
          const inner = p.slice(), outer = p.slice(), t = 0.08;
          if (inSide < 0) { inner[ci[1]] = p[ci[0]] + t; outer[ci[0]] = p[ci[0]] + t; } else { inner[ci[0]] = p[ci[1]] - t; outer[ci[1]] = p[ci[1]] - t; }
          put(level, STYLE.lining, worldUV(fbox(...inner), 1.5));
          put(level, matKey, worldUV(fbox(...outer), 1.5));
          if (p[1] < y0 + 5.5 && p[4] > y0 + 1) addCollider([p[0], p[2], p[3], p[5]], p[1], p[4], level);
          continue;
        }
        const geo = worldUV(fbox(...p), 1.5);
        put(level, matKey, geo);
        // walk collision for the solid parts that reach head height
        if (p[1] < y0 + 5.5 && p[4] > y0 + 1) addCollider([p[0], p[2], p[3], p[5]], p[1], p[4], level);
      }
      // cladding on the outer face of the core
      if (w.clad === 'wood') {
        const outX = Math.min(x1, x2) - 0.06;
        const [s1, s2] = w.cladSkip ?? [z2, z2];
        put(level, 'wood', worldUV(fbox(outX, y0 - (level === 'ground' ? 1 : 1.5), z1 + 0.375, outX + 0.06, y1 + 1.5, s1), 1.2));
        if (s2 < z2) put(level, 'wood', worldUV(fbox(outX, y0 - (level === 'ground' ? 1 : 1.5), s2, outX + 0.06, y1 + 1.5, z2), 1.2));
      }
    }
  }

  function fillOpening(level, o, alongX, c, thick, y0) {
    const sillY = y0 + o.sill, headY = y0 + o.head;
    const a = o.a, b = o.b;
    const span = (p1, p2, t, ya, yb, off = 0) => alongX ? fbox(p1, ya, c - t / 2 + off, p2, yb, c + t / 2 + off) : fbox(c - t / 2 + off, ya, p1, c + t / 2 + off, yb, p2);
    const frameT = 0.17;
    const archTop = () => {
      // arched head: glass fanlight + frame ring, set in the middle of the wall
      put(level, 'glass', wallShape(archPaneShape(a, b, headY, headY), alongX, c - 0.02, c + 0.02), { noShadow: true });
      put(level, 'frame', wallShape(archRingShape(a, b, headY, frameT), alongX, c - 0.15, c + 0.15));
      put(level, 'frame', span(a, b, 0.3, headY - frameT / 2, headY + frameT / 2));
      put(level, 'frame', span((a + b) / 2 - 0.05, (a + b) / 2 + 0.05, 0.3, headY, headY + (b - a) / 2));
    };
    if (o.shutters) {
      // a pair of louvred timber shutters folded back against the outside face
      const out = o.out === 'w' || o.out === 'n' ? -1 : 1;
      const face = c + out * (thick / 2 + 0.06);
      const w2 = (b - a) / 2;
      const top = headY + (o.arch ? (b - a) / 2 * 0.6 : 0);
      for (const [p1, p2] of [[a - w2, a], [b, b + w2]]) {
        put(level, 'shutter', alongX ? fbox(p1, sillY, face - 0.05, p2, top, face + 0.05) : fbox(face - 0.05, sillY, p1, face + 0.05, top, p2));
        for (let yy = sillY + 0.4; yy < top - 0.2; yy += 0.45) put(level, 'shutter', alongX ? fbox(p1 + 0.08, yy, face + out * 0.05, p2 - 0.08, yy + 0.12, face + out * 0.12) : fbox(face + out * 0.05, yy, p1 + 0.08, face + out * 0.12, yy + 0.12, p2 - 0.08));
      }
    }
    if (o.type === 'window' || o.type === 'slide' || o.type === 'glassdoor') {
      put(level, 'glass', span(a, b, 0.04, sillY, headY), { noShadow: true });
      if (o.arch) archTop();
      // frame
      put(level, 'frame', span(a, b, 0.3, headY - frameT, headY));
      put(level, 'frame', span(a, b, 0.3, sillY, sillY + frameT));
      put(level, 'frame', span(a, a + frameT, 0.3, sillY, headY));
      put(level, 'frame', span(b - frameT, b, 0.3, sillY, headY));
      const n = Math.max(1, Math.round((b - a) / (o.type === 'slide' ? 4 : 4.5)));
      for (let k = 1; k < n; k++) { const p = a + ((b - a) * k) / n; put(level, 'frame', span(p - 0.06, p + 0.06, 0.3, sillY, headY)); }
      if (o.type === 'window' && o.sill > 0.2) {
        // sill (inside + outside)
        put(level, 'stone', span(a - 0.2, b + 0.2, thick + 0.5, sillY - 0.15, sillY));
      }
      if (o.fins) {
        // vertical fins on the outside (west), ≤ 2 ft deep (bye-law 15a(4))
        const n2 = Math.max(3, Math.round((b - a) / 1.0) + 1);
        for (let k = 0; k < n2; k++) {
          const p = a + ((b - a) * k) / (n2 - 1);
          put(level, 'wood', fbox(c - thick / 2 - 1.25, sillY - 0.5, p - 0.1, c - thick / 2, headY + 0.5, p + 0.1));
        }
      }
      return;
    }
    if (o.type === 'opening' || o.type === 'arcade') return;
    if (o.arch) archTop();
    if (o.type === 'lift') {
      put(level, 'steel', span(a, b, 0.1, y0, headY));
      return;
    }
    // swing / double / pivot doors: leaves drawn open
    const leafMat = o.leaf ?? (o.type === 'pivot' ? 'mainDoor' : 'doorWood');
    const leaves = o.type === 'double' ? [[a, (a + b) / 2, 1], [b, (a + b) / 2, -1]] : [[a, b, 1]];
    // A leaf hinged at h, closed position pointing towards e. Rotation φ about Y makes the leaf's
    // direction (cos φ, 0, −sin φ); both leaves of a pair swing to the same side of the wall.
    const theta = o.type === 'pivot' ? 1.1 : 1.4;
    for (const [h, e, s] of leaves) {
      const w = Math.abs(e - h);
      const g = new THREE.BoxGeometry(M(w), M(o.head - 0.05), M(0.15));
      g.translate(M(w / 2), M((o.head - 0.05) / 2), 0);
      const phi0 = alongX ? (s > 0 ? 0 : Math.PI) : (s > 0 ? -Math.PI / 2 : Math.PI / 2);
      g.rotateY(phi0 + s * theta);
      g.translate(alongX ? M(h) : M(c), M(y0), alongX ? M(c) : M(h));
      put(level, leafMat, g);
    }
    // frame
    put(level, 'frame', span(a, b, thick + 0.05, headY - 0.12, headY));
  }

  // ---- floors (finish per room) + labels
  const floorMat = { marble: 'marble', wood: 'floorWood', tile: 'tile', stone: 'stone', paving: 'paving', carpet: 'carpet', rubber: 'rubber', courtyard: 'paving', planter: 'soil', terracotta: 'terracotta', parquet: 'parquet', limestone: 'limestone' };
  const tile = { marble: 2.2, floorWood: 1.6, tile: 1.2, stone: 2.5, paving: 1.8, carpet: 1, rubber: 1, soil: 1, terracotta: 3.2, parquet: 3.0, limestone: 4 };
  function buildRooms(level, data, y) {
    for (const r of data.rooms) {
      const fy = y - (r.sunk ?? 0) + 0.015;
      if (!r.noFloor) {
        const mk = floorMat[r.floor] ?? 'tile';
        put(level, mk, worldUV(fplane(r.r, fy), tile[mk] ?? 1.5), { noShadow: true });
      }
      if (r.beams) {
        // exposed timber beams across the short span, 3′6″ apart, under the ceiling
        const ceil = (LEVELS[level]?.ceiling ?? y + 10.5);
        const [bx1, bz1, bx2, bz2] = r.r;
        const alongZ = (bx2 - bx1) >= (bz2 - bz1); // beams span the short direction
        const len = alongZ ? bx2 - bx1 : bz2 - bz1;
        const span0 = alongZ ? bx2 - bx1 : bz2 - bz1, nb = Math.max(1, Math.round(span0 / 4.5));
        for (let k = 0; k < nb; k++) {
          const p = (alongZ ? bx1 : bz1) + (span0 / nb) * (k + 0.5);
          put(level, 'oak', alongZ ? fbox(p - 0.25, ceil - 0.6, bz1, p + 0.25, ceil, bz2) : fbox(bx1, ceil - 0.6, p - 0.25, bx2, ceil, p + 0.25));
        }
        void len;
      }
      // a ceiling fan in bedrooms and lounges, as in every Pakistani house
      if (!r.outdoor && !r.noFloor && r.fan !== false && (r.fan || /bed|lounge|study/i.test(r.name ?? ''))) {
        const ceil = (LEVELS[level]?.ceiling ?? y + 10.5) - (r.beams ? 0.6 : 0);
        const s = new THREE.Group();
        s.position.set(M((r.r[0] + r.r[2]) / 2), M(ceil), M((r.r[1] + r.r[3]) / 2));
        s.userData.slot = { id: 'ceiling_fan', hang: true, scale: 1 };
        groups[level].add(s);
      }
      if (!r.noLabel && r.name) {
        const w = r.r[2] - r.r[0], dd = r.r[3] - r.r[1];
        const big = r.outdoor ? '' : `<br><small>${fmtShort(Math.min(w, dd))} × ${fmtShort(Math.max(w, dd))}</small>`;
        const l = label(`${r.name}${big}`, `room${r.outdoor ? ' outdoor' : ''}`);
        l.position.set(M((r.r[0] + r.r[2]) / 2), M(y + 0.4), M((r.r[1] + r.r[3]) / 2));
        labelGroups[level].add(l);
      }
    }
    for (const f of data.furniture) groups[level].add(furniture(f, y, mat));
  }

  // ---- slabs: material array [sides..., top, bottom]
  function slab(level, rects, top, thick, sideKey, opts = {}) {
    for (const r of rects) {
      const g = worldUV(fbox(r[0], top - thick, r[1], r[2], top, r[3]), 2);
      const side = mat[sideKey];
      const m = new THREE.Mesh(g, [side, side, opts.topMat ? mat[opts.topMat] : mat.slabTop, opts.bottomMat ? mat[opts.bottomMat] : mat.ceiling, side, side]);
      m.castShadow = true; m.receiveShadow = true;
      (opts.group ?? groups[level]).add(m);
      pickables.push(m);
    }
  }

  // ======================= levels
  const L = LEVELS;
  const G = HOUSE.ground, F1 = HOUSE.first, B = HOUSE.basement;
  // A stair runs along x by default. With axis 'z', x0/xl/x1 are read as z positions and the two
  // halves ('north'/'south') as x ranges, so the same spec describes a stair running front to back.
  const SZ = STAIR.axis === 'z';
  const stairWell = SZ ? [STAIR.north[0], STAIR.x0, STAIR.south[1], STAIR.x1] : [STAIR.x0, STAIR.north[0], STAIR.x1, STAIR.south[1]];
  const sbox = (u1, y1, v1, u2, y2, v2) => (SZ ? fbox(v1, y1, u1, v2, y2, u2) : fbox(u1, y1, v1, u2, y2, v2));
  const srect = (u1, v1, u2, v2) => (SZ ? [v1, u1, v2, u2] : [u1, v1, u2, v2]);
  const liftR = LIFT ? [LIFT.r] : [];

  // ground floor
  const gfFloor = G.floorOutline;
  const court = G.courtyard ? [G.courtyard] : [];
  const sideG = STYLE.slabSide?.ground ?? 'stone', sideF = STYLE.slabSide?.first ?? 'band', sideR = STYLE.slabSide?.roof ?? 'ext';
  slab('ground', subtractRects(gfFloor, court), L.ground.floor, 1.5, sideG, { group: groups.noBasementGF });
  slab('ground', subtractRects(gfFloor, [...court, stairWell]), L.ground.floor, 1.5, sideG, { group: groups.basementGF });
  if (G.courtyard) slab('ground', [G.courtyard], L.ground.floor - 0.5, 1.0, sideG);
  buildWalls('ground', G, L.ground.floor, L.ground.ceiling);
  buildRooms('ground', G, L.ground.floor);
  // jaali screens (Scheme A)
  for (const j of FEAT.jaali ?? []) {
    const jy0 = j.y0 ?? L.ground.floor, jy1 = j.y1 ?? L.ground.ceiling;
    const geo = fbox(j.r[0], jy0, j.r[1], j.r[2], jy1, j.r[3]);
    const uv = geo.attributes.uv;
    const len = Math.max(j.r[2] - j.r[0], j.r[3] - j.r[1]);
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 2.2, uv.getY(i) * (jy1 - jy0) / 2.2);
    const m = new THREE.Mesh(geo, mat[j.m ?? 'jaali']); m.castShadow = true; groups[j.level ?? 'ground'].add(m);
  }
  // entrance steps (yard +0.5 → plinth +1.5)
  for (const st of FEAT.steps ?? []) {
    const [sx1, sz1, sx2, sz2] = st.r;
    if (!st.dir) {
      put('ground', st.m ?? 'stone', worldUV(fbox(sx1, 0.5, sz1, sx2, st.y, sz2), 2));
      surfaces.push({ r: st.r, y: st.y, level: 'ground' });
      continue;
    }
    // a flight of treads rising towards st.dir ('e' | 'w' | 'n' | 's'), 6″ risers
    const n = Math.max(1, Math.round((st.y - 0.5) / 0.55)), rise = (st.y - 0.5) / n;
    const alongX = st.dir === 'e' || st.dir === 'w', up = st.dir === 'e' || st.dir === 's';
    const len = alongX ? sx2 - sx1 : sz2 - sz1, run = len / n;
    for (let k = 0; k < n; k++) {
      const a = up ? k * run : len - (k + 1) * run, top = 0.5 + (k + 1) * rise;
      const g = alongX ? fbox(sx1 + a, 0.5, sz1, sx1 + len, top, sz2) : fbox(sx1, 0.5, sz1 + a, sx2, top, sz1 + len);
      if (!up) { const b = alongX ? fbox(sx1, 0.5, sz1, sx1 + a + run, top, sz2) : fbox(sx1, 0.5, sz1, sx2, top, sz1 + a + run); put('ground', st.m ?? 'stone', worldUV(b, 2)); }
      else put('ground', st.m ?? 'stone', worldUV(g, 2));
    }
    const lo = 0.5 + rise, hi = st.y;
    surfaces.push(alongX ? { r: st.r, yA: up ? lo : hi, yB: up ? hi : lo, level: 'ground' } : { r: st.r, zA: up ? lo : hi, zB: up ? hi : lo, level: 'ground' });
  }
  // terraces on the ground-floor roof: a brick parapet with a jaali panel along the open sides
  for (const tr of FEAT.terraces ?? []) {
    const [tx1, tz1, tx2, tz2] = tr.r, top = L.first.floor, t = 0.375;
    for (const side of tr.open ?? []) {
      const r = { n: [tx1, tz1, tx2, tz1 + t], s: [tx1, tz2 - t, tx2, tz2], w: [tx1, tz1, tx1 + t, tz2], e: [tx2 - t, tz1, tx2, tz2] }[side];
      put('first', 'brick', worldUV(fbox(r[0], top, r[1], r[2], top + 0.6, r[3]), 1.5));
      put('first', 'jaaliBrick', fbox(r[0] + 0.1, top + 0.6, r[1] + 0.1, r[2] - 0.1, top + 2.6, r[3] - 0.1));
      put('first', 'brick', worldUV(fbox(r[0] - 0.05, top + 2.6, r[1] - 0.05, r[2] + 0.05, top + 3.0, r[3] + 0.05), 1.5));
      addCollider(r, top, top + 3.0, 'first');
    }
  }
  // car porch (bye-law 15(a)(5)-(11)): a slab on its own brick columns, never on the boundary wall
  for (const po of FEAT.porches ?? []) {
    const [px1, pz1, px2, pz2] = po.r, h = po.h ?? 11;
    put('ground', 'rcc', fbox(px1, h - 0.75, pz1, px2, h, pz2));
    put('ground', 'teak', fbox(px1 + 0.05, h - 0.8, pz1 + 0.05, px2 - 0.05, h - 0.75, pz2 - 0.05));
    put('ground', 'kashi', worldUV(fbox(px1 - 0.05, h - 0.75, pz1 - 0.05, px2 + 0.05, h - 0.35, pz2 + 0.05), 1));
    for (const [cx, cz] of po.cols ?? []) {
      put('ground', 'brick', worldUV(fbox(cx - 0.75, 0.5, cz - 0.75, cx + 0.75, h - 0.75, cz + 0.75), 1.5));
      addCollider([cx - 0.75, cz - 0.75, cx + 0.75, cz + 0.75], 0.5, h, 'ground');
    }
  }
  // furniture and planters standing in the yard
  for (const fz of FEAT.yardFurniture ?? []) groups.yard.add(furniture(fz, 0.5, mat));

  // first floor (its floor slab is the ground-floor roof, including the terrace)
  const gfRoof = subtractRects(G.roofOutline, court);
  const voids = F1.voids ?? [];
  slab('first', subtractRects(gfRoof, [stairWell, ...voids]), L.first.floor, 1.5, sideF);
  buildWalls('first', F1, L.first.floor, L.first.ceiling);
  buildRooms('first', F1, L.first.floor);
  // railings / parapets on the open parts of the ground-floor roof
  const ffFoot = F1.footprint;
  const railEdges = boundaryEdges(gfRoof, [], (inner) => !inRects(ffFoot, inner[0], inner[1]));
  for (const e of railEdges) {
    const t = 0.15;
    const r = e.nx ? [e.x1 - (e.nx > 0 ? t : 0), e.z1, e.x1 + (e.nx < 0 ? t : 0), e.z2] : [e.x1, e.z1 - (e.nz > 0 ? t : 0), e.x2, e.z1 + (e.nz < 0 ? t : 0)];
    // every open part of the ground-floor roof is a terrace with a 3′6″ railing
    railing('first', r, L.first.floor);
  }
  // railings along the edges of double-height voids
  if (voids.length) {
    const ffFloorRects = subtractRects(gfRoof, [stairWell, ...voids]);
    const voidEdges = boundaryEdges(ffFloorRects, [], (inner, outer) => inRects(voids, outer[0], outer[1]));
    for (const e of voidEdges) {
      const t = 0.15;
      const r = e.nx ? [e.x1 - (e.nx > 0 ? t : 0), e.z1, e.x1 + (e.nx < 0 ? t : 0), e.z2] : [e.x1, e.z1 - (e.nz > 0 ? t : 0), e.x2, e.z1 + (e.nz < 0 ? t : 0)];
      railing('first', r, L.first.floor);
    }
  }
  // balconies (slab + railing on the open sides)
  for (const bal of FEAT.balconies ?? []) {
    const [bx1, bz1, bx2, bz2] = bal.r;
    const top = L.first.floor;
    const g = worldUV(fbox(bx1, top - 0.6, bz1, bx2, top, bz2), 2);
    groups.first.add(Object.assign(new THREE.Mesh(g, [mat.limestone, mat.limestone, mat.terracotta, mat.limestone, mat.limestone, mat.limestone]), { castShadow: true, receiveShadow: true }));
    const t = 0.15;
    for (const side of bal.open ?? []) {
      const r = { n: [bx1, bz1, bx2, bz1 + t], s: [bx1, bz2 - t, bx2, bz2], w: [bx1, bz1, bx1 + t, bz2], e: [bx2 - t, bz1, bx2, bz2] }[side];
      railing('first', r, top);
    }
    // stone brackets under the slab
    const n = Math.max(2, Math.round(Math.max(bx2 - bx1, bz2 - bz1) / 4));
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n;
      const px = bx2 - bx1 > bz2 - bz1 ? bx1 + u * (bx2 - bx1) : (bx1 + bx2) / 2;
      const pz = bx2 - bx1 > bz2 - bz1 ? (bz1 + bz2) / 2 : bz1 + u * (bz2 - bz1);
      put('first', 'limestone', fbox(px - 0.3, top - 1.6, pz - 0.3, px + 0.3, top - 0.6, pz + 0.3));
    }
    surfaces.push({ r: bal.r, y: top, level: 'first' });
  }

  // roof
  const canopy = ROOF.canopy; // 2 ft sunshades beyond the first-floor front
  const skylights = ROOF.skylights ?? [];
  const roofRects = subtractRects(ffFoot, [stairWell, ...liftR, ...skylights]);
  slab('roof', roofRects, L.roof.floor, 1.5, sideR);
  // skylights: a lined opening through the slab, a 1′6″ curb on the roof and a glass lid
  for (const [kx1, kz1, kx2, kz2] of skylights) {
    const t = 0.375, top = L.roof.floor + 1.5;
    for (const r of [[kx1 - t, kz1 - t, kx2 + t, kz1], [kx1 - t, kz2, kx2 + t, kz2 + t], [kx1 - t, kz1, kx1, kz2], [kx2, kz1, kx2 + t, kz2]]) {
      put('roof', extMat('roof'), worldUV(fbox(r[0], L.roof.floor - 1.5, r[1], r[2], top, r[3]), 1.5));
    }
    put('roof', 'glass', fbox(kx1 - t, top, kz1 - t, kx2 + t, top + 0.06, kz2 + t), { noShadow: true });
    addCollider([kx1 - t, kz1 - t, kx2 + t, kz2 + t], L.roof.floor, top + 0.1, 'roof');
  }
  // eaves / sunshades beyond the walls, with a timber soffit where the style asks for one
  slab('roof', subtractRects(canopy, ffFoot), L.roof.floor, STYLE.eave ?? 1.5, sideR, { bottomMat: STYLE.soffit });
  const parapetEdges = boundaryEdges(ffFoot, [], () => true);
  if (STYLE.frieze) {
    for (const e of parapetEdges) {
      const o = 0.06; // just proud of the wall
      const r = e.nx ? [e.x1 + (e.nx > 0 ? 0 : -o), e.z1, e.x1 + (e.nx > 0 ? o : 0), e.z2] : [e.x1, e.z1 + (e.nz > 0 ? 0 : -o), e.x2, e.z1 + (e.nz > 0 ? o : 0)];
      put('roof', STYLE.frieze, worldUV(fbox(r[0], L.roof.floor - 2.4, r[1], r[2], L.roof.floor - 1.5, r[3]), 1));
    }
  }
  for (const e of parapetEdges) {
    const t = 0.375;
    const r = e.nx ? [e.x1 - (e.nx > 0 ? t : 0), e.z1, e.x1 + (e.nx < 0 ? t : 0), e.z2] : [e.x1, e.z1 - (e.nz > 0 ? t : 0), e.x2, e.z1 + (e.nz < 0 ? t : 0)];
    put('roof', extMat('roof'), worldUV(fbox(r[0], L.roof.floor, r[1], r[2], L.roof.parapet, r[3]), 1.5));
    put('roof', STYLE.coping ?? 'band', fbox(r[0] - 0.08, L.roof.parapet, r[1] - 0.08, r[2] + 0.08, L.roof.parapet + 0.2, r[3] + 0.08));
    addCollider(r, L.roof.floor, L.roof.parapet, 'roof');
  }
  // stair tower (mumty) and lift overrun
  {
    const [x1, z1, x2, z2] = ROOF.mumty;
    const mumty = {
      walls: [
        { r: [x1, z1, x2, z1 + 0.75], ext: true }, { r: [x1, z2 - 0.75, x2, z2], ext: true },
        { r: [x1, z1, x1 + 0.75, z2], ext: true, clad: ROOF.mumtyClad, cladSkip: ROOF.mumtyCladSkip }, { r: [x2 - 0.75, z1, x2, z2], ext: true },
      ],
      openings: ROOF.mumtyOpenings ?? [],
    };
    buildWalls('roof', mumty, L.roof.floor, L.roof.mumtyCeiling);
    slab('roof', [[x1, z1, x2, z2]], L.roof.mumtyTop, 1.5, 'ext');
    if (LIFT) {
      const [lx1, lz1, lx2, lz2] = LIFT.r;
      put('roof', extMat('roof'), worldUV(fbox(lx1, L.roof.floor - 1.5, lz1, lx2, L.roof.liftTop, lz2), 1.5));
      if (ROOF.mumtyClad === 'wood') put('roof', 'wood', worldUV(fbox(lx1 - 0.06, L.roof.floor, lz1 + 0.375, lx1, L.roof.liftTop, lz2), 1.2));
      addCollider([lx1, lz1, lx2, lz2], L.roof.floor, L.roof.liftTop, 'roof');
    }
  }
  // tanks, solar, AC units
  for (const [tx, tz] of ROOF.tanks) {
    const g = new THREE.CylinderGeometry(M(2.4), M(2.4), M(5), 20);
    g.translate(M(tx), M(L.roof.floor + 1 + 2.5), M(tz));
    put('roof', 'tank', g);
    put('roof', 'rcc', fbox(tx - 2.6, L.roof.floor, tz - 2.6, tx + 2.6, L.roof.floor + 1, tz + 2.6));
  }
  {
    // South-facing rows: rotateX(+tilt) lowers the +z (south) edge, so the panel face points south and up.
    const s = ROOF.solar;
    const t = (s.tiltDeg * Math.PI) / 180;
    const lh = s.panelL * Math.cos(t), rise = s.panelL * Math.sin(t), base = L.roof.floor + 1.0;
    for (const row of s.rows) {
      const zN = row.z;                           // high (north) edge of the row
      for (let i = 0; i < row.n; i++) {
        const x = row.x + i * (s.panelW + 0.1) + s.panelW / 2;
        const panel = new THREE.BoxGeometry(M(s.panelW), M(0.12), M(s.panelL));
        panel.rotateX(t);
        panel.translate(M(x), M(base + rise / 2), M(zN + lh / 2));
        put('roof', 'solar', panel);
      }
      const xEnd = row.x + row.n * (s.panelW + 0.1);
      for (const px of [row.x + 0.5, (row.x + xEnd) / 2, xEnd - 0.6]) {
        put('roof', 'steel', fbox(px - 0.1, L.roof.floor, zN + 0.3, px + 0.1, base + rise - 0.1, zN + 0.5));      // tall leg (north)
        put('roof', 'steel', fbox(px - 0.1, L.roof.floor, zN + lh - 0.5, px + 0.1, base, zN + lh - 0.3));       // short leg (south)
      }
    }
  }
  for (const [ax, az] of ROOF.acUnits) put('roof', 'white', fbox(ax - 1.4, L.roof.floor + 0.3, az, ax + 1.4, L.roof.floor + 2.3, az + 1.0));
  if (ROOF.ups) { const u = ROOF.ups; put('roof', 'band', fbox(u[0], L.roof.floor, u[1], u[2], L.roof.floor + 6, u[3])); }

  // stairs
  const stairMeshes = (level, flights, landings, group) => {
    for (const [half, yE, yW] of flights) {
      const [za, zb] = STAIR[half];
      const n = Math.round(Math.abs(yW - yE) / 0.6);
      const r = (yW - yE) / n;                   // rise per step (signed, towards the west)
      const tread = (STAIR.x1 - STAIR.xl) / (n - 1);
      for (let k = 1; k < n; k++) {
        const top = yE + k * r;
        const xa = STAIR.x1 - k * tread, xb = STAIR.x1 - (k - 1) * tread;
        const g = worldUV(sbox(xa, top - 0.9, za, xb, top, zb), 1.2);
        (group ? group.add(new THREE.Mesh(g, mat.marble)) : put(level, 'marble', g));
      }
      // ramp: lowest/landing end at xl, the other at x1 (along z for a z stair)
      surfaces.push(SZ ? { r: srect(STAIR.xl, za, STAIR.x1, zb), zA: yW, zB: yE, level } : { r: [STAIR.xl, za, STAIR.x1, zb], yA: yW, yB: yE, level });
    }
    for (const y of landings) {
      const g = worldUV(sbox(STAIR.x0, y - 0.6, STAIR.north[0], STAIR.xl, y, STAIR.south[1]), 1.2);
      (group ? group.add(new THREE.Mesh(g, mat.marble)) : put(level, 'marble', g));
      surfaces.push({ r: srect(STAIR.x0, STAIR.north[0], STAIR.xl, STAIR.south[1]), y, level });
    }
    // centre railing between the two flights
    const ry = flights.map((f) => Math.min(f[1], f[2]));
    const yLo = Math.min(...ry), yHi = Math.max(...flights.map((f) => Math.max(f[1], f[2])));
    const mid = (STAIR.north[1] + STAIR.south[0]) / 2;
    const rail = sbox(STAIR.xl, yLo + 0.4, mid - 0.075, STAIR.x1, yHi + 3, mid + 0.075);
    (group ? group.add(new THREE.Mesh(rail, mat.glass)) : put(level, 'glass', rail, { noShadow: true }));
  };
  stairMeshes('ground', STAIR.flights.slice(0, 2), [STAIR.landings[0]]);
  if (STAIR.flights.length > 2) stairMeshes('roof', STAIR.flights.slice(2, 4), [STAIR.landings[1]]);
  if (B) {
    const bStairGroup = new THREE.Group();
    groups.basement.add(bStairGroup);
    const surfBefore = surfaces.length;
    stairMeshes('basement', STAIR.basementFlights, [STAIR.basementLanding], bStairGroup);
    for (let i = surfBefore; i < surfaces.length; i++) surfaces[i].level = 'basement';
    slab('basement', B.footprint, L.basement.floor, 1.0, 'rcc');
    buildWalls('basement', B, L.basement.floor, L.basement.ceiling);
    buildRooms('basement', B, L.basement.floor);
  }

  // ---- courtyard (side courtyard, open to the south side passage)
  if (G.courtyard) {
    const c = G.courtyard;
    const y = L.ground.floor - 0.5;
    put('ground', 'grass', worldUV(fplane([c[0] + 1.5, c[1] + 3.5, c[0] + 8.5, c[3] - 4.5], y + 0.03), 2), { noShadow: true });
    // a water channel and a tree in the side passage, at yard level
    put('ground', 'water', fplane([c[0] + 1.0, 46.3, c[2] - 3.5, 47.7], 0.58), { noShadow: true });
    put('ground', 'granite', fbox(c[0] + 0.8, 0.5, 46.1, c[2] - 3.3, 0.56, 47.9));
    const t = makeTree(4.5, 1.25); t.position.set(M(c[2] - 1.6), M(0.5), M(47.2)); groups.ground.add(t);
    const p = makePerson(0x6b4c8a, 1.6); p.position.set(M(c[0] + 5), M(y), M(c[1] + 6)); p.rotation.y = 0.8; groups.ground.add(p);
  }

  // ---- yard: drive, path, lawn, trees, cars
  const yardY = 0.5;
  put('yard', 'paving', worldUV(fplane(YARD.drive, yardY + 0.03), 1.8), { noShadow: true });
  put('yard', 'paving', worldUV(fplane(YARD.path, yardY + 0.03), 1.8), { noShadow: true });
  if (YARD.pump) { const q = YARD.pump; put('yard', 'band', fbox(q[0], yardY, q[1], q[2], yardY + 2.5, q[3])); }
  for (const c of YARD.cars) {
    const car = makeCar(c.model, c.color); // the model's nose points +x, towards the house
    car.position.set(M(YARD.carNoseX) - car.userData.length / 2, M(yardY), M(c.z));
    groups.yard.add(car);
  }
  const lawnPlain = new THREE.Mesh(worldUV(fplane(YARD.lawn, yardY + 0.025), 2), mat.grass);
  lawnPlain.receiveShadow = true;
  groups.yardPlain.add(lawnPlain);
  for (const [tx, tz] of YARD.trees) { const t = makeTree(5.5, 1.6); t.position.set(M(tx), M(yardY), M(tz)); groups.yardPlain.add(t); }
  const tl = label('2 trees in the front lawn<br><small>bye-law 17(e)</small>', 'prop');
  tl.position.set(M(YARD.trees[0][0]), M(19), M((YARD.trees[0][1] + YARD.trees[1][1]) / 2)); groups.yardPlain.add(tl);
  // basement version: sunken garden
  if (B && SUNKEN) {
    const [sx1, sz1, sx2, sz2] = SUNKEN.r;
    const lawnB = subtractRects([YARD.lawn], [SUNKEN.r]).map((r) => worldUV(fplane(r, yardY + 0.025), 2));
    groups.yardBasement.add(Object.assign(new THREE.Mesh(mergeGeometries(lawnB), mat.grass), { receiveShadow: true }));
    const yb = SUNKEN.floor;
    groups.yardBasement.add(Object.assign(new THREE.Mesh(worldUV(fbox(sx1, yb - 1, sz1, sx2, yb, sz2), 1.8), mat.paving), { receiveShadow: true }));
    // retaining walls (RCC) with a glass guard on top
    const rw = [[sx1 - 0.75, sz1 - 0.75, sx2, sz1], [sx1 - 0.75, sz2, sx2, sz2 + 0.75], [sx1 - 0.75, sz1, sx1, sz2]];
    for (const r of rw) {
      groups.yardBasement.add(Object.assign(new THREE.Mesh(worldUV(fbox(r[0], yb - 1, r[1], r[2], yardY + 0.3, r[3]), 1.5), mat.rcc), { receiveShadow: true, castShadow: true }));
      groups.yardBasement.add(new THREE.Mesh(fbox(r[0] + 0.3, yardY + 0.3, r[1] + 0.3, r[2] - 0.3, yardY + 3.8, r[3] - 0.3), mat.glass));
    }
    // 2.5 ft stair down along the west edge (bye-law 17b)
    const [qx1, qz1, qx2, qz2] = SUNKEN.stair;
    const n = 17;
    for (let k = 0; k < n; k++) {
      const top = yardY - (k + 1) * ((yardY - yb) / n);
      const za = qz1 + 1 + k * ((qz2 - qz1 - 1) / n);
      groups.yardBasement.add(Object.assign(new THREE.Mesh(fbox(qx1, top - 0.8, za, qx2, top, za + (qz2 - qz1 - 1) / n), mat.stone), { receiveShadow: true }));
    }
    groups.yardBasement.add(furniture({ t: 'planter', r: [7.0, 6.0, 15.0, 8.0], face: 's', h: 1.5 }, yb, mat));
    groups.yardBasement.add(furniture({ t: 'bench', r: [9.0, 14.2, 14.0, 15.8], face: 'n' }, yb, mat));
    for (const [tx, tz] of YARD.treesWithBasement) { const t = makeTree(5.5, 1.5); t.position.set(M(tx), M(yardY), M(tz)); groups.yardBasement.add(t); }
    const sl = label('Sunken garden<br><small>lights the basement · keeps plinth at 1′6″</small>', 'room outdoor');
    sl.position.set(M(10), M(yardY + 1), M(12)); groups.yardBasement.add(sl);
    surfaces.push({ r: [sx1, sz1, sx2, sz2], y: yb, level: 'yardBasement' });
    surfaces.push({ r: [qx1, qz1 + 1, qx2, qz2], zA: yardY, zB: yb, level: 'yardBasement' }); // ramp along z
    for (const r of rw) addCollider(r, yb, yardY + 3.8, 'yardBasement');
  }

  // ---- rear garden: lawn, deck, raised plunge pool, trees, privacy screen
  const GD = design.GARDEN;
  if (GD) {
    for (const r of GD.lawn ?? []) put('yard', 'grass', worldUV(fplane(r, yardY + 0.025), 2), { noShadow: true });
    for (const r of GD.paving ?? []) { put('yard', GD.pavingMat ?? 'terracotta', worldUV(fbox(r[0], yardY, r[1], r[2], yardY + 0.15, r[3]), 3.2)); surfaces.push({ r, y: yardY + 0.15, level: 'yard' }); }
    for (const r of GD.deck ?? []) { put('yard', 'oak', worldUV(fbox(r[0], yardY, r[1], r[2], yardY + 0.35, r[3]), 2.5)); surfaces.push({ r, y: yardY + 0.35, level: 'yard' }); }
    if (GD.pool) {
      const P = GD.pool;
      const [px1, pz1, px2, pz2] = P.r;
      const wall = 0.75, top = yardY + (P.h ?? 1.6);
      // coping wall: outer rounded rect minus inner
      const outer = roundedRect(px1, pz1, px2, pz2, P.radius ?? 2.5);
      const inner = roundedRect(px1 + wall, pz1 + wall, px2 - wall, pz2 - wall, Math.max(0.5, (P.radius ?? 2.5) - wall));
      outer.holes.push(inner);
      const ring = new THREE.ExtrudeGeometry(outer, { depth: top - yardY, bevelEnabled: false, curveSegments: 16 });
      ring.rotateX(Math.PI / 2); ring.translate(0, top, 0); ring.scale(FT, FT, FT);
      put('yard', 'limestone', worldUV(ring, 2.5));
      const water = new THREE.ShapeGeometry(roundedRect(px1 + wall, pz1 + wall, px2 - wall, pz2 - wall, Math.max(0.5, (P.radius ?? 2.5) - wall)), 16);
      water.rotateX(Math.PI / 2); water.translate(0, top - 0.35, 0); water.scale(FT, FT, FT);
      put('yard', 'water', water, { noShadow: true });
      const floor = new THREE.ShapeGeometry(roundedRect(px1 + wall, pz1 + wall, px2 - wall, pz2 - wall, Math.max(0.5, (P.radius ?? 2.5) - wall)), 16);
      floor.rotateX(Math.PI / 2); floor.translate(0, yardY - 3.0, 0); floor.scale(FT, FT, FT);
      put('yard', 'poolTile', floor, { noShadow: true });
      addCollider(P.r, yardY, top, 'yard');
    }
    for (const r of GD.tiles ?? []) { put('yard', 'encaustic', worldUV(fbox(r[0], yardY, r[1], r[2], yardY + 0.15, r[3]), 1.6)); surfaces.push({ r, y: yardY + 0.15, level: 'yard' }); }
    for (const r of GD.beds ?? []) {
      // tropical planting beds: low kerb, soil and layered broad leaves
      put('yard', 'limestone', fbox(r[0], yardY, r[1], r[2], yardY + 0.6, r[3]));
      const n = Math.round((r[2] - r[0]) * (r[3] - r[1]) / 2.5);
      for (let k = 0; k < n; k++) {
        const gx = r[0] + 0.6 + ((k * 0.618) % 1) * (r[2] - r[0] - 1.2), gz = r[1] + 0.6 + ((k * 0.382) % 1) * (r[3] - r[1] - 1.2);
        blob('yard', k % 7 === 0 ? 'flower' : 'leaf', gx, yardY + 1.2 + (k % 3) * 0.7, gz, 0.8 + (k % 4) * 0.35);
      }
    }
    if (GD.pergola) {
      // timber pergola: posts, two beams, rafters, bougainvillea on top
      const [qx1, qz1, qx2, qz2] = GD.pergola.r, h = yardY + GD.pergola.h;
      for (const px of [qx1 + 0.3, qx2 - 0.3]) for (const pz of [qz1 + 0.3, (qz1 + qz2) / 2, qz2 - 0.3]) put('yard', 'oak', fbox(px - 0.3, yardY, pz - 0.3, px + 0.3, h, pz + 0.3));
      for (const px of [qx1 + 0.3, qx2 - 0.3]) put('yard', 'oak', fbox(px - 0.3, h, qz1 - 0.6, px + 0.3, h + 0.8, qz2 + 0.6));
      for (let pz = qz1; pz <= qz2 + 0.01; pz += 1.6) put('yard', 'oak', fbox(qx1 - 0.8, h + 0.8, pz - 0.15, qx2 + 0.8, h + 1.3, pz + 0.15));
      const n = Math.round((qx2 - qx1) * (qz2 - qz1) / 4);
      for (let k = 0; k < n; k++) {
        const gx = qx1 + ((k * 0.618) % 1) * (qx2 - qx1), gz = qz1 + ((k * 0.382) % 1) * (qz2 - qz1);
        blob('yard', k % 3 === 0 ? 'flower' : 'leaf', gx, h + 1.5 + (k % 2) * 0.4, gz, 0.7 + (k % 3) * 0.3);
      }
    }
    for (const [a, b] of GD.lights ?? []) {
      // a sagging string of warm bulbs
      const n = Math.max(6, Math.round(Math.hypot(b[0] - a[0], b[2] - a[2]) / 1.4));
      for (let k = 0; k <= n; k++) {
        const u = k / n, sag = Math.sin(Math.PI * u) * 1.2;
        const px = a[0] + (b[0] - a[0]) * u, py = a[1] + (b[1] - a[1]) * u - sag, pz = a[2] + (b[2] - a[2]) * u;
        const bulb = new THREE.SphereGeometry(M(0.14), 8, 6); bulb.translate(M(px), M(py), M(pz));
        put('yard', 'bulb', bulb, { noShadow: true });
      }
    }
    for (const [tx, tz, h, c] of GD.trees ?? []) { const t = makeTree(h ?? 6, c ?? 1.6); t.position.set(M(tx), M(yardY), M(tz)); groups.yard.add(t); }
    for (const sc of GD.screens ?? []) {
      // privacy screen for the pool (bye-law 24b asks for 10 ft): a trellis, or a clipped hedge
      const [sx1, sz1, sx2, sz2] = sc.r;
      put('yard', sc.m === 'leaf' ? 'green' : (sc.m ?? 'oak'), sc.m === 'leaf' ? fbox(sx1 + 0.2, yardY, sz1 + 0.2, sx2 - 0.2, yardY + sc.h - 1.0, sz2 - 0.2) : fbox(sx1, yardY, sz1, sx2, yardY + sc.h, sz2));
      if (sc.m === 'leaf') for (let hy = yardY + 1.5; hy < yardY + sc.h; hy += 2.2) blob('yard', 'hedge', (sx1 + sx2) / 2, hy, (sz1 + sz2) / 2, 0.1);
      const alongX = sx2 - sx1 > sz2 - sz1;
      const len = alongX ? sx2 - sx1 : sz2 - sz1;
      for (let k = 0; k < len / 1.6; k++) {
        const u = (alongX ? sx1 : sz1) + 0.8 + k * 1.6;
        const hh = yardY + 2 + ((k * 37) % 7);
        blob('yard', sc.m === 'leaf' ? 'hedge' : (k % 4 === 0 ? 'flower' : 'leaf'), alongX ? u : (sx1 + sx2) / 2, hh, alongX ? (sz1 + sz2) / 2 : u, 1.0 + (k % 3) * 0.3);
      }
    }
    for (const fz of GD.furniture ?? []) groups.yard.add(furniture(fz, fz.y ?? yardY, mat));
  }
  // climbers (bougainvillea) on wall faces
  // jharokas: projecting timber oriel windows on carved brackets, with jaali sides and a small
  // tiled canopy. { side: 'w'|'e'|'n'|'s', at: wall face (ft), a, b: span along the wall, y: floor level }
  for (const jh of FEAT.jharokas ?? []) {
    const dep = jh.depth ?? 2.0, y0 = jh.y, out = jh.side === 'w' || jh.side === 'n' ? -1 : 1, alongX = jh.side === 'n' || jh.side === 's';
    const lvl = jh.level ?? 'first';
    // box from along-wall u (a..b), outward distance w0..w1, height y1..y2
    const jb = (u1, u2, w0, w1, y1, y2) => {
      const c1 = jh.at + out * w0, c2 = jh.at + out * w1;
      return alongX ? fbox(u1, y1, Math.min(c1, c2), u2, y2, Math.max(c1, c2)) : fbox(Math.min(c1, c2), y1, u1, Math.max(c1, c2), y2, u2);
    };
    put(lvl, 'teak', jb(jh.a, jh.b, 0, dep, y0 + 0.9, y0 + 1.6));                       // floor of the oriel (sill seat)
    for (let k = 0; k < 3; k++) {                                                        // carved brackets
      const u = jh.a + 0.4 + k * ((jh.b - jh.a - 0.8) / 2);
      put(lvl, 'teak', jb(u - 0.2, u + 0.2, 0, dep - 0.3, y0 - 0.6, y0 + 0.9));
    }
    put(lvl, 'teak', jb(jh.a, jh.a + 0.35, 0, dep, y0 + 1.6, y0 + 7.4));                  // corner posts
    put(lvl, 'teak', jb(jh.b - 0.35, jh.b, 0, dep, y0 + 1.6, y0 + 7.4));
    put(lvl, 'teak', jb(jh.a, jh.b, dep - 0.35, dep, y0 + 1.6, y0 + 2.4));                // front rail
    put(lvl, 'jaaliTeak', jb(jh.a + 0.35, jh.b - 0.35, dep - 0.2, dep - 0.15, y0 + 2.4, y0 + 7.0)); // front jaali
    put(lvl, 'jaaliTeak', jb(jh.a, jh.a + 0.05, 0.1, dep - 0.35, y0 + 1.6, y0 + 7.0));        // side jaalis
    put(lvl, 'jaaliTeak', jb(jh.b - 0.05, jh.b, 0.1, dep - 0.35, y0 + 1.6, y0 + 7.0));
    put(lvl, 'teak', jb(jh.a - 0.4, jh.b + 0.4, 0, dep + 0.6, y0 + 7.4, y0 + 7.75));       // canopy
    put(lvl, 'kashi', jb(jh.a - 0.4, jh.b + 0.4, dep + 0.55, dep + 0.62, y0 + 7.0, y0 + 7.75));
  }
  // steel spiral stair to the roof (bye-law 17c: allowed when no inside stair reaches the roof)
  for (const sp of FEAT.spirals ?? []) {
    const lvl = 'yard', r = sp.r ?? 2.75, n = Math.round((sp.y1 - sp.y0) / 0.6);
    put(lvl, 'iron', fbox(sp.x - 0.2, sp.y0, sp.z - 0.2, sp.x + 0.2, sp.y1 + 3.5, sp.z + 0.2));
    for (let k = 1; k <= n; k++) {
      const t = new THREE.BoxGeometry(M(r), M(0.12), M(0.95));
      t.translate(M(r / 2), 0, 0);
      t.rotateY(k * 0.42);
      t.translate(M(sp.x), M(sp.y0 + k * ((sp.y1 - sp.y0) / n)), M(sp.z));
      put(lvl, 'iron', t);
      const post = new THREE.BoxGeometry(M(0.08), M(3), M(0.08));
      post.translate(M(r - 0.1), M(1.5), 0); post.rotateY(k * 0.42);
      post.translate(M(sp.x), M(sp.y0 + k * ((sp.y1 - sp.y0) / n)), M(sp.z));
      put(lvl, 'iron', post);
    }
  }
  for (const v of FEAT.vines ?? []) {
    const [vx1, vz1, vx2, vz2] = v.r;
    const alongX = vx2 - vx1 >= vz2 - vz1;
    const len = alongX ? vx2 - vx1 : vz2 - vz1;
    const n = Math.round(len * (v.y1 - v.y0) / (v.sparse ?? 6));
    for (let k = 0; k < n; k++) {
      const u = ((k * 0.618) % 1) * len, h = v.y0 + ((k * 0.37) % 1) * (v.y1 - v.y0) * (0.4 + 0.6 * ((k * 0.13) % 1));
      blob(v.level ?? 'ground', k % 3 === 0 ? 'leaf' : 'flower', alongX ? vx1 + u : (vx1 + vx2) / 2, h, alongX ? (vz1 + vz2) / 2 : vz1 + u, 0.45 + (k % 3) * 0.2);
    }
  }
  // lanterns: a hanging lantern in the hall and wall lanterns by the doors
  for (const ln of FEAT.lanterns ?? []) {
    const lv = ln.level ?? 'ground';
    const s = ln.size ?? 1.2;
    const body = new THREE.CylinderGeometry(M(s * 0.5), M(s * 0.42), M(s * 1.3), 8);
    body.translate(M(ln.x), M(ln.y), M(ln.z));
    put(lv, 'lantern', body, { noShadow: true });
    const cap = new THREE.ConeGeometry(M(s * 0.6), M(s * 0.5), 8);
    cap.translate(M(ln.x), M(ln.y + s * 0.9), M(ln.z));
    put(lv, 'iron', cap);
    if (ln.hang) put(lv, 'iron', fbox(ln.x - 0.03, ln.y + s, ln.z - 0.03, ln.x + 0.03, ln.hang, ln.z + 0.03));
    if (ln.light && !opts.context) {
      const pl = new THREE.PointLight(0xffc890, ln.light, M(28), 2);
      pl.position.set(M(ln.x), M(ln.y), M(ln.z));
      groups[lv].add(pl);
    }
  }

  // ---- flush foliage and buckets into meshes
  for (const [key, arr] of leafBlobs) {
    const [level, kind] = key.split('|');
    groups[level].add(foliage(arr, kind, kind === 'hedge' ? 1.6 : 1));
  }
  for (const b of buckets.values()) {
    const geo = mergeGeometries(b.geos.map((g) => (g.index ? g.toNonIndexed() : g)));
    const m = new THREE.Mesh(geo, mat[b.matKey]);
    m.castShadow = !b.opts.noShadow && b.matKey !== 'glass';
    if (b.matKey === 'glass' || b.matKey === 'water' || b.matKey === 'bulb' || b.matKey === 'lantern') m.userData.noAO = true;
    m.receiveShadow = true;
    groups[b.level].add(m);
    if (b.matKey !== 'glass') pickables.push(m);
  }

  // ---- walkable surfaces
  const addFloors = (rects, y, level) => rects.forEach((r) => surfaces.push({ r, y, level }));
  addFloors(subtractRects(gfFloor, [...court, stairWell]), L.ground.floor, 'ground');
  addFloors([stairWell], L.ground.floor, 'noBasementGF');
  if (G.courtyard) addFloors([G.courtyard], L.ground.floor - 0.5, 'ground');
  addFloors(subtractRects(gfRoof, [stairWell, ...voids]), L.first.floor, 'first');
  addFloors(subtractRects([...ffFoot], [stairWell, ...liftR, ...(ROOF.skylights ?? [])]), L.roof.floor, 'roof');
  if (B) {
    addFloors(subtractRects(B.footprint, [stairWell]), L.basement.floor, 'basement');
    addFloors([stairWell], L.basement.floor, 'basement');
  }

  const root = new THREE.Group();
  root.position.z = M(opts.offsetZFt ?? 0);
  for (const g of Object.values(groups)) if (!g.parent) root.add(g);
  scene.add(root);

  // ---- areas (bye-law checks)
  const ffCovered = unionArea(subtractRects(ffFoot, voids));
  const gfCovered = unionArea(subtractRects(G.roofOutline, court));
  const gfEnclosed = G.enclosed ? unionArea(G.enclosed) : null;
  const pergolaCounted = design.GARDEN?.pergola ? 0.25 * unionArea([design.GARDEN.pergola.r]) : 0;
  // a car porch counts where it stands inside the buildable area (its part in the front clear space is allowed by 15(a)(11))
  const porchCounted = (FEAT.porches ?? []).reduce((a, po) => a + Math.max(0, po.r[2] - Math.max(po.r[0], d.sbFt?.front ?? 15.75)) * Math.max(0, Math.min(po.r[3], 44.625) - Math.max(po.r[1], 5.375)), 0);
  const mumtyArea = (ROOF.mumty[2] - ROOF.mumty[0]) * (ROOF.mumty[3] - ROOF.mumty[1]);
  const areas = {
    gfCovered: gfCovered + pergolaCounted + porchCounted, gfEnclosed, pergolaCounted, porchCounted, ffCovered, ffAllowed: d.ffSqft, mumtyArea, basement: B ? unionArea(B.footprint) : null,
    courtyard: G.courtyard ? (G.courtyard[2] - G.courtyard[0]) * (G.courtyard[3] - G.courtyard[1]) : 0,
    voids: unionArea(voids),
    top: L.roof.mumtyTop, liftTop: L.roof.liftTop,
  };

  // ---- state
  let basementOn = false;
  let cut = 'roof';
  const order = ['basement', 'ground', 'first', 'roof'];
  function apply() {
    const idx = order.indexOf(cut);
    groups.basement.visible = basementOn && idx >= 0;
    groups.ground.visible = idx >= 1;
    groups.first.visible = idx >= 2;
    groups.roof.visible = idx >= 3;
    if (cut === 'basement') { groups.basement.visible = basementOn; groups.ground.visible = false; }
    groups.basementGF.visible = basementOn;
    groups.noBasementGF.visible = !basementOn;
    groups.yardPlain.visible = !basementOn;
    groups.yardBasement.visible = basementOn;
    // only the top visible level shows its room labels
    const topLevel = cut === 'roof' ? null : cut;
    for (const k of order) labelGroups[k].visible = k === topLevel;
    // looking at the basement: lift the ground off the house footprint so it can be seen
    if (!opts.context && B && SUNKEN) site.setPlotHoles(basementOn ? (cut === 'basement' ? [SUNKEN.r, ...B.footprint] : [SUNKEN.r]) : []);
  }
  apply();

  const levelActive = (lv) => {
    if (lv === 'basement') return basementOn;
    if (lv === 'yardBasement') return basementOn;
    if (lv === 'noBasementGF') return !basementOn;
    return true;
  };

  /** Highest walkable house surface under (x, z) metres that is not above `maxY` metres. */
  function surfaceAt(xm, zm, maxY) {
    const x = xm / FT, z = zm / FT;
    let best = -Infinity;
    for (const s of surfaces) {
      if (!levelActive(s.level)) continue;
      const r = s.r;
      if (x < r[0] || x > r[2] || z < r[1] || z > r[3]) continue;
      let y;
      if (s.yA !== undefined) y = s.yA + ((x - r[0]) / (r[2] - r[0])) * (s.yB - s.yA);
      else if (s.zA !== undefined) y = s.zA + ((z - r[1]) / (r[3] - r[1])) * (s.zB - s.zA);
      else y = s.y;
      const ym = M(y);
      if (ym <= maxY && ym > best) best = ym;
    }
    return best;
  }

  const houseColliders = colliders.map((c) => Object.assign(c, { get off() { return !levelActive(c.level); } }));

  return {
    root, groups, areas, pickables, colliders: houseColliders, surfaceAt,
    hasBasement: !!B,
    holes: () => (basementOn && SUNKEN ? [SUNKEN.r] : []),
    setBasement(on) { basementOn = on; if (!on && cut === 'basement') cut = 'ground'; apply(); },
    setCut(level) { cut = level; apply(); },
    get basementOn() { return basementOn; },
    teleports: design.TELEPORTS ?? {},
    fmtArea: fmtSqft,
  };
}
