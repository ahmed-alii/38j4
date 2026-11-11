// Builds the site at 1:1 scale.
// Axes: x = east, y = up, z = south (north is −z). 1 unit = 1 metre.
// Origin = north-west corner of Plot 38 (front-left as seen from the road), at road-crown level.

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ft, IN, FT, fmtFtIn, fmtSqft } from './units.js';
import { subtractRects } from './geom.js';
import { tree as leafTree } from './foliage.js';

// ---------- helpers ----------

const texLoader = new THREE.TextureLoader();
const texCache = new Map();
export function tex(name) {
  if (!texCache.has(name)) {
    const t = texLoader.load(`textures/${name}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    texCache.set(name, t);
  }
  return texCache.get(name);
}

/** Rewrites UVs so a texture tiles at `tile` metres in world space (box / planar projection). */
export function worldUV(geo, tile = 1) {
  const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    let u, v;
    if (ny >= nx && ny >= nz) { u = x; v = z; } else if (nx >= nz) { u = z; v = y; } else { u = x; v = y; }
    uv.setXY(i, u / tile, v / tile);
  }
  uv.needsUpdate = true;
  return geo;
}

/** Box geometry from two corners, already placed in world coordinates. */
export function box(x1, y1, z1, x2, y2, z2) {
  const g = new THREE.BoxGeometry(Math.abs(x2 - x1), Math.abs(y2 - y1), Math.abs(z2 - z1));
  g.translate((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
  return g;
}

/** Horizontal rectangle at height y. */
export function rect(x1, z1, x2, z2, y) {
  const g = new THREE.PlaneGeometry(Math.abs(x2 - x1), Math.abs(z2 - z1));
  g.rotateX(-Math.PI / 2);
  g.translate((x1 + x2) / 2, y, (z1 + z2) / 2);
  return g;
}

export function label(html, cls = '') {
  const el = document.createElement('div');
  el.className = `lbl ${cls}`;
  el.innerHTML = html;
  return new CSS2DObject(el);
}

const dimMat = new THREE.LineBasicMaterial({ color: 0x0b2540, depthTest: false, transparent: true });
function dimLine(a, b, text, cls = 'dim') {
  const g = new THREE.Group();
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), dimMat);
  line.renderOrder = 10;
  g.add(line);
  const dir = b.clone().sub(a).normalize();
  const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.35);
  for (const p of [a, b]) {
    const t = new THREE.Line(new THREE.BufferGeometry().setFromPoints([p.clone().add(perp), p.clone().sub(perp)]), dimMat);
    t.renderOrder = 10;
    g.add(t);
  }
  const lab = label(text, cls);
  lab.position.copy(a).add(b).multiplyScalar(0.5);
  g.add(lab);
  return g;
}

function hatchTexture(color) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = color; x.globalAlpha = 0.28; x.fillRect(0, 0, 64, 64);
  x.globalAlpha = 0.85; x.strokeStyle = color; x.lineWidth = 6;
  for (let i = -64; i < 128; i += 22) { x.beginPath(); x.moveTo(i, 64); x.lineTo(i + 64, 0); x.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function overlay(x1, z1, x2, z2, y, material) {
  const g = rect(x1, z1, x2, z2, y);
  worldUV(g, 1.2);
  const m = new THREE.Mesh(g, material);
  m.renderOrder = 2;
  m.receiveShadow = true;
  return m;
}

// ---------- props for scale ----------

export function makePerson(shirt = 0x2f5d8a, heightM = 1.75) {
  const s = heightM / 1.75;
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x9c6b4e, roughness: 0.7 });
  const cloth = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.85 });
  const trousers = new THREE.MeshStandardMaterial({ color: 0x2b2b30, roughness: 0.9 });
  for (const dx of [-0.09, 0.09]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.72, 4, 8), trousers);
    leg.position.set(dx, 0.43, 0);
    g.add(leg);
  }
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.42, 4, 12), cloth);
  torso.scale.set(1, 1, 0.65);
  torso.position.y = 1.13;
  g.add(torso);
  for (const dx of [-0.23, 0.23]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.55, 4, 8), cloth);
    arm.position.set(dx, 1.1, 0);
    g.add(arm);
  }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), skin);
  head.position.y = 1.62;
  g.add(head);
  g.scale.setScalar(s);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

/** A sedan the size of a Toyota Corolla: 4.63 × 1.78 × 1.44 m. Nose points +x. */
let treeSeed = 0;
/** A broadleaf tree (trunk, branches and instanced leaf cards); height and canopy radius in metres. */
export function makeTree(height = 5.5, canopy = 2.2) {
  return leafTree(height, canopy, ++treeSeed);
}

// ---------- the site ----------

export function buildSite(scene, SITE, d) {
  const { D, W, sb, buildable: b, y, road } = d;
  const wt = SITE.wall.thickIn * IN;
  const layers = {};
  const pickables = [];
  const colliders = []; // {minX,maxX,minZ,maxZ,top}
  const add = (name, obj) => { (layers[name] ||= new THREE.Group()).add(obj); return obj; };

  const mats = {
    dirt: new THREE.MeshStandardMaterial({ map: tex('dry_ground_01'), color: 0xe6dccb, roughness: 1 }),
    plot: new THREE.MeshStandardMaterial({ map: tex('dry_ground_01'), color: 0xfff4e0, roughness: 1 }),
    grass: new THREE.MeshStandardMaterial({ map: tex('leafy_grass'), color: 0xc9d6a8, roughness: 1 }),
    asphalt: new THREE.MeshStandardMaterial({ map: tex('asphalt_02'), color: 0x9a9a9a, roughness: 0.95 }),
    brick: new THREE.MeshStandardMaterial({ map: tex('red_brick_03'), roughness: 0.95 }),
    plaster: new THREE.MeshStandardMaterial({ map: tex('painted_plaster_wall'), color: 0xf2efe8, roughness: 0.9 }),
    concrete: new THREE.MeshStandardMaterial({ map: tex('concrete'), roughness: 0.9 }),
  };

  // Ground: plot rows sit at yard level; berms 2″ below road edge; carriageway at crown.
  const R = road.row;
  const gW = rect(-600, -600, -R, 600, y.yard); worldUV(gW, 4);
  const gE1 = rect(0, -600, 600, 0, y.yard); worldUV(gE1, 4);
  const gE2 = rect(0, W, 600, 600, y.yard); worldUV(gE2, 4);
  const gE3 = rect(D, 0, 600, W, y.yard); worldUV(gE3, 4);
  for (const g of [gW, gE1, gE2, gE3]) {
    const m = new THREE.Mesh(g, mats.dirt); m.receiveShadow = true;
    add('ground', m); pickables.push(m);
  }
  const plotSurf = new THREE.Mesh(worldUV(rect(0, 0, D, W, y.yard + 0.004), 3), mats.plot);
  plotSurf.receiveShadow = true;
  add('ground', plotSurf); pickables.push(plotSurf);
  let plotHoles = [];
  /** Cut holes (feet rects) in our plot's ground, e.g. for a sunken court. */
  function setPlotHoles(holesFt) {
    plotHoles = holesFt.map((r) => r.map((v) => v * FT));
    const rects = subtractRects([[0, 0, D, W]], plotHoles);
    plotSurf.geometry.dispose();
    plotSurf.geometry = mergeGeometries(rects.map((r) => worldUV(rect(r[0], r[1], r[2], r[3], y.yard + 0.004), 3).toNonIndexed()));
  }

  const bermY = -0.05;
  for (const [x1, x2] of [[-road.berm, 0], [-R, -R + road.berm]]) {
    const m = new THREE.Mesh(worldUV(box(x1, bermY - 0.3, -600, x2, bermY, 600), 3), mats.grass);
    m.receiveShadow = true; add('ground', m); pickables.push(m);
  }
  const carriage = new THREE.Mesh(worldUV(box(-R + road.berm, -0.35, -600, -road.berm, 0, 600), 6), mats.asphalt);
  carriage.receiveShadow = true; add('ground', carriage); pickables.push(carriage);
  // centre line
  const dash = new THREE.MeshBasicMaterial({ color: 0xf2f2f2 });
  const dashGeos = [];
  for (let z = -200; z < 200; z += 6) dashGeos.push(rect(-R / 2 - 0.06, z, -R / 2 + 0.06, z + 3, 0.003));
  add('ground', new THREE.Mesh(mergeGeometries(dashGeos), dash));

  const roadLab = label(`Road (west) · ~${SITE.road.rowFt} ft wide<br><small>width estimated from satellite</small>`, 'road');
  roadLab.position.set(-R / 2, 0.2, W / 2 + 9);
  add('labels', roadLab);

  // ---------- boundary walls ----------
  function wallBox(x1, z1, x2, z2, top, out, group, mat = mats.brick) {
    const g = worldUV(box(x1, y.yard, z1, x2, top, z2), 1.1);
    out.push(g);
    colliders.push({ minX: Math.min(x1, x2), maxX: Math.max(x1, x2), minZ: Math.min(z1, z2), maxZ: Math.max(z1, z2), minY: y.yard, maxY: top, group });
  }

  // Our plot. Front wall sits inside the property line; common walls are centred on the line.
  const ours = [];
  const gw = ft(SITE.gate.widthFt);
  const pillar = ft(1.5);
  const gate = SITE.gate.side === 'north'
    ? { z1: wt / 2 + pillar, z2: wt / 2 + pillar + gw }
    : { z1: W - wt / 2 - pillar - gw, z2: W - wt / 2 - pillar };
  wallBox(0, wt / 2, wt, gate.z1 - pillar, y.wall, ours, 'ours', mats.plaster);
  wallBox(0, gate.z2 + pillar, wt, W - wt / 2, y.wall, ours, 'ours', mats.plaster);
  for (const zc of [gate.z1 - pillar / 2, gate.z2 + pillar / 2]) {
    wallBox(-0.03, zc - pillar / 2, pillar - 0.03, zc + pillar / 2, y.wall + ft(0.5), ours, 'ours', mats.plaster);
  }
  wallBox(0, -wt / 2, D, wt / 2, y.wall, ours, 'ours', mats.plaster);          // north common wall
  wallBox(0, W - wt / 2, D, W + wt / 2, y.wall, ours, 'ours', mats.plaster);   // south common wall
  wallBox(D - wt / 2, wt / 2, D + wt / 2, W - wt / 2, y.wall, ours, 'ours', mats.plaster); // rear
  const ourWalls = new THREE.Mesh(mergeGeometries(ours), mats.plaster);
  ourWalls.castShadow = ourWalls.receiveShadow = true;
  add('ourWalls', ourWalls); pickables.push(ourWalls);
  const gateLab = label(`Main gate ${SITE.gate.widthFt} ft<br><small>${SITE.gate.side} corner (to confirm)</small>`, 'note');
  gateLab.position.set(-0.4, y.wall + 0.6, (gate.z1 + gate.z2) / 2);
  add('labels', gateLab);

  // Neighbour plots: our row (west-facing), rear row (east-facing), row across the road (east-facing).
  const nWalls = [];
  const ghostGeos = [];
  const ghostTop = y.parapet;
  const rows = [
    { x0: 0, facing: 'west' },
    { x0: D, facing: 'east' },
    { x0: -R - D, facing: 'east' },
  ];
  for (const row of rows) {
    for (let k = -2; k <= 2; k++) {
      const z0 = k * W;
      const isOurs = row.x0 === 0 && k === 0;
      if (!isOurs) {
        const fx = row.facing === 'west' ? row.x0 : row.x0 + D; // front edge x
        const inward = row.facing === 'west' ? 1 : -1;
        wallBox(Math.min(fx, fx + inward * wt), z0 + wt / 2, Math.max(fx, fx + inward * wt), z0 + W - wt / 2, y.wall, nWalls, 'neighbour');
        // north side wall (our plot's own walls are drawn separately; k=1's north wall is our south wall)
        if (!(row.x0 === 0 && k === 1)) wallBox(row.x0, z0 - wt / 2, row.x0 + D, z0 + wt / 2, y.wall, nWalls, 'neighbour');
        // max legal volume (ghost)
        const front = sb.front, rear = sb.rear;
        const gx1 = row.facing === 'west' ? row.x0 + front : row.x0 + rear;
        const gx2 = row.facing === 'west' ? row.x0 + D - rear : row.x0 + D - front;
        ghostGeos.push(box(gx1, y.plinth, z0 + sb.side, gx2, ghostTop, z0 + W - sb.side));
      }
      // rear walls: our row and the rear row share the line x = D (drawn once, by our row)
      if (row.x0 === 0 && !isOurs) wallBox(D - wt / 2, z0 + wt / 2, D + wt / 2, z0 + W - wt / 2, y.wall, nWalls, 'neighbour');
      if (row.x0 < 0) wallBox(row.x0 - wt / 2, z0 + wt / 2, row.x0 + wt / 2, z0 + W - wt / 2, y.wall, nWalls, 'neighbour');
    }
    // southern-most side wall of the row
    wallBox(row.x0, 3 * W - wt / 2, row.x0 + D, 3 * W + wt / 2, y.wall, nWalls, 'neighbour');
  }
  const neighbourWalls = new THREE.Mesh(mergeGeometries(nWalls), mats.brick);
  neighbourWalls.castShadow = neighbourWalls.receiveShadow = true;
  add('neighbourWalls', neighbourWalls); pickables.push(neighbourWalls);

  const ghostMat = new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.9, transparent: true, opacity: 0.55 });
  const ghosts = new THREE.Mesh(mergeGeometries(ghostGeos), ghostMat);
  ghosts.castShadow = true; ghosts.receiveShadow = true;
  add('neighbourGhosts', ghosts);
  const ghostEdges = new THREE.LineSegments(new THREE.EdgesGeometry(ghosts.geometry), new THREE.LineBasicMaterial({ color: 0x8a8070, transparent: true, opacity: 0.6 }));
  add('neighbourGhosts', ghostEdges);
  const nLab = label('Neighbour · same rules<br><small>max legal volume (G+1)</small>', 'note');
  nLab.position.set(D / 2, ghostTop + 0.6, -W / 2);
  add('neighbourGhosts', nLab);
  for (const [txt, x, z] of [['Neighbour (north)', D / 2, -W / 2], ['Neighbour (south)', D / 2, W * 1.5], ['Rear neighbour · faces east', D * 1.5, W / 2]]) {
    const l = label(txt, 'plot'); l.position.set(x, y.yard + 0.3, z); add('labels', l);
  }

  // ---------- setbacks (compulsory open spaces) ----------
  const cosMat = new THREE.MeshBasicMaterial({ map: hatchTexture('#d4572a'), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const yo = y.yard + 0.012;
  add('setbacks', overlay(0, 0, sb.front, W, yo, cosMat));
  add('setbacks', overlay(D - sb.rear, 0, D, W, yo, cosMat));
  add('setbacks', overlay(sb.front, 0, D - sb.rear, sb.side, yo, cosMat));
  add('setbacks', overlay(sb.front, W - sb.side, D - sb.rear, W, yo, cosMat));

  // Lime ("chuna") lines marking the buildable footprint, the way it is set out on site.
  const lime = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  const lw = 0.08, ly = y.yard + 0.016;
  const limeGeos = [
    rect(b.x1 - lw / 2, b.z1 - lw / 2, b.x2 + lw / 2, b.z1 + lw / 2, ly),
    rect(b.x1 - lw / 2, b.z2 - lw / 2, b.x2 + lw / 2, b.z2 + lw / 2, ly),
    rect(b.x1 - lw / 2, b.z1, b.x1 + lw / 2, b.z2, ly),
    rect(b.x2 - lw / 2, b.z1, b.x2 + lw / 2, b.z2, ly),
  ];
  const limeMesh = new THREE.Mesh(mergeGeometries(limeGeos), lime);
  limeMesh.receiveShadow = true;
  add('setbacks', limeMesh);

  const dy = y.yard + 0.05;
  add('setbacks', dimLine(new THREE.Vector3(0, dy, W / 2), new THREE.Vector3(sb.front, dy, W / 2), `Front clear space<br><b>${fmtFtIn(sb.front)}</b>`, 'dim cos'));
  add('setbacks', dimLine(new THREE.Vector3(D - sb.rear, dy, W / 2), new THREE.Vector3(D, dy, W / 2), `Rear<br><b>${fmtFtIn(sb.rear)}</b>`, 'dim cos'));
  add('setbacks', dimLine(new THREE.Vector3(D * 0.62, dy, 0), new THREE.Vector3(D * 0.62, dy, sb.side), `Side <b>${fmtFtIn(sb.side)}</b>`, 'dim cos'));
  add('setbacks', dimLine(new THREE.Vector3(D * 0.62, dy, W - sb.side), new THREE.Vector3(D * 0.62, dy, W), `Side <b>${fmtFtIn(sb.side)}</b>`, 'dim cos'));
  add('setbacks', dimLine(new THREE.Vector3(b.x1, dy, b.z1 + 1.2), new THREE.Vector3(b.x2, dy, b.z1 + 1.2), `Buildable depth <b>${fmtFtIn(b.x2 - b.x1)}</b>`, 'dim build'));
  add('setbacks', dimLine(new THREE.Vector3(b.x1 + 1.5, dy, b.z1), new THREE.Vector3(b.x1 + 1.5, dy, b.z2), `Buildable width <b>${fmtFtIn(b.z2 - b.z1)}</b>`, 'dim build'));
  const areaLab = label(`Ground-floor footprint<br><b>${fmtSqft(d.gfSqft)}</b> max`, 'area');
  areaLab.position.set((b.x1 + b.x2) / 2, y.yard + 0.1, (b.z1 + b.z2) / 2);
  add('setbacks', areaLab);

  // Plot dimensions (always on with labels)
  add('labels', dimLine(new THREE.Vector3(-0.8, dy, 0), new THREE.Vector3(-0.8, dy, W), `Plot frontage <b>50′ 0″</b>`, 'dim plotdim'));
  add('labels', dimLine(new THREE.Vector3(0, dy, W + 0.9), new THREE.Vector3(D, dy, W + 0.9), `Plot depth <b>90′ 0″</b> · 4,500 sq ft`, 'dim plotdim'));

  // ---------- legal envelope ----------
  const envMat = (color, opacity) => new THREE.MeshStandardMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, roughness: 1 });
  const edge = (geo, color, opacity = 0.9) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  const gfGeo = box(b.x1, y.plinth, b.z1, b.x2, y.gfRoof, b.z2);
  const ffGeo = box(b.x1, y.gfRoof, b.z1, b.x2, y.ffRoof, b.z2);
  const gf = new THREE.Mesh(gfGeo, envMat(0x2f8f5b, 0.16));
  const ff = new THREE.Mesh(ffGeo, envMat(0x2f8f5b, 0.07));
  add('envelope', gf); add('envelope', edge(gfGeo, 0x2f8f5b));
  add('envelope', ff); add('envelope', edge(ffGeo, 0x2f8f5b, 0.45));
  // stair tower (mumty) ≤ 300 sq ft: drawn 15′ × 20′ at the middle of the footprint as a placeholder
  const mx = (b.x1 + b.x2) / 2, mz = (b.z1 + b.z2) / 2;
  const mGeo = box(mx - ft(10), y.ffRoof, mz - ft(7.5), mx + ft(10), y.mumty, mz + ft(7.5));
  add('envelope', new THREE.Mesh(mGeo, envMat(0x1d5fd1, 0.14)));
  add('envelope', edge(mGeo, 0x1d5fd1));
  const gfLab = label(`Ground floor · up to <b>${fmtSqft(d.gfSqft)}</b>`, 'env');
  gfLab.position.set(b.x2, (y.plinth + y.gfRoof) / 2, b.z2);
  gfLab.userData.elevation = true;
  add('envelope', gfLab);
  const ffLab = label(`First floor · max 75% = <b>${fmtSqft(d.ffSqft)}</b><br><small>volume shown is the full footprint</small>`, 'env');
  ffLab.position.set(b.x2, (y.gfRoof + y.ffRoof) / 2, b.z2);
  ffLab.userData.elevation = true;
  add('envelope', ffLab);
  const mLab = label(`Stair tower ≤ ${d.mumtySqft} sq ft`, 'env blue');
  mLab.position.set(mx, y.mumty + 0.3, mz);
  mLab.userData.elevation = true;
  add('envelope', mLab);

  // height limit plane
  const hGeo = rect(0, 0, D, W, y.max);
  const hMat = new THREE.MeshBasicMaterial({ color: 0xd4572a, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false });
  add('heightLimit', new THREE.Mesh(hGeo, hMat));
  const hEdge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, y.max, 0), new THREE.Vector3(D, y.max, 0), new THREE.Vector3(D, y.max, W), new THREE.Vector3(0, y.max, W)]),
  new THREE.LineBasicMaterial({ color: 0xd4572a }));
  add('heightLimit', hEdge);
  const hLab = label(`Height limit <b>35′ 0″</b> above road crown<br><small>no second floor allowed</small>`, 'env red');
  hLab.position.set(0, y.max, W / 2);
  hLab.userData.elevation = true;
  add('heightLimit', hLab);

  // Ranging rod: a surveyor's pole banded every foot, standing at the plot's front-south corner.
  const rod = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color: 0xc8352b, roughness: 0.6 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.6 });
  const rx = 0.55, rz = 0.55; // plot's north-west corner, in the front lawn
  const redGeos = [], whiteGeos = [];
  for (let f = 0; f < SITE.levels.maxHeightFt; f++) {
    const g = new THREE.CylinderGeometry(0.035, 0.035, ft(1), 8);
    g.translate(rx, ft(f + 0.5), rz);
    (f % 2 ? whiteGeos : redGeos).push(g);
  }
  rod.add(new THREE.Mesh(mergeGeometries(redGeos), red), new THREE.Mesh(mergeGeometries(whiteGeos), white));
  rod.children.forEach((m) => { m.castShadow = true; });
  const L = SITE.levels;
  const marks = [
    [y.plinth, `Plinth +${fmtFtIn(y.plinth)}`],
    [y.gfRoof, `GF roof +${fmtFtIn(y.gfRoof)}`],
    [y.ffRoof, `FF roof +${fmtFtIn(y.ffRoof)}`],
    [y.mumty, `Stair tower +${fmtFtIn(y.mumty)}`],
    [y.max, `Max +35′ 0″`],
  ];
  for (const [h, t] of marks) {
    const l = label(t, 'rod'); l.position.set(rx, h, rz + 0.1); l.userData.elevation = true; rod.add(l);
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.02), red);
    tick.position.set(rx + 0.2, h, rz); rod.add(tick);
  }
  add('rod', rod);

  // ---------- 1-ft grid on our plot ----------
  const gridPts = [];
  for (let f = 0; f <= SITE.plot.depthFt; f++) gridPts.push(ft(f), 0, 0, ft(f), 0, W);
  for (let f = 0; f <= SITE.plot.widthFt; f++) gridPts.push(0, 0, ft(f), D, 0, ft(f));
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3));
  gridGeo.translate(0, y.yard + 0.02, 0);
  add('grid', new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: 0x0b2540, transparent: true, opacity: 0.18 })));
  const grid5 = [];
  for (let f = 0; f <= SITE.plot.depthFt; f += 5) grid5.push(ft(f), 0, 0, ft(f), 0, W);
  for (let f = 0; f <= SITE.plot.widthFt; f += 5) grid5.push(0, 0, ft(f), D, 0, ft(f));
  const g5 = new THREE.BufferGeometry();
  g5.setAttribute('position', new THREE.Float32BufferAttribute(grid5, 3));
  g5.translate(0, y.yard + 0.022, 0);
  add('grid', new THREE.LineSegments(g5, new THREE.LineBasicMaterial({ color: 0x0b2540, transparent: true, opacity: 0.4 })));

  // ---------- scale props ----------
  const p3 = makePerson(0x4c6b3c, 1.78); p3.position.set(-road.berm - 1.2, 0, W * 0.7); p3.rotation.y = Math.PI / 2; add('props', p3);
  for (const g of Object.values(layers)) scene.add(g);

  function groundAt(x, z) {
    if (x > 0 || x < -R) {
      for (const h of plotHoles) if (x > h[0] && x < h[2] && z > h[1] && z < h[3]) return -Infinity;
      return y.yard;
    }
    if (x > -road.berm || x < -R + road.berm) return bermY;
    return 0;
  }

  return { layers, pickables, colliders, groundAt, gate, setPlotHoles };
}
