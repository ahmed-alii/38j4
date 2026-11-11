// The owner's avatar: a 5′10″ animated figure, explored in third person (or first person).
//
// Walk-in mode controls
//   Arrow keys / WASD  walk, relative to where the camera looks · Shift = run
//   Mouse              click the scene once, then move the mouse to look (Esc frees the pointer);
//                      dragging also works · wheel = zoom in/out (all the way in = first person)
//   V                  switch first / third person
//   Touch              left thumb = walk stick, right thumb = look

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makePerson } from './site.js';

export const AVATAR_HEIGHT = 1.778; // 5′10″ in metres
const EYE = AVATAR_HEIGHT * 0.936;  // eye height ≈ 5′5½″
const WALK = 1.4, RUN = 3.6;        // m/s
const PITCH0 = 0.26;                // default camera elevation (rad)
const SHOULDER = 0.45;              // camera offset to the avatar's right (m)
const LOOK_AHEAD = 1.5;             // aim this far in front of the avatar (m)

export class Avatar {
  constructor({ scene, camera, dom, groundAt, colliders, occluders, stickEl }) {
    Object.assign(this, { scene, camera, dom, groundAt, colliders, occluders, stickEl });
    this.root = new THREE.Group();
    scene.add(this.root);
    this.body = makePerson(0x2f5d8a, AVATAR_HEIGHT); // shown until the animated model loads
    this.root.add(this.body);
    this.enabled = false;
    this.pos = { x: 0, z: 0 };
    this.feet = 0;
    this.heading = 0;           // model rotation (rad); 0 = facing +z
    this.camYaw = 0;            // 0 = camera looking towards −z (north)
    this.camPitch = PITCH0;
    this.dist = 2.8;            // wanted camera distance (m)
    this.camDist = 2.8;         // actual, after wall collisions
    this.firstPerson = false;
    this.speed = 0;
    this.keys = new Set();
    this.stick = { x: 0, y: 0 };
    this.touches = new Map();
    this.locked = false;
    this.radius = 0.25;
    this.ray = new THREE.Raycaster();
    this.mixer = null;
    this.actions = {};
    this.current = null;
    this._bind();
  }

  async load(url) {
    try {
      // The model ships as base64 inside JSON (artifact pages serve .json but not .glb).
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const { glb } = await res.json();
      const bin = Uint8Array.from(atob(glb), (c) => c.charCodeAt(0));
      const gltf = await new GLTFLoader().parseAsync(bin.buffer, '');
      const model = gltf.scene;
      model.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false;
        const joints = /joint/i.test(o.name) || /joint/i.test(o.material?.name ?? '');
        o.material = new THREE.MeshStandardMaterial({
          color: joints ? 0x2f5d8a : 0xe8e2d8, roughness: joints ? 0.45 : 0.6, metalness: joints ? 0.3 : 0,
        });
      });
      // scale to exactly 5′10″
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model, true);
      const h = box.max.y - box.min.y;
      model.scale.setScalar(AVATAR_HEIGHT / h);
      model.position.y = -box.min.y * (AVATAR_HEIGHT / h);
      this.root.remove(this.body);
      this.body = model;
      this.root.add(model);
      this.mixer = new THREE.AnimationMixer(model);
      for (const clip of gltf.animations) this.actions[clip.name.toLowerCase()] = this.mixer.clipAction(clip);
      this._play('idle', 0);
      return true;
    } catch (err) {
      console.warn('Avatar model failed to load, using the simple figure.', err);
      return false;
    }
  }

  _play(name, fade = 0.25) {
    const next = this.actions[name];
    if (!next || next === this.current) return;
    next.reset().setEffectiveWeight(1).fadeIn(fade).play();
    if (this.current) this.current.fadeOut(fade);
    this.current = next;
  }

  // ---------------------------------------------------------------- input
  _bind() {
    const d = this.dom;
    let drag = null;
    d.addEventListener('pointerdown', (e) => {
      if (!this.enabled) return;
      if (e.pointerType === 'touch') {
        const left = e.clientX < window.innerWidth / 2;
        this.touches.set(e.pointerId, { kind: left ? 'move' : 'look', x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY });
        if (left) this._showStick(e.clientX, e.clientY);
        d.setPointerCapture?.(e.pointerId);
        return;
      }
      drag = { x: e.clientX, y: e.clientY };
      if (!this.locked) {
        try { const p = d.requestPointerLock?.(); p?.catch?.(() => {}); } catch { /* pointer lock unavailable: dragging still works */ }
      }
    });
    d.addEventListener('pointermove', (e) => {
      if (!this.enabled) return;
      const t = this.touches.get(e.pointerId);
      if (t) {
        if (t.kind === 'look') this._look(e.clientX - t.x, e.clientY - t.y, 0.006);
        else {
          const dx = e.clientX - t.x0, dy = e.clientY - t.y0;
          const r = 50, len = Math.hypot(dx, dy), k = len > r ? r / len : 1;
          this.stick.x = (dx * k) / r;
          this.stick.y = (-dy * k) / r;
          this._knob(dx * k, dy * k);
        }
        t.x = e.clientX; t.y = e.clientY;
        return;
      }
      if (this.locked) this._look(e.movementX, e.movementY, 0.0025);
      else if (drag) { this._look(e.clientX - drag.x, e.clientY - drag.y, 0.005); drag.x = e.clientX; drag.y = e.clientY; }
    });
    const end = (e) => {
      const t = this.touches.get(e.pointerId);
      if (t?.kind === 'move') { this.stick.x = this.stick.y = 0; this._hideStick(); }
      this.touches.delete(e.pointerId);
      drag = null;
    };
    d.addEventListener('pointerup', end);
    d.addEventListener('pointercancel', end);
    d.addEventListener('wheel', (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      this.zoom(Math.exp(e.deltaY * 0.0012));
    }, { passive: false });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === d;
      if (!this.locked) this.unlockedAt = performance.now();
      this.onLockChange?.(this.locked);
    });
    window.addEventListener('keydown', (e) => {
      if (!this.enabled || e.target.closest?.('input, select, textarea')) return;
      if (e.code === 'KeyV') { this.setFirstPerson(!this.firstPerson); return; }
      this.keys.add(e.code);
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  _look(dx, dy, s) {
    this.camYaw -= dx * s;
    this.camPitch = Math.max(-0.45, Math.min(1.35, this.camPitch + dy * s));
  }
  _showStick(x, y) {
    if (!this.stickEl) return;
    this.stickEl.hidden = false;
    this.stickEl.style.left = `${x - 60}px`;
    this.stickEl.style.top = `${y - 60}px`;
    this._knob(0, 0);
  }
  _knob(dx, dy) { const k = this.stickEl?.firstElementChild; if (k) k.style.transform = `translate(${dx}px, ${dy}px)`; }
  _hideStick() { if (this.stickEl) this.stickEl.hidden = true; }

  zoom(f) {
    if (this.firstPerson && f > 1) { this.setFirstPerson(false); this.dist = 1.2; return; }
    this.dist = Math.max(0.3, Math.min(10, this.dist * f));
    if (this.dist <= 0.35) this.setFirstPerson(true);
  }

  setFirstPerson(on) {
    this.firstPerson = on;
    if (!on && this.dist < 1) this.dist = 2.8;
    this.onViewChange?.(on);
  }

  // ---------------------------------------------------------------- placement
  /** Stand somewhere (explore mode keeps the avatar there as a 5′10″ scale figure). */
  place(x, z, heading, feet = null) {
    this.pos = { x, z };
    this.heading = heading;
    this.feet = feet ?? this.groundAt(x, z, 50);
    this._pose();
  }

  enable(x = this.pos.x, z = this.pos.z, yaw = null, feet = null) {
    this.enabled = true;
    this.place(x, z, yaw === null ? this.heading : Math.atan2(-Math.sin(yaw), -Math.cos(yaw)), feet);
    // camera behind the avatar, looking the way it faces
    this.camYaw = yaw ?? Math.atan2(-Math.sin(this.heading), -Math.cos(this.heading));
    this.camPitch = PITCH0;
    this.camDist = this.dist;
    this.camera.rotation.order = 'YXZ';
    this.update(0);
  }

  disable() {
    this.enabled = false;
    this.keys.clear();
    this.stick.x = this.stick.y = 0;
    this._hideStick();
    this.body.visible = true;
    if (this.locked) document.exitPointerLock?.();
  }

  _blocked(x, z) {
    const f = this.feet;
    for (const c of this.colliders) {
      if (c.off || c.maxY < f + 0.35 || c.minY > f + 1.7) continue;
      if (x + this.radius > c.minX && x - this.radius < c.maxX && z + this.radius > c.minZ && z - this.radius < c.maxZ) return true;
    }
    return false;
  }

  _pose() {
    this.root.position.set(this.pos.x, this.feet, this.pos.z);
    this.root.rotation.y = this.heading;
  }

  // ---------------------------------------------------------------- per frame
  update(dt) {
    this.mixer?.update(dt);
    if (!this.enabled) return;

    // movement, relative to the camera
    let f = 0, s = 0;
    const k = this.keys;
    if (k.has('ArrowUp') || k.has('KeyW')) f += 1;
    if (k.has('ArrowDown') || k.has('KeyS')) f -= 1;
    if (k.has('ArrowRight') || k.has('KeyD')) s += 1;
    if (k.has('ArrowLeft') || k.has('KeyA')) s -= 1;
    f += this.stick.y; s += this.stick.x;
    const len = Math.hypot(f, s);
    if (len > 1) { f /= len; s /= len; }
    const run = k.has('ShiftLeft') || k.has('ShiftRight') || Math.hypot(this.stick.x, this.stick.y) > 0.95;
    const want = len > 0.05 ? (run ? RUN : WALK) * Math.min(1, len) : 0;
    this.speed += (want - this.speed) * Math.min(1, dt * 8);

    if (this.speed > 0.02 && len > 0.05) {
      const sy = Math.sin(this.camYaw), cy = Math.cos(this.camYaw);
      const dx = -sy * f + cy * s, dz = -cy * f - sy * s;
      const n = Math.hypot(dx, dz) || 1;
      const mx = (dx / n) * this.speed * dt, mz = (dz / n) * this.speed * dt;
      if (!this._blocked(this.pos.x + mx, this.pos.z)) this.pos.x += mx;
      if (!this._blocked(this.pos.x, this.pos.z + mz)) this.pos.z += mz;
      // turn the body towards the direction of travel
      const target = this.firstPerson ? Math.atan2(-sy, -cy) : Math.atan2(dx, dz);
      let diff = target - this.heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.heading += diff * Math.min(1, dt * 10);
    } else if (this.firstPerson) {
      this.heading = Math.atan2(-Math.sin(this.camYaw), -Math.cos(this.camYaw));
    }

    // stay on floors, stairs and terraces; drop gently when walking off an edge
    const g = this.groundAt(this.pos.x, this.pos.z, this.feet + 0.4);
    if (g > -1e6) this.feet = g < this.feet - 0.05 ? Math.max(g, this.feet - 9 * dt) : g;
    this._pose();

    // animation matched to speed
    if (this.mixer) {
      if (this.speed < 0.15) this._play('idle');
      else if (this.speed < 2.2) { this._play('walk'); this.current.timeScale = this.speed / WALK; }
      else { this._play('run'); this.current.timeScale = this.speed / RUN * 1.1; }
    }

    // camera
    const cam = this.camera;
    if (this.firstPerson) {
      this.body.visible = false;
      cam.position.set(this.pos.x, this.feet + EYE, this.pos.z);
      cam.rotation.set(Math.max(-1.4, Math.min(1.4, PITCH0 - this.camPitch)), this.camYaw, 0, 'YXZ');
      return;
    }
    // over the right shoulder: the avatar sits to the left of the frame and you see the room ahead
    const sx = Math.cos(this.camYaw) * SHOULDER, sz = -Math.sin(this.camYaw) * SHOULDER;
    const target = new THREE.Vector3(this.pos.x + sx, this.feet + 1.55, this.pos.z + sz);
    const p = this.camPitch;
    const dir = new THREE.Vector3(Math.sin(this.camYaw) * Math.cos(p), Math.sin(p), Math.cos(this.camYaw) * Math.cos(p));
    // keep the camera on this side of walls and ceilings
    let allowed = this.dist;
    this.ray.set(target, dir);
    this.ray.far = this.dist + 0.3;
    const hits = this.ray.intersectObjects(this.occluders(), false);
    if (hits.length) allowed = Math.max(0.25, hits[0].distance - 0.25);
    this.camDist = allowed < this.camDist ? allowed : this.camDist + (allowed - this.camDist) * Math.min(1, dt * 3);
    cam.position.copy(target).addScaledVector(dir, this.camDist);
    if (cam.position.y < this.feet + 0.3) cam.position.y = this.feet + 0.3;
    // aim a little ahead of the avatar, so more of the room than of the avatar fills the view
    cam.lookAt(target.x - Math.sin(this.camYaw) * LOOK_AHEAD, target.y - 0.15, target.z - Math.cos(this.camYaw) * LOOK_AHEAD);
    this.body.visible = this.camDist > 0.7;
  }
}
