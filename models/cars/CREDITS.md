# Car model credits

The owner asked for these third-party models to be used for private visualisation only. Each `.json` holds one glTF binary, base64-encoded. Textures were shrunk to 1024 px WebP and meshes compressed with meshopt (gltf-transform).

- `civic.json`: "Honda Civic Type R FL5 Custom" by blakebella on Sketchfab (https://sketchfab.com/3d-models/honda-civic-type-r-fl5-custom-407a8981be2d45a388d7280d9b931663), licensed CC BY-NC-ND 4.0. Taken from https://github.com/Liooo0/lio-fl5-3d. The page scales it to the real 2,735 mm wheelbase and repaints it at load time; the file's shapes are unchanged.
- `landcruiser.json`: Toyota Land Cruiser 200, adapted from "Land cruise 2016" by ZIRODESIGN. The body and default parts from https://github.com/ffaz/landcruiser-3d were merged into one file, following that repository's parts manifest. The source licence applies.

If either model is unavailable, js/cars.js draws both cars from the makers' published dimensions instead.
