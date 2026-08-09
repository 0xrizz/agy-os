import json
import networkx as nx
from graphify.build import build_from_json

graph_data = json.load(open("graphify-out/graph.json", encoding="utf-8"))
G = build_from_json(graph_data, root=".", directed=False)

ecc_nodes = [n for n in G.nodes() if n.startswith("ECC::")]
openspec_nodes = [n for n in G.nodes() if n.startswith("openspec::") or n.startswith("OpenSpec::")]

print(f"Total ECC nodes: {len(ecc_nodes)}, OpenSpec nodes: {len(openspec_nodes)}")

found_path = None
for u in ecc_nodes[:50]:
    for v in openspec_nodes[:50]:
        if nx.has_path(G, u, v):
            p = nx.shortest_path(G, u, v)
            print(f"Found cross-repo path ({len(p)} nodes): {u} -> ... -> {v}")
            print("Path:", p)
            found_path = p
            break
    if found_path:
        break
