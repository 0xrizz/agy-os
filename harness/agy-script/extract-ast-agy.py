#!/usr/bin/env python3
import sys
import json
from pathlib import Path
from graphify.extract import collect_files, extract

target_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
out_dir = target_dir / "graphify-out"
detect_file = out_dir / ".graphify_detect.json"

detect = json.loads(detect_file.read_text(encoding="utf-8"))
code_files = []
for f in detect.get("files", {}).get("code", []):
    p = Path(f)
    code_files.extend(collect_files(p) if p.is_dir() else [p])

if code_files:
    result = extract(code_files, cache_root=target_dir, max_workers=1)
    ast_file = out_dir / ".graphify_ast.json"

    ast_file.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"AST: {len(result.get('nodes', []))} nodes, {len(result.get('edges', []))} edges extracted for {target_dir}")
else:
    ast_file = out_dir / ".graphify_ast.json"
    ast_file.write_text(json.dumps({"nodes": [], "edges": [], "input_tokens": 0, "output_tokens": 0}, ensure_ascii=False), encoding="utf-8")
    print(f"AST: 0 code files found for {target_dir}")
