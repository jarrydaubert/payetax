#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/.claude/skills"
PROFILE_DIR="$SKILLS_DIR/.profiles"
PROFILE_FILE="$PROFILE_DIR/payetax-keep.txt"

KEEP_SKILLS=(
  "ab-test-setup"
  "ad-creative"
  "ai-seo"
  "analytics-tracking"
  "churn-prevention"
  "cold-email"
  "competitor-alternatives"
  "content-strategy"
  "copy-editing"
  "copywriting"
  "email-sequence"
  "form-cro"
  "free-tool-strategy"
  "launch-strategy"
  "marketing-ideas"
  "marketing-psychology"
  "onboarding-cro"
  "page-cro"
  "popup-cro"
  "product-marketing-context"
  "programmatic-seo"
  "schema-markup"
  "seo-audit"
  "social-content"
  "accessibility"
  "engineering"
  "design-an-interface"
  "prd-to-issues"
  "tdd"
)

EXCLUDE_SKILLS=(
  "paid-ads"
  "paywall-upgrade-cro"
  "pricing-strategy"
  "referral-program"
  "signup-flow-cro"
  "revops"
  "sales-enablement"
  "site-architecture"
)

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

is_excluded() {
  local candidate="$1"
  local excluded
  for excluded in "${EXCLUDE_SKILLS[@]}"; do
    if [[ "$excluded" == "$candidate" ]]; then
      return 0
    fi
  done
  return 1
}

usage() {
  cat <<'USAGE'
Usage:
  scripts/apply-marketing-skill-profile.sh --list
  scripts/apply-marketing-skill-profile.sh --apply
USAGE
}

list_profile() {
  echo "Keep skills (${#KEEP_SKILLS[@]}):"
  local keep
  for keep in "${KEEP_SKILLS[@]}"; do
    echo "  - $keep"
  done

  echo
  echo "Excluded upstream skills (${#EXCLUDE_SKILLS[@]}):"
  local excluded
  for excluded in "${EXCLUDE_SKILLS[@]}"; do
    echo "  - $excluded"
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
    echo "# PayeTax skills keep profile"
    echo "# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "# Keep list"
    local keep
    for keep in "${KEEP_SKILLS[@]}"; do
      echo "$keep"
    done
  } > "$PROFILE_FILE"

  local dir_name
  while IFS= read -r dir_name; do
    if is_excluded "$dir_name"; then
      rm -rf "$SKILLS_DIR/$dir_name"
      echo "Removed excluded upstream skill: $dir_name"
      continue
    fi

    if ! is_kept "$dir_name"; then
      echo "Kept unknown/local skill (not in keep profile): $dir_name"
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
