#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=./ddf-lib.sh
source "$(dirname "$0")/ddf-lib.sh"

ensure_yq

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    shift
fi

PLANS_DIR="$DOCS_DIR/vision/plans"
PLANS_ARCHIVE_DIR="$PLANS_DIR/archive"
mkdir -p "$ARCHIVE_DIR"
mkdir -p "$PLANS_ARCHIVE_DIR"

ARCHIVED_COUNT=0

log_info "Scanning for completed/verified Change Records to archive..."

if [[ -d "$CHANGES_DIR" ]]; then
    for f in "$CHANGES_DIR"/CHG-*.md; do
        [[ ! -e "$f" ]] && continue
        
        status=$(get_frontmatter_value "$f" "status" | tr -d '"' | tr -d "'")
        if [[ "$status" == "archived" || "$status" == "completed" || "$status" == "verified" ]]; then
            fname=$(basename "$f" .md)
            slug=$(echo "$fname" | sed -E 's/^CHG-[0-9]+-?//')
            spec_delta=$(get_frontmatter_value "$f" "spec_delta_ref" | tr -d '"' | tr -d "'")

            if $DRY_RUN; then
                log_info "Would archive: $(basename "$f") (status: $status)"
            else
                # Use git mv if tracked, else mv
                if git ls-files --error-unmatch "$f" &>/dev/null; then
                    git mv "$f" "$ARCHIVE_DIR/"
                else
                    mv "$f" "$ARCHIVE_DIR/"
                fi
                log_pass "Archived: $(basename "$f")"
            fi
            ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))

            # Check for associated Spec-Delta folder via spec_delta_ref or candidate slug
            for candidate in "$spec_delta" "$fname" "$slug"; do
                if [[ -n "$candidate" && "$candidate" != "null" && "$candidate" != "_template" && "$candidate" != "archive" && -d "$PLANS_DIR/$candidate" ]]; then
                    if $DRY_RUN; then
                        log_info "Would archive Spec-Delta bundle: $candidate"
                    else
                        if git ls-files --error-unmatch "$PLANS_DIR/$candidate" &>/dev/null; then
                            git mv "$PLANS_DIR/$candidate" "$PLANS_ARCHIVE_DIR/"
                        else
                            mv "$PLANS_DIR/$candidate" "$PLANS_ARCHIVE_DIR/"
                        fi
                        log_pass "Archived Spec-Delta bundle: $candidate"
                    fi
                    break
                fi
            done
        fi
    done
fi

if [[ $ARCHIVED_COUNT -eq 0 ]]; then
    log_info "No records needed archiving."
else
    log_info "Archived $ARCHIVED_COUNT records."
    if ! $DRY_RUN; then
        log_info "Triggering index sync..."
        "$(dirname "$0")/ddf-index-sync.sh"
    fi
fi
