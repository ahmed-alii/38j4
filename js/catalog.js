// Real furniture models, at the size the maker built them.
// Each model is a glTF binary packed as base64 inside JSON (artifact pages serve .json, not .glb).
// Three come from Wayfair (product scans it donated to the Khronos glTF sample set, CC BY 4.0).
// The rest are CC0 photo-scanned or hand-modelled pieces from Poly Haven.
// Footprints in the design data match each model's true size, so walking space is measured
// against the real piece and not a stand-in.
//
// yaw: rotation that turns the model's front towards +z (the builder's local "front").
// dims: true width × depth × height in metres (x × z × y after yaw), for the credits list.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export const CATALOG = {
  GlamVelvetSofa: { name: 'Glam velvet sofa, 3-seat', brand: 'Wayfair', yaw: 0, dims: [2.19, 1.02, 0.79] },
  SheenWoodLeatherSofa: { name: 'Wood-frame leather sofa, 3-seat', brand: 'Wayfair', yaw: 0, dims: [2.73, 0.92, 1.12] },
  SheenChair: { name: 'Sheen accent chair', brand: 'Wayfair', yaw: 0, dims: [0.83, 0.57, 0.69] },
  mid_century_lounge_chair: { name: 'Mid-century swivel lounge chair', brand: 'Poly Haven', yaw: 0, dims: [1.01, 1.19, 1.17] },
  modern_arm_chair_01: { name: 'Teak-frame arm chair', brand: 'Poly Haven', yaw: 0, dims: [0.82, 0.99, 1.02] },
  coffee_table_round_01: { name: 'Round marble coffee table, Ø1.3 m', brand: 'Poly Haven', yaw: 0, dims: [1.3, 1.3, 0.49] },
  modern_coffee_table_01: { name: 'Concrete and oak coffee table', brand: 'Poly Haven', yaw: Math.PI / 2, dims: [1.2, 0.6, 0.39] },
  side_table_01: { name: 'Oak side table', brand: 'Poly Haven', yaw: 0, dims: [0.55, 0.45, 0.55] },
  modern_wooden_cabinet: { name: 'Fluted wooden sideboard', brand: 'Poly Haven', yaw: 0, dims: [2.44, 0.52, 0.68] },
  dining_chair_02: { name: 'Tufted leather dining chair', brand: 'Poly Haven', yaw: 0, dims: [0.43, 0.58, 0.97] },
  painted_wooden_chair_01: { name: 'Painted wooden chair', brand: 'Poly Haven', yaw: 0, dims: [0.43, 0.54, 0.96] },
  potted_plant_01: { name: 'Fiddle-leaf plant in terracotta', brand: 'Poly Haven', yaw: 0, dims: [0.59, 0.63, 1.34] },
  potted_plant_02: { name: 'Elephant-ear plant in terracotta', brand: 'Poly Haven', yaw: 0, dims: [0.7, 0.66, 0.84] },
  ceiling_fan: { name: 'Ceiling fan, 56″', brand: 'Poly Haven', yaw: 0, dims: [1.46, 1.46, 0.52] },
  desk_lamp_arm_01: { name: 'Anglepoise desk lamp', brand: 'Poly Haven', yaw: 0, dims: [0.2, 0.61, 0.89] },
};

// Which model stands in for each furniture type when the data does not name one.
export const TYPE_MODEL = {
  sofa: 'GlamVelvetSofa',
  armchair: 'SheenChair',
  coffee: 'coffee_table_round_01',
  nightstand: 'side_table_01',
  console: 'modern_wooden_cabinet',
  chair: 'dining_chair_02',
};

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const cache = new Map();

function load(id) {
  if (!cache.has(id)) {
    cache.set(id, fetch(new URL(`../models/furniture/${id}.json`, import.meta.url))
      .then((r) => { if (!r.ok) throw new Error(`${id}: HTTP ${r.status}`); return r.json(); })
      .then(async ({ glb }) => {
        const bin = Uint8Array.from(atob(glb), (c) => c.charCodeAt(0));
        const gltf = await loader.parseAsync(bin.buffer, '');
        const scene = gltf.scene;
        scene.rotation.y = CATALOG[id]?.yaw ?? 0;
        const wrap = new THREE.Group();
        wrap.add(scene);
        wrap.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(wrap);
        wrap.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true; o.receiveShadow = true;
            const ms = Array.isArray(o.material) ? o.material : [o.material];
            ms.forEach((m) => { if (m.map) m.map.anisotropy = 4; });
          }
        });
        return { wrap, box };
      }));
  }
  return cache.get(id);
}

/**
 * Swap every furniture slot under `root` for its real model. A slot is a group the builder made
 * with userData.slot = { id, w, d, align, hang } (w, d: the footprint in metres, in the slot's
 * own frame), holding a box stand-in that stays if the model fails to load.
 * Returns the ids actually used, for the credits list.
 */
export async function furnish(root) {
  const slots = [];
  root.traverse((o) => { if (o.userData.slot) slots.push(o); });
  const ids = [...new Set(slots.map((s) => s.userData.slot.id))];
  const got = new Map();
  await Promise.all(ids.map((id) => load(id).then((m) => got.set(id, m)).catch((e) => console.warn('furniture', e.message))));
  for (const s of slots) {
    const { id, w, d, align, hang, scale } = s.userData.slot;
    const m = got.get(id);
    if (!m) continue;
    const size = m.box.getSize(new THREE.Vector3());
    // real size; shrink only if the plan gives it less room than the real piece needs
    let k = scale ?? 1;
    if (w && d && !scale) k = Math.min(1, (w * 1.04) / size.x, (d * 1.04) / size.z);
    if (k < 0.97) console.warn(`furniture ${id}: footprint ${w.toFixed(2)}×${d.toFixed(2)} m < model ${size.x.toFixed(2)}×${size.z.toFixed(2)} m, scaled ${k.toFixed(2)}`);
    const inst = m.wrap.clone(true);
    inst.scale.setScalar(k);
    const cx = (m.box.min.x + m.box.max.x) / 2, cz = (m.box.min.z + m.box.max.z) / 2;
    // centre on the footprint, or push the back against the footprint's back edge (walls)
    let pz = -cz * k;
    if (align === 'back' && d) pz = -d / 2 - m.box.min.z * k;
    inst.position.set(-cx * k, hang ? -m.box.max.y * k : -m.box.min.y * k, pz);
    s.children.filter((c) => c.userData.proxy).forEach((c) => { s.remove(c); c.traverse((o) => o.geometry?.dispose()); });
    s.add(inst);
  }
  return ids.filter((id) => got.has(id));
}
