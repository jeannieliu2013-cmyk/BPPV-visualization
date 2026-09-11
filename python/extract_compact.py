from pathlib import Path
import re, json

SOURCE = Path("Epley_maneuver_simulation-2.html")
OUTPUT = Path("simulation.json")

s = SOURCE.read_text(encoding="utf-8")

newplot_section = s[s.find("Plotly.newPlot(", 3_000_000):]
m = re.search(
    r'Plotly\.newPlot\(\s*"[^"]+",\s*(\[.*?\]),\s*(\{.*?\}),\s*(\{.*?\})\s*\)\.then',
    newplot_section, re.S
)
if not m:
    raise RuntimeError("Plotly.newPlot block not found")

initial = json.loads(m.group(1))
layout = json.loads(m.group(2))
config = json.loads(m.group(3))

fm = re.search(r"Plotly\.addFrames\('([^']+)', (\[.*?\])\);", s, re.S)
if not fm:
    raise RuntimeError("Plotly.addFrames block not found")

graph_id = fm.group(1)
frames = json.loads(fm.group(2))

trajectory_lengths = [529, 608, 689, 649, 4]
stages = []
start = 0

for n in trajectory_lengths:
    static = {str(i): frames[start]["data"][i] for i in [0,1,2,3,5]}
    compact_frames = []

    for i in range(n):
        f = frames[start + i]
        compact_frames.append({
            "name": f["name"],
            "layout": f["layout"],
            "data": f["data"][4]
        })

    stages.append({
        "length": n,
        "static": static,
        "frames": compact_frames
    })
    start += n

simulation = {
    "graph_id": graph_id,
    "initial": initial,
    "layout": layout,
    "config": config,
    "trajectoryLengths": trajectory_lengths,
    "stages": stages
}

OUTPUT.write_text(
    json.dumps(simulation, separators=(",", ":")),
    encoding="utf-8"
)

print(f"Wrote {OUTPUT}")
