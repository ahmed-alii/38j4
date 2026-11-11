# Dream homes: Plots 37, 38 and 39, Sector J-4, DHA Gujranwala

Walkable 1:1 three.js models of three 1 kanal (50 × 90 ft), west-facing plots side by side, each designed against the DHA Gujranwala Construction & Development Regulations 2022.

**Live site:** https://ahmed-alii.github.io/38j4/

| Plot | Design | Character |
|---|---|---|
| 39 (`#plot-39`) | **Casa J-4** | Mediterranean stone and stucco villa: double-height arched hall, loggia, raised plunge pool. 5 bedrooms. Rev 3 after a design review (`docs/plot39-review.md`). |
| 38 (`#plot-38`) | **Scheme A** | Contemporary house with a side courtyard and a basement option. |
| 37 (`#plot-37`) | **Haveli J-4** | Traditional South Punjab house in brick and Multani tiles, arched verandas, wind tower, tehkhana basement option. 3 bedrooms. |

Each plot shows the other two next door. **Explore** orbits the model; **Walk in** puts a 5′10″ avatar inside (arrow keys or WASD to walk, Shift to run, mouse to look, V for first person). The panel (P to hide) switches floors and the basement option, and shows the bye-law checks. Furniture and cars are real 3D models at true size (credits in `models/*/CREDITS.md`).

The research behind the designs (bye-laws, brief, references, plans, gallery) is in `docs/` and `research/` (index in `research/README.md`).

## Run it locally

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

No build step. three.js loads from jsDelivr; everything else is in this repository.

## Layout

```
index.html        page + UI
js/config.js      the plot, setbacks, levels and rules (edit here)
js/site.js        builds the site geometry
js/sun.js         NOAA solar position for 32.27° N
js/avatar.js      your 5′10″ avatar: walk-in mode in third or first person (keyboard, mouse, touch)
models/avatar.json animated figure (X Bot from the three.js examples) as base64 GLB, scaled to 5′10″ at load
models/furniture/ real furniture models (Wayfair CC BY 4.0, Poly Haven CC0) as base64 GLB; see CREDITS.md
js/catalog.js     furniture catalogue: loads the models and swaps them in for the stand-ins at true size
js/cars.js        the family's cars: detailed models of a Civic Type R and a Land Cruiser 200 (models/cars/, see CREDITS.md), with drawn stand-ins built to the published dimensions
js/designs/       one file per design, in feet: scheme-a.js (plot 38), plot39.js (Casa J-4, plot 39), plot37.js (Haveli J-4, plot 37)
js/house.js       builds a design: walls with openings and arches, slabs, voids, stairs, roof, garden, pool
js/foliage.js     trees, climbers and hedges from instanced leaf cards
js/render.js      realistic pipeline: ambient occlusion, bloom, tone mapping, SMAA
js/geom.js        rectangle union/subtraction used for slabs, parapets and railings
js/main.js        scene, sun/sky, views, layers, floors, measuring tool
tools/check-layout.mjs  checks furniture against walls, each other and door clearances; draws plans
textures/         CC0 textures from Poly Haven (512 px)
docs/             bye-law digest, design brief, resource list, source PDFs
```

## Scale and axes

1 three.js unit = 1 metre. x points east, y up, z south. The origin is the plot's north-west corner (front-left as seen from the road), at the level of the road crown, which is DHA's height datum.

## Assumptions to confirm

- Road right-of-way ~40 ft (estimated from satellite).
- Gate on the south corner (so both cars fit nose-in in front of the stair core).
- Yard 6″ above road crown, plinth 1′ 6″, 12 ft floor-to-floor.
- Street grid exactly north–south (`gridRotationDeg` in `js/config.js` if a site survey says otherwise).
