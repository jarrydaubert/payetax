#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/.agents/skills"
PROFILE_DIR="$SKILLS_DIR/.profiles"
PROFILE_FILE="$PROFILE_DIR/payetax-keep.txt"
KEEP_SKILLS=()

usage() {
  cat <<'EOF'
Usage:
  scripts/apply-marketing-skill-profile.sh --list
  scripts/apply-marketing-skill-profile.sh --apply
EOF
}

is_kept() {
  local candidate="$1"
  local keep
  for keep in "${KEEP_SKILLS[@]}"; do
    if [[ "$keep" == "$candidate" ]]; then
      return 0
    fi
  done
  return 1
}

load_keep_skills() {
  if [[ ! -f "$PROFILE_FILE" ]]; then
    echo "Missing keep profile: $PROFILE_FILE" >&2
    exit 1
  fi

  KEEP_SKILLS=()
  while IFS= read -r line; do
    KEEP_SKILLS+=("$line")
  done < <(grep -vE '^\s*#|^\s*$' "$PROFILE_FILE")

  if [[ "${#KEEP_SKILLS[@]}" -eq 0 ]]; then
    echo "Keep profile has no skills: $PROFILE_FILE" >&2
    exit 1
  fi
}

list_profile() {
  load_keep_skills
  echo "Keep skills (${#KEEP_SKILLS[@]}):"
  local keep
  for keep in "${KEEP_SKILLS[@]}"; do
    echo "  - $keep"
  done

  echo
  echo "Installed skills:"
  find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name ".*" -print \
    | sed "s#^$SKILLS_DIR/##" \
    | sort
}

apply_profile() {
  load_keep_skills

  local dir_name
  while IFS= read -r dir_name; do
    if ! is_kept "$dir_name"; then
      rm -rf "$SKILLS_DIR/$dir_name"
      echo "Removed: $dir_name"
    fi
  done < <(
    find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name ".*" -print \
      | sed "s#^$SKILLS_DIR/##" \
      | sort
  )

  echo "Profile applied."
}

main() {
  if [[ $# -ne 1 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    --list)
      list_profile
      ;;
    --apply)
      apply_profile
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
