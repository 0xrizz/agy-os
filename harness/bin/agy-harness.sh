#!/usr/bin/env bash
# agy-harness — Personal Local Product CLI Entrypoint for AGY-OS Harness Deployment

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HARNESS_ROOT="$( cd "${SCRIPT_DIR}/../.." && pwd )"
HARNESS_ROOT="$(echo "${HARNESS_ROOT}" | tr '\\' '/')"

COMMAND="$1"
shift || true

# Forward-slash path normalization for --target-dir parameter
ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target-dir)
      TARGET_VAL="$2"
      TARGET_VAL_NORM="$(echo "${TARGET_VAL}" | tr '\\' '/')"
      ARGS+=("--target-dir" "${TARGET_VAL_NORM}")
      shift 2
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

case "${COMMAND}" in
  deploy|install)
    bash "${HARNESS_ROOT}/harness/agy-script/install-agy.sh" "${ARGS[@]}"
    ;;
  verify|audit)
    node "${HARNESS_ROOT}/harness/agy-script/scripts/verify-installation-agy.js" "${ARGS[@]}"
    ;;
  uninstall|clean)
    bash "${HARNESS_ROOT}/harness/agy-script/uninstall-agy.sh" "${ARGS[@]}"
    ;;
  status)
    echo "=== AGY-OS Local Product Status ==="
    node "${HARNESS_ROOT}/harness/agy-script/scripts/verify-installation-agy.js" "${ARGS[@]}"
    ;;
  *)
    echo "Usage: agy-harness <deploy|verify|uninstall|status> [--target-dir <path>]"
    exit 1
    ;;
esac
