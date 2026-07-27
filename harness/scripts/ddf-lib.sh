#!/usr/bin/env bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }

resolve_repo_root() {
    # Assumes script is in harness/scripts/
    cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd
}

# shellcheck disable=SC2034
REPO_ROOT="${OVERRIDE_REPO_ROOT:-$(resolve_repo_root)}"
DOCS_DIR="${OVERRIDE_DOCS_DIR:-$REPO_ROOT/docs}"
DECISIONS_DIR="${OVERRIDE_DECISIONS_DIR:-$DOCS_DIR/decisions}"
CHANGES_DIR="${OVERRIDE_CHANGES_DIR:-$DOCS_DIR/changes}"
ARCHIVE_DIR="${OVERRIDE_ARCHIVE_DIR:-$CHANGES_DIR/archive}"
PATCHES_DIR="${OVERRIDE_PATCHES_DIR:-$REPO_ROOT/harness/patches}"
TARGET_REPO="${OVERRIDE_TARGET_REPO:-d:/CLAUDE-PROJECT/website}"

YQ_VERSION="v4.44.3"

ensure_yq() {
    local bin_dir="$REPO_ROOT/harness/bin"
    if [[ ! -f "$bin_dir/yq" && ! -f "$bin_dir/yq.exe" ]]; then
        local real_bin
        real_bin="$(resolve_repo_root)/harness/bin"
        if [[ -f "$real_bin/yq.exe" ]]; then
            mkdir -p "$bin_dir"
            cp "$real_bin/yq.exe" "$bin_dir/"
        elif [[ -f "$real_bin/yq" ]]; then
            mkdir -p "$bin_dir"
            cp "$real_bin/yq" "$bin_dir/"
        fi
    fi
    local os="linux"
    local ext=""
    case "$(uname -s 2>/dev/null || echo "MINGW")" in
        CYGWIN*|MINGW*|MSYS*) os="windows"; ext=".exe" ;;
        Darwin*)              os="darwin" ;;
        Linux*)               os="linux" ;;
        *)
            log_fail "Unsupported OS platform: $(uname -s 2>/dev/null || echo 'unknown')"
            exit 1
            ;;
    esac

    local arch="amd64"
    case "$(uname -m 2>/dev/null || echo "x86_64")" in
        aarch64|arm64) arch="arm64" ;;
        x86_64|amd64)  arch="amd64" ;;
        *)
            log_fail "Unsupported CPU architecture: $(uname -m 2>/dev/null || echo 'unknown')"
            exit 1
            ;;
    esac

    local expected_hash=""
    case "${os}_${arch}" in
        windows_amd64) expected_hash="e279bc506a452eeafcdf364f91a025455e402a8001169083caf01f4b64a544e2" ;;
        linux_amd64)   expected_hash="41982ed30c309f95d852033481239c437a91a56662767011d8d80bf9d0ef7b77" ;;
        darwin_amd64)  expected_hash="c555bc6f5d8cfd414a6006f152d1163459c00b05b63077759b8606aa9f9e578c" ;;
        darwin_arm64)  expected_hash="b2d97ad0254f590eb7707e780fa2a912bb0e71f985012571217e928ee8d887a0" ;;
        *)
            log_fail "No expected SHA256 checksum defined for platform ${os}_${arch}"
            exit 1
            ;;
    esac

    local asset_name="yq_${os}_${arch}${ext}"
    local target_path="$bin_dir/yq${ext}"
    local url="https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/${asset_name}"

    if [[ ! -f "$target_path" ]]; then
        if command -v yq &> /dev/null; then
            return 0
        fi
        log_info "yq not found. Bootstrapping yq ($YQ_VERSION)..."
        mkdir -p "$bin_dir"
        log_info "Downloading $asset_name from $url..."
        curl -sL "$url" -o "$target_path"
        chmod +x "$target_path" 2>/dev/null || true
    fi

    export PATH="$bin_dir:$PATH"

    local actual_hash=""
    if command -v sha256sum &>/dev/null; then
        actual_hash=$(sha256sum "$target_path" | awk '{print $1}')
    elif command -v shasum &>/dev/null; then
        actual_hash=$(shasum -a 256 "$target_path" | awk '{print $1}')
    fi

    if [[ -n "$actual_hash" && "$actual_hash" != "$expected_hash" ]]; then
        log_fail "SHA256 checksum mismatch for $asset_name! Expected: $expected_hash, Got: $actual_hash"
        exit 1
    else
        log_pass "SHA256 checksum verified for $asset_name"
    fi
}

get_frontmatter_value() {
    local file="$1"
    local key="$2"
    tr -d '\r' < "$file" | sed -n '1{/^---$/!q};1d;/^---$/q;p' | yq eval ".${key}" - 2>/dev/null || echo "null"
}

get_frontmatter_list() {
    local file="$1"
    local key="$2"
    tr -d '\r' < "$file" | sed -n '1{/^---$/!q};1d;/^---$/q;p' | yq eval ".${key}[]" - 2>/dev/null || true
}
