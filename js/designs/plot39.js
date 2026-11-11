// Plot 39 · "Casa J-4": a Mediterranean courtyard-villa language on a compact footprint, in FEET.
// Same coordinate system as Scheme A: X east from the front (west) property line, Z south from the
// north boundary, Y above the road crown. Plot 39 is identical to 38 and sits directly north of it.
//
// Brief (owner, from the reference images):
//   - stone + stucco: honey limestone on the ground floor and the arches, warm white stucco above,
//     dark iron, timber eaves; arched windows with shutters (refs 2, 3, 4)
//   - smaller ground floor, bigger front and back: front garden 19 ft, rear loggia + pool garden
//   - double-height arched entrance hall with a lantern (ref 3); arched colonnades between rooms and
//     timber-beamed ceilings (ref 1); an arcaded loggia (ref 2) opening onto a raised plunge pool (ref 7)
//   - master suite after the owner's bedroom references: the bed against a timber divider with an
//     open walk-in wardrobe behind it, the bath along one side; kids' rooms with 2′6″ around beds
//   - back garden after the backyard references: patterned-tile patio, timber pergola with
//     bougainvillea over an outdoor dining table, an outdoor kitchen counter, string lights
//   - 5 bedrooms with fewer bathrooms: parents (en suite) downstairs; upstairs the master (en suite),
//     bedrooms 2 + 3 sharing a Jack-and-Jill bath, bedroom 4 using the common bath; plus a powder room
//
// Furniture uses footprint + facing, as in Scheme A (see tools/check-layout.mjs).

const hx = (x1, x2, z, t = 0.375, o = {}) => ({ r: [x1, z - t / 2, x2, z + t / 2], ...o });
const vz = (z1, z2, x, t = 0.375, o = {}) => ({ r: [x - t / 2, z1, x + t / 2, z2], ...o });
const EXT = { ext: true };
const STONE = { ext: true, m: 'limestone' };
const ox = (z, x1, x2, sill, head, type = 'window', o = {}) => ({ axis: 'x', at: z, a: x1, b: x2, sill, head, type, ...o });
const oz = (x, z1, z2, sill, head, type = 'window', o = {}) => ({ axis: 'z', at: x, a: z1, b: z2, sill, head, type, ...o });
const room = (id, name, r, floor, o = {}) => ({ id, name, r, floor, ...o });
const f = (t, r, face = 's', o = {}) => ({ t, r, face, ...o });
const ARCH = { arch: true };
const shut = (out) => ({ arch: true, shutters: true, out, ext: true });

export const LEVELS = {
  ground: { floor: 1.5, ceiling: 12 },
  first: { floor: 13.5, ceiling: 24 },
  roof: { floor: 25.5, parapet: 28.5, mumtyCeiling: 33, mumtyTop: 34.5, liftTop: 37 },
};

// Dog-leg stair in the south-west corner of the entrance hall, open to the double-height space.
export const STAIR = {
  x0: 25.25, xl: 29.0, x1: 37.0,
  south: [40.275, 43.875], north: [36.375, 39.975],
  flights: [['south', 1.5, 7.5], ['north', 13.5, 7.5], ['south', 13.5, 19.5], ['north', 25.5, 19.5]],
  landings: [7.5, 19.5],
};

export const LIFT = { r: [24.5, 30.5, 30.5, 36], shaftInner: [25.25, 31.25, 29.75, 35.625] };

// ---------------------------------------------------------------- GROUND FLOOR
const ground = {
  // enclosed rooms only (the compact block + the dirty kitchen)
  enclosed: [[24.5, 5.375, 66.0, 44.625], [66.0, 5.375, 72.0, 16.75], [18.5, 5.375, 24.5, 18.5]],
  // floor slab and roof also cover the loggia and the entrance porch
  floorOutline: [[24.5, 5.375, 66.0, 44.625], [66.0, 5.375, 72.0, 16.75], [66.0, 16.75, 74.0, 44.625], [18.5, 5.375, 24.5, 18.5], [19.5, 18.5, 24.5, 30.5]],
  roofOutline: [[24.5, 5.375, 66.0, 44.625], [66.0, 5.375, 72.0, 16.75], [66.0, 16.75, 74.0, 44.625], [18.5, 5.375, 24.5, 18.5], [19.5, 18.5, 24.5, 30.5]],
  courtyard: null,
  walls: [
    hx(18.5, 72.0, 5.75, 0.75, EXT),             // north (bay + main block + dirty kitchen)
    hx(24.5, 66.0, 44.25, 0.75, EXT),            // south
    vz(5.375, 18.5, 18.875, 0.75, EXT),          // west façade of the drawing-room bay
    hx(18.5, 25.25, 18.125, 0.75, EXT),          // bay, south return (beside the porch)
    vz(18.5, 44.625, 24.875, 0.75, EXT),         // west façade
    vz(5.375, 44.625, 65.625, 0.75, EXT),        // east wall, onto the loggia
    vz(5.375, 16.75, 71.625, 0.75, EXT),         // dirty kitchen east
    hx(65.25, 72.0, 16.375, 0.75, EXT),          // dirty kitchen south (faces the loggia)
    vz(16.75, 44.625, 73.5, 1.0, STONE),         // loggia arcade (stone piers, round arches)
    hx(65.625, 74.0, 44.125, 1.0, STONE),        // loggia south end
    vz(19.0, 30.5, 20.0, 1.0, STONE),            // porch arcade
    hx(19.5, 24.5, 30.0, 1.0, STONE),
    hx(25.25, 38.5, 18.5, 0.5),                  // drawing | hall
    vz(5.375, 18.5, 38.5, 0.5),                  // drawing | dining
    vz(5.375, 18.5, 53.0, 0.5),                  // dining | kitchen
    hx(38.5, 53.0, 18.5),                        // dining | lounge (arched colonnade)
    vz(18.5, 31.0, 40.0, 0.5),                   // hall | lounge (arches)
    hx(24.5, 30.875, 30.875, 0.75),              // lift north
    vz(30.5, 36.0, 30.125, 0.75),                // lift east
    hx(30.5, 36.5, 30.6875),                     // powder north
    vz(30.5, 36.0, 36.5),                        // powder east
    hx(24.5, 37.0, 36.0, 0.75),                  // stair north
    hx(40.0, 65.25, 31.0),                       // lounge | parents' suite
    vz(31.0, 44.625, 40.0, 0.5),                 // stair foot | dressing + bath
    vz(31.0, 44.625, 50.0),                      // dressing + bath | bedroom
    hx(40.0, 50.0, 36.5),                        // dressing | bath
  ],
  openings: [
    oz(24.875, 22.75, 27.25, 0, 8.5, 'double', { arch: true, ext: true, leaf: 'oak' }), // main door + fanlight
    oz(20.0, 22.0, 27.5, 0, 7.5, 'arcade', ARCH),                 // porch arch
    oz(18.875, 7.0, 10.5, 1.5, 8.5, 'window', shut('w')),          // drawing bay, west
    oz(18.875, 13.0, 16.5, 1.5, 8.5, 'window', shut('w')),
    ox(5.75, 21.0, 24.0, 2.5, 8.0, 'window', shut('n')),           // drawing, north
    ox(5.75, 30.0, 33.5, 2.5, 8.0, 'window', shut('n')),
    ox(18.5, 35.25, 38.0, 0, 7.5, 'opening', ARCH),                // hall → drawing
    oz(38.5, 8.75, 14.25, 0, 7.5, 'opening', ARCH),                // drawing → dining
    ox(18.5, 39.0, 45.25, 0, 8.25, 'opening', ARCH),               // dining ↔ lounge arcade
    ox(18.5, 46.25, 52.5, 0, 8.25, 'opening', ARCH),
    oz(40.0, 19.0, 24.5, 0, 8.25, 'opening', ARCH),                // hall ↔ lounge
    oz(40.0, 25.5, 30.75, 0, 8.25, 'opening', ARCH),
    ox(30.875, 26.0, 29.0, 0, 7.5, 'lift'),
    ox(30.6875, 33.5, 36.0, 0, 7.0, 'swing'),                      // powder
    oz(65.625, 9.5, 12.0, 0, 7.5, 'swing'),                        // kitchen → dirty kitchen
    ox(5.75, 66.75, 69.25, 0, 7.5, 'swing', EXT),                  // dirty kitchen service door
    oz(65.625, 19.5, 24.5, 0, 7.5, 'glassdoor', { arch: true, ext: true }), // lounge → loggia
    oz(65.625, 25.5, 30.5, 0, 7.5, 'glassdoor', { arch: true, ext: true }),
    oz(65.625, 34.0, 39.0, 0, 7.5, 'glassdoor', { arch: true, ext: true }), // parents → loggia
    ox(31.0, 50.5, 53.25, 0, 7.5, 'swing'),                        // lounge → parents' bedroom
    oz(50.0, 32.0, 34.5, 0, 7.5, 'opening'),                       // bedroom → dressing
    ox(36.5, 45.0, 47.5, 0, 7.5, 'swing'),                         // dressing → bath
    oz(24.875, 39.0, 41.5, 3.0, 8.75, 'window', { arch: true, ext: true }), // stair, tall arched slot
    ox(5.75, 42.0, 45.0, 2.5, 7.5, 'window', shut('n')),           // dining, north
    ox(5.75, 48.0, 51.0, 2.5, 7.5, 'window', shut('n')),
    ox(5.75, 56.0, 63.0, 3.5, 7.5, 'window', EXT),                 // kitchen, over the counter
    ox(44.25, 51.0, 53.25, 2.5, 8.0, 'window', shut('s')),         // parents' bedroom, south: windows either side of the bed head
    ox(44.25, 62.75, 65.0, 2.5, 8.0, 'window', shut('s')),
    ox(44.25, 42.0, 46.0, 5.5, 7.5, 'window', EXT),                // parents' bath, high
    oz(73.5, 18.25, 23.25, 0, 7.5, 'arcade', ARCH),                // loggia arcade
    oz(73.5, 24.75, 29.75, 0, 7.5, 'arcade', ARCH),
    oz(73.5, 31.25, 36.25, 0, 7.5, 'arcade', ARCH),
    oz(73.5, 37.75, 42.75, 0, 7.5, 'arcade', ARCH),
    ox(44.125, 67.0, 72.0, 0, 7.5, 'arcade', ARCH),
  ],
  rooms: [
    room('drawing', 'Drawing room', [19.25, 6.125, 38.25, 18.25], 'limestone', { beams: true }),
    room('hall', 'Entry hall · double height', [25.25, 18.75, 39.75, 30.5], 'limestone'),
    room('hall2', '', [36.69, 30.875, 39.75, 36.0], 'limestone', { noLabel: true }),
    room('stairfoot', '', [37.0, 36.375, 39.75, 43.875], 'limestone', { noLabel: true }),
    room('lift', '', [25.25, 31.25, 29.75, 35.625], 'limestone', { noLabel: true }),
    room('powder', 'Powder', [30.875, 30.875, 36.31, 35.625], 'tile'),
    room('stair', 'Stair', [25.25, 36.375, 37.0, 43.875], 'limestone', { noFloor: true }),
    room('dining', 'Dining', [38.75, 6.125, 52.75, 18.31], 'terracotta', { beams: true }),
    room('kitchen', 'Kitchen', [53.25, 6.125, 65.25, 18.5], 'terracotta'),
    room('dirty', 'Dirty kitchen + laundry', [66.0, 6.125, 71.25, 16.0], 'tile'),
    room('lounge', 'Family lounge', [40.25, 18.69, 65.25, 30.81], 'terracotta', { beams: true }),
    room('parents', "Parents' bedroom", [50.19, 31.19, 65.25, 43.875], 'parquet', { beams: true }),
    room('pdress', 'Dressing', [40.25, 31.19, 49.81, 36.31], 'parquet'),
    room('pbath', "Parents' bath", [40.25, 36.69, 49.81, 43.875], 'tile'),
    room('loggia', 'Loggia', [66.0, 16.75, 73.0, 43.625], 'terracotta', { outdoor: true, beams: true }),
    room('porch', 'Porch', [20.5, 20.0, 24.5, 29.5], 'limestone', { outdoor: true }),
  ],
  furniture: [
    // drawing room, 19 ft long: a sofa group, and a pair of lounge chairs in the bay windows
    f('sofa', [26.0, 6.2, 35.0, 9.25], 's', { model: 'SheenWoodLeatherSofa' }),
    f('armchair', [26.4, 14.2, 29.1, 17.45], 'n', { model: 'modern_arm_chair_01' }),
    f('armchair', [31.9, 14.2, 34.6, 17.45], 'n', { model: 'modern_arm_chair_01' }),
    f('coffee', [28.5, 10.7, 32.5, 12.7], 's', { model: 'modern_coffee_table_01' }), f('rug', [25.5, 9.4, 35.5, 17.7]),
    f('armchair', [19.4, 6.7, 23.3, 10.05], 'e', { model: 'mid_century_lounge_chair' }),
    f('armchair', [19.4, 13.9, 23.3, 17.25], 'e', { model: 'mid_century_lounge_chair' }),
    f('nightstand', [20.4, 11.0, 22.2, 12.5], 'e'),
    f('pot', [36.6, 6.3, 38.1, 7.8]),
    // entry hall: round table under the lantern, a pot by the door
    f('console', [31.0, 22.5, 34.0, 25.5], 's', { model: false }), f('pot', [25.4, 19.0, 26.8, 20.4]),
    // powder
    f('wc', [31.0, 33.3, 33.2, 35.6], 'n'), f('vanity', [30.875, 31.0, 32.625, 33.2], 'e'),
    // dining: 8 seats
    f('dining', [41.8, 8.1, 51.2, 15.3], 's'),
    // kitchen
    f('fridge', [53.4, 6.2, 56.4, 8.7], 's'), f('counter', [56.4, 6.125, 65.25, 8.125], 's'),
    f('island', [55.5, 12.0, 62.5, 15.0], 's'), f('stools', [56.0, 15.1, 62.0, 16.6], 'n'),
    // dirty kitchen + laundry
    f('counter', [69.25, 6.125, 71.25, 16.0], 'w'), f('washer', [66.1, 13.7, 68.5, 15.95], 'n'),
    // family lounge: TV group by the kitchen, reading chairs by the hall arches
    f('sofa', [54.4, 19.2, 61.6, 22.55], 's'), f('coffee', [55.85, 23.6, 60.15, 27.9], 's'),
    f('tv', [54.0, 29.1, 62.0, 30.81], 'n'), f('rug', [53.0, 22.0, 63.0, 29.0]),
    f('armchair', [43.6, 24.4, 46.5, 27.5], 'e'), f('armchair', [48.6, 24.4, 51.5, 27.5], 'w'),
    f('nightstand', [46.9, 25.2, 48.4, 26.7], 's', { lamp: false }),
    // parents' suite
    f('bed', [54.8, 36.675, 61.2, 43.875], 'n'),   // head on the south wall, not on the lounge TV wall
    f('nightstand', [53.2, 42.4, 54.6, 43.8], 'n'), f('nightstand', [61.4, 42.4, 62.8, 43.8], 'n'),
    f('console', [56.0, 31.19, 62.0, 32.69], 's'),
    f('wardrobe', [40.25, 31.19, 46.5, 33.19], 's'),
    f('vanity', [40.25, 37.0, 42.0, 40.0], 'e'), f('shower', [42.5, 40.2, 46.0, 43.875], 'n'),
    f('wc', [47.0, 41.575, 49.2, 43.875], 'n'),
    // loggia
    f('sofa', [70.0, 30.5, 73.0, 37.5], 'w', { model: false }),
    f('armchair', [69.75, 25.5, 73.0, 28.2], 'w', { model: 'modern_arm_chair_01' }),
    f('armchair', [69.75, 39.5, 73.0, 42.2], 'w', { model: 'modern_arm_chair_01' }),
    f('pot', [66.2, 17.0, 67.6, 18.4]), f('pot', [71.4, 17.0, 72.8, 18.4]),
    // porch
    f('pot', [20.7, 20.2, 22.1, 21.6]), f('pot', [20.7, 27.9, 22.1, 29.3]),
  ],
};

// ---------------------------------------------------------------- FIRST FLOOR
// Rev 3, after a design review (docs/plot39-review.md). The rules it follows:
//   - suites run room → wardrobe → bath: you never walk through a wardrobe or a bath to reach a bed
//   - every first-floor bath stands over a ground-floor bath or the laundry, never over a living
//     room, the dining table or a bed (short drains, no leaks over the rooms below)
//   - WCs sit on a north–south line, never facing or backing the Qibla (west); beds' feet point
//     away from it; bed heads go on solid walls, not windows, WCs or a TV wall
//   - the upstairs lounge is the hub: every bedroom opens off it, so there is no long corridor
const first = {
  footprint: [[24.5, 5.375, 66.0, 44.625], [66.0, 22.5, 74.0, 44.625], [18.5, 5.375, 24.5, 18.5], [66.0, 5.375, 72.0, 16.75]],
  // double-height entrance hall (no floor here; not covered area)
  voids: [[24.5, 18.5, 30.0, 30.5], [30.0, 22.5, 36.0, 30.5]],
  walls: [
    hx(18.5, 72.0, 5.75, 0.75, EXT),             // north (bay, main block, bedroom 3's bath over the laundry)
    vz(5.375, 18.5, 18.875, 0.75, EXT),          // west, bedroom 4 bay
    hx(18.5, 25.25, 18.125, 0.75, EXT),          // bay, south return
    vz(18.5, 44.625, 24.875, 0.75, EXT),         // west
    hx(24.5, 74.0, 44.25, 0.75, EXT),            // south
    vz(5.375, 16.75, 71.625, 0.75, EXT),         // bedroom 3 bath, east
    hx(65.375, 72.0, 16.375, 0.75, EXT),         // bedroom 3 bath, south (onto the lounge balcony)
    vz(5.375, 16.75, 65.625, 0.5),               // bedroom 3 | its bath
    vz(16.75, 22.875, 65.625, 0.75, EXT),        // lounge | balcony
    vz(22.875, 31.0, 65.625, 0.5),               // lounge | master sitting room
    vz(22.5, 44.625, 73.625, 0.75, EXT),         // master suite east (over the loggia arcade)
    hx(65.25, 74.0, 22.875, 0.75, EXT),          // master sitting room north (faces the balcony)
    hx(25.25, 66.0, 18.5),                       // bedrooms | bridge + lounge
    vz(5.375, 18.5, 34.0),                       // bedroom 4 | bedroom 2
    vz(5.375, 18.5, 48.0),                       // bedroom 2 | store
    vz(5.375, 18.5, 53.0),                       // store | bedroom 3
    hx(40.0, 73.25, 31.0),                       // lounge + sitting | baths, wardrobe, master bedroom
    vz(31.0, 44.625, 40.0),                      // stair landing | baths
    hx(40.0, 50.0, 36.5),                        // common bath | master bath
    vz(31.0, 44.625, 50.0),                      // baths | walk-in wardrobe
    vz(31.0, 44.625, 58.0),                      // walk-in wardrobe | master bedroom
    hx(24.5, 30.875, 30.875, 0.75),              // lift north
    vz(30.5, 36.0, 30.125, 0.75),                // lift east
    hx(24.5, 37.0, 36.0, 0.75),                  // stair north
  ],
  openings: [
    oz(30.125, 31.5, 34.5, 0, 7.5, 'lift'),                        // lift door onto the landing
    oz(18.875, 7.5, 10.5, 0, 7.5, 'glassdoor', shut('w')),         // bedroom 4 → front balcony
    oz(18.875, 13.5, 16.5, 0, 7.5, 'glassdoor', shut('w')),
    ox(18.5, 30.75, 33.25, 0, 7.5, 'swing'),                       // bridge → bedroom 4
    ox(18.5, 44.5, 47.0, 0, 7.5, 'swing'),                         // lounge → bedroom 2
    ox(5.75, 38.0, 41.0, 2.5, 7.5, 'window', shut('n')),           // bedroom 2 north
    ox(18.5, 49.25, 51.75, 0, 7.5, 'swing'),                       // lounge → store
    ox(5.75, 49.5, 51.5, 5.0, 7.5, 'window', EXT),                 // store, high
    ox(18.5, 57.5, 60.0, 0, 7.5, 'swing'),                         // lounge → bedroom 3
    ox(5.75, 56.5, 59.5, 2.5, 7.5, 'window', shut('n')),           // bedroom 3 north
    oz(65.625, 11.0, 13.5, 0, 7.5, 'swing'),                       // bedroom 3 → its bath (between wardrobes)
    ox(5.75, 67.5, 70.0, 5.0, 7.5, 'window', EXT),                 // bedroom 3 bath, high
    oz(71.625, 8.0, 10.5, 5.0, 7.5, 'window', EXT),
    oz(65.625, 19.0, 21.75, 0, 8.0, 'glassdoor', { arch: true, ext: true }), // lounge → balcony
    ox(31.0, 44.5, 47.0, 0, 7.5, 'swing'),                         // lounge → common bath
    oz(65.625, 27.0, 29.5, 0, 7.5, 'swing'),                       // lounge → master suite (sitting room)
    ox(22.875, 69.0, 72.0, 2.5, 7.5, 'window', shut('n')),         // sitting room, over the balcony
    oz(73.625, 25.0, 28.0, 2.5, 7.5, 'window', shut('e')),         // sitting room, over the garden
    ox(31.0, 66.75, 72.75, 0, 8.0, 'opening', ARCH),               // sitting room → master bedroom
    oz(58.0, 41.0, 43.5, 0, 7.5, 'opening'),                       // master bedroom → walk-in wardrobe
    oz(50.0, 40.5, 43.0, 0, 7.5, 'swing'),                         // walk-in wardrobe → master bath
    oz(24.875, 22.75, 27.25, 0.5, 7.0, 'window', { arch: true, ext: true }), // tall arched window over the door
    oz(24.875, 39.0, 41.5, 1.0, 8.0, 'window', { arch: true, ext: true }),   // stair slot
    ox(44.25, 43.5, 46.5, 5.5, 7.5, 'window', EXT),                // master bath, high
    ox(44.25, 52.5, 55.5, 5.5, 7.5, 'window', EXT),                // walk-in wardrobe, high
    ox(44.25, 61.0, 64.0, 2.5, 7.5, 'window', shut('s')),          // master bedroom, south
    ox(44.25, 66.5, 70.0, 2.5, 7.5, 'window', shut('s')),
    oz(73.625, 38.5, 41.5, 0, 7.5, 'glassdoor', shut('e')),        // master → balcony over the garden
    oz(73.625, 32.5, 35.0, 2.5, 7.5, 'window', shut('e')),
  ],
  rooms: [
    room('bed4', 'Bedroom 4', [19.25, 6.125, 33.81, 18.31], 'parquet'),
    room('bed2', 'Bedroom 2', [34.19, 6.125, 47.81, 18.31], 'parquet'),
    room('store', 'Store', [48.19, 6.125, 52.81, 18.31], 'tile'),
    room('bed3', 'Bedroom 3', [53.19, 6.125, 65.25, 18.31], 'parquet'),
    room('bath3', 'Bath 3', [66.0, 6.125, 71.25, 16.0], 'tile'),
    room('fgallery', 'Bridge', [30.0, 18.69, 40.0, 22.31], 'parquet'),
    room('fgallery2', '', [36.0, 22.31, 40.0, 30.5], 'parquet', { noLabel: true }),
    room('flounge', 'Upstairs lounge', [40.0, 18.69, 65.375, 30.81], 'parquet', { fan: true }),
    room('landing', '', [30.875, 30.875, 39.81, 35.625], 'parquet', { noLabel: true }),
    room('landing2', '', [37.0, 36.375, 39.81, 43.875], 'parquet', { noLabel: true }),
    room('flift', '', [25.25, 31.25, 29.75, 35.625], 'parquet', { noLabel: true }),
    room('fstair', '', [25.25, 36.375, 37.0, 43.875], 'parquet', { noFloor: true, noLabel: true }),
    room('cbath', 'Bath', [40.19, 31.19, 49.81, 36.31], 'tile'),
    room('mbath', 'Master bath', [40.19, 36.69, 49.81, 43.875], 'tile'),
    room('mdress', 'Walk-in wardrobe', [50.19, 31.19, 57.81, 43.875], 'parquet'),
    room('master', 'Master bedroom', [58.19, 31.19, 73.25, 43.875], 'parquet'),
    room('msit', 'Sitting', [65.875, 23.25, 73.25, 30.81], 'parquet', { fan: false }),
    room('terrace', 'Balcony', [66.0, 16.75, 74.0, 22.5], 'terracotta', { outdoor: true }),
  ],
  furniture: [
    // bedroom 4 (front bay, 14′6″ × 12′, balcony over the front garden): bed head on the north wall
    f('bed', [24.0, 6.125, 30.4, 13.325], 's'),
    f('nightstand', [22.4, 6.2, 23.8, 7.6], 's'), f('nightstand', [30.6, 6.2, 32.0, 7.6], 's'),
    f('wardrobe', [22.6, 15.85, 28.6, 17.75], 'n'),
    f('desk', [32.0, 8.5, 33.81, 12.5], 'w'), f('chair', [30.4, 9.75, 31.9, 11.25], 'e'),
    // bedroom 2 (13′8″ × 12′): bed head on the party wall, feet east
    f('bed', [34.19, 8.9, 41.4, 15.3], 'e'),
    f('nightstand', [34.19, 7.2, 35.6, 8.7], 'e'), f('nightstand', [34.19, 15.5, 35.6, 17.0], 'e'),
    f('wardrobe', [45.81, 6.3, 47.81, 13.5], 'w'),
    // store, off the lounge
    f('shelf', [48.19, 6.125, 52.81, 7.325], 's'), f('shelf', [51.6, 7.6, 52.81, 15.0], 'w'),
    // bedroom 3 (12′2″ × 12′): wardrobes either side of the door to its own bath
    f('bed', [53.19, 8.9, 60.4, 15.3], 'e'),
    f('nightstand', [53.19, 7.2, 54.6, 8.7], 'e'), f('nightstand', [53.19, 15.5, 54.6, 17.0], 'e'),
    f('wardrobe', [63.25, 6.3, 65.25, 10.75], 'w'), f('wardrobe', [63.25, 13.75, 65.25, 15.95], 'w'),
    // bedroom 3 bath, over the laundry
    f('shower', [66.0, 6.125, 71.25, 9.5], 's'),
    f('vanity', [66.0, 14.0, 68.5, 16.0], 'n'), f('wc', [68.9, 13.7, 71.25, 16.0], 'n'),
    // upstairs lounge: TV on the south wall, sofa facing it, reading chairs by the bridge
    f('tv', [51.0, 29.1, 59.0, 30.81], 'n'), f('rug', [50.5, 21.6, 59.5, 28.6]),
    f('sofa', [51.4, 21.9, 58.6, 25.25], 's'), f('coffee', [53.0, 25.8, 57.0, 27.8], 's', { model: 'modern_coffee_table_01' }),
    f('armchair', [41.2, 22.6, 43.9, 25.4], 'e'), f('armchair', [41.2, 26.0, 43.9, 28.8], 'e'),
    f('pot', [40.4, 29.2, 41.9, 30.7]),
    // common bath (bedrooms 2 and 4, guests), over the parents' dressing room
    f('shower', [40.19, 31.19, 43.4, 36.31], 'e'),
    f('vanity', [43.6, 34.56, 46.8, 36.31], 'n'), f('wc', [47.4, 33.91, 49.75, 36.31], 'n'),
    // master bath, directly over the parents' bath
    f('vanity', [41.5, 36.69, 46.5, 38.44], 's'),
    f('wc', [40.19, 41.475, 42.49, 43.875], 'n'), f('shower', [43.0, 40.4, 46.6, 43.875], 'n'),
    // walk-in wardrobe between the bedroom and the bath (his + hers)
    f('wardrobe', [50.19, 31.19, 57.81, 33.19], 's'),
    f('wardrobe', [50.19, 33.5, 52.19, 40.0], 'e'), f('wardrobe', [55.81, 33.5, 57.81, 40.0], 'w'),
    f('bench', [53.2, 35.0, 54.8, 38.5], 'e'),
    // master bedroom: bed head on the wardrobe wall, facing the garden balcony
    f('bed', [58.19, 32.9, 65.4, 39.3], 'e'),
    f('nightstand', [58.19, 31.3, 59.6, 32.7], 'e'), f('nightstand', [58.19, 39.5, 59.6, 40.9], 'e'),
    f('bench', [65.6, 34.4, 67.0, 38.4], 'e'),
    // master sitting room
    f('armchair', [69.35, 23.4, 73.25, 26.71], 'w', { model: 'mid_century_lounge_chair' }),
    f('armchair', [66.2, 23.4, 68.1, 26.1], 'e'),
    // lounge balcony
    f('chair', [70.4, 17.2, 71.85, 19.1], 'w', { model: 'painted_wooden_chair_01' }),
    f('chair', [70.4, 20.0, 71.85, 21.9], 'w', { model: 'painted_wooden_chair_01' }),
    f('pot', [72.3, 20.6, 73.7, 22.0]),
  ],
};

export const HOUSE = { ground, first, basement: null };
export const SUNKEN = null;

// ---------------------------------------------------------------- ROOF
export const ROOF = {
  mumty: [24.5, 36.0, 40.0, 44.625],              // stair tower: 15.5 × 8.625 = 134 sq ft (≤ 300)
  mumtyOpenings: [
    ox(36.375, 37.25, 39.75, 0, 7.5, 'glassdoor'),
    oz(24.875, 39.0, 41.5, 1.0, 6.5, 'window', ARCH),
  ],
  tanks: [[68.9, 8.4], [68.9, 13.7]],             // on the walls of bedroom 3's bath, over the laundry
  skylights: [[43.0, 22.0, 50.0, 27.5]],          // daylight into the upstairs lounge, which has no outside wall
  // 2 ft timber-lined eaves (sunshades, allowed into the clear spaces; not covered area)
  canopy: [[16.5, 3.375, 74.0, 5.375], [72.0, 5.375, 74.0, 16.75], [16.5, 5.375, 18.5, 20.5], [18.5, 18.5, 22.5, 20.5], [22.5, 20.5, 24.5, 44.625], [22.5, 44.625, 76.0, 46.625], [74.0, 22.5, 76.0, 44.625]],
  solar: {
    panelW: 3.72, panelL: 7.48, tiltDeg: 24,
    rows: [{ x: 41.5, z: 6.5, n: 6 }, { x: 19.0, z: 6.5, n: 6 }, { x: 53.5, z: 18.3, n: 3 }, { x: 41.0, z: 30.3, n: 8 }],
  },
  acUnits: [[28, 14], [32, 14], [28, 18], [32, 18], [45, 20], [49, 20]],
  ups: [56.0, 26.0, 60.0, 28.5],
};

// Front yard: gate on the south corner, two cars nose-in in front of the stair; lawn with two trees.
export const YARD = {
  // Honda Civic in Meteoroid Gray, Land Cruiser 300 in Precious White Pearl (js/cars.js)
  cars: [{ z: 35.0, model: 'civic', color: 0x4b5157 }, { z: 44.5, model: 'landcruiser', color: 0xeceae4 }],
  carNoseX: 21.0,
  drive: [0.75, 31.0, 24.5, 49.25],
  path: [10.0, 22.0, 18.5, 27.5],
  trees: [[6.5, 5.5], [6.5, 15.0]],
  lawn: [0.75, 0.375, 18.5, 21.5],
  // pool filtration plant + pump in a small housing inside the buildable area (bye-law 24c)
  pump: [82.5, 2.5, 84.5, 6.5],
};

// Rear garden (inside the buildable area from X 74, plus the 5′4½″ rear clear space).
export const GARDEN = {
  lawn: [[74.0, 0.375, 89.625, 49.625]],
  deck: [[74.5, 8.5, 84.5, 28.5]],
  pool: { r: [76.0, 11.0, 83.0, 26.0], h: 2.0, radius: 2.8 },  // raised plunge pool, 7′ × 15′
  // patio in patterned encaustic tiles (backyard ref 5)
  tiles: [[74.5, 29.0, 89.0, 49.4]],
  // timber pergola with bougainvillea over the outdoor dining table (backyard ref 4). Inside the
  // buildable area, 25% of a pergola's area counts as covered area (bye-law 15a(13)).
  pergola: { r: [75.0, 32.5, 84.5, 45.5], h: 9.5 },
  trees: [[87.2, 4.0, 6.5, 1.8], [87.4, 41.5, 6.5, 1.8]],
  beds: [[85.0, 29.5, 88.6, 36.5], [74.6, 1.6, 81.5, 7.8]],
  // planted privacy screen for the pool (bye-law 24b asks for 10 ft)
  screens: [{ r: [88.4, 1.0, 89.4, 28.5], h: 10, m: 'leaf' }, { r: [75.0, 0.5, 88.4, 1.5], h: 10, m: 'leaf' }],
  // string lights across the patio (backyard ref 5)
  lights: [[[74.2, 11.0, 31.0], [88.6, 9.0, 33.0]], [[74.2, 11.0, 46.5], [88.6, 9.0, 44.0]], [[88.6, 9.0, 33.0], [88.6, 9.0, 44.0]]],
  furniture: [
    f('lounger', [77.0, 26.4, 83.2, 28.4], 'w', { y: 0.85 }), f('lounger', [77.0, 8.6, 83.2, 10.6], 'w', { y: 0.85 }),
    f('table6', [76.5, 35.6, 83.5, 42.2], 's', { y: 0.65 }),
    // outdoor kitchen along the south boundary wall: a BBQ counter may stand in a clear space if
    // it takes at most half its width (bye-law 17(i)): 2′4″ of the 5′4½″ side space
    f('counter', [76.0, 47.25, 84.0, 49.55], 'n', { y: 0.65 }),
    f('pot', [85.0, 46.8, 86.6, 48.4], 's', { y: 0.65 }), f('pot', [74.7, 29.3, 76.1, 30.7], 's', { y: 0.65 }),
  ],
};

export const FEATURES = {
  steps: [{ r: [18.5, 22.0, 19.5, 27.5], y: 1.0, m: 'limestone' }, { r: [74.0, 16.75, 75.0, 44.625], y: 1.0, m: 'limestone' }],
  balconies: [
    { r: [16.5, 6.5, 18.5, 17.5], open: ['w', 'n', 's'] },  // bedroom 4, over the front garden (road side)
    { r: [74.0, 36.0, 77.0, 43.5], open: ['e', 'n', 's'] }, // master, over the garden
  ],
  vines: [
    { r: [74.05, 16.75, 74.15, 44.6], y0: 6, y1: 11.5, sparse: 9 },   // draping over the arcade, arches left clear
    { r: [19.4, 19.0, 19.5, 21.5], y0: 1, y1: 10 },
  ],
  lanterns: [
    { x: 30.0, z: 25.0, y: 16.5, size: 2.2, hang: 24.0, light: 3 },  // hall lantern (ref 3)
    { x: 22.5, z: 24.75, y: 9.6, size: 1.1, hang: 12.0 },            // porch
    { x: 69.5, z: 24.5, y: 9.6, size: 1.0, hang: 12.0 },             // loggia
    { x: 69.5, z: 35.0, y: 9.6, size: 1.0, hang: 12.0 },
    { x: 74.25, z: 30.5, y: 8.0, size: 0.8 },                         // wall lanterns on the arcade
    { x: 74.25, z: 37.0, y: 8.0, size: 0.8 },
  ],
};

export const STYLE = {
  ext: { ground: 'limestone', first: 'stucco', roof: 'stucco' },
  int: 'stuccoInt',
  railing: 'iron',
  slabSide: { ground: 'limestone', first: 'limestone', roof: 'stucco' },
  soffit: 'oak',
  coping: 'limestone',
  eave: 1.0,
};

export const TELEPORTS = {
  ground: { x: 27.5, z: 24.75, y: 1.5, yaw: -Math.PI / 2 },   // inside the door, looking into the hall
  first: { x: 38.0, z: 26.5, y: 13.5, yaw: Math.PI / 2 },     // on the gallery, looking over the hall
  roof: { x: 38.5, z: 33.0, y: 25.5, yaw: 0 },
};

export const DESIGN = {
  name: 'Casa J-4',
  summary: 'Mediterranean stone-and-stucco villa: double-height arched entrance hall, a 19 ft drawing room in a front bay, an open arcade joining dining and family lounge, timber beams, a loggia onto a raised plunge pool, iron balconies. 5 bedrooms, 4 baths + powder. Front lawn and a pool garden at the back.',
  HOUSE, LEVELS, STAIR, LIFT, SUNKEN, ROOF, YARD, GARDEN, FEATURES, STYLE, TELEPORTS,
};
