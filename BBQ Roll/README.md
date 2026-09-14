# BBQ maneuver simulation — Epley-style 7-trace template

This package follows the same data architecture as the working Epley template supplied by the user, adapted to the BBQ maneuver's 7 Plotly traces.

## Seven traces in every reconstructed frame

1. Right Horizontal Semicircular Canal
2. +X anterior axis
3. +Y left axis
4. +Z superior axis
5. Otoconia 1
6. Otoconia 2
7. Head mesh

The JSON stores the five traces that are unchanged within a stage once (`0,1,2,3,6`) and stores both moving otoconia traces (`4,5`) for every frame. `js/simulator.js` reconstructs the complete 7-trace frame in the original trace order before calling `Plotly.addFrames()` once.

There are 2,532 frames across 10 stages. Buttons animate the existing frame names; they do not delete or reload frames.
