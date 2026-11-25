#!/usr/bin/env bash
set -e
# Cron does not inherit the cPanel Node Selector environment.
video_api_dir="$(cd "$(dirname "$0")/.." && pwd)"
video_activation=""
for candidate in "$HOME"/nodevenv/EVOBRAND/apps/api/*/bin/activate; do
  if [ -f "$candidate" ]; then video_activation="$candidate"; break; fi
done
if [ -n "$video_activation" ]; then source "$video_activation"; fi
cd "$video_api_dir"
exec node src/video/worker.js --once
