#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=./ddf-lib.sh
source "$(dirname "$0")/ddf-lib.sh"

ensure_yq

TARGET_FILE=""
SKIP_TARGET_CHECK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --file) TARGET_FILE="$2"; shift 2 ;;
        --skip-target-check) SKIP_TARGET_CHECK=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

check_file() {
    local file="$1"
    local filename
    filename=$(basename "$file")

    # Skip templates and index files
    if [[ "$filename" == _* || "$filename" == "README.md" || "$filename" == "index.md" || "$file" == *"_template"* ]]; then
        return 0
    fi

    local doc_category=""
    if [[ "$file" == *"docs/decisions"* || "$filename" == ADR-* ]]; then
        doc_category="adr"
    elif [[ "$file" == *"docs/changes"* || "$filename" == CHG-* ]]; then
        doc_category="chg"
    elif [[ "$file" == *"docs/vision"* ]]; then
        doc_category="vision"
    elif [[ "$file" == *"docs/journal"* ]]; then
        doc_category="journal"
    else
        log_warn "File $file does not match known DDF document categories."
        WARN_COUNT=$((WARN_COUNT + 1))
        return 0
    fi

    # Phase 1: Delimiter Check
    local delim_count
    delim_count=$(tr -d '\r' < "$file" | grep -c "^---$" || echo "0")
    if [[ "$delim_count" -lt 2 ]]; then
        log_fail "$file: Missing frontmatter delimiters (---)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 0
    fi

    # Phase 2: Mandatory Key Check & Canonical Status Enum Validation
    local failed=false
    local status_val
    status_val=$(get_frontmatter_value "$file" "status" | tr -d '"' | tr -d "'")

    case "$doc_category" in
        adr)
            for key in decision_id status goal invariants date; do
                local val
                val=$(get_frontmatter_value "$file" "$key")
                if [[ "$val" == "null" || -z "$val" ]]; then
                    log_fail "$file: Missing mandatory key '$key'"
                    failed=true
                fi
            done
            case "$status_val" in
                draft|proposed|approved|superseded|deprecated) ;;
                *)
                    log_fail "$file: Invalid ADR status '$status_val' (Allowed: draft|proposed|approved|superseded|deprecated)"
                    failed=true
                    ;;
            esac
            ;;
        chg)
            for key in change_id status decision_refs owner_stage date; do
                local val
                if [[ "$key" == "decision_refs" ]]; then
                    val=$(get_frontmatter_list "$file" "$key")
                else
                    val=$(get_frontmatter_value "$file" "$key")
                fi
                
                if [[ -z "$val" || "$val" == "null" ]]; then
                    log_fail "$file: Missing mandatory key '$key'"
                    failed=true
                fi
            done
            case "$status_val" in
                draft|proposed|in_progress|completed|verified|archived) ;;
                *)
                    log_fail "$file: Invalid Change status '$status_val' (Allowed: draft|proposed|in_progress|completed|verified|archived)"
                    failed=true
                    ;;
            esac
            ;;
        vision|journal)
            for key in title status; do
                local val
                val=$(get_frontmatter_value "$file" "$key")
                if [[ "$val" == "null" || -z "$val" ]]; then
                    log_fail "$file: Missing mandatory key '$key'"
                    failed=true
                fi
            done
            case "$status_val" in
                draft|active|archived) ;;
                *)
                    log_fail "$file: Invalid $doc_category status '$status_val' (Allowed: draft|active|archived)"
                    failed=true
                    ;;
            esac
            local legacy_id
            legacy_id=$(get_frontmatter_value "$file" "id")
            if [[ "$legacy_id" != "null" && -n "$legacy_id" ]]; then
                log_fail "$file: Deprecated frontmatter key 'id' found. Use 'doc_id' instead."
                failed=true
            fi
            ;;
    esac

    if $failed; then
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 0
    fi

    # Phase 3: Decision Reference Validation (for Changes)
    if [[ "$doc_category" == "chg" ]]; then
        local refs
        refs=$(get_frontmatter_list "$file" "decision_refs")
        if [[ -n "$refs" ]]; then
            while IFS= read -r ref; do
                [[ -z "$ref" || "$ref" == "null" ]] && continue
                ref=$(echo "$ref" | tr -d '"' | tr -d "'")
                
                local adr_file
                adr_file=$(find "$DECISIONS_DIR" -maxdepth 1 -name "${ref}*.md" 2>/dev/null | head -n 1 || true)
                if [[ -z "$adr_file" ]]; then
                    log_fail "$file: Invalid decision_ref '$ref' - file not found in $DECISIONS_DIR"
                    failed=true
                else
                    local adr_status
                    adr_status=$(get_frontmatter_value "$adr_file" "status" | tr -d '"' | tr -d "'")
                    if [[ "$adr_status" != "approved" && "$adr_status" != "superseded" ]]; then
                        log_fail "$file: Invalid decision_ref '$ref' - status is '$adr_status', expected 'approved' or 'superseded'"
                        failed=true
                    fi
                fi
            done <<< "$refs"
        fi

        # Phase 3.5: Affected Scope Cross-Validation (for Changes)
        local allowed_scopes=()
        if [[ -n "$refs" ]]; then
            while IFS= read -r ref; do
                [[ -z "$ref" || "$ref" == "null" ]] && continue
                ref=$(echo "$ref" | tr -d '"' | tr -d "'")
                local adr_file
                adr_file=$(find "$DECISIONS_DIR" -maxdepth 1 -name "${ref}*.md" 2>/dev/null | head -n 1 || true)
                if [[ -n "$adr_file" && -f "$adr_file" ]]; then
                    while IFS= read -r scope; do
                        [[ -z "$scope" || "$scope" == "null" ]] && continue
                        scope=$(echo "$scope" | tr -d '"' | tr -d "'")
                        allowed_scopes+=("$scope")
                    done < <(get_frontmatter_list "$adr_file" "affected_scope")
                fi
            done <<< "$refs"
        fi

        if [[ ${#allowed_scopes[@]} -gt 0 ]]; then
            local touched_paths
            # shellcheck disable=SC2016
            touched_paths=$(grep -E '^\s*-\s*`[^`]+`' "$file" | sed -E 's/^\s*-\s*`([^`]+)`.*/\1/' || true)
            if [[ -n "$touched_paths" ]]; then
                while IFS= read -r tpath; do
                    [[ -z "$tpath" || "$tpath" == *"staged target patch"* ]] && continue
                    local path_allowed=false
                    for scope in "${allowed_scopes[@]}"; do
                        if [[ "$tpath" == "$scope"* || "$tpath" == "$scope" ]]; then
                            path_allowed=true
                            break
                        fi
                    done
                    if ! $path_allowed; then
                        log_warn "$file: Touched path '$tpath' falls outside declared affected_scope of bound ADRs."
                        WARN_COUNT=$((WARN_COUNT + 1))
                    fi
                done <<< "$touched_paths"
            fi
        fi
    fi

    if $failed; then
        FAIL_COUNT=$((FAIL_COUNT + 1))
    else
        PASS_COUNT=$((PASS_COUNT + 1))
    fi
}

check_target_repo() {
    if [ "$SKIP_TARGET_CHECK" = false ]; then
        if [ -d "$TARGET_REPO" ]; then
            if git -C "$TARGET_REPO" rev-parse --git-dir &>/dev/null; then
                local current_sha
                current_sha=$(git -C "$TARGET_REPO" rev-parse HEAD 2>/dev/null || echo "")
                local baseline_file="${OVERRIDE_BASELINE_FILE:-$REPO_ROOT/harness/.target-baseline}"
                if [[ -n "$current_sha" ]]; then
                    if [[ ! -f "$baseline_file" ]]; then
                        echo "$current_sha" > "$baseline_file"
                        log_info "Initialized target baseline SHA: $current_sha in $baseline_file"
                    else
                        local baseline_sha
                        baseline_sha=$(tr -d '\r\n ' < "$baseline_file")
                        if [[ "$current_sha" != "$baseline_sha" ]]; then
                            log_fail "Target repo commit hash drift detected (expected $baseline_sha, got $current_sha)."
                            FAIL_COUNT=$((FAIL_COUNT + 1))
                        fi
                    fi
                fi

                local status_output
                status_output=$(git -C "$TARGET_REPO" status --porcelain || true)
                if [[ -n "$status_output" ]]; then
                    log_fail "Target repo ($TARGET_REPO) has uncommitted modifications."
                    FAIL_COUNT=$((FAIL_COUNT + 1))
                else
                    log_pass "Target repo ($TARGET_REPO) is clean (git baseline verified)."
                fi
            else
                log_pass "Target repo ($TARGET_REPO) directory exists (non-git directory verified)."
            fi
        else
            log_warn "Target repo ($TARGET_REPO) not found."
            WARN_COUNT=$((WARN_COUNT + 1))
        fi
    fi
}

check_patch_coupling() {
    if [[ ! -d "$PATCHES_DIR" ]]; then
        return 0
    fi

    for patch_file in "$PATCHES_DIR"/*.patch; do
        [[ ! -e "$patch_file" ]] && continue
        local patch_name
        patch_name=$(basename "$patch_file")
        
        local coupled=false
        for chg_dir in "$CHANGES_DIR" "$ARCHIVE_DIR"; do
            if [[ -d "$chg_dir" ]]; then
                for chg_file in "$chg_dir"/CHG-*.md; do
                    [[ ! -e "$chg_file" ]] && continue
                    if grep -q -F "$patch_name" "$chg_file" 2>/dev/null; then
                        coupled=true
                        break 2
                    fi
                done
            fi
        done

        if ! $coupled; then
            log_fail "Uncoupled patch file found: $patch_name (no referencing Change Record in $CHANGES_DIR)"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        else
            log_pass "Patch coupling verified: $patch_name"
            PASS_COUNT=$((PASS_COUNT + 1))
        fi
    done
}

check_spec_delta_bundles() {
    local plans_dir="$DOCS_DIR/vision/plans"
    if [[ ! -d "$plans_dir" ]]; then
        return 0
    fi
    for bundle_dir in "$plans_dir"/*; do
        [[ ! -d "$bundle_dir" ]] && continue
        local slug
        slug=$(basename "$bundle_dir")
        [[ "$slug" == "_template" || "$slug" == "archive" ]] && continue

        local bundle_failed=false
        for req_file in "requirements.md" "design.md" "tasks.md"; do
            if [[ ! -f "$bundle_dir/$req_file" ]]; then
                log_fail "$bundle_dir: Missing mandatory Spec-Delta file '$req_file'"
                bundle_failed=true
            fi
        done
        if $bundle_failed; then
            FAIL_COUNT=$((FAIL_COUNT + 1))
        else
            log_pass "Spec-Delta bundle verified: $slug"
            PASS_COUNT=$((PASS_COUNT + 1))
        fi
    done
}

# Phase 4: Target Repo Read-Only Check
check_target_repo

log_info "Validating files..."
if [[ -n "$TARGET_FILE" ]]; then
    if [[ -f "$TARGET_FILE" ]]; then
        check_file "$TARGET_FILE"
    else
        log_fail "Target file not found: $TARGET_FILE"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
else
    # Expanded scanner covering decisions, changes (active & archive), vision, and journal
    for category_dir in "$DECISIONS_DIR" "$CHANGES_DIR" "$CHANGES_DIR/archive" "$DOCS_DIR/vision" "$DOCS_DIR/journal"; do
        if [[ -d "$category_dir" ]]; then
            for f in "$category_dir"/*.md; do
                [[ -e "$f" ]] && check_file "$f"
            done
        fi
    done
    check_spec_delta_bundles
    check_patch_coupling
fi

echo ""
log_info "Validation Summary: $PASS_COUNT passed, $FAIL_COUNT failed, $WARN_COUNT warnings."
if [[ $FAIL_COUNT -gt 0 ]]; then
    exit 1
fi
