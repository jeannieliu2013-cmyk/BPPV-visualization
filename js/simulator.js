(async function () {
  "use strict";

  const graph = document.getElementById("plot");
  const label = document.getElementById("stage-control-label");
  const previousButton = document.getElementById("previous");
  const nextButton = document.getElementById("next");

  function setLabel(stage) {
    label.textContent = "Stage " + (stage + 1) + " / " + sim.trajectoryLengths.length;
  }

  const response = await fetch("data/simulation.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load data/simulation.json (HTTP " + response.status + ")");
  const sim = await response.json();

  await Plotly.newPlot(graph, sim.initial, sim.layout, sim.config);

  let currentStage = 0;

  function stageFrames(stage) {
    const st = sim.stages[String(stage)];
    return st.frames.map(function (f) {
      return {
        name: f.name,
        layout: f.layout,
        data: [
          st.static["0"],
          st.static["1"],
          st.static["2"],
          st.static["3"],
          f.data[0],
          f.data[1],
          st.static["6"]
        ]
      };
    });
  }

  // Play a stage directly from the complete frame objects in JSON.
  // No frames are deleted or reloaded after a button press.
  function showStage(stage) {
    currentStage = Math.max(0, Math.min(sim.trajectoryLengths.length - 1, stage));
    const frames = stageFrames(currentStage);

    Plotly.animate(graph, frames, {
      mode: "immediate",
      frame: { duration: 30, redraw: true },
      transition: { duration: 0 }
    });

    setLabel(currentStage);
  }

  function previousStage() {
    if (currentStage > 0) {
      currentStage -= 1;
      const frames = stageFrames(currentStage);
      const lastFrame = frames[frames.length - 1];

      Plotly.animate(graph, [lastFrame], {
        mode: "immediate",
        frame: { duration: 0, redraw: true },
        transition: { duration: 0 }
      });

      setLabel(currentStage);
    }
  }

  previousButton.addEventListener("click", previousStage);
  nextButton.addEventListener("click", function () {
    if (currentStage < sim.trajectoryLengths.length - 1) {
      showStage(currentStage + 1);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === "ArrowRight") {
      if (currentStage < sim.trajectoryLengths.length - 1) showStage(currentStage + 1);
    } else if (event.key === "ArrowLeft") {
      previousStage();
    }
  });

  setLabel(0);
  showStage(0);
})().catch(function (error) {
  console.error(error);
  const box = document.createElement("pre");
  box.style.cssText = "color:red;white-space:pre-wrap;position:fixed;top:0;left:0;right:0;z-index:999;background:white;padding:12px;margin:0";
  box.textContent = error && error.stack ? error.stack : String(error);
  document.body.appendChild(box);
});
