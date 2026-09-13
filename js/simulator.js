(async function () {
  const response = await fetch("data/simulation.json", { cache: "no-store" });
  const sim = await response.json();

  const graph = document.getElementById("plot");
  const lengths = sim.trajectoryLengths;
  const numberOfStages = lengths.length;

  function buildAllFrames() {
    const all = [];

    for (let stage = 0; stage < numberOfStages; stage++) {
      const staticTraces = sim.stages[stage].static;

      for (const f of sim.stages[stage].frames) {
        all.push({
          data: [
            staticTraces["0"],
            staticTraces["1"],
            staticTraces["2"],
            staticTraces["3"],
            f.data["4"],
            f.data["5"],
            staticTraces["6"]
          ],
          layout: f.layout,
          name: f.name
        });
      }
    }

    return all;
  }

  function framesOfStage(stage) {
    return sim.stages[stage].frames.map(f => f.name);
  }

  await Plotly.newPlot(graph, sim.initial, sim.layout, sim.config);

  // Same architecture as the working compact template:
  // add every named frame once, then animate by frame name.
  const allFrames = buildAllFrames();
  await Plotly.addFrames(graph, allFrames);

  let currentStage = 0;

  function showStage(stage) {
    if (stage < 0) stage = 0;
    if (stage >= numberOfStages) stage = numberOfStages - 1;

    currentStage = stage;

    Plotly.animate(
      graph,
      framesOfStage(stage),
      {
        mode: "immediate",
        frame: { duration: 30, redraw: true },
        transition: { duration: 0 }
      }
    );

    updateStageLabel();
  }

  function nextStage() {
    if (currentStage < numberOfStages - 1) {
      currentStage += 1;
      showStage(currentStage);
    }
  }

  function previousStage() {
    if (currentStage > 0) {
      currentStage -= 1;

      const stageFrames = framesOfStage(currentStage);
      const lastFrame = stageFrames[stageFrames.length - 1];

      Plotly.animate(
        graph,
        [lastFrame],
        {
          mode: "immediate",
          frame: { duration: 0, redraw: true },
          transition: { duration: 0 }
        }
      );

      updateStageLabel();
    }
  }

  function updateStageLabel() {
    const label = document.getElementById("stage-control-label");
    if (label) {
      label.innerHTML =
        "Stage " + (currentStage + 1) + " / " + numberOfStages;
    }
  }

  const container = graph.parentElement;

  const controls = document.createElement("div");
  controls.style.textAlign = "center";
  controls.style.marginTop = "10px";

  const previousButton = document.createElement("button");
  previousButton.innerHTML = "◀ Previous";
  previousButton.style.margin = "5px";
  previousButton.style.padding = "8px 16px";
  previousButton.onclick = previousStage;

  const nextButton = document.createElement("button");
  nextButton.innerHTML = "Next ▶";
  nextButton.style.margin = "5px";
  nextButton.style.padding = "8px 16px";
  nextButton.onclick = nextStage;

  const label = document.createElement("span");
  label.id = "stage-control-label";
  label.style.margin = "10px";
  label.style.fontWeight = "bold";

  controls.appendChild(previousButton);
  controls.appendChild(label);
  controls.appendChild(nextButton);
  container.appendChild(controls);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === "ArrowRight") {
      nextStage();
    } else if (event.key === "ArrowLeft") {
      previousStage();
    }
  });

  showStage(0);
})();
