#!/usr/bin/env python3
import sys
import json
from pathlib import Path
from graphify.detect import detect

target_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
out_dir = target_dir / "graphify-out"
out_dir.mkdir(parents=True, exist_ok=True)

res = detect(target_dir)
out_file = out_dir / ".graphify_detect.json"
out_file.write_text(json.dumps(res, indent=2, ensure_ascii=False), encoding="utf-8")

code_files = len(res.get("files", {}).get("code", []))
doc_files = len(res.get("files", {}).get("document", []))
paper_files = len(res.get("files", {}).get("paper", []))
image_files = len(res.get("files", {}).get("image", []))

print(f"Detect complete for {target_dir.resolve()}:")
print(f"  total_files: {res.get('total_files', 0)}")
print(f"  code: {code_files}, docs: {doc_files}, papers: {paper_files}, images: {image_files}")
