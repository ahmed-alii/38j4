# Scheme A: base design (revision 3)

Built from `requirements.md` and checked against `bylaws-1-kanal.md`. All geometry is in `js/house-data.js` (feet, plot coordinates).

**Revision 3 (owner feedback):** the laundry moved into a larger dirty kitchen, the kitchen and family lounge grew, the pump/UPS room left the house (the pump sits on the underground tank in the rear clear space; the UPS/inverter goes in a ventilated cabinet on the roof beside the solar panels), and the store moved upstairs. On the first floor, bedrooms now open straight off the corridor, with wardrobes along the entry wall.

**Revision 2 (owner feedback):** the courtyard moved from the centre to the south side of the house, the garden gallery was removed, and every room's furniture was re-placed so there is proper walking space. Furniture is now stored as exact footprints, and `tools/check-layout.mjs` verifies the plan (see below).

## Bye-law check

| Item | Scheme A | Limit | |
|---|---|---|---|
| Ground floor covered | 2,412 sq ft | 2,703 (inside the clear spaces) | ✓ |
| First floor covered | **2,016 sq ft** | 2,027 (75%) | ✓ 99.5% |
| Stair tower | 151 sq ft, top at 34′ 6″ | 300 sq ft, 35′ | ✓ |
| Lift overrun | top at 37′ | 41′ (bye-law 11d) | ✓ |
| Ceilings | 10′ 6″ clear, 12′ floor to floor | 9′ 6″–12′ | ✓ |
| Plinth | 1′ 6″ (also with basement, via the sunken garden) | ≥ 1′ 6″ | ✓ |
| Trees in front lawn | 2 | ≥ 2 | ✓ |
| Solar | 20 × 585 W ≈ 11.7 kW, facing due south | 10 kW for the 22(b) relief | ✓ |

## Ground floor

- **Front (unchanged):** gate on the south corner, two cars nose-in in front of the wood-clad lift and stair core. Drawing room behind the jaali, facing the lawn. Entrance verandah, foyer, powder room, lift and stair.
- **Dining** (16′ × 12′): between the drawing room and the family lounge, as asked. The 8-seat table has 3′ 8″ or more to every wall.
- **Kitchen** (19′ 6″ × 12′ 4″): fridge, a tall pantry unit and a 13′ 9″ counter along the north wall under the window; a 10′ × 3′ 6″ island with five stools facing the lounge. Aisles are 4′ at the counter and 4′ 9″ at each end of the island. It opens to the lounge and has a side opening to the dining room.
- **Dirty kitchen + laundry** (11′ 8″ × 12′ 2″): L-shaped counter with the cooking range and sink, washer and dryer, pantry shelf, and a service door to the side passage.
- **Family lounge** (40′ × 12′): one long room from the foyer to the parents' bath wall. A family sofa faces the courtyard at the west end; the TV corner (sofa, two armchairs) is at the east end; reading chairs sit by the study wall. A 9 ft sliding door and fixed glass open onto the courtyard.
- **Study** (9′ 3″ × 12′ 7″): off the hall, close to the entrance so visitors don't pass through the house. Glass door to the courtyard.
- **Courtyard** (17′ × 13′ 7″, plus the 5′ 4½″ side passage = about 17′ × 19′ open to the sky): lawn, bench, two loungers, and a water channel and tree in the side passage. The lounge, study and parents' bedroom all open onto it.
- **Parents' suite:** bedroom 21′ 7″ × 12′ 8″ with a 10′ wardrobe wall, the bed against the east wall under a high window, a sliding door to the courtyard, a south window and a sitting corner; bathroom 7′ 8″ × 12′.
- **Outside the house:** water pump on the underground tank in the rear clear space; UPS/inverter cabinet on the roof by the solar panels.

## First floor

- **Upstairs lounge + hall** at the head of the stairs, opening to a front terrace (west) and a north terrace.
- **Bedrooms 2 and 3** (15′ 10″ × 12′ 2″ and 16′ 7″ × 12′ 2″, plus a 9′ 7″ × 8′ entry zone each) along the north. The door from the corridor opens straight into the bedroom; wardrobes line the entry zone; each has its own bath.
- **Bedroom 4** (14′ 8″ × 12′ 8″ plus entry zone, north-east) with a wardrobe wall and its own bath.
- **Store** (11′ 8″ × 4′ 1″, shelved) at the end of the corridor, moved up from the ground floor.
- **Master suite** (south-east, over the parents): bedroom 14′ 8″ × 12′ 8″ with a full-width wardrobe wall and east and south windows; master bath 6′ × 12′ 8″.
- **Corridor** (4′ 4″) along the courtyard side with glass, and a door to the **south terrace** over the study.

## How the plan is checked

`node tools/check-layout.mjs` reports any furniture that overlaps a wall or another piece, sits outside a room, or is inside the 3 ft clear zone on either side of any door or opening. It also prints first-floor covered area against the 75% limit. `--svg DIR` draws a scaled plan of each floor with the clear zones shaded. The current plan reports **no problems**.

## Things to decide next

- **Master bedroom size:** it is slightly smaller than bedrooms 2 and 3, because the courtyard and the 75% limit box it in. It can grow by taking space from bath 4 or bedroom 4.
- **Gate corner:** south assumed. It decides where the cars park.
- **Basement:** yes or no.
- **Style versions:** Mediterranean, Spanish and others on this same plan.
