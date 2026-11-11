// "Realistic" rendering pipeline: HDR render → ground-truth ambient occlusion (GTAO) → bloom on
// lamps → tone mapping + sRGB (OutputPass) → SMAA anti-aliasing. "Fast" skips all of it.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

export function makePipeline(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const gtao = new GTAOPass(scene, camera, size.x, size.y);
  gtao.output = GTAOPass.OUTPUT.Default;
  gtao.blendIntensity = 1.0;
  gtao.updateGtaoMaterial({ radius: 0.55, distanceExponent: 1.6, thickness: 1.2, scale: 1.0, samples: 16, distanceFallOff: 1.0 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
  // Glass, water and alpha-cut leaf cards would show up as solid sheets in the AO normal pass:
  // hide them while GTAO renders its own buffers (the colour image already contains them).
  const noAO = [];
  const refreshNoAO = () => { noAO.length = 0; scene.traverse((o) => { if (o.userData.noAO) noAO.push(o); }); };
  const gtaoRender = gtao.render.bind(gtao);
  gtao.render = (...args) => {
    const vis = noAO.map((o) => o.visible);
    noAO.forEach((o) => { o.visible = false; });
    gtaoRender(...args);
    noAO.forEach((o, i) => { o.visible = vis[i]; });
  };
  composer.addPass(gtao);

  // only things far brighter than sunlit walls bloom: lanterns, bulbs, the sun's glint on water
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.45, 0.55, 3.5);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const smaa = new SMAAPass(size.x * renderer.getPixelRatio(), size.y * renderer.getPixelRatio());
  composer.addPass(smaa);

  return {
    refreshNoAO,
    setSize(w, h) {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(w, h);
      gtao.setSize(w, h);
    },
    render() { composer.render(); },
  };
}
