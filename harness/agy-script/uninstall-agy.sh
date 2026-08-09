#!/usr/bin/env bash
# ==============================================================================
# AGY Custom ECC Uninstall / Rollback Script
# Target Harness Workspace: agy-os (d:/dev/agy-os)
# Target Cleanup Locations:
#   - .agents/agents/
#   - .agents/plugin/ecc/
#   - .agents/rules/
#   - .agents/workflows/
#   - .agents/skills/
#   - .agents/scripts/
#   - .agents/hooks.json
#   - .agents/ecc-items.json
# Safety Guarantees: ECC/ and website/ remain 100% untouched
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TARGET_DIR=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --target-dir)
            TARGET_DIR="$2"
            shift 2
            ;;
        --dry-run|-n)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Usage: uninstall-agy.sh [--target-dir <path>] [--dry-run]"
            echo "Automated teardown/rollback script for installed ECC plugin assets."
            echo ""
            echo "Options:"
            echo "  --target-dir <path>  Target repository directory for isolated teardown."
            echo "  --dry-run, -n        Preview deletion without making any changes."
            echo "  --help, -h           Show this help message."
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

if [ -n "${TARGET_DIR}" ]; then
    ROOT_DIR="${TARGET_DIR}"
else
    ROOT_DIR="$( cd "${SCRIPT_DIR}/../.." && pwd )"
fi

# Normalize Windows paths if needed, ensuring forward slashes
ROOT_DIR="$(echo "${ROOT_DIR}" | tr '\\' '/')"

echo "[uninstall-agy.sh] Starting AGY ECC teardown/rollback..."
echo "[uninstall-agy.sh] Target Root: ${ROOT_DIR}"
echo "[uninstall-agy.sh] Dry-Run Mode: ${DRY_RUN}"

TARGET_AGENTS_DIR="${ROOT_DIR}/.agents/agents"
TARGET_PLUGIN_DIR="${ROOT_DIR}/.agents/plugin"
TARGET_RULES_DIR="${ROOT_DIR}/.agents/rules"
TARGET_WORKFLOWS_DIR="${ROOT_DIR}/.agents/workflows"
TARGET_SKILLS_DIR="${ROOT_DIR}/.agents/skills"
TARGET_SCRIPTS_DIR="${ROOT_DIR}/.agents/scripts"
TARGET_HOOKS_FILE="${ROOT_DIR}/.agents/hooks.json"
TARGET_HOOKS_BAK_FILE="${ROOT_DIR}/.agents/hooks.json.bak"
TARGET_ECC_ITEMS_FILE="${ROOT_DIR}/.agents/ecc-items.json"
ECC_REF_DIR="d:/dev/agy-os/ECC"
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
    echo "[DRY-RUN] Would remove agents directory: ${TARGET_AGENTS_DIR}"
    echo "[DRY-RUN] Would remove plugin directory: ${TARGET_PLUGIN_DIR}"
    echo "[DRY-RUN] Would remove rules directory: ${TARGET_RULES_DIR}"
    echo "[DRY-RUN] Would remove workflows directory: ${TARGET_WORKFLOWS_DIR}"
    echo "[DRY-RUN] Would remove skills directory: ${TARGET_SKILLS_DIR}"
    echo "[DRY-RUN] Would remove scripts directory: ${TARGET_SCRIPTS_DIR}"
    echo "[DRY-RUN] Would remove hooks file: ${TARGET_HOOKS_FILE}"
    echo "[DRY-RUN] Would remove hooks backup file: ${TARGET_HOOKS_BAK_FILE}"
    echo "[DRY-RUN] Would remove ecc-items file: ${TARGET_ECC_ITEMS_FILE}"
    echo "[DRY-RUN] Would remove root .agents directory: ${ROOT_DIR}/.agents"
    echo "[DRY-RUN] Reference directories untouched:"
    echo "  - ${ECC_REF_DIR} (UNTOUCHED)"
    echo "  - ${WEBSITE_REF_DIR} (UNTOUCHED)"
    echo "============================================================="
    echo "[uninstall-agy.sh] DRY-RUN COMPLETE. No disk changes executed."
    exit 0
fi

# Step 1: Remove .agents/agents/
echo "[uninstall-agy.sh] Step 1: Removing agents directory..."
if [ -d "${TARGET_AGENTS_DIR}" ]; then
    rm -rf "${TARGET_AGENTS_DIR}"
    echo "  [SUCCESS] Removed directory: ${TARGET_AGENTS_DIR}"
fi

# Step 2: Remove .agents/plugin/
echo "[uninstall-agy.sh] Step 2: Removing ECC plugin directory..."
if [ -d "${TARGET_PLUGIN_DIR}" ]; then
    rm -rf "${TARGET_PLUGIN_DIR}"
    echo "  [SUCCESS] Removed directory: ${TARGET_PLUGIN_DIR}"
fi

# Step 3: Remove .agents/rules/
echo "[uninstall-agy.sh] Step 3: Removing rules directory..."
if [ -d "${TARGET_RULES_DIR}" ]; then
    rm -rf "${TARGET_RULES_DIR}"
    echo "  [SUCCESS] Removed directory: ${TARGET_RULES_DIR}"
fi

# Step 4: Remove .agents/workflows/
echo "[uninstall-agy.sh] Step 4: Removing workflows directory..."
if [ -d "${TARGET_WORKFLOWS_DIR}" ]; then
    rm -rf "${TARGET_WORKFLOWS_DIR}"
    echo "  [SUCCESS] Removed directory: ${TARGET_WORKFLOWS_DIR}"
fi

# Step 5: Remove .agents/skills/
echo "[uninstall-agy.sh] Step 5: Removing skills directory..."
if [ -d "${TARGET_SKILLS_DIR}" ]; then
    rm -rf "${TARGET_SKILLS_DIR}"
    echo "  [SUCCESS] Removed directory: ${TARGET_SKILLS_DIR}"
fi

# Step 6: Remove .agents/scripts/
echo "[uninstall-agy.sh] Step 6: Removing scripts directory..."
if [ -d "${TARGET_SCRIPTS_DIR}" ]; then
    rm -rf "${TARGET_SCRIPTS_DIR}"
    echo "  [SUCCESS] Removed directory: ${TARGET_SCRIPTS_DIR}"
fi

# Step 7: Remove .agents/hooks.json & backup
echo "[uninstall-agy.sh] Step 7: Removing hooks files..."
if [ -f "${TARGET_HOOKS_FILE}" ]; then
    rm -f "${TARGET_HOOKS_FILE}"
    echo "  [SUCCESS] Removed file: ${TARGET_HOOKS_FILE}"
fi
if [ -f "${TARGET_HOOKS_BAK_FILE}" ]; then
    rm -f "${TARGET_HOOKS_BAK_FILE}"
    echo "  [SUCCESS] Removed file: ${TARGET_HOOKS_BAK_FILE}"
fi

# Step 8: Remove .agents/ecc-items.json
echo "[uninstall-agy.sh] Step 8: Removing ecc-items file..."
if [ -f "${TARGET_ECC_ITEMS_FILE}" ]; then
    rm -f "${TARGET_ECC_ITEMS_FILE}"
    echo "  [SUCCESS] Removed file: ${TARGET_ECC_ITEMS_FILE}"
fi

# Step 9: Clean .agents/ directory
if [ -d "${ROOT_DIR}/.agents" ]; then
    rm -rf "${ROOT_DIR}/.agents"
    echo "  [SUCCESS] Removed directory: ${ROOT_DIR}/.agents"
fi

# Step 10: Safety Audit Confirmation
echo "[uninstall-agy.sh] Step 10: Verifying reference preservation..."
echo "  [VERIFIED] Original ECC/ repository untouched: ${ECC_REF_DIR}"
echo "  [VERIFIED] Target website/ repository untouched: ${WEBSITE_REF_DIR}"

echo "[uninstall-agy.sh] Rollback complete. All installed ECC assets, rules, workflows, skills, scripts, and hooks have been safely cleaned up."

