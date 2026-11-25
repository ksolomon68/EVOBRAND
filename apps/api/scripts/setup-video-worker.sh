#!/usr/bin/env bash
set -e
video_api_dir="$(cd "$(dirname "$0")/.." && pwd)"
for candidate in "$HOME"/nodevenv/EVOBRAND/apps/api/*/bin/activate; do
  if [ -f "$candidate" ]; then source "$candidate"; break; fi
done
cd "$video_api_dir"
# Create the tables even when FFmpeg installation still needs hosting support.
node src/video/migrate.js
node scripts/video-preflight.js
command -v crontab >/dev/null || { echo 'Video worker setup: crontab is unavailable; use the documented supervised worker.' >&2; exit 1; }
video_cron_file="$(mktemp)"
video_cron_error="$(mktemp)"
trap 'rm -f "$video_cron_file" "$video_cron_error"' EXIT
if ! LC_ALL=C crontab -l > "$video_cron_file" 2> "$video_cron_error"; then
  if ! grep -qi 'no crontab' "$video_cron_error"; then cat "$video_cron_error" >&2; exit 1; fi
fi
# Preserve all other jobs; replace only the entry owned by this feature.
node scripts/video-crontab.js "$video_cron_file" "$video_api_dir"
crontab "$video_cron_file"
echo 'Video tables ready; FFmpeg verified; video worker scheduled every minute.'
