# Resources collected for the model

## Site data

| What | Source | Used for |
|---|---|---|
| Allotment card | Owner's photo: Phase 1, Sector J-4, Plot 38, 1 Kanal, Residential | Plot identity, size |
| Map pin | Google Maps share link → 32.2696086 N, 74.1188972 E | Sun position, orientation |
| Satellite view | Esri World Imagery tiles, zoom 18 (`sources/satellite-around-pin.png`) | Street grid runs N–S within ~1–2°; the pin is in the west-facing row, ~19 m from the road centre; the road reads as roughly 40 ft. Plots around it were still empty in the imagery. |
| OpenStreetMap | api.openstreetmap.org | Almost nothing is mapped in J-4 yet, so no help |
| Bye-laws | dhagwa.com: Regulations 2022 + summary sheet (`sources/`) | All rules in `bylaws-1-kanal.md` |

## Architecture knowledge (Claude skills)

| Repository | Licence | What we take from it |
|---|---|---|
| [oyekamal/freecad-claude-house-designer](https://github.com/oyekamal/freecad-claude-house-designer) | MIT | 17 Claude skills for residential design and engineering written around Pakistani practice (spatial planning, typology, climate, stairs, openings, RCC frame, seismic, MEP, roofing, BOQ / cost). Distilled for this plot in `design-brief.md`. |
| [darkspock/bigbangplanner](https://github.com/darkspock/bigbangplanner) | MIT | Claude skill + three.js kit for walkable home models. Single storey only, so we did not use it as the engine, but we follow its approach: the house is a data file in real units, furniture is procedural, and the user's real measurements always win. |
| [kasiopajg/kasiopa-home-plans](https://github.com/kasiopajg/kasiopa-home-plans) | MIT | 2D plan + electrical / plumbing layer editor. Candidate for the services drawings stage. |

## 3D / rendering

| Resource | Licence | Use |
|---|---|---|
| [three.js r170](https://threejs.org) (via jsDelivr) | MIT | Renderer, orbit controls, sky shader, CSS2D labels |
| [Poly Haven](https://polyhaven.com) textures (`../textures/`) | CC0 | dry ground, grass, asphalt, brick, plaster, concrete, paving, marble, wood floor |
| NOAA solar position equations | public domain | Real sun angle for any date and time at the plot (`js/sun.js`) |
| X Bot (`examples/models/gltf/Xbot.glb`, three.js repo; character and idle/walk/run animations from Adobe Mixamo) | Mixamo terms: free to use in projects | The owner's avatar, scaled to 5′10″ (`models/avatar.json`: the GLB as base64, because published pages don't serve .glb) |

### Considered for later stages

| Resource | Licence | Why it may help |
|---|---|---|
| [furnishup/blueprint3d](https://github.com/furnishup/blueprint3d) (2k★), [cvdlab/react-planner](https://github.com/cvdlab/react-planner) (1.5k★), [laanlabs/openPlan3D](https://github.com/laanlabs/openPlan3D) | MIT | Floor-plan editors to look at if the owner wants to drag walls themselves |
| [egmalt/house-planner](https://github.com/egmalt/house-planner) | MIT | True-scale plan with satellite overlay and bill of materials |
| Poly Haven models / HDRIs, Kenney furniture kit | CC0 | Furniture and lighting once the layout is fixed (all assets ship inside the repo: published pages cannot load from these hosts at runtime) |
