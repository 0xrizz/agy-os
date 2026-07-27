#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=./ddf-lib.sh
source "$(dirname "$0")/ddf-lib.sh"

ensure_yq

generate_index() {
    local dir="$1"
    local pattern="$2"
    local out_file="$3"
    local type="$4" # ADR or CHG

    mkdir -p "$(dirname "$out_file")"
    
    echo "<!-- THIS FILE IS AUTO-GENERATED (DERIVED CACHE). DO NOT EDIT DIRECTLY. -->" > "$out_file"
    echo "# $type Index" >> "$out_file"
    echo "" >> "$out_file"

    shopt -s nullglob
    # shellcheck disable=SC2206
    local files=("$dir"/$pattern)
    shopt -u nullglob

    local valid_files=()
    for f in "${files[@]}"; do
        [[ -f "$f" ]] || continue
        if [[ "$type" == "ADR" ]]; then
            local status
            status=$(get_frontmatter_value "$f" "status" | tr -d '"' | tr -d "'")
            if [[ "$status" == "approved" || "$status" == "superseded" ]]; then
                valid_files+=("$f")
            fi
        else
            valid_files+=("$f")
        fi
    done

    if [[ ${#valid_files[@]} -eq 0 ]]; then
        echo "*(No records)*" >> "$out_file"
        log_pass "Generated $out_file (No records)"
        return 0
    fi

    if [[ "$type" == "ADR" ]]; then
        echo "| Decision ID | Title | Status | Date | Affected Scope |" >> "$out_file"
        echo "|---|---|---|---|---|" >> "$out_file"
    else
        echo "| Change ID | Title | Status | Decision Refs | Owner Stage | Date |" >> "$out_file"
        echo "|---|---|---|---|---|---|" >> "$out_file"
    fi

    for f in "${valid_files[@]}"; do
        local title
        title=$(tr -d '\r' < "$f" | grep -m1 "^# " | sed 's/^# //' || echo "Untitled")
        title=$(echo "$title" | tr -d '"' | tr -d "'")
        
        if [[ "$type" == "ADR" ]]; then
            local did status ddate scope
            did=$(get_frontmatter_value "$f" "decision_id" | tr -d '"' | tr -d "'")
            status=$(get_frontmatter_value "$f" "status" | tr -d '"' | tr -d "'")
            ddate=$(get_frontmatter_value "$f" "date" | tr -d '"' | tr -d "'")
            
            scope=$(get_frontmatter_list "$f" "affected_scope" | paste -sd "," - | sed 's/,/, /g' || echo "")
            if [[ -z "$scope" ]]; then
                scope=$(get_frontmatter_value "$f" "affected_scope" | tr -d '"' | tr -d "'" | tr '\n' ' ' | xargs)
            fi

            echo "| $did | [$title]($(basename "$f")) | $status | $ddate | $scope |" >> "$out_file"
        else
            local cid status refs owner ddate
            cid=$(get_frontmatter_value "$f" "change_id" | tr -d '"' | tr -d "'")
            status=$(get_frontmatter_value "$f" "status" | tr -d '"' | tr -d "'")
            refs=$(get_frontmatter_list "$f" "decision_refs" | paste -sd "," - | sed 's/,/, /g' || echo "")
            owner=$(get_frontmatter_value "$f" "owner_stage" | tr -d '"' | tr -d "'")
            ddate=$(get_frontmatter_value "$f" "date" | tr -d '"' | tr -d "'")

            echo "| $cid | [$title]($(basename "$f")) | $status | $refs | $owner | $ddate |" >> "$out_file"
        fi
    done
    
    log_pass "Generated $out_file"
}

log_info "Syncing DDF Indices..."
generate_index "$DECISIONS_DIR" "ADR-*.md" "$DECISIONS_DIR/index.md" "ADR"
generate_index "$CHANGES_DIR" "CHG-*.md" "$CHANGES_DIR/index.md" "CHG"
