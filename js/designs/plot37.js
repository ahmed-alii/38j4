// Plot 37 · "Haveli J-4": a traditional South Punjab house on a compact footprint, in FEET.
// Same coordinate system as the other plots: X east from the front (west) property line, Z south
// from the north boundary, Y above the road crown. Plot 37 is identical to 38 and sits directly south of it.
//
// Brief (owner): smaller house, more open space (front lawn at the 15′9″ minimum, a deep back
// garden), ground + first floor + an optional basement, arched verandas front and back (not all
// round), exposed brick with Multani blue tile, jaalis, jharokas and roshandans, passive cooling, a
// green belt of trees, a covered porch for two cars, one big closed kitchen with pantry and laundry,
// drawing room opening onto the dining room, a family lounge, a study, a staff room with its own bath,
// no pool. Three bedrooms with full baths (fewer, better bedrooms), master at the back.
//
// Planning rules carried over from the Casa J-4 review (docs/plot39-review.md):
//   - room → wardrobe → bath; never enter a bedroom through its wardrobe or bath
//   - every first-floor bath stands over a ground-floor wet room (staff bath, laundry) or over the
//     rear veranda, never over a living room, the dining table, a bed or the kitchen
//   - WCs on a north–south line (the Qibla is west); beds' feet away from the west
//   - kitchen closed, north-east (no west sun), next to the dining room through the hall
//
// Passive cooling (Gujranwala summers reach 45 °C):
//   - 13½″ cavity brick outer walls; ground floor ceilings 11′6″ with roshandans (high vents)
//   - the stair is a thermal chimney: its brick wind tower (badgir) on the roof has open jaali arches
//     at the top, so hot air rises out of the house and draws cooler air in from the north side
//   - the west (road) face is shaded by the front veranda, jharokas and jaalis; little west glass
//   - deep rear veranda on the east; 2 ft chhajjas on the south and west; light terracotta roof tiles
//   - a green belt: trees along the south and rear boundaries, hedges, climbers on the walls
//   - the tehkhana (basement) stays near earth temperature (~24 °C) for summer afternoons

const hx = (x1, x2, z, t = 0.375, o = {}) => ({ r: [x1, z - t / 2, x2, z + t / 2], ...o });
const vz = (z1, z2, x, t = 0.375, o = {}) => ({ r: [x - t / 2, z1, x + t / 2, z2], ...o });
const EXT = { ext: true };
const BRICK = { ext: true, m: 'brick' };
const RCC = { ext: true, rcc: true };
const ox = (z, x1, x2, sill, head, type = 'window', o = {}) => ({ axis: 'x', at: z, a: x1, b: x2, sill, head, type, ...o });
const oz = (x, z1, z2, sill, head, type = 'window', o = {}) => ({ axis: 'z', at: x, a: z1, b: z2, sill, head, type, ...o });
const room = (id, name, r, floor, o = {}) => ({ id, name, r, floor, ...o });
const f = (t, r, face = 's', o = {}) => ({ t, r, face, ...o });
const ARCH = { arch: true };
const shut = (out) => ({ arch: true, shutters: true, out, ext: true });
const T = 1.125; // 13½″ cavity outer wall

export const LEVELS = {
  basement: { floor: -8.0, ceiling: 2.0 },          // 10 ft basement (bye-law 12)
  ground: { floor: 3.5, ceiling: 15.0 },            // 3′6″ plinth with a basement (14a); 11′6″ rooms
  first: { floor: 16.5, ceiling: 27.0 },
  roof: { floor: 28.5, parapet: 31.5, mumtyCeiling: 33.5, mumtyTop: 35.0, liftTop: 35.0 },
};

// Dog-leg stair at the front-north corner, running front to back (axis z): landing at the north
// end under a tall arched window, both flights ending at the hall (z 20). It doubles as the thermal
// chimney under the wind tower.
export const STAIR = {
  axis: 'z',
  x0: 6.5, xl: 10.25, x1: 20.0,                     // along z: landing 6.5–10.25, flights 10.25–20
  north: [21.125, 25.0], south: [25.5, 29.375],     // the two flights, across x
  flights: [['north', 3.5, 10.0], ['south', 16.5, 10.0]],
  landings: [10.0],
  basementFlights: [['south', 3.5, -2.25], ['north', -8.0, -2.25]],
  basementLanding: -2.25,
};

export const LIFT = null;

// ---------------------------------------------------------------- GROUND FLOOR
// North part (z 5.375–25.75) fronts the car porch at x 20; south part (z 25.75–44.625) sits behind
// the front veranda at x 23.75. Rear wall at x 60, rear veranda to x 67, garden beyond.
const ground = {
  enclosed: [[20.0, 5.375, 60.0, 25.75], [23.75, 25.75, 60.0, 44.625]],
  floorOutline: [[20.0, 5.375, 60.0, 25.75], [15.75, 25.75, 60.0, 44.625], [60.0, 25.75, 67.0, 44.625]],
  roofOutline: [[20.0, 5.375, 60.0, 25.75], [15.75, 25.75, 60.0, 44.625], [60.0, 25.75, 67.0, 44.625]],
  courtyard: null,
  walls: [
    hx(20.0, 60.0, 5.375 + T / 2, T, EXT),                 // north
    hx(23.75, 60.0, 44.625 - T / 2, T, EXT),               // south
    vz(5.375, 25.75, 20.0 + T / 2, T, EXT),                // west, north part (onto the porch)
    hx(20.0, 24.875, 25.75 - T / 2, T, EXT),               // step in the façade
    vz(25.75, 44.625, 23.75 + T / 2, T, EXT),              // west, south part (behind the veranda)
    vz(5.375, 44.625, 60.0 - T / 2, T, EXT),               // rear
    // front veranda: brick arcade
    vz(25.75, 44.625, 16.25, 1.0, BRICK),
    hx(15.75, 23.75, 44.125, 1.0, BRICK),
    // rear veranda: brick arcade
    vz(25.75, 44.625, 66.5, 1.0, BRICK),
    hx(60.0, 67.0, 44.125, 1.0, BRICK),
    // stair, staff room, service column
    vz(6.5, 20.0, 29.625, 0.5),                            // stair | staff room
    hx(29.375, 41.25, 16.25, 0.5),                         // staff room | hall
    vz(6.5, 16.5, 41.0, 0.5),                              // staff room | laundry
    vz(6.5, 11.75, 35.5),                                  // staff bath
    hx(35.31, 40.75, 11.69),
    hx(41.0, 46.75, 12.75, 0.5),                           // laundry | pantry
    hx(41.0, 46.75, 16.25, 0.5),                           // pantry | hall
    vz(6.5, 26.25, 46.75, 0.5),                            // service column | kitchen
    hx(41.0, 46.75, 20.5, 0.5),                            // hall | powder
    vz(20.25, 26.25, 41.0, 0.5),                           // hall | powder
    hx(46.75, 59.4, 26.25, 0.5),                           // kitchen | lounge
    hx(24.875, 46.75, 26.25, 0.5),                         // hall | drawing + dining
    vz(26.25, 43.5, 37.5, 0.5),                            // drawing | dining (arch)
    vz(26.25, 43.5, 47.25, 0.5),                           // dining | lounge (arch)
  ],
  openings: [
    oz(20.5625, 20.75, 24.25, 0, 8.5, 'double', { arch: true, ext: true, leaf: 'teak' }),  // main door, from the porch
    oz(20.5625, 8.0, 12.5, 4.5, 11.0, 'window', { arch: true, ext: true }),                  // stair: tall arched window (west)
    ox(5.9375, 22.5, 27.5, 4.5, 11.0, 'window', { arch: true, ext: true }),                  // stair: north window
    ox(16.25, 37.5, 40.0, 0, 7.5, 'swing'),                                                   // hall → staff room
    ox(5.9375, 30.75, 34.25, 3.0, 8.0, 'window', shut('n')),                                  // staff room
    ox(5.9375, 37.0, 39.5, 6.0, 7.5, 'window', EXT),                                          // staff bath, high
    oz(35.5, 9.0, 11.25, 0, 7.0, 'swing'),                                                    // staff room → its bath
    ox(5.9375, 41.75, 44.25, 0, 7.5, 'swing', EXT),                                           // laundry: service door to the side passage
    ox(12.75, 44.0, 46.0, 0, 7.5, 'opening'),                                                 // laundry ↔ pantry
    oz(46.75, 13.25, 15.75, 0, 7.5, 'opening'),                                               // pantry → kitchen
    oz(46.75, 17.0, 19.75, 0, 7.5, 'swing'),                                                  // hall → kitchen
    ox(20.5, 42.0, 44.5, 0, 7.0, 'swing'),                                                    // hall → powder
    ox(5.9375, 49.75, 56.25, 3.5, 8.0, 'window', shut('n')),                                  // kitchen, over the counter (north light)
    ox(5.9375, 57.0, 58.5, 9.5, 10.75, 'window', EXT),                                        // kitchen roshandan
    oz(59.4375, 10.5, 13.0, 0, 7.5, 'swing', EXT),                                            // kitchen service door → service yard
    oz(59.4375, 15.0, 20.0, 3.5, 8.0, 'window', shut('e')),                                   // kitchen, east
    ox(26.25, 25.5, 29.5, 0, 8.5, 'double', { arch: true, leaf: 'teak' }),                    // hall → drawing
    oz(24.3125, 28.5, 32.0, 0, 8.5, 'glassdoor', { arch: true, ext: true }),                  // drawing → front veranda
    oz(24.3125, 37.0, 40.5, 0, 8.5, 'glassdoor', { arch: true, ext: true }),
    ox(44.0625, 28.0, 31.5, 2.5, 8.5, 'window', shut('s')),                                   // drawing, south
    ox(44.0625, 33.0, 36.0, 2.5, 8.5, 'window', shut('s')),
    ox(44.0625, 31.75, 32.75, 9.75, 10.75, 'window', EXT),                                    // drawing roshandan
    oz(37.5, 27.25, 33.0, 0, 9.0, 'opening', ARCH),                                           // drawing ↔ dining
    ox(26.25, 38.0, 41.0, 0, 8.0, 'opening', ARCH),                                           // hall → dining
    ox(44.0625, 39.5, 44.5, 2.5, 8.5, 'window', shut('s')),                                   // dining, south
    oz(47.25, 27.25, 33.0, 0, 9.0, 'opening', ARCH),                                          // dining ↔ lounge
    oz(59.4375, 27.5, 31.5, 0, 8.5, 'glassdoor', { arch: true, ext: true }),                  // lounge → rear veranda
    oz(59.4375, 35.5, 42.5, 2.5, 8.5, 'window', { arch: true, ext: true }),                   // lounge, east (over the sofa)
    ox(44.0625, 50.5, 55.5, 2.5, 8.5, 'window', shut('s')),                                   // lounge, south
    ox(44.0625, 56.25, 57.25, 9.75, 10.75, 'window', EXT),                                    // lounge roshandan
    // front veranda arcade (three arches) and south end
    oz(16.25, 26.5, 31.5, 0, 8.5, 'arcade', ARCH),
    oz(16.25, 32.5, 37.5, 0, 8.5, 'arcade', ARCH),
    oz(16.25, 38.5, 43.5, 0, 8.5, 'arcade', ARCH),
    ox(44.125, 17.25, 22.25, 0, 8.5, 'arcade', ARCH),
    // rear veranda arcade
    oz(66.5, 27.0, 31.5, 0, 8.5, 'arcade', ARCH),
    oz(66.5, 33.0, 37.5, 0, 8.5, 'arcade', ARCH),
    oz(66.5, 39.0, 43.5, 0, 8.5, 'arcade', ARCH),
    ox(44.125, 61.0, 65.5, 0, 8.5, 'arcade', ARCH),
  ],
  rooms: [
    room('hall', 'Entrance hall', [21.125, 20.0, 41.0, 26.0], 'marble'),
    room('hall2', '', [29.875, 16.5, 46.5, 20.25], 'marble', { noLabel: true }),
    room('stair', 'Stair', [21.125, 6.5, 29.375, 20.0], 'marble', { noFloor: true }),
    room('staff', 'Staff room', [29.875, 6.5, 40.75, 16.0], 'tile', { fan: true }),
    room('staffbath', '', [35.69, 6.5, 40.75, 11.5], 'tile', { noLabel: true }),
    room('laundry', 'Laundry', [41.25, 6.5, 46.5, 12.5], 'tile'),
    room('pantry', 'Pantry', [41.25, 13.0, 46.5, 16.0], 'tile'),
    room('powder', 'Powder', [41.25, 20.75, 46.5, 26.0], 'tile'),
    room('kitchen', 'Kitchen (closed)', [47.0, 6.5, 58.875, 26.0], 'granite'),
    room('drawing', 'Drawing room', [24.875, 26.5, 37.25, 43.5], 'marble', { fan: true }),
    room('dining', 'Dining', [37.75, 26.5, 47.0, 43.5], 'marble'),
    room('lounge', 'Family lounge', [47.5, 26.5, 58.875, 43.5], 'marble'),
    room('fveranda', 'Front veranda', [16.75, 25.75, 23.75, 43.625], 'terracotta', { outdoor: true }),
    room('rveranda', 'Rear veranda', [60.0, 25.75, 66.0, 43.625], 'terracotta', { outdoor: true }),
  ],
  furniture: [
    // hall
    // staff room: single bed, wardrobe, own shower-WC
    f('bed', [29.875, 12.0, 36.375, 15.25], 'e'),
    f('wardrobe', [29.875, 6.5, 31.875, 9.5], 'e'),
    f('shower', [35.69, 6.5, 38.25, 8.9], 's'), f('wc', [38.45, 6.5, 40.75, 8.9], 's'),
    f('vanity', [39.0, 9.3, 40.75, 11.5], 'w'),
    // laundry and pantry
    f('washer', [41.25, 10.0, 43.15, 12.5], 'e'), f('counter', [44.6, 6.5, 46.5, 9.0], 'w'),
    f('shelf', [41.25, 13.0, 42.5, 16.0], 'e'),
    // powder
    f('wc', [44.2, 23.8, 46.5, 26.0], 'n'), f('vanity', [41.25, 23.9, 43.0, 26.0], 'n'),
    // kitchen: fridge, counter under the north window, east counter, island, breakfast table
    f('fridge', [47.0, 6.5, 49.4, 9.0], 's'), f('counter', [49.5, 6.5, 58.875, 8.5], 's'),
    f('counter', [56.875, 14.0, 58.875, 19.0], 'w'),
    f('island', [50.0, 12.0, 55.0, 15.0], 's'),
    f('dining', [50.5, 19.5, 56.5, 26.0], 's'),
    // drawing room
    f('sofa', [27.0, 40.55, 36.0, 43.5], 'n', { model: 'SheenWoodLeatherSofa' }),
    f('armchair', [28.1, 32.0, 30.82, 33.87], 's'), f('armchair', [31.4, 32.0, 34.12, 33.87], 's'),
    f('coffee', [29.3, 35.2, 33.24, 37.17], 's', { model: 'modern_coffee_table_01' }),
    f('rug', [26.5, 31.5, 36.0, 40.2]), f('pot', [24.95, 33.5, 26.45, 35.0]),
    // dining: 8 seats
    f('dining', [38.8, 34.0, 46.0, 43.4], 'e'),
    // family lounge: TV on the dining wall, velvet sofa facing it
    f('tv', [47.5, 35.0, 49.2, 43.0], 'e'),
    f('sofa', [54.6, 35.4, 57.95, 42.58], 'w'), f('coffee', [50.2, 36.9, 54.47, 41.17], 's'),
    f('rug', [49.6, 34.6, 56.4, 43.0]),
    f('armchair', [51.0, 27.8, 53.72, 29.67], 's'),
    // verandas: charpais, chairs and pots
    f('charpai', [17.25, 27.0, 20.25, 33.5], 'e'),
    f('chair', [21.2, 40.8, 22.65, 42.7], 'w', { model: 'painted_wooden_chair_01' }),
    f('pot', [17.0, 42.3, 18.5, 43.6]),
    f('charpai', [61.0, 34.0, 64.0, 40.5], 'e'),
    f('pot', [64.5, 42.2, 66.0, 43.6]),
  ],
};

// ---------------------------------------------------------------- FIRST FLOOR
// Three bedrooms with full baths, an upstairs family lounge over the drawing room (onto the front
// terrace) and a study over the dining room, all off one landing at the head of the stair.
const first = {
  footprint: [[20.0, 5.375, 60.0, 25.75], [23.75, 25.75, 60.0, 44.625], [60.0, 29.75, 67.0, 44.625]],
  voids: [],
  walls: [
    hx(20.0, 60.0, 5.375 + T / 2, T, EXT),                 // north
    hx(23.75, 67.0, 44.625 - T / 2, T, EXT),               // south
    vz(5.375, 25.75, 20.0 + T / 2, T, EXT),                // west, north part
    hx(20.0, 24.875, 25.75 - T / 2, T, EXT),               // façade step
    vz(25.75, 44.625, 23.75 + T / 2, T, EXT),              // west, south part (onto the front terrace)
    vz(5.375, 29.75, 60.0 - T / 2, T, EXT),                // rear, north of the master's wing
    vz(29.75, 44.625, 59.4375, 0.5),                       // master bedroom | walk-in + bath
    hx(59.2, 67.0, 29.75 + T / 2, T, EXT),                 // master wing, north (onto the small terrace)
    vz(29.75, 44.625, 67.0 - T / 2, T, EXT),               // master wing, east (over the rear veranda)
    vz(6.5, 20.0, 29.625, 0.5),                            // stair | bedroom 2
    hx(29.375, 41.25, 20.25, 0.5),                         // bedroom 2 | landing
    vz(6.5, 20.5, 41.0, 0.5),                              // bedroom 2 | bath 3 + lobby
    vz(6.5, 11.75, 35.5),                                  // bath 2
    hx(35.31, 40.75, 11.69),
    hx(41.0, 46.75, 12.75, 0.5),                           // bath 3 | lobby
    hx(41.0, 46.75, 20.25, 0.5),                           // lobby | landing (open)
    vz(6.5, 20.5, 46.75, 0.5),                             // lobby + bath 3 | bedroom 3
    hx(46.75, 59.4, 20.25, 0.5),                           // bedroom 3 | master
    vz(20.25, 26.25, 46.75, 0.5),                          // landing | master sitting
    hx(24.875, 46.75, 26.25, 0.5),                         // landing | lounge + study
    vz(26.25, 43.5, 37.5, 0.5),                            // lounge | study
    vz(26.25, 43.5, 47.25, 0.5),                           // study | master
    hx(59.69, 66.4, 36.75, 0.5),                           // walk-in | master bath
  ],
  openings: [
    ox(5.9375, 22.5, 27.5, 1.0, 8.5, 'window', { arch: true, ext: true }),                   // stair, north
    oz(20.5625, 21.0, 24.25, 1.0, 8.0, 'window', { ext: true }),                              // landing jharoka (seat window)
    oz(20.5625, 9.0, 12.5, 1.0, 8.0, 'window', { ext: true }),                                // stair jharoka
    // bedroom 2 (over the staff room; bath over the staff bath)
    ox(20.25, 37.5, 40.0, 0, 7.5, 'swing'),
    ox(5.9375, 31.75, 35.0, 2.5, 7.5, 'window', shut('n')),
    oz(35.5, 9.0, 11.25, 0, 7.0, 'swing'),
    ox(5.9375, 37.0, 39.5, 5.0, 7.0, 'window', EXT),
    // bedroom 3 (over the kitchen; bath over the laundry, entered through a short lobby)
    ox(20.25, 42.0, 45.75, 0, 7.5, 'opening'),
    oz(46.75, 14.5, 17.0, 0, 7.5, 'swing'),
    oz(46.75, 9.75, 12.25, 0, 7.0, 'swing'),
    ox(5.9375, 42.0, 44.0, 5.0, 7.0, 'window', EXT),
    ox(5.9375, 50.75, 54.75, 2.5, 7.5, 'window', shut('n')),
    oz(59.4375, 9.0, 13.0, 2.5, 7.5, 'window', shut('e')),
    // master suite: sitting area → bedroom → walk-in wardrobe → bath (over the rear veranda)
    oz(46.75, 21.5, 24.0, 0, 7.5, 'swing'),
    oz(59.4375, 21.5, 24.5, 2.5, 7.5, 'window', shut('e')),
    oz(59.4375, 26.0, 29.0, 0, 7.5, 'glassdoor', { arch: true, ext: true }),                // onto the veranda-roof terrace
    ox(44.0625, 50.5, 54.5, 2.5, 7.5, 'window', shut('s')),
    ox(44.0625, 55.5, 56.5, 8.0, 9.25, 'window', EXT),                                       // roshandan
    oz(59.4375, 31.5, 34.0, 0, 7.5, 'opening'),
    ox(36.75, 61.0, 63.5, 0, 7.0, 'swing'),
    oz(67.0 - T / 2, 32.0, 35.0, 4.5, 7.5, 'window', EXT),
    oz(67.0 - T / 2, 38.5, 42.0, 5.0, 7.5, 'window', EXT),
    ox(44.0625, 61.5, 64.5, 5.0, 7.5, 'window', EXT),
    // upstairs lounge (over the drawing room) onto the front terrace
    ox(26.25, 27.0, 33.0, 0, 8.0, 'opening', ARCH),
    oz(24.3125, 29.0, 32.5, 0, 8.0, 'glassdoor', { arch: true, ext: true }),
    oz(24.3125, 37.0, 40.5, 0, 8.0, 'glassdoor', { arch: true, ext: true }),
    ox(44.0625, 28.0, 31.5, 2.5, 7.5, 'window', shut('s')),
    ox(44.0625, 32.5, 36.0, 2.5, 7.5, 'window', shut('s')),
    // study (over the dining room)
    ox(26.25, 39.5, 42.0, 0, 7.5, 'swing'),
    ox(44.0625, 39.0, 42.5, 2.5, 7.5, 'window', shut('s')),
    ox(44.0625, 43.5, 44.5, 8.0, 9.25, 'window', EXT),
  ],
  rooms: [
    room('landing', 'Landing', [21.125, 20.5, 46.5, 26.0], 'marble'),
    room('fstair', '', [21.125, 6.5, 29.375, 20.0], 'marble', { noFloor: true, noLabel: true }),
    room('bed2', 'Bedroom 2', [29.875, 6.5, 40.75, 20.0], 'parquet'),
    room('bath2', 'Bath 2', [35.69, 6.5, 40.75, 11.5], 'tile'),
    room('lobby3', '', [41.25, 13.0, 46.5, 20.0], 'parquet', { noLabel: true }),
    room('bath3', 'Bath 3', [41.25, 6.5, 46.5, 12.5], 'tile'),
    room('bed3', 'Bedroom 3', [47.0, 6.5, 58.875, 20.0], 'parquet'),
    room('master', 'Master bedroom', [47.5, 20.5, 58.875, 43.5], 'parquet'),
    room('mdress', 'Walk-in', [59.69, 30.875, 65.875, 36.5], 'parquet'),
    room('mbath', 'Master bath', [59.69, 37.0, 65.875, 43.5], 'tile'),
    room('flounge', 'Upstairs lounge', [24.875, 26.5, 37.25, 43.5], 'parquet'),
    room('study', 'Study', [37.75, 26.5, 47.0, 43.5], 'parquet', { fan: true }),
    room('fterrace', 'Front terrace', [15.75, 25.75, 23.75, 44.625], 'terracotta', { outdoor: true }),
    room('rterrace', 'Terrace', [60.0, 25.75, 67.0, 29.75], 'terracotta', { outdoor: true }),
  ],
  furniture: [
    // landing: a seat in the jharoka
    f('bench', [21.2, 21.25, 22.6, 24.0], 'e'),
    // bedroom 2: bed head on the stair wall, feet east; wardrobe beside the bath
    f('bed', [29.875, 12.0, 37.075, 18.4], 'e'),
    f('nightstand', [29.875, 10.3, 31.3, 11.7], 'e'), f('nightstand', [29.875, 18.55, 31.3, 19.95], 'e'),
    f('wardrobe', [29.875, 6.5, 31.875, 9.9], 'e'), f('wardrobe', [38.75, 12.0, 40.75, 16.9], 'w'),
    f('shower', [35.69, 6.5, 38.25, 8.9], 's'), f('wc', [38.45, 6.5, 40.75, 8.9], 's'),
    f('vanity', [39.0, 9.3, 40.75, 11.5], 'w'),
    // bedroom 3: bed head on the master wall, feet north
    f('bed', [50.2, 12.6, 56.6, 19.8], 'n'),
    f('nightstand', [48.6, 18.4, 50.0, 19.8], 'n'), f('nightstand', [56.8, 18.4, 58.2, 19.8], 'n'),
    f('wardrobe', [47.0, 6.5, 49.0, 9.4], 'e'), f('wardrobe', [55.5, 6.5, 58.875, 8.5], 's'),
    f('wc', [41.25, 6.5, 43.55, 8.9], 's'), f('shower', [44.0, 6.5, 46.5, 9.5], 's'),
    f('vanity', [41.25, 9.5, 43.0, 12.5], 'e'),
    // master: sitting area by the door, bed head on the study wall facing the garden
    f('armchair', [51.5, 20.9, 54.81, 24.8], 's', { model: 'mid_century_lounge_chair' }),
    f('bed', [47.5, 32.6, 54.7, 39.0], 'e'),
    f('nightstand', [47.5, 31.0, 48.9, 32.4], 'e'), f('nightstand', [47.5, 39.2, 48.9, 40.6], 'e'),
    f('bench', [55.0, 34.0, 56.4, 37.6], 'e'),
    f('wardrobe', [63.875, 30.875, 65.875, 36.5], 'w'),
    f('wc', [59.69, 41.2, 61.99, 43.5], 'n'), f('shower', [62.4, 40.4, 65.875, 43.5], 'n'),
    f('vanity', [63.6, 37.0, 65.875, 40.2], 'w'),
    // upstairs lounge
    f('sofa', [28.4, 40.0, 35.58, 43.35], 'n'),
    f('armchair', [29.0, 31.0, 31.72, 32.87], 's'), f('armchair', [32.3, 31.0, 35.02, 32.87], 's'),
    f('coffee', [29.85, 34.8, 34.12, 39.07], 's'), f('rug', [28.0, 33.5, 36.0, 40.0]),
    // study: day bed for a guest, desk under the south window, bookshelves
    f('sofa', [37.75, 34.0, 41.1, 41.18], 'e'),
    f('desk', [42.0, 41.0, 46.5, 43.5], 'n'), f('chair', [43.5, 39.2, 45.0, 40.7], 's'),
    f('shelf', [45.75, 28.0, 47.0, 37.0], 'w'),
    // front terrace (veranda roof) and the small rear terrace
    f('charpai', [17.0, 34.0, 20.0, 40.5], 'e'),
    f('pot', [16.2, 26.2, 17.7, 27.7]), f('pot', [16.2, 42.9, 17.7, 44.4]),
    f('chair', [64.0, 26.2, 65.45, 28.1], 'w', { model: 'painted_wooden_chair_01' }),
  ],
};

// ---------------------------------------------------------------- BASEMENT (option)
// Tehkhana: the traditional cool room below ground. A big summer lounge at the back, a guest room
// with its own bath under the drawing room, a store and the plant room (UPS, pumps, filters).
// Daylight and air through roshandans just above the ground (the 3′6″ plinth leaves 2 ft of wall).
const basement = {
  footprint: [[20.0, 5.375, 60.0, 25.75], [23.75, 25.75, 60.0, 44.625]],
  walls: [
    hx(20.0, 60.0, 5.875, 1, RCC),
    hx(23.75, 60.0, 44.125, 1, RCC),
    vz(5.375, 25.75, 20.5, 1, RCC),
    hx(20.0, 24.25, 25.25, 1, RCC),
    vz(25.75, 44.625, 24.25, 1, RCC),
    vz(5.375, 44.625, 59.5, 1, RCC),
    vz(6.5, 20.0, 29.625, 0.5),                            // stair | store
    hx(29.375, 47.0, 16.25, 0.5),                          // store + plant room | hall
    vz(6.5, 16.5, 38.5, 0.5),                              // store | plant room
    hx(24.75, 37.5, 26.25, 0.5),                           // hall | guest room
    vz(26.25, 43.625, 37.5, 0.5),                          // guest room | tehkhana
    vz(26.25, 33.0, 31.5),                                 // guest bath
    hx(24.75, 31.69, 32.81),
  ],
  openings: [
    ox(16.25, 31.0, 33.5, 0, 7.5, 'swing'),                // hall → store
    ox(16.25, 41.0, 43.5, 0, 7.5, 'swing'),                // hall → plant room
    ox(26.25, 33.0, 35.5, 0, 7.5, 'swing'),                // hall → guest room
    oz(31.5, 29.5, 31.75, 0, 7.0, 'swing'),                // guest room → bath
    ox(44.125, 26.5, 30.5, 8.25, 9.6, 'window', EXT),      // roshandans just above ground
    ox(44.125, 32.0, 36.0, 8.25, 9.6, 'window', EXT),
    ox(44.125, 42.0, 46.0, 8.25, 9.6, 'window', EXT),
    ox(44.125, 49.0, 53.0, 8.25, 9.6, 'window', EXT),
    ox(44.125, 54.5, 58.0, 8.25, 9.6, 'window', EXT),
    oz(59.5, 30.0, 34.0, 8.25, 9.6, 'window', EXT),
    oz(59.5, 37.0, 41.0, 8.25, 9.6, 'window', EXT),
    ox(5.875, 49.0, 53.0, 8.25, 9.6, 'window', EXT),
    ox(5.875, 32.0, 35.0, 8.25, 9.6, 'window', EXT),
  ],
  rooms: [
    room('bhall', 'Basement hall', [21.0, 16.5, 47.0, 26.0], 'marble'),
    room('bstair', '', [21.0, 6.5, 29.375, 20.0], 'marble', { noFloor: true, noLabel: true }),
    room('bstore', 'Store', [29.875, 6.5, 38.25, 16.0], 'tile'),
    room('plant', 'Plant room · UPS, pumps, filters', [38.75, 6.5, 59.0, 16.0], 'tile'),
    room('guest', 'Guest room', [24.75, 26.5, 37.25, 43.625], 'parquet'),
    room('gbath', 'Guest bath', [24.75, 26.5, 31.31, 32.63], 'tile'),
    room('tehkhana', 'Tehkhana · summer lounge', [37.75, 16.5, 59.0, 43.625], 'marble', { fan: true }),
  ],
  furniture: [
    f('shelf', [29.875, 6.5, 38.25, 7.75], 's'), f('shelf', [29.875, 8.0, 31.0, 13.0], 'e'),
    f('tall', [39.0, 6.5, 44.0, 8.5], 's'), f('tall', [53.0, 6.5, 58.5, 8.5], 's'),
    f('bed', [30.0, 37.2, 36.4, 43.625], 'n'),
    f('nightstand', [28.4, 42.2, 29.8, 43.6], 'n'), f('nightstand', [36.6, 42.2, 37.25, 43.6], 'n'),
    f('wardrobe', [35.25, 30.0, 37.25, 35.0], 'w'),
    f('wc', [24.75, 26.5, 27.05, 28.9], 's'), f('shower', [24.75, 29.6, 27.6, 32.63], 'e'),
    f('vanity', [29.6, 26.5, 31.31, 28.6], 's'),
    f('sofa', [44.0, 36.0, 51.18, 39.35], 'n'), f('sofa', [52.0, 27.0, 55.35, 34.18], 'w'),
    f('coffee', [45.5, 30.5, 49.77, 34.77], 's'), f('rug', [42.0, 27.0, 56.0, 40.0]),
    f('charpai', [38.5, 38.5, 41.5, 43.5], 'e'),
    f('tv', [38.25, 26.0, 39.95, 34.0], 'e'),
  ],
};

export const HOUSE = { ground, first, basement };
export const SUNKEN = null;

// ---------------------------------------------------------------- ROOF
// Services only: no inside stair reaches the roof, so a steel spiral stair in the service yard gives
// access (bye-law 17c). The stair's brick wind tower caps the thermal chimney.
export const ROOF = {
  mumty: [20.0, 5.375, 29.875, 20.5],              // wind tower over the stairwell: 9′10″ × 15′1″ = 149 sq ft (≤ 300)
  mumtyOpenings: [
    ox(5.75, 21.5, 24.5, 1.5, 4.8, 'opening', ARCH), ox(5.75, 25.5, 28.5, 1.5, 4.8, 'opening', ARCH),
    ox(20.125, 21.5, 24.5, 1.5, 4.8, 'opening', ARCH), ox(20.125, 25.5, 28.5, 1.5, 4.8, 'opening', ARCH),
    oz(20.375, 7.5, 12.0, 1.5, 4.8, 'opening', ARCH), oz(20.375, 13.5, 18.0, 1.5, 4.8, 'opening', ARCH),
    oz(29.5, 7.5, 12.0, 1.5, 4.8, 'opening', ARCH), oz(29.5, 13.5, 18.0, 1.5, 4.8, 'opening', ARCH),
  ],
  tanks: [[38.2, 9.0], [43.9, 9.6]],               // on the walls of baths 2 and 3
  // 2 ft chhajjas (sunshades) on the west, south and east faces of the first floor
  canopy: [[18.0, 5.375, 20.0, 25.75], [21.75, 25.75, 23.75, 44.625], [23.75, 44.625, 67.0, 46.625], [20.0, 3.375, 60.0, 5.375], [60.0, 5.375, 62.0, 29.75], [67.0, 29.75, 69.0, 44.625]],
  solar: {
    panelW: 3.72, panelL: 7.48, tiltDeg: 24,
    rows: [{ x: 30.5, z: 13.5, n: 7 }, { x: 25.0, z: 24.8, n: 9 }, { x: 25.0, z: 36.1, n: 10 }],
  },
  acUnits: [[32.5, 7.0], [49.0, 7.0], [53.0, 7.0], [57.0, 7.0]],
};

// Front: covered porch for two cars on the north side (gate at the north corner), front lawn at the
// 15′9″ minimum with its two trees.
export const GATE = 'north';
export const YARD = {
  cars: [{ z: 7.0, model: 'landcruiser', color: 0xeceae4 }, { z: 16.3, model: 'civic', color: 0x4b5157 }],
  carNoseX: 17.25,
  drive: [0.75, 0.375, 20.0, 23.25],
  path: [12.0, 23.25, 16.25, 26.5],
  trees: [[6.0, 31.0], [6.0, 42.5]],
  lawn: [0.75, 23.25, 15.75, 49.625],
};

// Back garden: lawn, a grape-vine pergola for sitting out, the service yard behind the kitchen,
// and the green belt (trees along the boundaries, hedges and climbers).
export const GARDEN = {
  lawn: [[67.0, 0.375, 89.625, 49.625], [60.0, 44.625, 67.0, 49.625]],
  paving: [[60.0, 0.375, 67.0, 25.75]],
  pavingMat: 'paving',
  pergola: { r: [72.0, 30.0, 80.0, 42.0], h: 9.0 },
  trees: [[86.5, 4.5, 7.0, 2.2], [86.5, 16.0, 7.0, 2.2], [86.5, 27.5, 7.0, 2.2], [86.5, 39.0, 7.0, 2.2], [76.0, 47.0, 6.0, 1.8], [33.0, 47.3, 6.0, 1.7], [46.0, 47.3, 6.0, 1.7]],
  beds: [[68.0, 45.5, 84.0, 49.0], [68.0, 1.0, 84.0, 4.0]],
  screens: [{ r: [67.0, 0.75, 67.75, 24.5], h: 6, m: 'leaf' }],
  furniture: [
    f('table6', [73.0, 33.0, 79.0, 39.0], 's'),
    f('charpai', [81.0, 8.0, 84.0, 14.5], 'e'),
    f('pot', [67.5, 26.0, 69.0, 27.5], 's'),
  ],
};

export const FEATURES = {
  steps: [
    { r: [17.5, 20.25, 20.0, 24.75], y: 3.5, dir: 'e', m: 'stone' },        // porch → main door
    { r: [13.25, 32.5, 15.75, 37.5], y: 3.5, dir: 'e', m: 'brick' },        // lawn → front veranda
    { r: [67.0, 33.0, 69.5, 37.5], y: 3.5, dir: 'w', m: 'brick' },          // rear veranda → garden
  ],
  porches: [{ r: [0.75, 0.375, 20.0, 23.25], h: 11.0, cols: [[1.75, 1.25], [18.75, 1.25], [1.75, 22.5], [18.75, 22.5]] }],
  terraces: [
    { r: [15.75, 25.75, 23.75, 44.625], open: ['w', 'n', 's'] },              // front terrace over the veranda
    { r: [60.0, 25.75, 67.0, 29.75], open: ['e', 'n'] },                    // master's terrace over the rear veranda
  ],
  jharokas: [
    { side: 'w', at: 20.0, a: 9.0, b: 12.5, y: 16.5 },                      // over the porch, at the stair
    { side: 'w', at: 20.0, a: 21.0, b: 24.25, y: 16.5 },                    // the landing's seat window
  ],
  jaali: [
    { r: [15.85, 25.85, 16.0, 26.4], m: 'jaaliBrick' },
    { r: [66.6, 25.85, 66.75, 26.9], m: 'jaaliBrick' },
    // jaali screens in the wind tower's arches
    { r: [20.0, 5.6, 29.875, 5.9], y0: 30.0, y1: 33.3, m: 'jaaliBrick', level: 'roof' },
    { r: [20.0, 19.95, 29.875, 20.25], y0: 30.0, y1: 33.3, m: 'jaaliBrick', level: 'roof' },
  ],
  spirals: [{ x: 63.5, z: 5.5, r: 2.75, y0: 0.5, y1: 28.5 }],
  vines: [
    { r: [24.25, 44.75, 37.0, 44.85], y0: 4, y1: 14, sparse: 6 },
    { r: [59.9, 5.5, 60.0, 9.5], y0: 2, y1: 14 },
  ],
  lanterns: [
    { x: 20.0, z: 30.0, y: 11.5, size: 1.0, hang: 15.0 },
    { x: 20.0, z: 40.0, y: 11.5, size: 1.0, hang: 15.0 },
    { x: 63.5, z: 30.0, y: 11.5, size: 1.0, hang: 15.0 },
    { x: 63.5, z: 40.0, y: 11.5, size: 1.0, hang: 15.0 },
    { x: 25.0, z: 11.0, y: 24.0, size: 1.6, hang: 33.0 },                    // in the stair tower
  ],
};

export const STYLE = {
  ext: { ground: 'brick', first: 'brick', roof: 'brick' },
  int: 'lime',
  lining: 'lime',                                  // limewash on the inside of the brick outer walls
  railing: 'iron',
  slabSide: { ground: 'brick', first: 'kashi', roof: 'brick' },
  soffit: 'teak',
  coping: 'brick',
  frieze: 'kashi',
  eave: 0.75,
};

export const TELEPORTS = {
  ground: { x: 22.5, z: 22.5, y: 3.5, yaw: -Math.PI / 2 },   // inside the main door
  first: { x: 33.0, z: 23.0, y: 16.5, yaw: -Math.PI / 2 },   // on the landing
  basement: { x: 35.0, z: 21.0, y: -8.0, yaw: -Math.PI / 2 },
};

export const DESIGN = {
  name: 'Haveli J-4',
  summary: 'Traditional South Punjab house in exposed brick with Multani blue tiles, jaalis, jharokas and roshandans. Arched verandas front and back, a brick wind tower over the stair that draws hot air out, a green belt of trees and a deep back garden. Drawing room opening onto the dining, family lounge, big closed kitchen with pantry and laundry, staff room. Three bedrooms with full baths, an upstairs lounge and a study; a tehkhana basement option.',
  HOUSE, LEVELS, STAIR, LIFT, SUNKEN, ROOF, YARD, GARDEN, FEATURES, STYLE, TELEPORTS, GATE,
};
