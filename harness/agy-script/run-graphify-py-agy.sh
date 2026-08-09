#!/usr/bin/env bash
set -euo pipefail
uv tool run --from graphifyy python "$@"
