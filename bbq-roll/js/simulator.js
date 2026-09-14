(async function () {
    "use strict";

    const response = await fetch("data/simulation.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load data/simulation.json: HTTP " + response.status);

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
                        f.data[0],
                        f.data[1],
                        staticTraces["6"]
                    ],
                    layout: f.layout,
                    name: f.name
                });
            }
        }
        return all;
    }

    function framesOfStage(stage) { return sim.stages[stage].frames.map(f => f.name); }
    function updateLabel(stage) { document.getElementById("stage-control-label").textContent = "Stage " + (stage + 1) + " / " + numberOfStages; }

    await Plotly.newPlot(graph, sim.initial, sim.layout, sim.config);
    await Plotly.addFrames(graph, buildAllFrames());

    let currentStage = 0;
    function showStage(stage) {
        stage = Math.max(0, Math.min(numberOfStages - 1, stage));
        currentStage = stage;
        Plotly.animate(graph, framesOfStage(stage), { mode: "immediate", frame: { duration: 30, redraw: true }, transition: { duration: 0 } });
        updateLabel(stage);
    }

    document.getElementById("next").addEventListener("click", () => { if (currentStage < numberOfStages - 1) showStage(currentStage + 1); });
    document.getElementById("previous").addEventListener("click", () => {
        if (currentStage > 0) { const target=currentStage-1; currentStage=target; const fs=framesOfStage(target); Plotly.animate(graph,[fs[fs.length-1]],{mode:"immediate",frame:{duration:0,redraw:true},transition:{duration:0}}); updateLabel(target); }
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === "ArrowRight") { if (currentStage < numberOfStages - 1) showStage(currentStage + 1); }
        else if (event.key === "ArrowLeft" && currentStage > 0) { const target=currentStage-1; currentStage=target; const fs=framesOfStage(target); Plotly.animate(graph,[fs[fs.length-1]],{mode:"immediate",frame:{duration:0,redraw:true},transition:{duration:0}}); updateLabel(target); }
    });
    showStage(0);
})();
