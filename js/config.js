// Everything that describes the real plot and the rules that apply to it.
// Sources:
//   - Allotment card: Phase 1, Sector J-4, Plot 38, 1 Kanal (500 sq yd), Residential.
//   - Google Maps pin: 32.2696086 N, 74.1188972 E.
//   - DHA Gujranwala Construction & Development Regulations 2022 (Bye-Laws), see docs/.
// Values marked `assumed: true` are estimates to confirm with the owner / on site.

import { ft } from './units.js';

export const SITE = {
  title: 'Plot 38 · Sector J-4 · Phase 1 · DHA Gujranwala',
  card: { phase: '1', sector: 'J-4', plotNo: '38', size: '1 Kanal (500 sq yd)', category: 'Residential', facing: 'West' },
  location: { lat: 32.2696086, lon: 74.1188972, tzHours: 5 }, // Pakistan Standard Time, no DST

  // Satellite imagery shows the J-4 street grid running within ~1–2° of true north–south.
  gridRotationDeg: 0,

  // DHA GWA: 20 Marla residential = 50 ft × 90 ft. West-facing: the 50 ft side is on the road (west).
  plot: { widthFt: 50, depthFt: 90 },

  // Bye-law 17(a): minimum clear spaces including boundary walls, 1 Kanal plot.
  setbacks: { frontFt: 15.75, rearFt: 5.375, sideFt: 5.375 },

  // Road in front (west). Width estimated from satellite imagery: ~40 ft right-of-way.
  road: { rowFt: 40, carriagewayFt: 24, assumed: true },

  levels: {
    yardFt: 0.5,          // finished yard above road crown (bye-law 14b: ≤ 12″)
    plinthFt: 1.5,        // bye-law 14a: ≥ 1′6″ above crown (3′6″ with basement)
    plinthBasementFt: 3.5,
    gfFloorToFloorFt: 12, // assumed typical; clear ceiling must be 9′6″–12′ (bye-law 11c)
    ffFloorToFloorFt: 12, // assumed typical
    parapetFt: 3,         // bye-law 15a(4): parapet 3 ft
    mumtyFt: 9,           // assumed stair-tower height above roof
    maxHeightFt: 35,      // bye-law 11a: from crown of road to highest part of roof
    liftRoomMaxFt: 41,    // bye-law 11d: lift machine room only
    boundaryWallFt: 7,    // bye-law 16a: max 7 ft from crown of adjacent road
  },

  wall: { thickIn: 9 },   // bye-law 15a(6): external / load-bearing walls 9″

  gate: { side: 'south', widthFt: 16, assumed: true }, // bye-law 17k: left or right corner, ≤ 20 ft incl. wicket.
                                                       // South: cars park in front of the lift/stair core.

  rules: {
    ffMaxShareOfGF: 0.75, // bye-law 15a(3)
    mumtyMaxSqft: 300,    // bye-law 23a(2)
    secondFloor: false,
  },
};

/** Derived numbers, all in metres unless the name says Ft / Sqft. */
export function derive(site = SITE) {
  const D = ft(site.plot.depthFt);   // along x (west → east)
  const W = ft(site.plot.widthFt);   // along z (north → south)
  const sb = { front: ft(site.setbacks.frontFt), rear: ft(site.setbacks.rearFt), side: ft(site.setbacks.sideFt) };
  const buildable = { x1: sb.front, x2: D - sb.rear, z1: sb.side, z2: W - sb.side };
  const buildDepthFt = site.plot.depthFt - site.setbacks.frontFt - site.setbacks.rearFt;
  const buildWidthFt = site.plot.widthFt - 2 * site.setbacks.sideFt;
  const plotSqft = site.plot.depthFt * site.plot.widthFt;
  const gfSqft = buildDepthFt * buildWidthFt;
  const ffSqft = gfSqft * site.rules.ffMaxShareOfGF;
  const L = site.levels;
  const y = {
    crown: 0,
    yard: ft(L.yardFt),
    plinth: ft(L.plinthFt),
    gfRoof: ft(L.plinthFt + L.gfFloorToFloorFt),
    ffRoof: ft(L.plinthFt + L.gfFloorToFloorFt + L.ffFloorToFloorFt),
    parapet: ft(L.plinthFt + L.gfFloorToFloorFt + L.ffFloorToFloorFt + L.parapetFt),
    mumty: ft(L.plinthFt + L.gfFloorToFloorFt + L.ffFloorToFloorFt + L.mumtyFt),
    max: ft(L.maxHeightFt),
    wall: ft(L.boundaryWallFt),
  };
  const road = { row: ft(site.road.rowFt), carriage: ft(site.road.carriagewayFt) };
  road.berm = (road.row - road.carriage) / 2;
  return {
    D, W, sb, buildable, buildDepthFt, buildWidthFt, plotSqft, gfSqft, ffSqft,
    mumtySqft: site.rules.mumtyMaxSqft,
    totalAboveGroundSqft: gfSqft + ffSqft + site.rules.mumtyMaxSqft,
    coverage: gfSqft / plotSqft,
    y, road,
    stackTopFt: L.plinthFt + L.gfFloorToFloorFt + L.ffFloorToFloorFt + L.mumtyFt,
  };
}
