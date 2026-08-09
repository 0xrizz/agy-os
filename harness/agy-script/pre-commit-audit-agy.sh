#!/usr/bin/env bash
# harness/agy-script/pre-commit-audit-agy.sh
# OBJ-04: Pre-commit supply chain security audit hook.
# Runs pnpm audit --audit-level=high before each commit.
# Blocks commit if HIGH or CRITICAL vulnerabilities are found.
# Per spec: pkg.security.supply_chain

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "[pre-commit-audit] Running pnpm audit --audit-level=high..."

cd "${ROOT_DIR}"

if ! command -v pnpm &> /dev/null; then
  echo "[pre-commit-audit] WARNING: pnpm not found, skipping audit."
  exit 0
fi

if pnpm audit --audit-level=high; then
  echo "[pre-commit-audit] Audit PASSED — no HIGH or CRITICAL vulnerabilities found."
  exit 0
else
  echo ""
  echo "[pre-commit-audit] AUDIT FAILED — HIGH or CRITICAL vulnerability detected."
  echo ""
  echo "Action required before committing:"
  echo "  1. Run: pnpm audit --audit-level=high"
  echo "  2. Check the advisory details and update affected packages"
  echo "  3. Run: pnpm update <package-name>"
  echo "  4. Re-run: pnpm audit --audit-level=high to verify clean"
  echo ""
  echo "Commit BLOCKED. Resolve vulnerabilities and try again."
  exit 1
fi
