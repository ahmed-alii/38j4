# Research

The research and output behind the three houses. The site itself is in the repository root.

| Folder | What it holds |
|---|---|
| `references/` | The owner's reference images (Pinterest pins, bedroom and backyard ideas) and the contact sheets made from them for plot 39 |
| `satellite/` | Satellite mosaic around the plot pin (32.2696° N, 74.1189° E) and OpenStreetMap data used to size the road and the neighbours |
| `bylaws-text/` | Text extracted from the DHA Gujranwala Construction & Development Regulations 2022 and the summary sheet (the PDFs are in `docs/sources/`) |
| `plans/` | Floor plans drawn by `tools/check-layout.mjs` for each design: Scheme A (plot 38), Casa J-4 (plot 39), Haveli J-4 (plot 37). Yellow = 3 ft door clearance, red edge = front of a piece of furniture |
| `gallery/` | Final views of each house (exterior, cutaways, walk-in rooms), plus the car models |
| `model-contact-sheets/` | Poly Haven furniture candidates reviewed before choosing the models in `models/furniture/` |

## Written research (in `docs/`)

- `bylaws-1-kanal.md`: the bye-laws that apply to a 1 kanal plot, with clause numbers
- `design-brief.md`, `requirements.md`: the owner's brief and interview answers
- `resources.md`: architecture resources, 3D assets and tools considered
- `scheme-a.md`, `plot39-casa-j4.md`, `plot37-haveli-j4.md`: design notes for each house
- `plot39-review.md`: the design review of Casa J-4 and the planning rules used afterwards

## Open-source house-planning projects surveyed

- [darkspock/bigbangplanner](https://github.com/darkspock/bigbangplanner)
- [egmalt/house-planner](https://github.com/egmalt/house-planner)
- [kasiopajg/kasiopa-home-plans](https://github.com/kasiopajg/kasiopa-home-plans)
- [oyekamal/freecad-claude-house-designer](https://github.com/oyekamal/freecad-claude-house-designer)
- [viettranx/3dviz-pro-max](https://github.com/viettranx/3dviz-pro-max)

## Third-party 3D sources

- Furniture: Wayfair product scans from [KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) (CC BY 4.0) and [Poly Haven](https://polyhaven.com/models) (CC0). See `models/furniture/CREDITS.md`.
- Cars: Civic Type R from [Liooo0/lio-fl5-3d](https://github.com/Liooo0/lio-fl5-3d) (based on a Sketchfab model, CC BY-NC-ND 4.0) and Land Cruiser 200 from [ffaz/landcruiser-3d](https://github.com/ffaz/landcruiser-3d). See `models/cars/CREDITS.md`.
- Avatar: Mixamo X Bot from the three.js examples. Textures and sky: Poly Haven (CC0).
