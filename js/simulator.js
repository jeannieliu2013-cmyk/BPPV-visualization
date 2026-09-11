(async function () {
    "use strict";

    const response = await fetch("data/simulation.json");
    if (!response.ok) {
        throw new Error("Could not load data/simulation.json");
    }
    const sim = await response.json();

    const graph = document.getElementById("plot");
    let currentStage = 0;

    const trajectoryLengths = sim.trajectoryLengths;
    const numberOfStages = trajectoryLengths.length;

    function frameNames(stage) {
        return sim.stages[stage].frames.map(f => f.name);
    }

    /*
     * Reconstructs the original Plotly frame structure exactly.
     *
     * Original frame trace order:
     *   0 = canal
     *   1 = +X axis
     *   2 = +Y axis
     *   3 = +Z axis
     *   4 = otoconia
     *   5 = head mesh
     *
     * Traces 0,1,2,3,5 are identical for every frame within a stage,
     * so they are stored once per stage. Trace 4 is stored for every frame.
     */
    function buildStageFrames(stage) {
        const staticTraces = sim.stages[stage].static;

        return sim.stages[stage].frames.map(function (f) {
            return {
                data: [
                    staticTraces["0"],
                    staticTraces["1"],
                    staticTraces["2"],
                    staticTraces["3"],
                    f.data,
                    staticTraces["5"]
                ],
                layout: f.layout,
                name: f.name
            };
        });
    }

    function updateStageLabel() {
        document.getElementById("stage-control-label").textContent =
            "Stage " + (currentStage + 1) + " / " + numberOfStages;
    }

    async function loadAndShowStage(stage) {
        stage = Math.max(0, Math.min(stage, numberOfStages - 1));

        // Remove frames belonging to the previous stage so the browser
        // does not retain all 2,479 expanded frames at once.
        if (currentStageFrames.length) {
            await Plotly.deleteFrames(graph, currentStageFrames);
        }

        currentStage = stage;
        currentStageFrames = frameNames(stage);

        // Reconstruct only the current stage in memory.
        await Plotly.addFrames(graph, buildStageFrames(stage));

        Plotly.animate(graph, currentStageFrames, {
            mode: "immediate",
            frame: {
                duration: 30,
                redraw: true
            },
            transition: {
                duration: 0
            }
        });

        updateStageLabel();
    }

    let currentStageFrames = [];

    // This is the original initial Plotly figure, extracted unchanged.
    await Plotly.newPlot(
        graph,
        sim.initial,
        sim.layout,
        sim.config
    );

    // Add only Stage 0 initially, exactly as the original animation did.
    currentStageFrames = frameNames(0);
    await Plotly.addFrames(graph, buildStageFrames(0));

    updateStageLabel();

    Plotly.animate(graph, currentStageFrames, {
        mode: "immediate",
        frame: {
            duration: 30,
            redraw: true
        },
        transition: {
            duration: 0
        }
    });

    document.getElementById("next").onclick = function () {
        if (currentStage < numberOfStages - 1) {
            loadAndShowStage(currentStage + 1);
        }
    };

    document.getElementById("previous").onclick = function () {
        if (currentStage > 0) {
            loadAndShowStage(currentStage - 1);
        }
    };

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === "ArrowRight") {
            if (currentStage < numberOfStages - 1) {
                loadAndShowStage(currentStage + 1);
            }
        } else if (event.key === "ArrowLeft") {
            if (currentStage > 0) {
                loadAndShowStage(currentStage - 1);
            }
        }
    });
})();
