# BPPV compact GitHub Pages version — frame-loading fix

This version keeps the compact `simulation.json`, but changes the JavaScript:
- reconstructs all 2,479 original Plotly frames once;
- calls `Plotly.addFrames()` once, matching the original HTML architecture;
- does NOT delete/re-add frames when Next/Previous is clicked;
- preserves the original frame trace order (including the head-mesh/otoconia
  trace swap present in the original HTML);
- Next/Previous only call `Plotly.animate()` on the existing named frames.
