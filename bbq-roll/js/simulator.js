(async function () {
    "use strict";

    const response = await fetch("data/simulation.json", { cache: "no-store" });
    if (!response.ok) {
        throw new Error("Could not load data/simulation.json: HTTP " + response.status);
    }

    const sim = await response.json();
    const graph = document.getElementById("plot");
    const lengths = sim.trajectoryLengths;
    const numberOfStages = lengths.length;

    // Compact BBQ version based on the Epley template; this source has 8 stages and 7 traces:
    // 0 canal, 1 X, 2 Y, 3 Z, 4 otoconia 1, 5 otoconia 2, 6 head mesh.
    function buildAllFrames() {
        const all = [];

        for (let stage = 0; stage < numberOfStages; stage++) {
            const staticTraces = sim.stages[stage].static;

            for (const f of sim.stages[stage].frames) {
                all.push({
                    name: f.name,
                    layout: f.layout,
                    data: [
                        staticTraces["0"],  // canal
                        staticTraces["1"],  // +X
                        staticTraces["2"],  // +Y
                        staticTraces["3"],  // +Z
                        f.data[0],          // otoconia 1
                        f.data[1],          // otoconia 2
                        staticTraces["6"]   // head mesh
                    ]
                });
            }
        }
        return all;
    }

    function framesOfStage(stage) {
        return sim.stages[stage].frames.map(f => f.name);
    }

    function updateLabel(stage) {
        document.getElementById("stage-control-label").textContent =
            "Stage " + (stage + 1) + " / " + numberOfStages;
    }

    await Plotly.newPlot(graph, sim.initial, sim.layout, sim.config);

    // Add every frame once. Button presses do NOT reload or delete frames.
    const allFrames = buildAllFrames();
    await Plotly.addFrames(graph, allFrames);

    let currentStage = 0;

    function showStage(stage) {
        stage = Math.max(0, Math.min(stage, numberOfStages - 1));
        currentStage = stage;

        Plotly.animate(graph, framesOfStage(stage), {
            mode: "immediate",
            frame: { duration: 30, redraw: true },
            transition: { duration: 0 }
        });

        updateLabel(stage);
    }

    document.getElementById("next").addEventListener("click", function () {
        if (currentStage < numberOfStages - 1) {
            showStage(currentStage + 1);
        }
    });

    document.getElementById("previous").addEventListener("click", function () {
        if (currentStage > 0) {
            const target = currentStage - 1;
            currentStage = target;
            const stageFrames = framesOfStage(target);

            Plotly.animate(graph, [stageFrames[stageFrames.length - 1]], {
                mode: "immediate",
                frame: { duration: 0, redraw: true },
                transition: { duration: 0 }
            });

            updateLabel(target);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === "ArrowRight") {
            if (currentStage < numberOfStages - 1) showStage(currentStage + 1);
        } else if (event.key === "ArrowLeft") {
            if (currentStage > 0) {
                const target = currentStage - 1;
                currentStage = target;
                const stageFrames = framesOfStage(target);

                Plotly.animate(graph, [stageFrames[stageFrames.length - 1]], {
                    mode: "immediate",
                    frame: { duration: 0, redraw: true },
                    transition: { duration: 0 }
                });

                updateLabel(target);
            }
        }
    });

    showStage(0);
})().catch(function (err) {
    console.error(err);
    const pre = document.createElement("pre");
    pre.style.cssText = "margin:12px;padding:12px;background:#fee;border:1px solid #c00;white-space:pre-wrap;";
    pre.textContent = "Simulation failed to load:\\n" + (err.stack || err);
    document.body.insertBefore(pre, document.body.firstChild);
});
