#!/usr/bin/env bash
# Usage: npm run frames -- path/to/melt.mp4 [fps] [width] [logo x:y:w:h]
# Slices the video into public/hero/frames/frame_0001.jpg ...
# The optional 4th argument paints out a corner logo, in source-video pixels.
set -euo pipefail

INPUT="${1:?Pass the video path, e.g. npm run frames -- melt.mp4}"
FPS="${2:-24}"
WIDTH="${3:-1600}"
LOGO="${4:-}"
OUT="public/hero/frames"

FILTER="fps=${FPS},scale=${WIDTH}:-2:flags=lanczos"
if [ -n "$LOGO" ]; then
  IFS=: read -r LX LY LW LH <<< "$LOGO"
  FILTER="delogo=x=${LX}:y=${LY}:w=${LW}:h=${LH},${FILTER}"
fi

command -v ffmpeg >/dev/null || { echo "ffmpeg is not installed. Install it first (https://ffmpeg.org/download.html)."; exit 1; }

mkdir -p "$OUT"
find "$OUT" -maxdepth 1 -name 'frame_*' -delete

ffmpeg -hide_banner -loglevel error -i "$INPUT" \
  -vf "$FILTER" \
  -q:v 4 "$OUT/frame_%04d.jpg"

COUNT=$(find "$OUT" -maxdepth 1 -name 'frame_*.jpg' | wc -l | tr -d ' ')
SIZE=$(du -sh "$OUT" | cut -f1)
echo "Extracted ${COUNT} frames (${SIZE}) into ${OUT}"
