import json

g = json.load(open("graphify-out/graph.json", encoding="utf-8"))
root_planner_nodes = [n["id"] for n in g["nodes"] if "planner" in n["id"].lower() and not n["id"].startswith("ECC::") and not n["id"].startswith("OpenSpec::")]
print(f"Root planner nodes ({len(root_planner_nodes)}):", root_planner_nodes[:15])
