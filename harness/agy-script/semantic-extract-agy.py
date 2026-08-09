#!/usr/bin/env python3
import sys
import json
from pathlib import Path
from graphify.extract import extract_markdown

target_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
out_dir = target_dir / "graphify-out"
chunks_info_file = out_dir / ".graphify_chunks_info.json"

if not chunks_info_file.exists():
    print("No chunks info file found.")
    sys.exit(1)

chunks_info = json.loads(chunks_info_file.read_text(encoding="utf-8"))

for chunk in chunks_info:
    chunk_num = chunk["chunk_num"]
    total_chunks = chunk["total_chunks"]
    files = chunk["files"]
    chunk_path = Path(chunk["chunk_path"])

    all_nodes = []
    all_edges = []
    all_hyperedges = []

    for f_str in files:
        f_path = Path(f_str)
        if f_path.exists() and f_path.suffix.lower() == ".md":
            res = extract_markdown(f_path)
            all_nodes.extend(res.get("nodes", []))
            all_edges.extend(res.get("edges", []))
            if "hyperedges" in res:
                all_hyperedges.extend(res.get("hyperedges", []))

    # Deduplicate nodes by id
    seen = set()
    deduped_nodes = []
    for n in all_nodes:
        if n["id"] not in seen:
            seen.add(n["id"])
            deduped_nodes.append(n)

    chunk_data = {
        "nodes": deduped_nodes,
        "edges": all_edges,
        "hyperedges": all_hyperedges,
        "input_tokens": 0,
        "output_tokens": 0
    }

    chunk_path.write_text(json.dumps(chunk_data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote chunk {chunk_num}/{total_chunks} to {chunk_path.name}: {len(deduped_nodes)} nodes, {len(all_edges)} edges")

print(f"All {len(chunks_info)} chunks extracted successfully.")
