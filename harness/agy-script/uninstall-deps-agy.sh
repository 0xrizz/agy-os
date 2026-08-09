#!/usr/bin/env bash
# harness/agy-script/uninstall-deps-agy.sh
# OBJ-04: Non-destructive rollback — removes node_modules/ at root agy-os/ only.
# MUST be run via Git Bash. CMD and PowerShell are prohibited per AGENTS.md §0.
# 
# SAFETY INVARIANTS:
# - Only deletes: d:/dev/agy-os/node_modules/
# - NEVER touches: package.json, pnpm-lock.yaml, .npmrc, .gitignore, ECC/, website/
# - Logs timestamp to harness/agy-script/.rollback-log
# Per spec: pkg.isolation.non_destructive

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
NODE_MODULES_DIR="${ROOT_DIR}/node_modules"
ROLLBACK_LOG="${SCRIPT_DIR}/.rollback-log"

echo "[uninstall-deps-agy] Root: ${ROOT_DIR}"
echo "[uninstall-deps-agy] Target: ${NODE_MODULES_DIR}"

# Safety check: confirm we are targeting the correct directory
if [[ "${NODE_MODULES_DIR}" != *"agy-os/node_modules" ]]; then
  echo "ERROR: Unexpected target path: ${NODE_MODULES_DIR}"
  echo "ABORT: Will only delete node_modules at root agy-os/ level."
  exit 1
fi

# Safety check: ensure we never touch website/ or ECC/
WEBSITE_DIR="/d/CLAUDE-PROJECT/website"
ECC_DIR="${ROOT_DIR}/ECC"

if [[ "${NODE_MODULES_DIR}" == *"${WEBSITE_DIR}"* ]]; then
  echo "ERROR: Target path includes website/ — READ-ONLY. ABORT."
  exit 1
fi

if [[ "${NODE_MODULES_DIR}" == *"${ECC_DIR}"* ]]; then
  echo "ERROR: Target path includes ECC/ — READ-ONLY. ABORT."
  exit 1
fi

# Perform deletion
if [ -d "${NODE_MODULES_DIR}" ]; then
  echo "[uninstall-deps-agy] Removing ${NODE_MODULES_DIR}..."
  rm -rf "${NODE_MODULES_DIR}"
  echo "[uninstall-deps-agy] node_modules/ removed successfully."
else
  echo "[uninstall-deps-agy] node_modules/ not found at ${NODE_MODULES_DIR} — nothing to remove."
fi

# Log rollback with timestamp
TIMESTAMP=$(date '+%Y-%m-%dT%H:%M:%S%z')
echo "${TIMESTAMP} | uninstall-deps-agy | removed ${NODE_MODULES_DIR}" >> "${ROLLBACK_LOG}"
echo "[uninstall-deps-agy] Rollback logged to ${ROLLBACK_LOG}"

echo ""
echo "[uninstall-deps-agy] Rollback complete. Config files (package.json, pnpm-lock.yaml, .npmrc, .gitignore) are untouched."
echo "[uninstall-deps-agy] To reinstall: bash harness/agy-script/install-deps-agy.sh"
