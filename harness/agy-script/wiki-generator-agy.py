#!/usr/bin/env python3
import json
from pathlib import Path
from graphify.export import to_obsidian
from graphify.build import build_from_json

target_dir = Path(".")
out_dir = target_dir / "graphify-out"
wiki_dir = out_dir / "wiki"
wiki_dir.mkdir(parents=True, exist_ok=True)

graph_data = json.loads((out_dir / "graph.json").read_text(encoding="utf-8"))
G = build_from_json(graph_data, root=".", directed=False)

analysis = json.loads((out_dir / ".graphify_analysis.json").read_text(encoding="utf-8")) if (out_dir / ".graphify_analysis.json").exists() else {}
labels_data = json.loads((out_dir / ".graphify_labels.json").read_text(encoding="utf-8")) if (out_dir / ".graphify_labels.json").exists() else {}

communities = {int(k): v for k, v in analysis.get("communities", {}).items()}
cohesion = {int(k): v for k, v in analysis.get("cohesion", {}).items()}
labels = {int(k): v for k, v in labels_data.items()}

# Export obsidian / wiki pages
file_count = to_obsidian(G, communities, str(wiki_dir), community_labels=labels, cohesion=cohesion)

# Ensure index.md exists in wiki_dir
index_md = wiki_dir / "index.md"
lines = [
    "# Knowledge Graph Wiki Index",
    "",
    f"Total Communities: {len(communities)}",
    f"Total Nodes: {G.number_of_nodes()}",
    f"Total Edges: {G.number_of_edges()}",
    "",
    "## Community Architecture Articles",
    ""
]

for cid, c_nodes in sorted(communities.items()):
    c_label = labels.get(cid, f"Community {cid}")
    sanitized = c_label.replace("/", "-").replace("\\", "-").replace(":", "-")
    lines.append(f"- [{c_label}](./community_{cid}.md) — {len(c_nodes)} nodes (Cohesion: {cohesion.get(cid, 0.0):.2f})")

index_md.write_text("\n".join(lines), encoding="utf-8")
print(f"Wiki generated: {file_count} files written to {wiki_dir.resolve()}, index.md created.")
