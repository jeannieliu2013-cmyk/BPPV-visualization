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

    /*
     * Plotly.deleteFrames expects NUMERIC FRAME INDICES, not frame names.
     * Keep track of how many frames are currently installed so that the
     * next-stage buttons work correctly while still keeping memory low.
     */
    let currentStageFrameCount = 0;

    async function loadAndShowStage(stage) {
        stage = Math.max(0, Math.min(stage, numberOfStages - 1));

        // Stop any currently running animation.
        Plotly.animate(graph, [], {
            mode: "immediate",
            transition: { duration: 0 },
            frame: { duration: 0 }
        });

        // Delete the currently installed frames by their numeric indices.
        if (currentStageFrameCount > 0) {
            const indices = Array.from(
                { length: currentStageFrameCount },
                (_, i) => i
            );
            await Plotly.deleteFrames(graph, indices);
        }

        currentStage = stage;

        const frames = buildStageFrames(stage);
        const names = frames.map(f => f.name);

        await Plotly.addFrames(graph, frames);
        currentStageFrameCount = frames.length;

        Plotly.animate(graph, names, {
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

    // This is the original initial Plotly figure, extracted unchanged.
    await Plotly.newPlot(
        graph,
        sim.initial,
        sim.layout,
        sim.config
    );

    // Add only Stage 0 initially.
    const initialFrames = buildStageFrames(0);
    const initialNames = initialFrames.map(f => f.name);

    await Plotly.addFrames(graph, initialFrames);
    currentStageFrameCount = initialFrames.length;

    updateStageLabel();

    Plotly.animate(graph, initialNames, {
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
