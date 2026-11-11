// Plot 38 · Scheme A (revision 3), in FEET.
// Plot coordinates: X = distance east from the front (west) property line, 0–90.
//                   Z = distance south from the north boundary, 0–50.
// Heights (Y) are feet above the crown of the front road (DHA's datum).
// Buildable footprint (bye-law 17a): X 15.75 → 84.625, Z 5.375 → 44.625.
//
// Revision 2: courtyard moved to the south side of the house (open to the side passage),
// garden gallery removed, rooms and furniture re-planned for proper walking space.
// Revision 3: laundry folded into a larger dirty kitchen, kitchen and lounge enlarged, pump/UPS
// moved out of the house, store moved upstairs; bedrooms open straight off the corridor.
//
// Furniture is given as its footprint rectangle r = [x1, z1, x2, z2] in plan, plus `face`:
// the direction its front faces ('n' = −Z, 's' = +Z, 'e' = +X, 'w' = −X). A sofa faces the
// way you look when sitting on it; a bed faces the way its foot points; a counter, wardrobe,
// vanity or WC faces the side you stand on. tools/check-layout.mjs checks these rectangles
// against the walls, each other and the 3 ft in front of every door.
//
// Requirements: docs/requirements.md. Rules: docs/bylaws-1-kanal.md.

// ---- helpers ----
/** wall running along X, centred on line z, thickness t */
const hx = (x1, x2, z, t = 0.375, o = {}) => ({ r: [x1, z - t / 2, x2, z + t / 2], ...o });
/** wall running along Z, centred on line x */
const vz = (z1, z2, x, t = 0.375, o = {}) => ({ r: [x - t / 2, z1, x + t / 2, z2], ...o });
const EXT = { ext: true };
/** opening in a wall that runs along X (on line z) */
const ox = (z, x1, x2, sill, head, type = 'window', o = {}) => ({ axis: 'x', at: z, a: x1, b: x2, sill, head, type, ...o });
/** opening in a wall that runs along Z (on line x) */
const oz = (x, z1, z2, sill, head, type = 'window', o = {}) => ({ axis: 'z', at: x, a: z1, b: z2, sill, head, type, ...o });
const room = (id, name, r, floor, o = {}) => ({ id, name, r, floor, ...o });
const f = (t, r, face = 's', o = {}) => ({ t, r, face, ...o });

export const LEVELS = {
  basement: { floor: -9.5, ceiling: 0 },
  ground: { floor: 1.5, ceiling: 12 },
  first: { floor: 13.5, ceiling: 24 },
  roof: { floor: 25.5, parapet: 28.5, mumtyCeiling: 33, mumtyTop: 34.5, liftTop: 37 },
};

// Stair: dog-leg in the south-west core. Interior X 18.5 → 30.25, Z 36.375 → 43.875.
// Each flight 8 ft long (X 22.25 → 30.25), west landing X 18.5 → 22.25.
// South half = first flight up from each floor; north half = second flight.
export const STAIR = {
  x0: 18.5, xl: 22.25, x1: 30.25,
  south: [40.275, 43.875], north: [36.375, 39.975],
  flights: [
    // [half, yAtX1, yAtXl]  (y at the east end, y at the landing end)
    ['south', 1.5, 7.5], ['north', 13.5, 7.5],      // ground → first
    ['south', 13.5, 19.5], ['north', 25.5, 19.5],   // first → roof
  ],
  landings: [7.5, 19.5],
  basementFlights: [['north', 1.5, -4], ['south', -9.5, -4]],
  basementLanding: -4,
};

export const LIFT = { r: [17.75, 30, 23.75, 36], shaftInner: [18.5, 30.75, 23.375, 35.625] };

// ---------------------------------------------------------------- GROUND FLOOR
const ground = {
  // floor slab (includes the verandah) and the ground-floor roof (= first-floor slab)
  floorOutline: [[17.75, 5.375, 84.625, 44.625], [15.75, 21.0, 17.75, 30.375]],
  roofOutline: [[17.75, 5.375, 84.625, 44.625], [15.75, 5.375, 17.75, 30.375]],
  // side courtyard, open to the sky and to the south side passage
  courtyard: [45.0, 31.0, 62.0, 44.625],
  walls: [
    hx(17.75, 84.625, 5.75, 0.75, EXT),          // north
    vz(5.375, 44.625, 84.25, 0.75, EXT),         // east
    hx(17.75, 45.25, 44.25, 0.75, EXT),          // south: stair, hall, study
    hx(61.75, 84.625, 44.25, 0.75, EXT),         // south: parents' bedroom
    vz(31.0, 44.625, 45.0, 0.5, EXT),            // study | courtyard
    vz(31.0, 44.625, 62.0, 0.5, EXT),            // courtyard | parents' bedroom
    hx(45.0, 62.0, 31.0, 0.5, EXT),              // lounge | courtyard
    vz(5.375, 21.25, 20.0, 0.5, EXT),            // drawing room glass wall (jaali in front of it)
    hx(15.75, 35.25, 21.0, 0.5, EXT),            // drawing south / verandah north
    vz(21.0, 30.0, 22.125, 0.75, EXT),           // foyer front (main door)
    hx(15.75, 24.125, 30.375, 0.75, EXT),        // verandah south / lift north
    vz(30.0, 44.625, 18.125, 0.75, { ext: true, clad: 'wood', cladSkip: [38.75, 42.25] }), // lift + stair core front
    vz(30.0, 36.0, 23.75, 0.75),                 // lift east
    hx(17.75, 30.25, 36.0, 0.75),                // stair north
    hx(30.25, 35.25, 30.0),                      // powder north
    vz(30.0, 36.0, 30.25),                       // powder west
    hx(30.25, 35.25, 36.0),                      // powder south
    vz(5.375, 44.625, 35.25, 0.5),               // drawing/dining, foyer/lounge, powder, hall/study
    hx(35.25, 45.0, 31.0, 0.5),                  // lounge | study
    hx(35.25, 52.0, 18.5),                       // dining | lounge (mostly open)
    vz(5.375, 18.5, 52.0, 0.5),                  // dining | kitchen
    vz(5.375, 18.5, 72.0),                       // kitchen | dirty kitchen
    hx(72.0, 84.625, 18.5),                      // dirty kitchen | lounge + parents' bath
    vz(18.5, 31.0, 76.0, 0.5),                   // lounge | parents' bath (TV wall)
    hx(62.0, 84.625, 31.0),                      // lounge + bath | parents' bedroom
  ],
  openings: [
    oz(22.125, 23.5, 27.5, 0, 9, 'pivot'),               // main door
    ox(21.0, 27.5, 32.0, 0, 8.5, 'double'),              // foyer → drawing
    oz(35.25, 9.0, 14.5, 0, 8.5, 'opening'),             // drawing → dining
    oz(35.25, 22.5, 28.0, 0, 9, 'opening'),              // foyer → lounge
    oz(23.75, 31.5, 34.5, 0, 7.5, 'lift'),
    oz(30.25, 31.0, 33.5, 0, 7.5, 'swing'),              // powder
    oz(35.25, 38.5, 41.0, 0, 7.5, 'swing'),              // hall → study
    ox(18.5, 37.25, 50.0, 0, 9, 'opening'),              // dining ↔ lounge
    oz(52.0, 12.5, 17.5, 0, 8.5, 'opening'),             // dining ↔ kitchen
    oz(72.0, 9.5, 12.0, 0, 7.5, 'swing'),                // kitchen → dirty kitchen
    ox(5.75, 72.5, 75.0, 0, 7.5, 'swing', EXT),          // dirty kitchen service door
    ox(31.0, 46.0, 55.0, 0, 9, 'slide', EXT),            // lounge → courtyard
    ox(31.0, 55.5, 61.5, 0.25, 9, 'window', EXT),        // lounge, fixed glass to courtyard
    oz(45.0, 32.0, 37.0, 0.25, 9, 'window', EXT),        // study glass to courtyard
    oz(45.0, 38.0, 43.5, 0, 9, 'glassdoor', EXT),        // study → courtyard
    oz(62.0, 35.0, 40.0, 0, 9, 'slide', EXT),            // parents → courtyard
    oz(62.0, 32.0, 34.5, 2.5, 9, 'window', EXT),
    oz(62.0, 40.5, 43.5, 2.5, 9, 'window', EXT),
    ox(31.0, 63.0, 65.75, 0, 7.5, 'swing'),              // lounge → parents' bedroom
    ox(31.0, 77.0, 79.5, 0, 7.5, 'swing'),               // bedroom → bath
    // windows
    oz(20.0, 6.0, 20.5, 0.5, 9.5, 'window'),             // drawing, full-height glass behind jaali
    ox(5.75, 23.0, 31.0, 3, 8, 'window'),                // drawing north
    oz(18.125, 39.0, 42.0, 3, 10.5, 'window', { fins: true }), // stair slot
    ox(5.75, 39.0, 49.0, 2.5, 8, 'window'),              // dining north
    ox(5.75, 59.0, 68.0, 3.5, 7.5, 'window'),            // kitchen north, over the counter
    ox(5.75, 76.5, 81.0, 4, 7, 'window'),                // dirty kitchen, over the counter
    ox(44.25, 37.0, 43.0, 3, 8, 'window'),               // study south
    oz(84.25, 34.5, 41.5, 5.5, 8, 'window'),             // parents' bedroom east, high (bed below)
    ox(44.25, 67.0, 77.0, 2.5, 8, 'window'),             // parents' bedroom south
    oz(84.25, 23.0, 27.0, 6, 8, 'window'),               // parents' bath, high
  ],
  rooms: [
    room('drawing', 'Drawing room', [20.25, 6.125, 35.0, 20.75], 'marble'),
    room('verandah', 'Entrance verandah', [15.75, 21.25, 21.75, 30.0], 'stone', { outdoor: true }),
    room('foyer', 'Foyer', [22.5, 21.25, 35.0, 30.0], 'marble'),
    room('lift', 'Lift', [18.5, 30.75, 23.375, 35.625], 'marble', { noLabel: true }),
    room('hall', 'Hall', [24.125, 30.0, 30.06, 35.625], 'marble'),
    room('hall2', '', [30.25, 36.19, 35.0, 43.875], 'marble', { noLabel: true }),
    room('powder', 'Powder', [30.44, 30.19, 35.0, 35.81], 'tile'),
    room('stair', 'Stair', [18.5, 36.375, 30.25, 43.875], 'marble', { noFloor: true }),
    room('dining', 'Dining', [35.5, 6.125, 51.75, 18.31], 'marble'),
    room('kitchen', 'Kitchen', [52.25, 6.125, 71.81, 18.5], 'tile'),
    room('dirty', 'Dirty kitchen + laundry', [72.19, 6.125, 83.875, 18.31], 'tile'),
    room('lounge', 'Family lounge', [35.5, 18.69, 75.75, 30.75], 'wood'),
    room('study', 'Study', [35.5, 31.25, 44.75, 43.875], 'wood'),
    room('courtyard', 'Courtyard', [45.25, 31.25, 61.75, 44.625], 'courtyard', { outdoor: true, sunk: 0.5 }),
    room('pbath', "Parents' bath", [76.25, 18.69, 83.875, 30.81], 'tile'),
    room('parents', "Parents' bedroom", [62.25, 31.19, 83.875, 43.875], 'wood'),
    room('jaaliwalk', '', [17.75, 6.125, 19.75, 21.0], 'stone', { noLabel: true, outdoor: true }),
  ],
  furniture: [
    // drawing room: sofa facing two armchairs, entry and the dining opening kept clear
    f('sofa', [23.5, 6.4, 31.5, 9.4], 's'),
    f('armchair', [23.5, 14.6, 26.3, 17.4], 'n'), f('armchair', [28.7, 14.6, 31.5, 17.4], 'n'),
    f('coffee', [25.0, 10.9, 30.0, 13.4]),
    f('rug', [22.5, 8.6, 32.5, 16.8]),
    // foyer
    f('console', [23.0, 21.3, 27.0, 22.5], 's'),
    // powder
    f('wc', [32.6, 33.6, 34.95, 35.8], 'w'), f('vanity', [33.5, 30.25, 35.0, 32.6], 'w'),
    // dining: 8-seat table, 3′9″+ from table edge to every wall
    f('dining', [39.0, 8.0, 48.6, 15.2], 's'),
    // kitchen (19′6″ wide): fridge, tall pantry and a 13′9″ counter on the north wall; a 10′ island
    // with stools facing the lounge. Aisles: 4′ at the counter, 4′9″ at each end of the island.
    f('fridge', [52.4, 6.2, 55.4, 8.7], 's'),
    f('tall', [55.4, 6.125, 57.9, 8.6], 's'),
    f('counter', [57.9, 6.125, 71.7, 8.125], 's'),
    f('island', [57.0, 12.25, 67.0, 15.75], 's'),
    f('stools', [57.5, 15.9, 66.5, 17.4], 'n'),
    // dirty kitchen with the laundry in it: L-shaped counter, washer + dryer, pantry shelf
    f('counter', [75.2, 6.125, 83.875, 8.125], 's'),
    f('counter', [81.875, 8.125, 83.875, 13.5], 'w'),
    f('washer', [77.0, 16.1, 79.4, 18.31], 'n'), f('washer', [79.6, 16.1, 82.0, 18.31], 'n'),
    f('shelf', [72.19, 13.5, 73.4, 18.31], 'e'),
    // family lounge: TV corner at the east end, family sitting by the foyer, reading chairs
    f('sofa', [64.0, 20.5, 67.0, 27.5], 'e'),
    f('armchair', [70.5, 19.0, 73.3, 21.8], 's'), f('armchair', [70.5, 27.2, 73.3, 30.0], 'n'),
    f('coffee', [68.2, 22.0, 70.7, 26.0]),
    f('tv', [74.3, 20.75, 75.75, 27.75], 'w'),
    f('rug', [66.0, 20.0, 73.5, 28.5]),
    f('sofa', [46.0, 21.8, 54.0, 24.8], 's'),          // family sitting, facing the courtyard
    f('coffee', [48.0, 25.2, 52.0, 27.4]),
    f('armchair', [41.5, 25.9, 44.3, 28.7], 'e'), f('armchair', [41.5, 22.0, 44.3, 24.8], 'e'),
    f('shelf', [36.0, 29.7, 41.0, 30.75], 'n'),
    // study
    f('desk', [36.5, 41.4, 41.5, 43.875], 'n'), f('chair', [38.75, 39.6, 40.25, 41.1], 's'),
    f('shelf', [36.0, 31.25, 44.0, 32.45], 's'),
    f('armchair', [41.6, 33.6, 44.4, 36.4], 'w'),
    // parents' suite
    f('bed', [76.6, 34.6, 83.875, 41.0], 'w'),
    f('nightstand', [82.475, 33.1, 83.875, 34.5], 'w'), f('nightstand', [82.475, 41.1, 83.875, 42.5], 'w'),
    f('wardrobe', [66.5, 31.19, 76.5, 33.19], 's'),
    f('armchair', [64.4, 40.6, 67.2, 43.4], 'e'), f('armchair', [69.2, 40.6, 72.0, 43.4], 'w'),
    f('coffee', [67.6, 41.4, 68.8, 42.6]),
    f('vanity', [76.25, 20.0, 78.0, 26.0], 'e'),
    f('shower', [80.2, 18.75, 83.875, 22.25], 's'),
    f('wc', [81.55, 24.0, 83.875, 26.2], 'w'),
    // courtyard
    f('bench', [49.0, 41.6, 53.0, 43.2], 'n'),
    f('lounger', [53.5, 37.0, 55.7, 43.2], 'n'), f('lounger', [56.2, 37.0, 58.4, 43.2], 'n'),
  ],
};

// ---------------------------------------------------------------- FIRST FLOOR
const first = {
  // Covered area (bye-law 15a(3): ≤ 75% of 2,703 sq ft = 2,027 sq ft)
  footprint: [
    [24.25, 13.0, 35.25, 30.0],    // upstairs lounge + front of the hall
    [17.75, 30.0, 35.25, 44.625],  // lift, hall, stair, landing
    [35.25, 5.375, 84.625, 31.0],  // bedrooms 2, 3, 4 and the corridor
    [62.0, 31.0, 84.625, 44.625],  // master suite
  ],
  // open parts of the ground-floor roof (glass railings)
  terraces: [
    { name: 'Front terrace', r: [15.75, 5.375, 24.25, 30.0] },
    { name: 'North terrace', r: [24.25, 5.375, 35.25, 13.0] },
    { name: 'South terrace', r: [35.25, 31.0, 45.0, 44.625] },
  ],
  walls: [
    hx(24.25, 35.625, 13.375, 0.75, EXT),        // lounge north (over the north terrace)
    hx(35.25, 84.625, 5.75, 0.75, EXT),          // north
    vz(13.0, 30.375, 24.625, 0.75, EXT),         // lounge + hall front
    hx(17.75, 24.625, 30.375, 0.75, EXT),        // lift north
    vz(30.0, 44.625, 18.125, 0.75, { ext: true, clad: 'wood', cladSkip: [38.75, 42.25] }), // lift + stair core front
    hx(17.75, 35.625, 44.25, 0.75, EXT),         // south of stair + landing
    vz(31.0, 44.625, 34.875, 0.75, EXT),         // hall + landing | south terrace
    vz(5.375, 13.375, 35.625, 0.75, EXT),        // bedroom 2 | north terrace
    vz(13.0, 26.5, 35.25, 0.5),                  // lounge | bedroom 2 + bath 2
    hx(35.25, 62.25, 31.25, 0.5, EXT),           // corridor glass over terrace + courtyard
    vz(31.0, 44.625, 62.375, 0.75, EXT),         // master bath | courtyard
    hx(62.0, 84.625, 44.25, 0.75, EXT),          // south (master)
    vz(5.375, 44.625, 84.25, 0.75, EXT),         // east
    hx(35.25, 42.0, 18.5),                       // bath 2 north
    vz(18.5, 26.5, 42.0),                        // bath 2 | bedroom 2 entry
    vz(5.375, 26.5, 52.0),                       // bedroom 2 | bedroom 3
    hx(62.0, 69.0, 18.5),                        // bath 3 north
    vz(18.5, 26.5, 62.0),                        // bedroom 3 entry | bath 3
    vz(5.375, 26.5, 69.0),                       // bedroom 3 | bedroom 4
    hx(35.25, 84.625, 26.5),                     // corridor north (bedrooms open straight off it)
    hx(77.0, 84.625, 19.0),                      // bedroom 4 | bath 4
    vz(19.0, 26.5, 77.0),                        // bedroom 4 entry | bath 4
    vz(26.5, 31.0, 72.0),                        // corridor end | store
    hx(62.0, 84.625, 31.0),                      // master suite north
    vz(31.0, 44.625, 69.0),                      // master bath | master bedroom
    vz(30.0, 36.0, 23.75, 0.75),                 // lift east
    hx(17.75, 30.25, 36.0, 0.75),                // stair north
  ],
  openings: [
    oz(24.625, 22.5, 26.0, 0, 8.5, 'slide', EXT),        // lounge → front terrace
    oz(24.625, 13.5, 22.0, 2.5, 8.5, 'window', EXT),
    ox(13.375, 29.0, 33.5, 0, 8.5, 'slide', EXT),        // lounge → north terrace
    ox(13.375, 25.5, 28.5, 2.5, 8.5, 'window', EXT),
    oz(24.625, 26.8, 29.8, 3, 8, 'window', EXT),         // hall
    oz(23.75, 31.5, 34.5, 0, 7.5, 'lift'),
    oz(34.875, 31.4, 35.6, 3, 9, 'window', EXT),         // hall → terrace view
    oz(34.875, 38.0, 41.0, 0, 8, 'glassdoor', EXT),      // landing → south terrace
    oz(18.125, 39.0, 42.0, 0, 10.5, 'window', { fins: true }), // stair slot
    ox(5.75, 40.0, 48.0, 3, 8, 'window', EXT),           // bedroom 2 north
    ox(18.5, 37.8, 40.3, 0, 7.5, 'swing'),               // bedroom 2 → bath 2
    ox(26.5, 47.0, 49.5, 0, 7.5, 'swing'),               // corridor → bedroom 2
    ox(5.75, 55.0, 64.0, 3, 8, 'window', EXT),           // bedroom 3 north
    ox(18.5, 64.0, 66.5, 0, 7.5, 'swing'),               // bedroom 3 → bath 3
    ox(26.5, 57.0, 59.5, 0, 7.5, 'swing'),               // corridor → bedroom 3
    ox(31.25, 36.0, 39.5, 3, 9, 'window', EXT),          // corridor glass
    ox(31.25, 40.0, 43.0, 0, 8, 'glassdoor', EXT),       // corridor → south terrace
    ox(31.25, 43.5, 61.5, 3, 9, 'window', EXT),
    oz(84.25, 8.0, 16.0, 3, 8, 'window', EXT),           // bedroom 4 east
    ox(19.0, 77.5, 80.0, 0, 7.5, 'swing'),               // bedroom 4 → bath 4
    ox(26.5, 69.5, 72.0, 0, 7.5, 'swing'),               // corridor → bedroom 4
    oz(84.25, 22.0, 26.0, 5.5, 8, 'window', EXT),        // bath 4, high
    oz(72.0, 27.5, 30.0, 0, 7.5, 'swing'),               // corridor → store
    ox(31.0, 69.5, 72.0, 0, 7.5, 'double'),              // corridor → master bedroom
    oz(69.0, 32.0, 34.5, 0, 7.5, 'swing'),               // master bedroom → bath
    oz(84.25, 33.0, 42.0, 2, 8.5, 'window', EXT),        // master east
    ox(44.25, 72.0, 82.0, 3, 8, 'window', EXT),          // master south
    oz(62.375, 36.0, 42.0, 5.5, 8, 'window', EXT),       // master bath west, high
    ox(44.25, 64.0, 68.0, 5.5, 8, 'window', EXT),        // master bath south, high
  ],
  rooms: [
    room('flounge', 'Upstairs lounge', [25.0, 13.75, 35.0, 26.5], 'wood'),
    room('fhall', 'Upper hall', [25.0, 26.5, 35.0, 35.625], 'wood'),
    room('fhall2', '', [24.125, 30.75, 25.0, 35.625], 'wood', { noLabel: true }),
    room('landing', 'Landing', [30.25, 36.375, 34.5, 43.875], 'wood', { noLabel: true }),
    room('flift', 'Lift', [18.5, 30.75, 23.375, 35.625], 'wood', { noLabel: true }),
    room('fstair', 'Stair', [18.5, 36.375, 30.25, 43.875], 'wood', { noFloor: true, noLabel: true }),
    room('bed2', 'Bedroom 2', [36.0, 6.125, 51.81, 18.31], 'wood'),
    room('bed2b', '', [35.5, 13.75, 36.0, 18.31], 'wood', { noLabel: true }),
    room('bath2', 'Bath 2', [35.5, 18.69, 41.81, 26.31], 'tile'),
    room('bed2e', '', [42.19, 18.31, 51.81, 26.31], 'wood', { noLabel: true }),   // bedroom 2 entry + wardrobes
    room('bed3', 'Bedroom 3', [52.19, 6.125, 68.81, 18.31], 'wood'),
    room('bed3e', '', [52.19, 18.31, 61.81, 26.31], 'wood', { noLabel: true }),   // bedroom 3 entry + wardrobes
    room('bath3', 'Bath 3', [62.19, 18.69, 68.81, 26.31], 'tile'),
    room('corridor', 'Corridor', [35.5, 26.69, 71.81, 31.0], 'wood'),
    room('bed4', 'Bedroom 4', [69.19, 6.125, 83.875, 18.81], 'wood'),
    room('bed4e', '', [69.19, 18.81, 76.81, 26.31], 'wood', { noLabel: true }),   // bedroom 4 entry + wardrobes
    room('bath4', 'Bath 4', [77.19, 19.19, 83.875, 26.31], 'tile'),
    room('store', 'Store', [72.19, 26.69, 83.875, 30.81], 'tile'),
    room('master', 'Master bedroom', [69.19, 31.19, 83.875, 43.875], 'wood'),
    room('mbath', 'Master bath', [62.75, 31.19, 68.81, 43.875], 'tile'),
    room('fterrace', 'Front terrace', [15.75, 5.375, 24.25, 30.0], 'paving', { outdoor: true }),
    room('nterrace', 'North terrace', [24.25, 5.375, 35.25, 13.0], 'paving', { outdoor: true }),
    room('sterrace', 'South terrace', [35.25, 31.5, 45.0, 44.625], 'paving', { outdoor: true }),
  ],
  furniture: [
    // upstairs lounge
    f('sofa', [25.2, 14.5, 28.2, 22.5], 'e'),
    f('coffee', [29.3, 17.2, 31.8, 21.2]),
    f('tv', [33.8, 15.0, 35.0, 22.0], 'w'),
    f('rug', [26.5, 14.2, 33.0, 22.8]),
    // bedroom 2
    f('bed', [36.0, 8.8, 43.2, 15.2], 'e'),
    f('nightstand', [36.0, 7.1, 37.4, 8.6], 'e'), f('nightstand', [36.0, 15.4, 37.4, 16.9], 'e'),
    f('desk', [49.6, 8.5, 51.8, 13.5], 'w'), f('chair', [47.9, 10.25, 49.4, 11.75], 'e'),
    f('vanity', [35.5, 19.0, 37.25, 22.0], 'e'), f('shower', [35.5, 22.8, 39.0, 26.31], 'n'),
    f('wc', [39.5, 23.6, 41.81, 25.8], 'w'),
    f('wardrobe', [42.19, 19.4, 44.0, 26.31], 'e'), f('wardrobe', [50.0, 18.6, 51.81, 23.3], 'w'),
    // bedroom 3
    f('bed', [61.6, 8.8, 68.8, 15.2], 'w'),
    f('nightstand', [67.4, 7.1, 68.8, 8.6], 'w'), f('nightstand', [67.4, 15.4, 68.8, 16.9], 'w'),
    f('desk', [52.19, 8.5, 54.4, 13.5], 'e'), f('chair', [54.6, 10.25, 56.1, 11.75], 'w'),
    f('wardrobe', [52.19, 18.6, 54.0, 26.31], 'e'), f('wardrobe', [60.0, 19.4, 61.81, 26.31], 'w'),
    f('vanity', [62.19, 19.0, 63.95, 22.0], 'e'), f('shower', [62.19, 22.8, 65.7, 26.31], 'n'),
    f('wc', [66.5, 23.6, 68.81, 25.8], 'w'),
    // bedroom 4
    f('bed', [73.3, 6.125, 79.7, 13.3], 's'),
    f('nightstand', [71.6, 6.2, 73.1, 7.6], 's'), f('nightstand', [79.9, 6.2, 81.4, 7.6], 's'),
    f('desk', [81.7, 12.5, 83.875, 17.5], 'w'),
    f('wardrobe', [75.0, 19.0, 76.81, 26.31], 'w'),
    f('vanity', [77.19, 22.8, 78.95, 26.31], 'e'), f('wc', [81.55, 23.4, 83.875, 25.6], 'w'),
    f('shower', [80.4, 19.19, 83.875, 22.69], 's'),
    // store (moved up from the ground floor)
    f('shelf', [75.4, 29.6, 83.875, 30.81], 'n'), f('shelf', [82.6, 26.69, 83.875, 29.4], 'w'),
    // master suite
    f('bed', [69.19, 35.8, 76.4, 42.2], 'e'),
    f('nightstand', [69.19, 34.6, 70.6, 35.7], 'e'), f('nightstand', [69.19, 42.4, 70.6, 43.8], 'e'),
    f('wardrobe', [73.0, 31.19, 83.6, 33.2], 's'),
    f('armchair', [80.6, 40.6, 83.4, 43.4], 'w'),
    f('vanity', [62.75, 32.0, 64.5, 37.5], 'e'), f('wc', [66.5, 36.0, 68.81, 38.2], 'w'),
    f('shower', [62.75, 40.4, 68.81, 43.875], 'n'),
    // terraces
    f('lounger', [40.0, 37.5, 42.2, 43.7], 'n'), f('lounger', [42.6, 37.5, 44.8, 43.7], 'n'),
    f('chair', [26.0, 7.0, 27.5, 8.5], 's'), f('chair', [29.0, 7.0, 30.5, 8.5], 's'),
    f('planter', [16.0, 6.0, 17.6, 18.0], 'e', { h: 1.5 }),
  ],
};

// ---------------------------------------------------------------- BASEMENT (option)
const basement = {
  footprint: [[15.75, 5.375, 84.625, 44.625]],
  walls: [
    hx(15.75, 84.625, 5.875, 1, { ext: true, rcc: true }),
    hx(15.75, 84.625, 44.125, 1, { ext: true, rcc: true }),
    vz(5.375, 44.625, 84.125, 1, { ext: true, rcc: true }),
    vz(5.375, 44.625, 16.25, 1, { ext: true, rcc: true }),
    hx(15.75, 35.25, 21.0, 0.375),                 // games / basement lounge
    vz(30.0, 36.0, 23.75, 0.75), hx(16.25, 24.125, 30.375, 0.75), // lift
    hx(16.25, 30.25, 36.0, 0.75),                  // stair north
    { r: [17.75, 30.0, 18.5, 44.625] },            // core wall continues down
    vz(5.375, 44.625, 35.25, 0.5),
    hx(35.25, 55.25, 21.0, 0.5),                   // theatre south
    hx(35.25, 55.25, 36.0, 0.375),                 // gym south
    vz(36.0, 44.625, 42.0),                        // powder / store
    vz(5.375, 44.625, 55.25, 0.5),
    hx(55.25, 84.625, 20.0, 0.375),
    vz(5.375, 20.0, 70.0),
  ],
  openings: [
    oz(16.25, 6.5, 20.0, 0, 8.5, 'slide'),           // games room → sunken court
    ox(21.0, 22.0, 32.0, 0, 8.5, 'opening'),
    oz(23.75, 31.5, 34.5, 0, 7.5, 'lift'),
    oz(35.25, 17.0, 20.0, 0, 7.5, 'double'),         // theatre
    oz(35.25, 23.0, 29.0, 0, 8.5, 'opening'),        // gym
    ox(36.0, 37.0, 39.5, 0, 7.5, 'swing'),           // powder
    ox(36.0, 46.0, 48.5, 0, 7.5, 'swing'),           // store
    oz(55.25, 26.0, 29.0, 0, 7.5, 'double'),         // spare room
    ox(20.0, 58.0, 60.5, 0, 7.5, 'swing'),           // plant room
    ox(20.0, 73.0, 75.5, 0, 7.5, 'swing'),           // storage
  ],
  rooms: [
    room('games', 'Family / games room', [16.75, 6.375, 35.0, 20.8], 'wood'),
    room('blounge', 'Basement lounge', [16.75, 21.2, 35.0, 30.0], 'wood'),
    room('bhall', 'Hall', [24.125, 30.0, 35.0, 35.625], 'tile', { noLabel: true }),
    room('bhall2', '', [30.25, 36.0, 35.0, 43.625], 'tile', { noLabel: true }),
    room('blift', '', [18.5, 30.75, 23.375, 35.625], 'tile', { noLabel: true }),
    room('bstair', '', [18.5, 36.375, 30.25, 43.625], 'tile', { noFloor: true, noLabel: true }),
    room('theatre', 'Home theatre', [35.5, 6.375, 55.0, 20.75], 'carpet'),
    room('gym', 'Gym', [35.5, 21.25, 55.0, 35.8], 'rubber'),
    room('bpowder', 'Powder + shower', [35.5, 36.2, 41.8, 43.625], 'tile'),
    room('bstore', 'Store', [42.2, 36.2, 55.0, 43.625], 'tile'),
    room('plant', 'Plant room (UPS, pumps)', [55.5, 6.375, 69.8, 19.8], 'tile'),
    room('storage', 'Storage', [70.2, 6.375, 83.625, 19.8], 'tile'),
    room('spare', 'Spare room (guests / office)', [55.5, 20.2, 83.625, 43.625], 'wood'),
  ],
  furniture: [
    f('pool', [21.5, 9.75, 30.5, 14.25], 's'),
    f('sofa', [22.0, 26.9, 30.0, 29.9], 'n'),
    f('theatre', [38.7, 9.0, 52.9, 20.5], 'n'),
    f('screen', [39.25, 6.4, 51.25, 6.6], 's'),
    f('treadmill', [38.6, 22.0, 41.4, 28.0], 'n'), f('treadmill', [42.6, 22.0, 45.4, 28.0], 'n'),
    f('bench', [48.0, 29.25, 52.0, 30.75], 's'),
    f('sofa', [65.5, 40.4, 74.5, 43.4], 'n'),
    f('bed', [76.4, 29.3, 83.6, 34.7], 'w'),
  ],
};

// Sunken garden in the front lawn (basement option only). Bye-law 12(a) keeps the plinth
// at 1′6″ when a sunken area is provided; 17(b) allows a 2.5 ft stair down in the clear space.
export const SUNKEN = { r: [3.5, 3.5, 15.75, 20.5], floor: -9.5, stair: [3.5, 3.5, 6.0, 20.5] };

// ---------------------------------------------------------------- ROOF
export const ROOF = {
  mumty: [17.75, 36.0, 35.25, 44.625],   // stair tower: 17.5 × 8.625 = 151 sq ft (≤ 300)
  mumtyClad: 'wood', mumtyCladSkip: [38.75, 42.25],
  mumtyOpenings: [
    ox(36.375, 30.75, 33.75, 0, 7.5, 'glassdoor'),
    oz(18.125, 39.0, 42.0, 0, 7.0, 'window', { fins: true }),
  ],
  tanks: [[38.5, 22.5], [43.5, 22.5]],   // two 1,000-gallon overhead tanks over bath 2 / wardrobe 2 (clear of the stair-tower door)
  // 2 ft sunshades beyond the first-floor front (allowed in clear spaces; not covered area)
  canopy: [[22.25, 13.0, 24.25, 30.375], [24.25, 11.0, 35.25, 13.0]],
  // Solar: facing due south (azimuth 180°), north edge raised, tilted 24°. 4 rows × 5 panels of
  // 585 W (2.28 × 1.13 m, portrait) = 20 panels ≈ 11.7 kW, enough for the bye-law 22(b) relief.
  // Row pitch 11.8 ft: a 7.48 ft panel at 24° rises 3.0 ft, and its shadow at the 21 Dec noon sun
  // (34.3°) reaches 4.5 ft, so 6.8 + 4.5 = 11.3 ft < 11.8 ft: no row shades the next in winter.
  solar: {
    panelW: 3.72, panelL: 7.48, tiltDeg: 24,
    rows: [{ x: 63.0, z: 6.5, n: 5 }, { x: 63.0, z: 18.3, n: 5 }, { x: 63.0, z: 30.1, n: 5 }, { x: 41.5, z: 6.5, n: 5 }],
  },
  acUnits: [[27, 15], [31, 15], [27, 19.5], [31, 19.5], [48, 21], [52, 21]],
  // UPS / solar inverter and batteries in a ventilated cabinet next to the panels (out of the house)
  ups: [55.5, 20.0, 59.5, 22.5],
};

// Front yard: gate on the south corner, two cars nose-in in front of the lift/stair core.
export const YARD = {
  // Honda Civic in Meteoroid Gray, Land Cruiser 300 in Precious White Pearl (js/cars.js)
  cars: [{ z: 35.0, model: 'civic', color: 0x4b5157 }, { z: 44.5, model: 'landcruiser', color: 0xeceae4 }],
  carNoseX: 16.9,
  drive: [0.75, 31.0, 17.75, 49.25],
  path: [8.0, 22.5, 15.75, 31.0],
  trees: [[6.5, 9.5], [6.5, 17.5]],
  treesWithBasement: [[2.2, 2.4], [1.9, 22.0]],
  lawn: [0.75, 0.375, 17.75, 21.0],
  // water pump in a small housing on the underground tank in the rear clear space (bye-law 17b
  // allows an underground water tank there; confirm the pump housing with DHA)
  pump: [85.6, 20.0, 88.6, 23.0],
};

export const HOUSE = { ground, first, basement };

export const FEATURES = {
  jaali: [{ r: [17.8, 5.75, 17.95, 21.0] }],
  steps: [{ r: [14.75, 21.5, 15.75, 29.75], y: 1.0 }],
  yardFurniture: [f('planter', [15.85, 6.0, 17.65, 20.5], 'e', { h: 1.4 })],
};

export const TELEPORTS = {
  ground: { x: 24.0, z: 25.5, y: 1.5, yaw: -Math.PI / 2 },   // foyer, looking into the lounge
  first: { x: 27.0, z: 31.0, y: 13.5, yaw: -Math.PI / 2 },
  roof: { x: 32.0, z: 25.0, y: 25.5, yaw: -Math.PI / 2 },
  basement: { x: 28.0, z: 33.0, y: -9.5, yaw: -Math.PI / 2 },
};

export const DESIGN = {
  name: 'Scheme A',
  summary: '5 bedrooms (parents downstairs, master at the back upstairs), drawing room, dining, a long family lounge opening onto a side courtyard, show + dirty kitchen, study, upstairs lounge and lift. Modern style with a jaali front.',
  HOUSE, LEVELS, STAIR, LIFT, SUNKEN, ROOF, YARD, FEATURES, TELEPORTS,
};
