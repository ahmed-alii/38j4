// Foliage made of many small alpha-cut "leaf cards" (instanced), the standard real-time technique
// for believable trees and climbers. Leaves cast leaf-shaped shadows through a matching depth material.

import * as THREE from 'three';

const cache = {};

function leafTexture(kind) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const rnd = mulberry(kind === 'flower' ? 7 : 3);
  const leaf = (cx, cy, len, ang, col) => {
    x.save(); x.translate(cx, cy); x.rotate(ang);
    x.fillStyle = col;
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(len * 0.45, -len * 0.32, len, 0); x.quadraticCurveTo(len * 0.45, len * 0.32, 0, 0); x.fill();
    x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(2, 0); x.lineTo(len * 0.9, 0); x.stroke();
    x.restore();
  };
  if (kind === 'flower') {
    // bougainvillea: papery magenta bracts in threes, a few leaves behind
    for (let k = 0; k < 10; k++) leaf(20 + rnd() * 88, 20 + rnd() * 88, 26 + rnd() * 10, rnd() * 6.3, ['#3f6b2c', '#4e7d34', '#365f27'][k % 3]);
    for (let k = 0; k < 16; k++) {
      const cx = 18 + rnd() * 92, cy = 18 + rnd() * 92, col = ['#c21f73', '#d3368a', '#a8165f', '#e04f9e'][k % 4];
      for (let p = 0; p < 3; p++) { x.save(); x.translate(cx, cy); x.rotate((p * Math.PI * 2) / 3 + rnd()); x.fillStyle = col; x.beginPath(); x.ellipse(7, 0, 8, 6, 0, 0, Math.PI * 2); x.fill(); x.restore(); }
    }
  } else {
    // broadleaf: overlapping leaves in several greens, sun-lit and shaded
    const greens = kind === 'hedge' ? ['#2f5a24', '#3a6a2b', '#456f2f', '#2a4f20'] : ['#4b7a33', '#5a8a3b', '#3d6a2a', '#6b9645', '#35602a'];
    for (let k = 0; k < 22; k++) leaf(10 + rnd() * 108, 10 + rnd() * 108, 24 + rnd() * 18, rnd() * 6.3, greens[k % greens.length]);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function materials(kind) {
  if (!cache[kind]) {
    const map = leafTexture(kind);
    cache[kind] = {
      mat: new THREE.MeshStandardMaterial({ map, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75, metalness: 0 }),
      depth: new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.45 }),
    };
  }
  return cache[kind];
}

const card = new THREE.PlaneGeometry(1, 1);
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();

/**
 * A cloud of leaf cards filling the given blobs.
 * @param {{x:number,y:number,z:number,r:number,sy?:number}[]} blobs  centres and radii in metres
 * @param {'leaf'|'flower'|'hedge'} kind
 * @param {number} density cards per cubic metre-ish (scaled by blob size)
 */
export function foliage(blobs, kind = 'leaf', density = 1) {
  const rnd = mulberry(blobs.length * 31 + Math.round((blobs[0]?.x ?? 0) * 100));
  const counts = blobs.map((b) => Math.max(4, Math.round((10 + b.r * b.r * 55) * density)));
  const total = counts.reduce((a, b) => a + b, 0);
  const { mat, depth } = materials(kind);
  const mesh = new THREE.InstancedMesh(card, mat, total);
  mesh.customDepthMaterial = depth;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.noAO = true;
  let i = 0;
  blobs.forEach((b, bi) => {
    for (let k = 0; k < counts[bi]; k++) {
      // points biased towards the surface of the (squashed) sphere, like a real canopy
      const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, rr = b.r * Math.pow(rnd(), 0.35);
      const sq = Math.sqrt(1 - u * u);
      _p.set(b.x + rr * sq * Math.cos(th), b.y + rr * u * (b.sy ?? 0.8), b.z + rr * sq * Math.sin(th));
      _e.set(rnd() * Math.PI, rnd() * Math.PI * 2, rnd() * Math.PI);
      _q.setFromEuler(_e);
      const sc = (0.38 + rnd() * 0.32) * (kind === 'hedge' ? 0.8 : 1);
      _s.set(sc, sc, sc);
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
      // lighter leaves on top, darker inside
      const shade = 0.72 + 0.28 * ((_p.y - (b.y - b.r)) / (2 * b.r)) + (rnd() - 0.5) * 0.12;
      mesh.setColorAt(i, _c.setScalar(Math.max(0.55, Math.min(1.1, shade))));
      i++;
    }
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}

/** A broadleaf tree about `height` m tall with a canopy of radius `canopy` m. */
export function tree(height = 5.5, canopy = 2.0, seed = 1) {
  const rnd = mulberry(Math.round(height * 100 + canopy * 10 + seed));
  const g = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({ color: 0x5e4a38, roughness: 1 });
  const trunkH = height * 0.55;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1 + canopy * 0.03, 0.16 + canopy * 0.05, trunkH, 9), bark);
  trunk.position.y = trunkH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);
  const blobs = [{ x: 0, y: height * 0.68, z: 0, r: canopy * 0.75, sy: 0.75 }];
  const n = 5 + Math.round(canopy * 1.5);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + rnd() * 0.6, d = canopy * (0.45 + rnd() * 0.35);
    const bx = Math.cos(a) * d, bz = Math.sin(a) * d, by = height * (0.58 + rnd() * 0.25);
    blobs.push({ x: bx, y: by, z: bz, r: canopy * (0.42 + rnd() * 0.22), sy: 0.8 });
    // a branch reaching out to each leaf cluster
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.07, 1, 6), bark);
    const from = new THREE.Vector3(0, trunkH * 0.9, 0), to = new THREE.Vector3(bx * 0.8, by - 0.2, bz * 0.8);
    br.scale.y = from.distanceTo(to);
    br.position.copy(from).add(to).multiplyScalar(0.5);
    br.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
    br.castShadow = true;
    g.add(br);
  }
  g.add(foliage(blobs, 'leaf', 1));
  return g;
}
