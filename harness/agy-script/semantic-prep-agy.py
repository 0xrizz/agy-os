#!/usr/bin/env python3
import sys
import json
from pathlib import Path
from graphify.cache import check_semantic_cache

target_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
out_dir = target_dir / "graphify-out"
detect_file = out_dir / ".graphify_detect.json"

detect = json.loads(detect_file.read_text(encoding="utf-8"))
all_files = [f for cat in ('document', 'paper', 'image') for f in detect['files'].get(cat, [])]

spec_path = Path("d:/dev/agy-os/.agents/skills/graphify/references/extraction-spec.md").resolve()

cached_nodes, cached_edges, cached_hyperedges, uncached = check_semantic_cache(
    all_files, root=str(target_dir), prompt_file=str(spec_path)
)

if cached_nodes or cached_edges or cached_hyperedges:
    (out_dir / ".graphify_cached.json").write_text(
        json.dumps({'nodes': cached_nodes, 'edges': cached_edges, 'hyperedges': cached_hyperedges}, ensure_ascii=False),
        encoding="utf-8"
    )
else:
    (out_dir / ".graphify_cached.json").unlink(missing_ok=True)

(out_dir / ".graphify_uncached.txt").write_text('\n'.join(uncached), encoding="utf-8")
print(f"Cache: {len(all_files)-len(uncached)} files hit, {len(uncached)} files need extraction for {target_dir}")

# Split into chunks of 22 files
chunk_size = 22
chunks = [uncached[i:i + chunk_size] for i in range(0, len(uncached), chunk_size)]
print(f"Created {len(chunks)} chunks for {len(uncached)} uncached files.")

chunk_info = []
for idx, chunk_files in enumerate(chunks, 1):
    chunk_filename = f".graphify_chunk_{idx:02d}.json"
    chunk_path = (out_dir / chunk_filename).resolve()
    info = {
        "chunk_num": idx,
        "total_chunks": len(chunks),
        "files": chunk_files,
        "chunk_path": str(chunk_path).replace("\\", "/")
    }
    chunk_info.append(info)

(out_dir / ".graphify_chunks_info.json").write_text(
    json.dumps(chunk_info, indent=2, ensure_ascii=False),
    encoding="utf-8"
)
