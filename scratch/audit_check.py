import json
import re

with open("d:/dev/agy-os/graphify-out/graph.json", encoding="utf-8") as f:
    g = json.load(f)

nodes = g.get("nodes", [])
edges = g.get("links", g.get("edges", []))
print(f"graph.json file size: {len(json.dumps(g))} bytes")
print(f"graph.json nodes count: {len(nodes)}")
print(f"graph.json edges count: {len(edges)}")

# Check scoping / exclusions
excluded_prefixes = ["ecc/", "openspec/", "frameworks/openspec/", "harness/patches/"]
found_excluded = []
for n in nodes:
    src = n.get("source_file", "") or n.get("id", "")
    for ep in excluded_prefixes:
        if ep in src.lower():
            found_excluded.append((ep, src))

print(f"Found excluded nodes: {len(found_excluded)}")
if found_excluded:
    print("Sample excluded nodes found:", found_excluded[:5])

with open("d:/dev/agy-os/graphify-out/.graphify_labels.json", encoding="utf-8") as f:
    labels = json.load(f)

generic_count = sum(1 for v in labels.values() if re.match(r"^Community\s+\d+$", str(v)))
semantic_count = len(labels) - generic_count
print(f"Labels check: {generic_count}/{len(labels)} generic 'Community N' labels, {semantic_count}/{len(labels)} semantic labels.")
