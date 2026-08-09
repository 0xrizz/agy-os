#!/usr/bin/env bash
# graphify-merge-agy.sh
# Merges all 4 per-repo graph.json files into the unified agy-os/graphify-out/graph.json
# AGENTS.md §4: All harness scripts reside in harness/agy-script/

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

ECC_GRAPH="$REPO_ROOT/ECC/graphify-out/graph.json"
OPENSPEC_GRAPH="$REPO_ROOT/OpenSpec/graphify-out/graph.json"
FRAMEWORKS_GRAPH="$REPO_ROOT/frameworks/openspec/graphify-out/graph.json"
ROOT_GRAPH="$REPO_ROOT/graphify-out/graph.json"

OUT_DIR="$REPO_ROOT/graphify-out"
OUT_GRAPH="$OUT_DIR/graph.json"

mkdir -p "$OUT_DIR"

# Baseline calculation: if OUT_GRAPH exists prior to merge, count its nodes
BASELINE_NODES=0
if [[ -f "$OUT_GRAPH" ]]; then
  BASELINE_NODES=$(python -c "import json; data=json.load(open('$OUT_GRAPH')); print(len(data.get('nodes', [])))" 2>/dev/null || echo 0)
fi

# Build array of input graph files
INPUT_GRAPHS=()

if [[ -f "$ECC_GRAPH" ]]; then
  INPUT_GRAPHS+=("$ECC_GRAPH")
fi

if [[ -f "$OPENSPEC_GRAPH" ]]; then
  INPUT_GRAPHS+=("$OPENSPEC_GRAPH")
fi

if [[ -f "$FRAMEWORKS_GRAPH" ]]; then
  INPUT_GRAPHS+=("$FRAMEWORKS_GRAPH")
fi

# Include root graph if present and distinct from output location
TMP_ROOT=""
if [[ -f "$ROOT_GRAPH" ]]; then
  TMP_ROOT="$OUT_DIR/root_graph_snapshot.json"
  cp "$ROOT_GRAPH" "$TMP_ROOT"
  INPUT_GRAPHS+=("$TMP_ROOT")
fi

if [[ ${#INPUT_GRAPHS[@]} -eq 0 ]]; then
  echo "[graphify-merge-agy] Error: No input graph.json files found to merge." >&2
  exit 1
fi

echo "[graphify-merge-agy] Merging ${#INPUT_GRAPHS[@]} input graphs..."

if command -v graphify &>/dev/null; then
  graphify merge-graphs "${INPUT_GRAPHS[@]}" --out "$OUT_GRAPH"
else
  echo "[graphify-merge-agy] graphify CLI not found, using python fallback..."
  python -c "
import sys, json

out_path = sys.argv[1]
input_paths = sys.argv[2:]

merged_nodes = []
merged_links = []
seen_node_ids = set()

for path in input_paths:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for node in data.get('nodes', []):
                nid = node.get('id')
                if nid and nid not in seen_node_ids:
                    seen_node_ids.add(nid)
                    merged_nodes.append(node)
            for link in data.get('links', []):
                merged_links.append(link)
    except Exception as e:
        print(f'Error reading {path}: {e}', file=sys.stderr)

out_data = {'nodes': merged_nodes, 'links': merged_links}
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(out_data, f, indent=2)
" "$OUT_GRAPH" "${INPUT_GRAPHS[@]}"
fi

# Clean up temp snapshot if created
if [[ -n "$TMP_ROOT" && -f "$TMP_ROOT" ]]; then
  rm -f "$TMP_ROOT"
fi

# Shrink-guard check
FINAL_NODES=$(python -c "import json; data=json.load(open('$OUT_GRAPH')); print(len(data.get('nodes', [])))" 2>/dev/null || echo 0)

echo "[graphify-merge-agy] Baseline nodes: $BASELINE_NODES, Merged nodes: $FINAL_NODES"

if [[ $BASELINE_NODES -gt 0 && $FINAL_NODES -lt $BASELINE_NODES ]]; then
  echo "[graphify-merge-agy] Error: Shrink-guard triggered! Merged node count ($FINAL_NODES) is lower than baseline ($BASELINE_NODES)." >&2
  exit 1
fi

echo "[graphify-merge-agy] Merge complete: $OUT_GRAPH"
exit 0
