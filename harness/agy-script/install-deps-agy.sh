#!/usr/bin/env bash
# harness/agy-script/install-deps-agy.sh
# OBJ-04: Install runtime dependencies for agy-os using pnpm (frozen lockfile)
# MUST be run via Git Bash. CMD and PowerShell are prohibited per AGENTS.md §0.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "[install-deps-agy] Installing runtime dependencies for agy-os..."
echo "[install-deps-agy] Root: ${ROOT_DIR}"

# Check pnpm is available
if ! command -v pnpm &> /dev/null; then
  echo ""
  echo "ERROR: pnpm is not installed or not in PATH."
  echo ""
  echo "To install pnpm, run one of the following in Git Bash:"
  echo "  corepack enable && corepack use pnpm@11.5.3"
  echo "  OR: npm install -g pnpm@11.5.3"
  echo ""
  echo "Then re-run: bash harness/agy-script/install-deps-agy.sh"
  exit 1
fi

PNPM_VERSION=$(pnpm --version 2>/dev/null || echo "unknown")
echo "[install-deps-agy] Using pnpm v${PNPM_VERSION}"

# Run frozen install to prevent lockfile drift
cd "${ROOT_DIR}"
pnpm install --frozen-lockfile

echo ""
echo "[install-deps-agy] Install complete. All dependencies are ready."
echo "[install-deps-agy] Verify with: node harness/agy-script/verify-deps-agy.js"
