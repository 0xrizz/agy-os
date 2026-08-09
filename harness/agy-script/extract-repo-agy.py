#!/usr/bin/env python3
import sys
import subprocess
from pathlib import Path

repo_path = sys.argv[1]
print(f"==================================================")
print(f"Starting extraction for repository: {repo_path}")
print(f"==================================================")

py_helper = "harness/agy-script/run-graphify-py-agy.sh"

def run_cmd(script, *args):
    cmd = ["bash", py_helper, script, repo_path] + list(args)
    res = subprocess.run(cmd, check=True)
    return res.returncode

print(f"Step 1: Detect for {repo_path}")
run_cmd("harness/agy-script/detect-agy.py")

print(f"Step 2: AST Extraction for {repo_path}")
run_cmd("harness/agy-script/extract-ast-agy.py")

print(f"Step 3: Semantic Prep for {repo_path}")
run_cmd("harness/agy-script/semantic-prep-agy.py")

print(f"Step 4: Semantic Extraction for {repo_path}")
run_cmd("harness/agy-script/semantic-extract-agy.py")

print(f"Step 5: Build Graph & Reports for {repo_path}")
run_cmd("harness/agy-script/build-graph-agy.py")

print(f"==================================================")
print(f"Extraction complete for repository: {repo_path}")
print(f"==================================================")
