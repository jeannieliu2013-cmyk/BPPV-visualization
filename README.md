# BPPV / Epley GitHub Pages version

This project is a compact restructuring of the original
`Epley_maneuver_simulation-2.html`.

## What was preserved

- Original Plotly initial figure data
- Original Plotly layout and configuration
- All 2,479 animation frames
- All five stages
- All original frame names and titles
- All canal coordinates
- All axis coordinates
- All head-mesh coordinates and mesh connectivity
- All otoconia positions
- Original frame timing: 30 ms
- Previous / Next buttons
- Enter and arrow-key controls

## Why the file became much smaller

The original HTML was approximately 134.0 MiB.

The original Plotly animation repeated the same stage-static traces in every frame.
Within each stage, traces 0, 1, 2, 3 and 5 are identical from frame to frame.
Only trace 4 changes.

The compact `data/simulation.json` therefore stores those repeated traces once
per stage and stores only the changing trace plus frame metadata for each frame.
`js/simulator.js` reconstructs the original frame objects in the browser.

Only the current stage is expanded into Plotly frames, so the browser does not
need to retain all 2,479 expanded frames simultaneously.

The large embedded Plotly JavaScript bundle was also removed from the HTML.
The page loads the exact Plotly 3.7.0 library from Plotly's CDN.

## GitHub Pages

Upload this folder to a GitHub repository and enable GitHub Pages from the
repository's Pages settings. `index.html` is the entry page.

Important: the JSON file must remain at:
`data/simulation.json`

and the JavaScript file at:
`js/simulator.js`

## Important

Keep the original 140-MB HTML as an archive. This compact project is derived
from it; it is not necessary to keep the huge HTML in the GitHub Pages branch.
