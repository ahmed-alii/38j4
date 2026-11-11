# 1-Kanal West-Facing House, DHA Gujranwala: Design Brief

**Plot:** 50' × 90' (4,500 sq ft), road on the **west**, 32.27°N 74.12°E. G+1 + mumty (+ optional basement). Height cap 35' above road crown.

> **Checked against the official DHA Gujranwala Regulations 2022 (see `bylaws-1-kanal.md`).** The skills quote DHA Lahore figures. For Gujranwala, the setbacks, the 75% first-floor rule, the 300 sq ft stair tower, the 9′6″–12′ ceilings, the 12′–18′ porch depth and the 7′ boundary wall are all confirmed in the GWA text. GWA also settles the open height question: the stair tower **is** inside the 35′ limit, and only a lift machine room may reach 41′ (bye-law 11d). With a 1′6″ plinth and 12′ floor-to-floor on both floors, a 9′ stair tower tops out at 34′6″.

**Source tags.** `[SP]` spatial-planning, `[TY]` building-typology, `[ST]` stairs-vertical-circulation, `[SE]` seismic-design, `[SS]` structural-systems, `[OL]` openings-lintels, `[RW]` roofing-waterproofing, `[MEP]` mep-coordination, `[GEO]` geotechnical-foundations, `[BC]` building-codes-permits, `[CE]` cost-estimation-boq, `[DD]` DESIGN_DOCUMENT.md (a Rawalpindi 5-marla study). **`[GK]`** marks my own general knowledge or my own arithmetic, not taken from the files. The skills themselves label many numbers "T4 practice" or "unverified". None of this replaces a PEC engineer, a PCATP architect, or the DHA Gujranwala bylaw schedule.

---

## 0. The legal envelope, in numbers

| Item | Value | Note |
|---|---|---|
| Setbacks | Front 15'9", rear 5'4½", sides 5'4½" | These match the **DHA Lahore** 1-kanal table exactly `[BC §5.1]`. Model the ½" exactly; rounding down is an encroachment. |
| Buildable footprint | **39'3" (N–S) × 68'10½" (W–E) ≈ 2,703 sq ft = 60% coverage** `[GK arithmetic]` | That is below the 65–70% the typology examples assume (2,925–3,150) `[TY §3.4]`. **The ground floor is the binding constraint on this house.** |
| First floor | ≤ 75% of permissible GF ≈ **2,027 sq ft** | Matches the DHA Lahore rule `[BC §5.2]` |
| Mumty | ≤ 300 sq ft | |
| Above-grade total | **≈ 5,030 sq ft** | Within the 1-kanal market range of 4,710–5,770 `[TY §3.4]` |
| Basement (optional) | One storey only; **not under the car porch**; clear height 9'0"–10'0"; soil report mandatory for DHA | DHA Lahore rules `[BC §7.2]`. Confirm them for Gujranwala. |
| Ceiling height | 9'6"–12'0" (your brief) | Same as DHA Lahore `[BC §5.2]` |
| Car porch | Depth 12'–18' (+2' projection allowed); clear height ≥ 9'0" and ≤ GF height | DHA Lahore `[BC §7.1]` |
| Boundary wall | Max 7'0" | `[BC §7.3]` |
| Distance to neighbours | **10'9" wall-to-wall** on N, S and E (5'4½" + 5'4½") | `[GK]` This drives daylight and privacy more than anything else. |

**Height stack check** `[GK arithmetic using SP/SS/RW values]`: plinth 2'0" + GF floor-to-floor (F2F) 11'6" + FF F2F 11'6" puts the roof slab top at 25'0". Add the inverted roof build-up (~1'0") and a 3'6" parapet and you reach about 29'6". A mumty (≈ 9'0" F2F) tops out at about **34'6"**. **If you choose 12'+ F2F on both floors, the mumty breaks 35'** unless DHA excludes the mumty from the height measurement. Verify that before fixing ceiling heights.

---

## 1. Climate and orientation

### 1.1 Sun angles for 32.27°N (skill formula `[SP §6.2]`, my arithmetic)
| | Noon altitude |
|---|---|
| Summer solstice | **81.2°** |
| Equinox | 57.7° |
| Winter solstice | **34.3°** |
| Courtyard W/H factor for winter sun to reach the floor | 1/tan(34.3°) = **1.47** |

- **South window chajja** (7 ft / 2.1 m window): D = 2.1/tan 81.2° = **0.33 m (13")**. A 12–18" chajja gives full June noon shade and lets in ~89% of winter sun `[SP §7.5 method]`. Practice is 12–24" over every opening, doubling as rain protection `[SP §7.5]`.
- **West window:** at a 4 pm altitude of about 27°, D = 2.1/tan 27° = **4.1 m (13'+)**. **No horizontal overhang works on the west** `[SP §7.5; DD §5]`. The options are jaali, vertical fins, external louvres/shutters, a 6–8 ft (1.8–2.4 m) verandah, or no window at all. A chajja may go up to 900 mm (3') on west façades `[OL §7.4]`, but that only gives partial shade.

### 1.2 What "west-facing" means here
- The **street façade takes the full afternoon load during peak heat** (≈ 45°C). Morning low sun on the east comes at cooler ambient temperatures, so east and west are not symmetric `[DD §5]`.
- The skills' worked example **"1 Kanal, 50×90, west-open"** `[SP §12.3]` sets the strategy:
  1. Make the west strip a **buffer**: porch, garage, stair, store, servant room and baths. **0% west-facing habitable glazing.**
  2. Put an 8 ft deep verandah along the west entrance face, with a jaali screen on it.
  3. Add a centred courtyard with its long axis E–W (see 1.4).
  4. Put all bedrooms on the north and east, and the living/lounge on the south with a ~0.30 m chajja.
  5. Use 13.5" brick external walls on the west and south faces for thermal mass. That example was for Multan; in Gujranwala it is an option, not a requirement.
  6. Roof: 75 mm insulation plus a shaded terrace.
- **WWR targets** `[SP §7.4]`: North 20–30%, South 15–25%, East 8–12%, **West 0–8%**. The worked example used N 25 / S 18 / E 8 / W 0.
- **Site-specific caveat `[GK arithmetic]`:** the side galis are only 5'4½", with G+1 neighbours 10'9" away. In winter a 25 ft neighbour to the south throws a shadow about 37 ft long, so **your south side wall gets almost no direct winter sun on either floor**, and N/S side windows deliver diffuse light only. Winter solar gain therefore has to come from the **courtyard** and roof terraces, not from the side walls.

### 1.3 Room placement (Punjab default `[SP §7.3]`, adapted to this plot `[GK]`)
| Zone | Rooms |
|---|---|
| **West (street, buffer)** | Car porch (W/SW), foyer, stair, guest WC, store. The drawing room "can absorb a poorer aspect" because it is occupied for few hours `[SP §7.3]`, so it is acceptable at the NW front behind a jaali/verandah. |
| **North** | Bedrooms, kitchen. The north light is soft but comes across a 5'4½" gali. |
| **East (rear)** | GF bedroom, dining (gets morning light), kitchen/dirty kitchen. **The kitchen must never face west** `[SP §7.3]`. |
| **South** | Lounge, facing the courtyard rather than the gali |
| **Centre** | Courtyard, long axis E–W |
| **Roof** | Insulate it. It is the largest solar-gain surface, and treating the roof is the first move, not the last `[SP §7.5]`. |

Indicative zoning `[GK synthesis, not a plan]`:
```
            N  (5'4½" gali)
 ROAD │ Drawing+WC │Foyer│                     │ Kitchen  │ Dirty kit │
  W   │ (guest     │Stair│  COURTYARD ~16×20   │ Dining   │ Laundry   │  E
15'9" │  entry)    │     │  (E–W long axis)    │──────────│───────────│
lawn/ │ Car porch  │Store│  Lounge on its      │ GF bed + │ Servant + │
drive │ 18×20 (SW) │ WC  │  south/north edge   │ bath (NE)│ WC (SE)   │
            S  (5'4½" gali, service access to the rear)
```

### 1.4 Passive strategies
- **Courtyard:** the skills recommend **18×20 to 20×24 ft** for 1 kanal `[SP §6.3]`. With only 39'3" of footprint width, about **14×16 to 16×20 ft** is realistic `[GK]`. For a two-storey wall of H ≈ 25 ft, a 16 ft width gives **W/H ≈ 0.64**, inside the hot-dry optimum band of 0.3–0.7 `[SP §6.3]`. Keep the plan proportion between 1:1 and 1:2. Put planting or water on ≥ 30% of the floor, retractable shade from May to September, an openable door or window from every adjacent room, a high-level outlet at the stair or mumty, and a floor drain at ≥ 1:100 `[SP §6.4]`. Placed between the guest front and the family rear, the courtyard also serves as the **purdah divider**.
  - `[GK arithmetic]` If the FF is two-storey on the courtyard's south side, winter sun reaches the courtyard's north wall only above ~14 ft, so only FF windows get it. **Use the 25% FF reduction to keep the courtyard's south side single-storey.** Winter sun then reaches down to about 3–4 ft above the GF floor, which lets it into the GF lounge.
  - **Seismic flag:** the courtyard is a hole in the diaphragm. Centre it, give it edge beams on all four sides, and tell the engineer explicitly `[SP §2.6, §9.4]`.
- **Light wells** for internal baths: 4×4 ft minimum, 4×6 ft for two baths. Never cap one with a fixed skylight; use a louvred rooflight `[SP §6.5]`.
- **Cross-ventilation:** every habitable room gets openings on two walls. Make outlet area 1.25–1.5× inlet area, with inlets low on the shaded side and outlets high. Put a **roshandan (2'×1'6") over every internal door** `[SP §7.6]`. The **stairwell plus a louvred mumty vent works as the stack chimney** and needs no wind `[DD §6]`.
- **Jaali:** use it on west and courtyard-facing openings, the upper courtyard walls and the roof parapet. It **screens view and radiation but does not boost airflow** `[DD §3.1]`. Use hinged or sliding panels so they can be closed in winter `[DD §4]`. Jaali walls cost 30–60% more than plain wall per sq ft `[TY §13.3]`.
- **Ceiling height** is itself a passive measure because hot air stratifies above head height `[SP §3.4]`. Daylight reaches about 2–2.5× the window head height into a room, so a 7' head lights about 14–17 ft deep. Rooms deeper than that need a second aspect `[SP App. C]`.
- **Winter fog/cold:** close the mumty louvres, rooflights and roshandans, and open south/courtyard curtains by day `[DD §4, §6]`. **Monsoon:** evaporative cooling weakens at high humidity `[DD §3.1]`. Design rainfall is 75–100 mm/hr for the Punjab plains `[RW §5.2]`.
- `[GK]` Gujranwala's prevailing wind direction is not in the skills; they only give Lahore (SW optimal) and Islamabad (N/SE). Get a wind rose from PMD.

---

## 2. Program and spatial planning

### 2.1 1-kanal program `[TY §3.4, §4; SP §3.5–3.6]`
5–6 bedrooms, 5–7 baths plus a powder room plus a servant WC, 2–3 cars, **drawing room with its own guest WC and preferably its own entrance**, GF and FF family lounges, dining, kitchen + **dirty kitchen** + pantry, dedicated laundry, 2 stores, **servant quarter with its own WC and external entry**, **prayer room 8×8 ft** with a wudu point, a study, and roof terrace + mumty. **Always provide one GF bedroom with an attached bath** for elderly or guest use `[SP §9.2]`. A **service stair** (~120 sq ft per floor) becomes worthwhile at 1 kanal `[TY §3.4]`. **Set the FF back** to create terraces `[TY §3.4]`.

### 2.2 Room sizes (internal clear, feet)
| Space | Code floor (NBC, T2) `[SP §3.1]` | 1-kanal practice `[SP §3.2]` | Typology variant `[TY §3.4]` |
|---|---|---|---|
| Master bedroom | 81 sf (≈9×9); **workable minimum 12×14** | **16×18** | 18×16 + dressing + bath |
| Other bedrooms | 81 sf | 14×16 | 14×15 |
| Drawing room | — | 16×20 | 20×16 |
| Family lounge | — | 18×22 | 20×18 |
| Dining | — | 14×16 (8-seat needs 9'6"×14') | 16×14 |
| Kitchen | 54 sf | 16×16 or 18×12 (island: 42" clear on all sides) | 14×12 |
| Dirty kitchen | — | 8×10 | 10×8 |
| Attached bath | 30 sf (5×6) | 6×9 (min 3-fixture 5×8) | — |
| Common bath / powder | 12 sf WC | 6×8 / 4×6 | — |
| Store / laundry | — | 7×9 / 7×9 | — |
| Servant room + bath | — | 10×12 + 5×7 | — |
| Stair well (dog-leg) | — | **9×14** | — |
| Car porch | 9×18 per car | **18×20 (2 cars)**, SUV 9×20 | — |
| Foyer | 5×6 min | 7×8 comfortable | — |
| Prayer room | — | — | 8×8 |

Furniture checks `[SP §3.3]`: king bed 6'×6'6" with a 2'6" side aisle, 3' at the foot if a wardrobe is there, wardrobe 2' deep + 3' clear. Kitchen aisle 42" for one cook, 48" for two. Shower 36×36" minimum. Drawing-room sofa set (3+2+1+1) needs about 11×13 ft clear.

**Fit test `[GK arithmetic using SP §3.8 method]`:** the full T4 GF list (drawing, dining, lounge, kitchen, dirty kitchen, GF bedroom + bath, powder, store, laundry, servant + WC, foyer, prayer) needs about **1,915 sf carpet**. Available is 2,703 − 360 (porch) = 2,343 × 0.70–0.75 net-to-gross ≈ **1,640–1,760 sf**, giving a **ratio of 1.09–1.17, which does not fit.** The FF (master suite + 3 beds of 14×16 with baths + lounge ≈ 1,506 sf against ~1,460–1,520 available) is tight. Resolve this by moving the servant quarter, laundry and stores to a **basement** or the FF, merging dining into the lounge, or using bedrooms of 14×15. **Five bedrooms total (1 GF + 4 FF) is the realistic ceiling.**

### 2.3 Zoning and purdah rules `[SP §3.5, §4.4; TY §3.4]`
- The **drawing room opens directly off the entrance, with its own WC and no sightline into the family lounge.** A guest must never cross the family zone to reach a WC. "A drawing room a guest reaches only by crossing the family lounge is the defining failure" on kanal plots.
- The main door must never open straight onto the lounge. Use an **L-turn, a screen wall 4–5 ft inside the door, or a foyer**. Put the powder room off the foyer or drawing room, never off the family passage. Include a 2'×3' shoe niche.
- The dirty kitchen goes at the rear, externally ventilated, next to the kitchen and the rear open space. The servant quarter gets an external entry. Here the **side gali (5'4½") is the service route**, and the skills treat it as a design asset `[TY §3.4]`.
- The roof must be reachable without passing through a bedroom. **The stair lands in circulation, never inside a room** `[SP §5.4]`.
- If the FF might ever be let separately, the stair has to be reachable from the porch without entering the GF house. That decision is permanent `[SP §5.4]`.
- Bath windows go high (sill ≥ 6') because of the narrow galis. Roof parapet: 1.0–1.1 m solid plus jaali up to about 1.5–1.65 m where neighbours overlook `[DD §12]`.

### 2.4 Circulation `[SP §4.1]`
| Situation | Width |
|---|---|
| Absolute minimum, finished faces | 3'0" (frame at 38") |
| Passage serving 1–2 rooms | 4'0" |
| Passage serving 3+ bedrooms | 4'6" |
| Main spine / gallery | 5'0"–7'0" (Pakistani vernacular is 7'0") |

Targets: circulation 8–14% of covered area (over 18% is waste), walls 8–12%, stair 4–6% per floor at 1 kanal `[SP §4, §10; ST §7.3]`.

---

## 3. Stairs and vertical circulation

**Safe design envelope** `[ST §3.4]`: riser **≤ 180 mm (design 175)**, tread **≥ 275 mm**, clear width **≥ 1000 mm** (1050–1200 for a main stair, 1200 if a future stairlift is possible), headroom **≥ 2100 mm**, **≤ 12 risers per flight**, landing ≥ stair width and ≥ 1000 mm, handrail 900 mm, guard 1000 mm, balusters < 100 mm apart, 2R+T target 620 (range 600–640) `[SP §5.1]`. Pakistan has no verified BCP stair clause, so these values come from IRC/NBC; confirm them with DHA `[ST §3.3]`.

**Stair geometry for this house** `[GK arithmetic using ST §1 method]`, with 280 mm treads and 1100 mm flights:
| F2F | Risers | Riser | 2R+T | Dog-leg clear well (L × W) |
|---|---|---|---|---|
| 11'0" (3353) | 20 (10+10) | 168 mm | 616 | 3720 × 2350 mm (12'2" × 7'9") |
| 11'6" (3505) | 20 (10+10) | 175 mm | 631 | 3720 × 2350 mm (12'2" × 7'9") |
| 12'0" (3658) | 21 (11+10) | 174 mm | 628 | 4000 × 2350 mm (13'1" × 7'9") |
| 12'6" (3810) | 22 (11+11) | 173 mm | 626 | 4000 × 2350 mm (13'1" × 7'9") |

- Gross well with walls is about **9×14 ft**, the skills' 1-kanal figure `[SP §3.2]`. With 1200 mm flights the width becomes 8'4" clear.
- At 1 kanal the stair can be **a straight run with a mid-landing as an entrance-hall feature** `[ST §7.3]`. At 20 risers that is about 9×280 + 1000 + 9×280 = 6.04 m (19'10") × 1.2 m `[GK]`.
- Open-well (3 flights) needs about 2.7 × 3.3 m and suits 1 kanal+ because it lets light down the well `[SP §5.3]`.
- **Headroom at the half-landing** (11'6" F2F): 1752 − 150 waist − 25 = 1577 mm, which reaches 2100 about 3 treads back `[GK, SP §5.2 method]`. **Under a dog-leg flight there is only ~1430 mm, so do not put a WC there** `[ST §13]`.
- **Stack the stair exactly on every floor, with the mumty directly over it** `[SP §5.4]`. **The roof flight must use the same riser and tread as the main stair** (the most common Pakistani stair fall) `[ST §16]`. `[GK]` The 300–500 mm roof build-up adds to the last flight's rise, so plan for one or two extra risers or a sunk mumty slab.
- Put a window on the half-landing (3'×4', sill 900) `[SP §4.3]`.
- **Home lift:** reserve **1525 × 1525 mm (5×5 ft)** stacked closets on GF and FF with a removable floor panel, a spare 20 A circuit and a conduit, and tell the engineer about the pit and header beam now `[accessibility §8.4]`. The stairs skill gives a minimum aligned void of **1000 × 1400 mm** for a through-floor lift `[ST §14]`. `[GK]` A typical machine-room-less home lift needs a 150–300 mm pit and about 2.8–3.2 m of overhead above the top stop. If it serves the roof, the mumty must enclose it, which counts against both the 300 sf and the 35' limits.

---

## 4. Openings and walls

**Walls** `[SP §9.3; TY §11.2]`: external **9" (230 mm)**, partitions **4.5" (115 mm)** (must be restrained at the top and ends), wet/plumbing walls **9" minimum**, internal load-bearing walls 9". Brick is 9×4.5×3". Plaster is 12 mm inside and 20 mm outside, **deducted from clear dimensions**.

**Doors** `[SP §4.2]` (leaf, W×H): main entrance 3'6"×7'0" single or 2× 3'0"×7'6" double; bedroom and kitchen 3'0"×7'0"; bath and store 2'6"×7'0" (2'10" for accessibility); French door 2× 2'6"×7'0". The openings skill uses 900/750 × 2100 mm `[OL §1.3]`.

**Windows** `[SP §4.3; OL §1.3, §7.1]`:
| Opening | Size | Sill |
|---|---|---|
| Bedroom | 5'×4' or 6'×4' | 3'0" (900) |
| Lounge / drawing | 6'×5' or 8'×5' | 2'6"–3'0" (750–900) |
| Dining | 5'×4' | 900 |
| Kitchen | 4'×3' | 4'0" (1200) |
| Bath | 2'×2' or 3'×2' | 5'–6' (1500–1800) |
| Roshandan | 2'×1'6" | over the door head (1980) |
| Stair landing | 3'×4' | 900 |

- **Use one head height per storey: 7'0" (2134) or 2250 mm.** That gives a continuous lintel band, which is also a seismic band `[OL §1.3]`.
- Openable area must be ≥ 1/10 of floor area. Sliding windows halve the openable area.
- Each bedroom needs one escape window: ≥ 5.7 sf, ≥ 24" high, ≥ 20" wide, sill ≤ 44", with a quick-release grille `[SP §4.5]`.
- **Lintels:** 115 mm for openings ≤ 1.0 m, 150 mm for 1.0–1.5 m, 230 mm for 1.5–2.1 m; anything over 2.1 m needs a designed beam `[SS §6.3]`.
- **Chajja:** 450–600 mm typical, up to 900 mm on the west; 75 mm at the root tapering to 50 mm; cast monolithic with the lintel `[OL §7.4]`.
- **No corner windows (Zone 2B+)**; keep openings ≥ 600 mm from corners `[SE §4.5]`.
- The porch opening (3.0–4.5 m) is a portal frame, and the street wall is usually the weakest lateral line `[OL §6.4]`.

---

## 5. Structure

- **Seismic zone:** the skills list **Gujranwala in Zone 2B** (PGA 0.16–0.24 g, Z = 0.20) under BCP SP-2007, with the caveat "indicative, verify against the official map" `[SE §1.2]`. In 2B: no unreinforced masonry, **a plinth beam is mandatory** (min 230×300, 4#12), no corner windows, no soft storey, no short columns `[SE]`. Section numbers are not page-verified, so do not cite them `[TY §11.4]`.
- **System:** an RC frame is standard at 1 kanal `[TY §3.5]`.
  - **Bays of 3.5–5.0 m (12–16 ft)** are the sweet spot; beyond 6 m, beam depth gets intrusive. Columns sit inside wall lines, at least 3 per direction, with corner columns upsized `[SS §7.5; SP §9.4]`.
  - `[GK]` One fit for this footprint: 39'3" width → 3 bays of about 12'10" (or 15' + 8'6" passage + 15'); 68'10" depth → 5 bays of about 13'7", adjusted around the courtyard and porch.
- **Columns** (Zone 2B, G+1) `[SS §7.3]`: **300×300 mm (12×12)** for tributary areas ≤ 20 m², 300×380 for 20–28 m². A 12" column in a 9" wall projects 3", within the ~100 mm tolerance. Common practice also uses 9×12 / 12×12 `[SS §3.2]`.
- **Slabs** `[TY §11.3; SP §9.4]`: 5–6" (125–150 mm) up to 14 ft spans, **7" at 16 ft, 8" at 18 ft, ~8.6" at 20 ft**. An 18×22 lounge therefore needs a beam or a deep slab.
- **Beams** (total depth including slab) `[SS §6.2]`: 4.0–4.5 m span → 12" (230×300); 5 m → 14" (230×380); 6 m → 15" (230×460); **18 ft porch → 18" deep** `[SP §9.4]`. Common sections are 9×15 / 9×18 `[SS §3.2]`.
- **Heights** `[SS §3.2; TY §12.1; SP §3.4]`:
  - Practice F2F is 10'6"–11'6"; premium drawing rooms 11'6"–12'6".
  - The skills' modelling default is 3200 mm, or **3350 mm (11'0") for a generous house**.
  - Baths 9–10 ft; keep ≥ 7'0" under beams at doors.
  - **Plinth 1'6"–2'6"** above road crown.
  - Porch clearance: an 18" beam over an 8' clear porch puts the soffit at about 9'6", so coordinate it with the DHA 9' minimum porch height `[SP §9.4]`.
- **Foundations:** upper-Punjab alluvium (silty clay/fine sand) has SBC of about 100–150 kPa at 1.2–1.5 m, and the **water table is 3–12 m (higher near canals)**. Isolated or strip footings at 1.2–1.5 m (4–5 ft) are usually adequate `[GEO §8.4]`. A basement needs this plot's own soil report `[SP §2.4a]`.
- **Service zone** under beam soffits: allow 200–350 mm `[MEP §7.1]`.

---

## 6. Roof, waterproofing and MEP items that take up space in the model

| Item | Size / rule |
|---|---|
| **Roof build-up** (inverted, recommended for hot climates) | Slab + screed to **1:40** fall + 2-ply membrane + **50–75 mm XPS** + geotextile + pavers: **300–500 mm (12–20") total**, 5.2–9.3 kN/m² `[RW §4.2]`. The alternative is brick-bat coba at 230–290 mm including the slab `[RW §4.3]`. Avoid cold roofs `[RW §4.4]`. **Use a light-coloured finish** `[DD §10]`. |
| Parapet | 1.0–1.1 m; membrane upstand ≥ 150 mm; coping overhang ≥ 40 mm `[RW §5.5]`. Parapets need seismic ties. |
| Roof drainage | At least 2 outlets plus an overflow scupper; 75–110 mm downpipe per ~40–60 m² of roof `[MEP §6.3; DD §10.3]` |
| **Overhead tank (OHT)** | **1,000 imp gal (4,546 L) is the common default**: ≈1.8 × 1.2 m footprint, **4.55 t**. It must sit on a plinth over a column or beam line, never mid-span `[MEP §7.2]`. The skill's range is 250–500 gal `[SP §3.5]`. |
| **Underground tank (UGT)** | 1,000–2,000 imp gal (sizing: OHT = ⅓–½ of a day, UGT = 1–2 days, at 135–200 L/person/day). Place it under the porch or lawn, clear of footings, ≥ 3 m from any septic tank `[MEP §7.2; SP §3.5]`. |
| **Septic tank** | Required separations: 3 m from the foundation, **5 m from the boundary**, 15 m from the UGT `[MEP §10.1]`. **None of these fit on this plot, so connect to the DHA sewer** (a sewer is very likely available `[GK]`). If one were needed anyway, 10 users → about 2.0 × 0.85 × 1.10 m liquid depth `[MEP §8.6]`. |
| **Solar PV** | 12–20 kg/m², south-facing at about latitude tilt (~32°). **Put the mumty on the north or east of the roof so its shadow misses the panels.** Zone the roof into panels / shaded terrace / mumty / OHT `[SP §9.6; DD §10.4]`. `[GK]` Allow about 6–8 m² of roof per kW including row spacing: 10 kW ≈ 60–80 m² (650–860 sf), against ~1,700 sf of available main roof. |
| Solar geyser | 150–300 L, 0.2–0.4 t, placed close to the wet stack `[MEP §7.2]` |
| **Split-AC outdoor units** | 50–120 kg each, on plinths over beams with 25 mm isolators, ≥ 150 mm from beam/column faces. Wall sleeve 65–75 mm at a 1:100 fall. Ducted units need a **350–450 mm plenum** and a 600×600 access panel `[MEP §7.1]`. `[GK]` A 1.5-ton outdoor unit is about 850×600×300 mm; expect 8–12 units on a 1-kanal house. Group them on the roof or in the side galis, never on the west façade. |
| **Plumbing shafts** | **≥ 300 × 450 mm clear** per stack group; 110 mm soil stack + vent; horizontal fall 1:40–1:60. Stack baths over baths (**never over a bedroom or drawing room**) `[MEP §6.4; SP §9.1]`. |
| Sunken bath slab | **250–350 mm** below FFL `[RW §9.3]` (150–250 mm per `[MEP §6.4]`) |
| Electrical riser | 150×150 mm, next to the stair `[SP §9.1]` |
| Kitchen exhaust | 150 mm duct through masonry, not RCC `[MEP §7.1]` |
| Gas | Exposed or chased in masonry, never cast into RCC. Keep it 300 mm from electrical. LPG never below grade (relevant to the basement) `[MEP §7.3]`. |

---

## 7. Cost ballpark (PKR, **August 2026 snapshot** `[CE §8]`; 2026 bands `[TY §13]`)

| Package | PKR/sf of covered area |
|---|---|
| Grey structure | 2,800–3,500 (lean spec 2,650; difficult sites 3,800) |
| Turnkey, A-category | **5,800–8,800** (6,700–8,800 is typical for a well-finished house) |
| Turnkey, premium | 10,000–15,000 |

- **Covered-area weights:** enclosed space and mumty 100%, porch 50–60%, open terrace 40–50% `[CE §8.5]`.
- **Gujranwala, as a secondary city, sits lower in the bands than Lahore** `[TY §13.1]`.
- **This house** (≈ 4,900–5,000 weighted sf) `[GK arithmetic]`:
  - Grey ≈ **PKR 14–17.5 M**
  - Turnkey A ≈ **PKR 29–44 M**
  - Premium ≈ PKR 50–75 M
  - The typology table gives **PKR 33 M turnkey** for a 4,710 sf 1-kanal house `[TY §13.2]`.
- **Modifiers** `[TY §13.3]`: basement +15–30% on its own area (≈ +PKR 20–25 M for 2,700 sf turnkey `[GK]`); RC frame +8–12% on grey; spans over 16 ft +5–15% on structure; service stair at full rate × 2 floors; jaali +30–60% on that wall area.
- **Add 22–39%** at schematic stage for contingency, escalation and soft costs `[DD §K]`. Boundary wall and external works are extra.

---

## 8. Interview questions for the homeowner (the ones that move the plan most)

1. **Household now and in 10 years:** how many people, their ages, any elderly or mobility-limited members, and live-in staff (how many, gender)? *This sets bedroom count, the GF bedroom, the lift reservation and the servant quarter.*
2. **Bedrooms:** how many, which need attached baths and dressing rooms, and does the master suite go on the GF or FF? *Section 2.2 shows 5 is the realistic ceiling.*
3. **Guests:** how formal is hosting? Should the drawing room have its **own external entrance** and WC? Do you host mixed-gender or segregated gatherings? Do you need a separate ladies' sitting area?
4. **Dining:** a separate formal dining room, or dining merged with the lounge? *This frees about 220 sf of GF.*
5. **Cooking:** a dirty kitchen with heavy desi cooking? An open-plan "show" kitchen with an island? Piped gas or LPG?
6. **Cars:** how many, and are any SUVs/Land Cruisers? Do you want the car porch inside the building line (it costs about 360 sf of GF) or open parking in the 15'9" front setback?
7. **Basement:** yes or no? If yes, what goes in it (servant quarter, gym, store, parking)? Budget about +15–30%. Do neighbours report a high water table?
8. **Courtyard:** central open-to-sky courtyard, glazed atrium, or none? Are you willing to give up about 250–320 sf of floor for it?
9. **Upper floor:** could the FF ever be let separately, or used as a married son's portion with its own kitchenette? *This permanently fixes where the stair goes.*
10. **Stairs and lift:** a grand straight feature stair in the entrance hall or a compact dog-leg? A service stair? A home lift now, later, or never?
11. **Ceiling height:** what clear height do you want (9'6"–12')? Is a double-height drawing or lounge desired? *The 35' cap and the mumty height make this a trade-off.*
12. **Prayer:** a dedicated prayer room (8×8) with a wudu point? What qibla alignment preference? `[GK: qibla from Gujranwala ≈ 259°, i.e. just south of west, toward the road]`
13. **Roof use:** summer sleeping, drying clothes, entertaining, solar PV (how many kW), solar geyser? Should the 25% FF reduction go to a front terrace over the porch or to courtyard-facing terraces?
14. **Climate priorities:** rely mainly on AC, or invest in passive measures (jaali, courtyard, roof insulation, minimal west glass)? How many AC units are planned, and do you want ducted or split units?
15. **Budget band and finish level** (grey only, A-category or premium), and is construction phased? *The plot's DHA phase and the exact current bylaw schedule also need to be obtained.*

---

### Quick modelling defaults for three.js `[SP §9.3; SS §3.2; OL; RW]`, chosen values marked `[GK]`
- Walls: external 230 mm, internal 115 mm.
- Plinth: 610 mm (2'0") `[GK choice within 1'6"–2'6"]`.
- Floor-to-floor: 3505 mm (11'6") GF and FF `[GK choice]`.
- Slab 150 mm; beams 230×380 / 230×460 total depth; columns 300×300.
- Door head 2134 mm; window head 2134–2250 mm; sills 900 / 750 / 1200 / 1800 mm.
- Chajja 450–600 mm (up to 900 mm on the west).
- Parapet 1050 mm; roof build-up 400 mm; mumty F2F about 2750 mm `[GK]`.
- Boundary wall 2134 mm (7'0"); porch clear height ≥ 2743 mm (9'0").
- Stair: 20 risers × 175 mm, 280 mm treads, 1100 mm flights, well 3720 × 2350 mm clear.
- Courtyard about 4.9 × 6.1 m (16×20 ft), centred, long axis E–W `[GK]`.
