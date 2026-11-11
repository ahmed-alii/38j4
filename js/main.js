import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SITE, derive } from './config.js';
import { buildSite, label } from './site.js';
import { buildHouse } from './house.js';
import { furnish, CATALOG } from './catalog.js';
import { upgradeCars } from './cars.js';
import { DESIGN as SCHEME_A } from './designs/scheme-a.js';
import { DESIGN as CASA_J4 } from './designs/plot39.js';
import { DESIGN as HAVELI_J4 } from './designs/plot37.js';
import { sunPosition, sunTimes, sunVector, compassName, fmtClock } from './sun.js';
import { Avatar } from './avatar.js';
import { makePipeline } from './render.js';
import { fmtFtIn, fmtM, fmtSqft, fmtSqm } from './units.js';

const d = derive(SITE);
const $ = (id) => document.getElementById(id);

// ---------- renderer ----------
const stage = $('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.75;
stage.appendChild(renderer.domElement);

const labels = new CSS2DRenderer();
labels.domElement.className = 'labels';
stage.appendChild(labels.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfd8de, 180, 700);
// Explore uses a normal lens; walk-in uses a wider one, about what your eyes take in standing in a
// room (a 16 mm-equivalent on a phone camera); a narrow lens makes real rooms feel cramped.
const ORBIT_FOV = 50, WALK_FOV = 72;
const camera = new THREE.PerspectiveCamera(ORBIT_FOV, 1, 0.05, 3000);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;
// swap in a real sky photo (CC0, Poly Haven) for reflections and soft ambient light once it loads
new THREE.TextureLoader().load('textures/sky_env.jpg', (t) => {
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  scene.environment = pmrem.fromEquirectangular(t).texture;
  scene.environmentIntensity = 0.55;
  t.dispose();
});
// the same sky, in 4K, as the visible background in daylight (real clouds instead of a gradient)
let skyPhoto = null;
new THREE.TextureLoader().load('textures/sky_bg.jpg', (t) => {
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  skyPhoto = t;
  updateSun();
});

// ---------- rendering quality ----------
// Realistic: ambient occlusion, bloom, SMAA, 4K shadows. Fast: plain render (default on phones).
const coarse = window.matchMedia?.('(pointer: coarse)').matches;
let quality = coarse ? 'fast' : 'realistic';
try { quality = localStorage.getItem('dreamhome.quality') || quality; } catch { /* storage unavailable */ }
const pipeline = makePipeline(renderer, scene, camera);

// ---------- sky & light ----------
const sky = new Sky();
sky.scale.setScalar(5000);
const su = sky.material.uniforms;
su.turbidity.value = 9;       // Punjab haze
su.rayleigh.value = 1.6;
su.mieCoefficient.value = 0.006;
su.mieDirectionalG.value = 0.82;
scene.add(sky);

const hemi = new THREE.HemisphereLight(0xdfe9f3, 0x8a7a62, 0.9);
scene.add(hemi);
const fill = new THREE.AmbientLight(0xfff3e4, 0.35); // stands in for light bouncing around indoors
scene.add(fill);
const sun = new THREE.DirectionalLight(0xfff1dc, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -40; sun.shadow.camera.right = 40;
sun.shadow.camera.top = 40; sun.shadow.camera.bottom = -40;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 260;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

// ---------- projects: which plot is "ours" in this view ----------
// Three 1 kanal plots side by side, all west-facing: 39 (north), 38, 37 (south). Each view shows
// the plot's own design with its built neighbours next door.
const NB = {
  39: { design: CASA_J4, name: 'Plot 39 · Casa J-4' },
  38: { design: SCHEME_A, name: 'Plot 38 · Scheme A' },
  37: { design: HAVELI_J4, name: 'Plot 37 · Haveli J-4' },
};
const PROJECTS = {
  'plot-39': { plotNo: '39', design: CASA_J4, neighbours: [{ ...NB[38], offsetZFt: 50 }, { ...NB[37], offsetZFt: 100 }] },
  'plot-38': { plotNo: '38', design: SCHEME_A, neighbours: [{ ...NB[39], offsetZFt: -50 }, { ...NB[37], offsetZFt: 50 }] },
  'plot-37': { plotNo: '37', design: HAVELI_J4, neighbours: [{ ...NB[38], offsetZFt: -50 }, { ...NB[39], offsetZFt: -100 }] },
};
const projectKey = PROJECTS[location.hash.slice(1)] ? location.hash.slice(1) : 'plot-39';
const project = PROJECTS[projectKey];
window.addEventListener('hashchange', () => { if (PROJECTS[location.hash.slice(1)]) location.reload(); });
// the gate corner belongs to the design (bye-law 17k: left or right corner)
SITE.gate.side = project.design?.GATE ?? 'south';

// ---------- site ----------
const site = buildSite(scene, SITE, d);
// A plot with no design yet behaves like an empty house: nothing to walk on, cut away or measure.
const NO_HOUSE = {
  surfaceAt: () => -Infinity, colliders: [], pickables: [], areas: null, teleports: {}, basementOn: false,
  setCut() {}, setBasement() {},
};
const house = project.design ? buildHouse(scene, site, d, project.design) : NO_HOUSE;
for (const nb of project.neighbours ?? []) {
  const n = buildHouse(scene, site, d, nb.design, { offsetZFt: nb.offsetZFt, context: true });
  const nl = label(`${nb.name}<br><small>your other plot</small>`, 'note');
  nl.position.set(d.D / 2, 9.5, d.W / 2 + nb.offsetZFt * 0.3048);
  // the neighbour is context only: hide its own labels so they don't crowd this plot's
  n.root.traverse((o) => { if (o.isCSS2DObject) o.visible = false; });
  n.root.parent.add(nl);
  upgradeCars(n.root);
}
if (project.design) upgradeCars(house.root).then(() => pipeline?.refreshNoAO());
document.getElementById('plotTitle').textContent = `Plot ${project.plotNo} · Sector J-4`;
document.getElementById('plotNo').textContent = project.plotNo;
document.querySelectorAll('[data-project]').forEach((a) => a.setAttribute('aria-current', a.dataset.project === projectKey ? 'page' : 'false'));
document.getElementById('schemeSection').hidden = !project.design;
document.getElementById('pendingSection').hidden = !!project.design;
document.querySelectorAll('[data-tp]').forEach((b) => { b.hidden = !project.design || b.dataset.tp === 'basement' || !house.teleports[b.dataset.tp]; });
if (project.design) {
  document.getElementById('designName').textContent = project.design.name;
  document.getElementById('designSummary').textContent = project.design.summary ?? '';
}
// swap the stand-in furniture for the real models once they have loaded, and list them
if (project.design) {
  furnish(house.root).then((ids) => {
    const list = document.getElementById('furnList');
    if (list) {
      list.replaceChildren(...ids.map((id) => {
        const c = CATALOG[id], li = document.createElement('li');
        const [w, dd, h] = c.dims.map((v) => Math.round(v * 100));
        li.innerHTML = `<span>${c.name}</span><small>${c.brand} · ${w} × ${dd} × ${h} cm</small>`;
        return li;
      }));
      document.getElementById('furnSection').hidden = !ids.length;
    }
    pipeline?.refreshNoAO();
  });
}
// designs without a basement option hide its controls
document.querySelectorAll('.basement-ctl').forEach((el) => { el.hidden = !house.hasBasement; });
const center = new THREE.Vector3(d.D / 2, 0, d.W / 2);
sun.target.position.copy(center);

// sun path arc
const sunPathGroup = new THREE.Group();
scene.add(sunPathGroup);

// ---------- controls ----------
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.maxPolarAngle = Math.PI / 2 - 0.02;
orbit.minDistance = 2;
orbit.maxDistance = 400;

// Walkable height at (x, z): the highest of the site ground and the house's floors, stairs and
// terraces that is not above `maxY` (so you can step up a stair but not onto a roof).
function groundAt(x, z, maxY) {
  let best = -Infinity;
  const s = site.groundAt(x, z);
  if (s <= maxY) best = s;
  const h = house.surfaceAt(x, z, maxY);
  if (h > best) best = h;
  return best;
}
// Things the walk-in camera must not pass through: the house and the boundary walls.
function shownObj(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }
const wallMeshes = [];
for (const k of ['ourWalls', 'neighbourWalls']) site.layers[k]?.traverse((o) => { if (o.isMesh) wallMeshes.push(o); });
const avatar = new Avatar({
  scene, camera, dom: renderer.domElement, groundAt,
  colliders: [...site.colliders, ...house.colliders],
  occluders: () => [...house.pickables, ...wallMeshes].filter(shownObj),
  stickEl: $('stick'),
});
avatar.load('models/avatar.json');
// In explore mode the avatar waits on the front path as a 5′10″ scale figure.
avatar.place(12.0 * 0.3048, 26.0 * 0.3048, Math.PI / 2);
const youLabel = label('You · 5′ 10″', 'you');
youLabel.position.set(0, 2.05, 0);
avatar.root.add(youLabel);

const VIEWS = {
  aerial: { pos: [-14, 19, 32], target: [d.D / 2, 3, d.W / 2] },
  plan: { pos: [d.D / 2, 62, d.W / 2 + 0.01], target: [d.D / 2, 0, d.W / 2] },
  road: { pos: [-d.road.row + 1.2, 1.6, d.W / 2], target: [d.D / 2, 3.5, d.W / 2] },
  rear: { pos: [d.D + 18, 14, d.W / 2 + 22], target: [d.D / 2, 3, d.W / 2] },
};

// Portrait phones see less width: pull the camera back so the whole plot fits.
function viewPos(v) {
  const p = new THREE.Vector3(...v.pos), t = new THREE.Vector3(...v.target);
  const k = camera.aspect < 1 && v !== VIEWS.road ? 1.8 : 1;
  return t.add(p.sub(t).multiplyScalar(k));
}

let mode = 'orbit';
let userCut = 'roof';     // floors chosen in the panel
let roofOff = false;      // walk-in: hide the floors above the avatar
let autoLevel = null;
let tween = null;
function goView(name) {
  if (mode === 'walk') exitWalk();
  const v = VIEWS[name];
  tween = {
    t: 0,
    fromPos: camera.position.clone(), toPos: viewPos(v),
    fromT: orbit.target.clone(), toT: new THREE.Vector3(...v.target),
  };
  document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === name ? 'true' : 'false'));
}

function setModeButtons() {
  document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
}
function enterWalk() {
  if (mode === 'walk') return;
  mode = 'walk';
  orbit.enabled = false;
  tween = null;
  avatar.enable();                 // from wherever the avatar is standing
  camera.fov = WALK_FOV; camera.updateProjectionMatrix();
  document.body.classList.add('walking');
  if (!document.body.classList.contains('panel-collapsed')) setPanel(true, { remember: false });
  // dimension lines draw on top of everything; indoors they just cut across the rooms
  for (const k of ['labels', 'setbacks']) if (site.layers[k]) { site.layers[k].userData.walkWas = site.layers[k].visible; site.layers[k].visible = false; }
  $('walkHelp').hidden = false;
  setMeasure(false);
  setModeButtons();
  document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
}
function exitWalk() {
  if (mode !== 'walk') return;
  mode = 'orbit';
  avatar.disable();
  camera.fov = ORBIT_FOV; camera.updateProjectionMatrix();
  orbit.enabled = true;
  document.body.classList.remove('walking');
  if (panelPref === 'open') setPanel(false, { remember: false });
  for (const k of ['labels', 'setbacks']) if (site.layers[k] && site.layers[k].userData.walkWas !== undefined) site.layers[k].visible = site.layers[k].userData.walkWas;
  $('walkHelp').hidden = true;
  autoLevel = null;
  house.setCut(userCut);
  // keep orbiting around the avatar from where the camera is
  orbit.target.set(avatar.pos.x, avatar.feet + 1.2, avatar.pos.z);
  camera.up.set(0, 1, 0);
  setModeButtons();
}

document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => goView(b.dataset.view)));
document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.mode === 'walk') enterWalk(); else exitWalk();
}));
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Escape' || mode !== 'walk') return;
  // the first Esc only frees the mouse pointer; the next one leaves walk-in mode
  if (avatar.locked || performance.now() - (avatar.unlockedAt ?? 0) < 400) return;
  exitWalk();
});
avatar.onLockChange = (locked) => { $('lockHint').textContent = locked ? 'Mouse steers the view · Esc frees the pointer' : 'Click the scene to steer with the mouse'; };
avatar.onViewChange = (fp) => { $('povBtn').textContent = fp ? 'Third person' : 'First person'; $('povBtn').setAttribute('aria-pressed', String(fp)); };
$('povBtn').addEventListener('click', () => avatar.setFirstPerson(!avatar.firstPerson));
$('roofBtn').addEventListener('click', () => {
  roofOff = !roofOff;
  $('roofBtn').setAttribute('aria-pressed', String(roofOff));
  autoLevel = null;
  if (!roofOff) house.setCut('roof');
});
const levelOf = (feetM) => { const f = feetM / 0.3048; return f < -1 ? 'basement' : f < 12.5 ? 'ground' : f < 24.5 ? 'first' : 'roof'; };

// ---------- layers ----------
const LAYER_DEFAULTS = {
  setbacks: !project.design, envelope: !project.design, heightLimit: true, ourWalls: true, neighbourWalls: true,
  neighbourGhosts: false, props: true, rod: true, grid: false, labels: true, sunPath: false,
};
function applyLayer(name, on) {
  if (name === 'labels') { labels.domElement.hidden = !on; return; }
  if (name === 'sunPath') { sunPathGroup.visible = on; return; }
  if (site.layers[name]) site.layers[name].visible = on;
}
document.querySelectorAll('input[data-layer]').forEach((inp) => {
  const name = inp.dataset.layer;
  inp.checked = LAYER_DEFAULTS[name] ?? true;
  applyLayer(name, inp.checked);
  inp.addEventListener('change', () => applyLayer(name, inp.checked));
});

// ---------- sun ----------
const loc = SITE.location;
function todayAtSite() {
  const t = new Date(Date.now() + loc.tzHours * 3600e3);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate(), hours: t.getUTCHours() + t.getUTCMinutes() / 60 };
}
const today = todayAtSite();
const DATES = {
  summer: { year: today.year, month: 6, day: 21 },
  equinox: { year: today.year, month: 3, day: 20 },
  winter: { year: today.year, month: 12, day: 21 },
  today: { year: today.year, month: today.month, day: today.day },
};
let dateKey = 'summer';
let hours = 16;

function buildSunPath() {
  sunPathGroup.clear();
  const date = DATES[dateKey];
  const { rise, set } = sunTimes(date, loc);
  if (rise === null || set === null) return;
  const Rr = 46;
  const pts = [];
  for (let h = rise; h <= set + 1e-6; h += 1 / 12) {
    const p = sunPosition(date, h, loc);
    const v = sunVector(Math.max(p.altitude, 0), p.azimuth, SITE.gridRotationDeg);
    pts.push(new THREE.Vector3(center.x + v.x * Rr, v.y * Rr, center.z + v.z * Rr));
  }
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf2a33a }));
  sunPathGroup.add(line);
  for (let h = Math.ceil(rise); h <= set; h += 1) {
    const p = sunPosition(date, h, loc);
    if (p.altitude < 0) continue;
    const v = sunVector(p.altitude, p.azimuth, SITE.gridRotationDeg);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), new THREE.MeshBasicMaterial({ color: 0xf2a33a }));
    dot.position.set(center.x + v.x * Rr, v.y * Rr, center.z + v.z * Rr);
    sunPathGroup.add(dot);
    if (h % 2 === 0) {
      const l = label(fmtClock(h).replace(':00', ''), 'sunhour');
      l.position.copy(dot.position).add(new THREE.Vector3(0, 1.2, 0));
      sunPathGroup.add(l);
    }
  }
}

function updateSun() {
  const date = DATES[dateKey];
  const p = sunPosition(date, hours, loc);
  const v = sunVector(p.altitude, p.azimuth, SITE.gridRotationDeg);
  su.sunPosition.value.set(v.x, v.y, v.z);
  sun.position.set(center.x + v.x * 120, Math.max(v.y, 0.02) * 120, center.z + v.z * 120);
  const day = THREE.MathUtils.smoothstep(p.altitude, -2, 8);
  sun.intensity = 3.2 * day;
  sun.color.setHSL(0.09, 0.8, 0.62 + 0.3 * THREE.MathUtils.smoothstep(p.altitude, 0, 30));
  hemi.intensity = 0.25 + 0.75 * THREE.MathUtils.smoothstep(p.altitude, -6, 20);
  fill.intensity = 0.08 + 0.32 * THREE.MathUtils.smoothstep(p.altitude, -6, 20);
  renderer.toneMappingExposure = 0.45 + 0.35 * THREE.MathUtils.smoothstep(p.altitude, -6, 15);
  scene.fog.color.setHSL(0.6, 0.16, 0.25 + 0.5 * THREE.MathUtils.smoothstep(p.altitude, -6, 15));
  // photographed sky by day; the physical sky model at dawn, dusk and night
  const usePhoto = skyPhoto && p.altitude > 4;
  sky.visible = !usePhoto;
  scene.background = usePhoto ? skyPhoto : null;
  if (usePhoto) scene.backgroundIntensity = 0.75 + 0.55 * THREE.MathUtils.smoothstep(p.altitude, 4, 35);

  const { rise, set } = sunTimes(date, loc);
  $('clock').textContent = fmtClock(hours);
  $('sunRead').textContent = p.altitude > 0
    ? `Sun ${Math.round(p.altitude)}° high, from the ${compassName(p.azimuth)} (${Math.round(p.azimuth)}°)`
    : 'Sun below the horizon';
  $('sunTimes').textContent = `Sunrise ${fmtClock(rise)} · Sunset ${fmtClock(set)}`;
  $('westNote').hidden = !(p.altitude > 0 && p.azimuth > 200 && p.azimuth < 300);
}

document.querySelectorAll('[data-date]').forEach((b) => b.addEventListener('click', () => {
  dateKey = b.dataset.date;
  document.querySelectorAll('[data-date]').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
  buildSunPath();
  updateSun();
}));
const timeIn = $('time');
timeIn.value = String(hours);
timeIn.addEventListener('input', () => { hours = parseFloat(timeIn.value); updateSun(); });
let playing = false;
$('play').addEventListener('click', () => {
  playing = !playing;
  $('play').textContent = playing ? 'Pause' : 'Play day';
  $('play').setAttribute('aria-pressed', String(playing));
});

// ---------- measure tool ----------
const measureGroup = new THREE.Group();
scene.add(measureGroup);
let measuring = false;
let mPoints = [];
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const markMat = new THREE.MeshBasicMaterial({ color: 0x1d5fd1, depthTest: false });
const mLineMat = new THREE.LineBasicMaterial({ color: 0x1d5fd1, depthTest: false });

function setMeasure(on) {
  measuring = on;
  $('measure').setAttribute('aria-pressed', String(on));
  $('measure').textContent = on ? 'Measuring… tap two points' : 'Measure';
  renderer.domElement.style.cursor = on ? 'crosshair' : '';
  mPoints = [];
}
$('measure').addEventListener('click', () => setMeasure(!measuring));
$('clearMeasure').addEventListener('click', () => { measureGroup.clear(); mPoints = []; });

function shown(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }

let down = null;
renderer.domElement.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!measuring || mode !== 'orbit' || !down) return;
  if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 || performance.now() - down.t > 600) return;
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects([...site.pickables, ...house.pickables].filter(shown), false)[0];
  if (!hit) return;
  const p = hit.point.clone();
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), markMat);
  dot.renderOrder = 20;
  dot.position.copy(p);
  measureGroup.add(dot);
  mPoints.push(p);
  if (mPoints.length === 2) {
    const [a, b] = mPoints;
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), mLineMat);
    line.renderOrder = 20;
    measureGroup.add(line);
    const dist = a.distanceTo(b);
    const horiz = Math.hypot(b.x - a.x, b.z - a.z);
    const extra = Math.abs(b.y - a.y) > 0.05 ? `<br><small>horizontal ${fmtFtIn(horiz)}</small>` : '';
    const l = label(`<b>${fmtFtIn(dist)}</b> · ${fmtM(dist)}${extra}`, 'measure');
    l.position.copy(a).add(b).multiplyScalar(0.5);
    measureGroup.add(l);
    mPoints = [];
  }
});

// ---------- house controls ----------
function setCut(level) {
  userCut = level;
  if (mode !== 'walk') house.setCut(level);
  document.querySelectorAll('[data-cut]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cut === level ? 'true' : 'false'));
}
document.querySelectorAll('[data-cut]').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.cut === 'basement' && !house.basementOn) setBasement(true);
  setCut(b.dataset.cut);
  if (b.dataset.cut !== 'roof' && mode === 'orbit') goView('cutaway');
}));
function setBasement(on) {
  house.setBasement(on);
  document.querySelectorAll('[data-basement]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.basement === 'on') === on)));
  $('tpBasement').hidden = !on || !project.design;
  $('cutBasement').disabled = !on;
  fillDesign();
}
document.querySelectorAll('[data-basement]').forEach((b) => b.addEventListener('click', () => {
  setBasement(b.dataset.basement === 'on');
  setCut(house.basementOn ? 'basement' : 'roof');
}));
document.querySelectorAll('[data-tp]').forEach((b) => b.addEventListener('click', () => {
  const t = house.teleports[b.dataset.tp];
  if (mode !== 'walk') enterWalk();
  avatar.enable(t.x * 0.3048, t.z * 0.3048, t.yaw, t.y * 0.3048);
}));
VIEWS.cutaway = { pos: [d.D / 2 - 14, 26, d.W / 2 + 20], target: [d.D / 2, 2, d.W / 2] };

function fillDesign() {
  const a = house.areas;
  if (!a) return;
  const pct = Math.round((a.ffCovered / a.ffAllowed) * 100);
  const rows = [
    a.gfEnclosed
      ? ['Ground floor', `${fmtSqft(a.gfEnclosed)} enclosed`, `${fmtSqft(a.gfCovered)} covered incl. loggia, porch${a.pergolaCounted ? ', ¼ of pergola' : ''}`]
      : ['Ground floor, covered', fmtSqft(a.gfCovered), `courtyard ${fmtSqft(a.courtyard)} open to sky`],
    ['First floor, covered', fmtSqft(a.ffCovered), `${pct}% of the ${fmtSqft(a.ffAllowed)} allowed`],
    ['Stair tower', `${Math.round(a.mumtyArea)} sq ft`, 'of 300 allowed'],
    house.hasBasement
      ? ['Basement (option)', house.basementOn ? fmtSqft(a.basement) : 'not included', house.basementOn ? 'with sunken garden' : 'switch it on below']
      : ['Double-height hall', `${Math.round(a.voids)} sq ft open to the roof`, 'not counted as covered area'],
    ['Highest point', fmtFtIn(a.top * 0.3048), `stair tower · lift top ${fmtFtIn(a.liftTop * 0.3048)} (≤ 41′)`],
  ];
  $('design').innerHTML = rows.map(([k, v, s]) => `<div class="stat"><dt>${k}</dt><dd><b>${v}</b><span>${s}</span></dd></div>`).join('');
}
fillDesign();

// ---------- stats panel ----------
function fillStats() {
  const rows = [
    ['Plot', `50′ × 90′ = ${fmtSqft(d.plotSqft)}`, '500 sq yd · 418 m²'],
    ['Ground floor (max)', `${fmtFtIn(d.buildable.z2 - d.buildable.z1)} × ${fmtFtIn(d.buildable.x2 - d.buildable.x1)}`, `${fmtSqft(d.gfSqft)} · ${Math.round(d.coverage * 100)}% of plot`],
    ['First floor (max)', fmtSqft(d.ffSqft), '75% of ground floor'],
    ['Stair tower on roof', `≤ ${d.mumtySqft} sq ft`, 'no living space in it'],
    ['Basement (optional)', `≤ ${fmtSqft(d.gfSqft)}`, 'one storey, ≤ 10′ high'],
    ['Above ground, all floors', fmtSqft(d.totalAboveGroundSqft), fmtSqm(d.totalAboveGroundSqft)],
    ['Height', '35′ 0″ max', 'from road crown · no 2nd floor'],
  ];
  $('stats').innerHTML = rows.map(([k, v, s]) => `<div class="stat"><dt>${k}</dt><dd><b>${v}</b><span>${s}</span></dd></div>`).join('');
  $('stackNote').textContent = `Plinth ${SITE.levels.plinthFt * 12}″ + ground floor ${SITE.levels.gfFloorToFloorFt}′ + first floor ${SITE.levels.ffFloorToFloorFt}′ + stair tower ${SITE.levels.mumtyFt}′ = ${fmtFtIn(d.stackTopFt * 0.3048)}, under the 35′ limit.`;
}
fillStats();

// ---------- panel collapse (wide screens) ----------
// The choice is remembered; walk-in mode tucks the panel away and leaving it brings it back.
let panelPref = 'open';
try { panelPref = localStorage.getItem('dreamhome.panel') || 'open'; } catch { /* storage unavailable */ }
function setPanel(collapsed, { remember = true } = {}) {
  document.body.classList.toggle('panel-collapsed', collapsed);
  $('panelCollapse').setAttribute('aria-expanded', String(!collapsed));
  $('panelExpand').setAttribute('aria-expanded', String(!collapsed));
  if (remember) {
    panelPref = collapsed ? 'collapsed' : 'open';
    try { localStorage.setItem('dreamhome.panel', panelPref); } catch { /* storage unavailable */ }
  }
  resize();
  // keep keyboard focus on the control that now toggles it (only for the user's own clicks)
  if (remember && document.activeElement?.closest?.('#panelCollapse, #panelExpand')) (collapsed ? $('panelExpand') : $('panelCollapse')).focus({ preventScroll: true });
}
$('panelCollapse').addEventListener('click', () => setPanel(true));
$('panelExpand').addEventListener('click', () => setPanel(false));
window.addEventListener('keydown', (e) => {
  if (e.code !== 'KeyP' || e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  setPanel(!document.body.classList.contains('panel-collapsed'));
});

// ---------- panel toggle (mobile) ----------
$('panelToggle').addEventListener('click', () => {
  const open = document.body.classList.toggle('panel-open');
  $('panelToggle').setAttribute('aria-expanded', String(open));
  $('panelToggle').textContent = open ? 'Hide controls' : 'Controls';
});

// ---------- loop ----------
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h);
  pipeline.setSize(w, h);
  labels.setSize(w, h);
  camera.aspect = w / h;
  // On wide screens the panel covers the left edge: shift the picture so the plot sits in the free area.
  const panel = $('panel');
  const shift = w > 760 && !document.body.classList.contains('panel-collapsed') ? panel.offsetWidth + 12 : 0;
  if (shift) camera.setViewOffset(w + shift, h, 0, 0, w, h); else camera.clearViewOffset();
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
document.body.classList.toggle('panel-collapsed', panelPref === 'collapsed');
$('panelCollapse').setAttribute('aria-expanded', String(panelPref !== 'collapsed'));
$('panelExpand').setAttribute('aria-expanded', String(panelPref !== 'collapsed'));
resize();

camera.position.copy(viewPos(VIEWS.aerial));
orbit.target.set(...VIEWS.aerial.target);
buildSunPath();
updateSun();

// rendering quality switch (realistic: AO, bloom, SMAA, 4K sun shadows)
function setQuality(q) {
  quality = q;
  try { localStorage.setItem('dreamhome.quality', q); } catch { /* storage unavailable */ }
  const size = q === 'realistic' ? 4096 : 2048;
  if (sun.shadow.mapSize.x !== size) {
    sun.shadow.mapSize.set(size, size);
    sun.shadow.map?.dispose();
    sun.shadow.map = null;
  }
  document.querySelectorAll('[data-quality]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.quality === q)));
}
document.querySelectorAll('[data-quality]').forEach((b) => b.addEventListener('click', () => setQuality(b.dataset.quality)));
setQuality(quality);
pipeline.refreshNoAO();

const compass = $('compassRose');
const elevationLabels = [];
scene.traverse((o) => { if (o.userData.elevation) elevationLabels.push(o); });
let elevShown = true;
const clock = new THREE.Clock();
const dirV = new THREE.Vector3();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.1);
  if (tween) {
    tween.t = Math.min(1, tween.t + dt / 0.9);
    const k = 1 - Math.pow(1 - tween.t, 3);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
    orbit.target.lerpVectors(tween.fromT, tween.toT, k);
    if (tween.t >= 1) tween = null;
  }
  if (mode === 'orbit') orbit.update();
  avatar.update(dt);
  if (mode === 'walk') {
    // walk-in: show the floor the avatar is on with everything above lifted off (if chosen)
    const lv = roofOff ? levelOf(avatar.feet) : 'roof';
    if (lv !== autoLevel) { autoLevel = lv; house.setCut(lv); }
  }
  if (playing) {
    hours += dt * 0.8;
    if (hours > 20) hours = 5;
    timeIn.value = String(hours);
    updateSun();
  }
  camera.getWorldDirection(dirV);
  const showElev = dirV.y > -0.8;
  if (showElev !== elevShown) { elevShown = showElev; elevationLabels.forEach((o) => { o.visible = showElev; }); }
  const heading = Math.atan2(dirV.x, -dirV.z) * 180 / Math.PI + SITE.gridRotationDeg;
  compass.style.transform = `rotate(${-heading}deg)`;
  if (quality === 'realistic') pipeline.render(); else renderer.render(scene, camera);
  labels.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

// expose for debugging in the console
window.__dreamHome = { scene, camera, orbit, site, d, SITE, goView, enterWalk, exitWalk, avatar, house };
