#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/.agents/skills"
PROFILE_DIR="$SKILLS_DIR/.profiles"
PROFILE_FILE="$PROFILE_DIR/payetax-keep.txt"

KEEP_SKILLS=(
  "ab-test-setup"
  "accessibility"
  "ad-creative"
  "ai-seo"
  "analytics-tracking"
  "churn-prevention"
  "community-marketing"
  "cold-email"
  "competitor-alternatives"
  "content-strategy"
  "copy-editing"
  "copywriting"
  "customer-research"
  "design-an-interface"
  "email-sequence"
  "engineering"
  "form-cro"
  "free-tool-strategy"
  "frontend-design"
  "launch-strategy"
  "marketing-ideas"
  "marketing-psychology"
  "onboarding-cro"
  "page-cro"
  "payetax-context"
  "popup-cro"
  "prd-to-issues"
  "product-marketing-context"
  "programmatic-seo"
  "schema-markup"
  "seo-audit"
  "social-content"
  "tdd"
)

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

list_profile() {
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
  mkdir -p "$PROFILE_DIR"

  {
    echo "# PayeTax agents-native skills keep profile"
    echo "# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "# Keep list"
    local keep
    for keep in "${KEEP_SKILLS[@]}"; do
      echo "$keep"
    done
  } > "$PROFILE_FILE"

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
