#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BLOG_IMAGE_DIR="$PROJECT_ROOT/public/images/blog"
WIDTH="${BLOG_IMAGE_WIDTH:-1600}"
HEIGHT="${BLOG_IMAGE_HEIGHT:-1000}"
QUALITY="${BLOG_IMAGE_QUALITY:-2}"

usage() {
  cat <<'EOF'
Usage:
  scripts/import-blog-image.sh <source-image> <output-filename.jpg>

Examples:
  scripts/import-blog-image.sh ~/Desktop/spring-statement.png spring-statement-2026.jpg
  bun run blog:image:import -- ~/Desktop/director-tax.png director-tax-deadlines.jpg

Notes:
  - Output is always written to public/images/blog/
  - Images are center-cropped to 1600x1000 by default
  - Use .jpg output filenames for consistency with the existing blog library
EOF
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

if [[ $# -eq 1 && ( "$1" == "-h" || "$1" == "--help" ) ]]; then
  usage
  exit 0
fi

if [[ $# -ne 2 ]]; then
  usage
  exit 1
fi

SOURCE_IMAGE="$1"
OUTPUT_FILENAME="$2"

if [[ ! -f "$SOURCE_IMAGE" ]]; then
  echo "Source image not found: $SOURCE_IMAGE" >&2
  exit 1
fi

case "$OUTPUT_FILENAME" in
  *.jpg|*.jpeg)
    ;;
  *)
    echo "Output filename must end with .jpg or .jpeg: $OUTPUT_FILENAME" >&2
    exit 1
    ;;
esac

require_command ffmpeg
require_command sips

mkdir -p "$BLOG_IMAGE_DIR"

DEST_PATH="$BLOG_IMAGE_DIR/$OUTPUT_FILENAME"
TEMP_STEM="$(mktemp "/tmp/payetax-blog-image.XXXXXX")"
TEMP_PATH="$TEMP_STEM.jpg"

cleanup() {
  rm -f "$TEMP_PATH" "$TEMP_STEM"
}
trap cleanup EXIT

ffmpeg -y -i "$SOURCE_IMAGE" \
  -vf "scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}" \
  -frames:v 1 \
  -q:v "$QUALITY" \
  "$TEMP_PATH" >/dev/null 2>&1

mv "$TEMP_PATH" "$DEST_PATH"

echo "Imported blog image:"
echo "  Source: $SOURCE_IMAGE"
echo "  Output: $DEST_PATH"
sips -g pixelWidth -g pixelHeight "$DEST_PATH" | tail -n 2
