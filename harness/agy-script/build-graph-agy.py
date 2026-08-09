#!/usr/bin/env python3
import sys
import json
import glob
from pathlib import Path
from datetime import datetime, timezone

from graphify.cache import save_semantic_cache
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from graphify.detect import save_manifest
from graphify.llm import generate_community_labels

target_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
out_dir = target_dir / "graphify-out"
spec_path = Path("d:/dev/agy-os/.agents/skills/graphify/references/extraction-spec.md").resolve()

# Step B3: Merge Chunks
chunk_files = sorted(out_dir.glob(".graphify_chunk_*.json"))
all_nodes, all_edges, all_hyperedges = [], [], []
total_in, total_out = 0, 0

for c in chunk_files:
    d = json.loads(c.read_text(encoding="utf-8"))
    all_nodes.extend(d.get("nodes", []))
    all_edges.extend(d.get("edges", []))
    all_hyperedges.extend(d.get("hyperedges", []))
    total_in += d.get("input_tokens", 0)
    total_out += d.get("output_tokens", 0)

sem_new = {
    "nodes": all_nodes,
    "edges": all_edges,
    "hyperedges": all_hyperedges,
    "input_tokens": total_in,
    "output_tokens": total_out
}
(out_dir / ".graphify_semantic_new.json").write_text(
    json.dumps(sem_new, indent=2, ensure_ascii=False), encoding="utf-8"
)

# Save Cache
uncached_txt = out_dir / ".graphify_uncached.txt"
uncached = [line for line in uncached_txt.read_text(encoding="utf-8").splitlines() if line] if uncached_txt.exists() else []

save_semantic_cache(
    all_nodes, all_edges, all_hyperedges,
    root=str(target_dir), allowed_source_files=uncached, prompt_file=str(spec_path)
)

# Merge Cached + New
cached_file = out_dir / ".graphify_cached.json"
cached = json.loads(cached_file.read_text(encoding="utf-8")) if cached_file.exists() else {"nodes": [], "edges": [], "hyperedges": []}

merged_sem_nodes = cached.get("nodes", []) + all_nodes
merged_sem_edges = cached.get("edges", []) + all_edges
merged_sem_hyper = cached.get("hyperedges", []) + all_hyperedges

seen_sem = set()
deduped_sem = []
for n in merged_sem_nodes:
    if n["id"] not in seen_sem:
        seen_sem.add(n["id"])
        deduped_sem.append(n)

sem_final = {
    "nodes": deduped_sem,
    "edges": merged_sem_edges,
    "hyperedges": merged_sem_hyper,
    "input_tokens": total_in,
    "output_tokens": total_out
}
(out_dir / ".graphify_semantic.json").write_text(
    json.dumps(sem_final, indent=2, ensure_ascii=False), encoding="utf-8"
)

# Clean intermediate files
for temp_f in [out_dir / ".graphify_cached.json", out_dir / ".graphify_uncached.txt", out_dir / ".graphify_semantic_new.json"]:
    temp_f.unlink(missing_ok=True)

# Part C: Merge AST + Semantic
ast_file = out_dir / ".graphify_ast.json"
ast = json.loads(ast_file.read_text(encoding="utf-8")) if ast_file.exists() else {"nodes": [], "edges": []}
sem = json.loads((out_dir / ".graphify_semantic.json").read_text(encoding="utf-8"))

seen_ast = {n["id"] for n in ast.get("nodes", [])}
merged_nodes = list(ast.get("nodes", []))
for n in sem.get("nodes", []):
    if n["id"] not in seen_ast:
        merged_nodes.append(n)
        seen_ast.add(n["id"])

merged_edges = ast.get("edges", []) + sem.get("edges", [])
merged_hyperedges = sem.get("hyperedges", [])

merged_extract = {
    "nodes": merged_nodes,
    "edges": merged_edges,
    "hyperedges": merged_hyperedges,
    "input_tokens": sem.get("input_tokens", 0),
    "output_tokens": sem.get("output_tokens", 0)
}
(out_dir / ".graphify_extract.json").write_text(
    json.dumps(merged_extract, indent=2, ensure_ascii=False), encoding="utf-8"
)

# Step 4: Build Graph & Cluster
detection = json.loads((out_dir / ".graphify_detect.json").read_text(encoding="utf-8"))
G = build_from_json(merged_extract, root=str(target_dir), directed=False)

if G.number_of_nodes() == 0:
    print(f"ERROR: Graph is empty for {target_dir}")
    sys.exit(1)

communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {"input": merged_extract.get("input_tokens", 0), "output": merged_extract.get("output_tokens", 0)}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)

labels = {cid: f"Community {cid}" for cid in communities}
try:
    lbl_res = generate_community_labels(G, communities)
    if isinstance(lbl_res, tuple):
        labels = lbl_res[0]
    elif isinstance(lbl_res, dict):
        labels = lbl_res
except Exception:
    pass

questions = suggest_questions(G, communities, labels)

# Export graph.json
try:
    wrote = to_json(G, communities, out_dir / "graph.json")
except TypeError:
    wrote = to_json(G, communities, str(out_dir / "graph.json"))


# Generate GRAPH_REPORT.md
report = generate(
    G, communities, cohesion, labels, gods, surprises, detection, tokens,
    str(target_dir), suggested_questions=questions
)
(out_dir / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")

# Analysis & Labels sidecars
analysis = {
    "communities": {str(k): v for k, v in communities.items()},
    "cohesion": {str(k): v for k, v in cohesion.items()},
    "gods": gods,
    "surprises": surprises,
    "questions": questions
}
(out_dir / ".graphify_analysis.json").write_text(json.dumps(analysis, indent=2, ensure_ascii=False), encoding="utf-8")
(out_dir / ".graphify_labels.json").write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding="utf-8")

# Step 9: Save Manifest & Cost
corpus = detection.get("all_files") or detection.get("files", {})
manifest_files = {}
for k, v in corpus.items():
    manifest_files[k] = v

save_manifest(manifest_files, root=str(target_dir))

cost_path = out_dir / "cost.json"
cost = json.loads(cost_path.read_text(encoding="utf-8")) if cost_path.exists() else {"runs": [], "total_input_tokens": 0, "total_output_tokens": 0}
cost["runs"].append({
    "date": datetime.now(timezone.utc).isoformat(),
    "input_tokens": tokens["input"],
    "output_tokens": tokens["output"],
    "files": detection.get("total_files", 0)
})
cost["total_input_tokens"] += tokens["input"]
cost["total_output_tokens"] += tokens["output"]
cost_path.write_text(json.dumps(cost, indent=2, ensure_ascii=False), encoding="utf-8")

# Clean temp chunk files
for c in chunk_files:
    c.unlink(missing_ok=True)
(out_dir / ".graphify_chunks_info.json").unlink(missing_ok=True)

print(f"Graph successfully built for {target_dir.resolve()}: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities.")
