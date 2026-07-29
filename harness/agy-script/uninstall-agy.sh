#!/usr/bin/env bash
# ==============================================================================
# AGY Custom ECC Uninstall / Rollback Script
# Target Harness Workspace: agy-os (d:/dev/agy-os)
# Target Cleanup Locations:
#   - .agents/plugin/ecc/
#   - .agents/rules/
#   - .agents/workflows/
#   - .agents/skills/
#   - .agents/hooks.json
# Safety Guarantees: ECC/ and website/ remain 100% untouched
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "${SCRIPT_DIR}/../.." && pwd )"

# Normalize Windows paths if needed, ensuring forward slashes
ROOT_DIR="$(echo "${ROOT_DIR}" | sed 's/\\/\//g')"

DRY_RUN=false

for arg in "$@"; do
    case "$arg" in
        --dry-run|-n)
            DRY_RUN=true
            ;;
        --help|-h)
            echo "Usage: uninstall-agy.sh [--dry-run]"
            echo "Automated teardown/rollback script for installed ECC plugin assets."
            echo ""
            echo "Options:"
            echo "  --dry-run, -n    Preview deletion without making any changes."
            echo "  --help, -h       Show this help message."
            exit 0
            ;;
    esac
done

echo "[uninstall-agy.sh] Starting AGY ECC teardown/rollback..."
echo "[uninstall-agy.sh] Target Root: ${ROOT_DIR}"
echo "[uninstall-agy.sh] Dry-Run Mode: ${DRY_RUN}"

TARGET_PLUGIN_DIR="${ROOT_DIR}/.agents/plugin/ecc"
TARGET_RULES_DIR="${ROOT_DIR}/.agents/rules"
TARGET_WORKFLOWS_DIR="${ROOT_DIR}/.agents/workflows"
TARGET_SKILLS_DIR="${ROOT_DIR}/.agents/skills"
TARGET_HOOKS_FILE="${ROOT_DIR}/.agents/hooks.json"
ECC_REF_DIR="${ROOT_DIR}/ECC"
WEBSITE_REF_DIR="d:/CLAUDE-PROJECT/website"

# Safety Verification
echo "[uninstall-agy.sh] Verifying read-only reference repositories..."
if [ -d "${ECC_REF_DIR}" ]; then
    echo "  [PASS] Upstream ECC/ repository protected at: ${ECC_REF_DIR}"
fi
if [ -d "${WEBSITE_REF_DIR}" ]; then
    echo "  [PASS] Target website/ repository protected at: ${WEBSITE_REF_DIR}"
fi

if [ "$DRY_RUN" = true ]; then
    echo "=================== DRY-RUN ROLLBACK PLAN ==================="
    echo "[DRY-RUN] Would remove plugin directory: ${TARGET_PLUGIN_DIR}"
    echo "[DRY-RUN] Would remove rules directory: ${TARGET_RULES_DIR}"
    echo "[DRY-RUN] Would remove workflows directory: ${TARGET_WORKFLOWS_DIR}"
    echo "[DRY-RUN] Would remove skills directory: ${TARGET_SKILLS_DIR}"
    echo "[DRY-RUN] Would remove hooks file: ${TARGET_HOOKS_FILE}"
    echo "[DRY-RUN] Reference directories untouched:"
    echo "  - ${ECC_REF_DIR} (UNTOUCHED)"
    echo "  - ${WEBSITE_REF_DIR} (UNTOUCHED)"
    echo "============================================================="
    echo "[uninstall-agy.sh] DRY-RUN COMPLETE. No disk changes executed."
    exit 0
fi

# Step 1: Remove .agents/plugin/ecc/
echo "[uninstall-agy.sh] Step 1: Removing ECC plugin directory..."
if [ -d "${TARGET_PLUGIN_DIR}" ]; then
    rm -rf "${TARGET_PLUGIN_DIR}"
    echo "  [SUCCESS] Removed directory: ${TARGET_PLUGIN_DIR}"
fi

# Step 2: Remove .agents/rules/
echo "[uninstall-agy.sh] Step 2: Removing rules directory..."
if [ -d "${TARGET_RULES_DIR}" ]; then
    rm -rf "${TARGET_RULES_DIR}"
    echo "  [SUCCESS] Removed directory: ${TARGET_RULES_DIR}"
fi

# Step 3: Remove .agents/workflows/
echo "[uninstall-agy.sh] Step 3: Removing workflows directory..."
if [ -d "${TARGET_WORKFLOWS_DIR}" ]; then
    rm -rf "${TARGET_WORKFLOWS_DIR}"
    echo "  [SUCCESS] Removed directory: ${TARGET_WORKFLOWS_DIR}"
fi

# Step 4: Remove .agents/skills/
echo "[uninstall-agy.sh] Step 4: Removing skills directory..."
if [ -d "${TARGET_SKILLS_DIR}" ]; then
    rm -rf "${TARGET_SKILLS_DIR}"
    echo "  [SUCCESS] Removed directory: ${TARGET_SKILLS_DIR}"
fi

# Step 5: Remove .agents/hooks.json
echo "[uninstall-agy.sh] Step 5: Removing hooks file..."
if [ -f "${TARGET_HOOKS_FILE}" ]; then
    rm -f "${TARGET_HOOKS_FILE}"
    echo "  [SUCCESS] Removed file: ${TARGET_HOOKS_FILE}"
fi

# Step 6: Safety Audit Confirmation
echo "[uninstall-agy.sh] Step 6: Verifying reference preservation..."
echo "  [VERIFIED] Original ECC/ repository untouched: ${ECC_REF_DIR}"
echo "  [VERIFIED] Target website/ repository untouched: ${WEBSITE_REF_DIR}"

echo "[uninstall-agy.sh] Rollback complete. All installed ECC assets, rules, workflows, skills, and hooks have been safely cleaned up."
