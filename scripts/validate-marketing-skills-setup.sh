#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/.claude/skills"
SOURCE_FILE="$SKILLS_DIR/.sources/marketingskills.json"
PROFILE_FILE="$SKILLS_DIR/.profiles/payetax-keep.txt"
VERSIONS_FILE="$SKILLS_DIR/VERSIONS.md"
CLAUDE_CONTEXT_FILE="$PROJECT_ROOT/.claude/product-marketing-context.md"
AGENTS_DIR="$PROJECT_ROOT/.agents"
AGENTS_CONTEXT_FILE="$AGENTS_DIR/product-marketing-context.md"
AGENTS_SKILLS_LINK="$AGENTS_DIR/skills"

error_count=0

error() {
  printf "ERROR: %s\n" "$1" >&2
  error_count=$((error_count + 1))
}

contains_item() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    if [[ "$item" == "$needle" ]]; then
      return 0
    fi
  done
  return 1
}

UPSTREAM_SKILLS=(
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
)

EXCLUDED_SKILLS=(
  "paid-ads"
  "paywall-upgrade-cro"
  "pricing-strategy"
  "referral-program"
  "signup-flow-cro"
  "revops"
  "sales-enablement"
  "site-architecture"
)

if [[ ! -d "$SKILLS_DIR" ]]; then
  error "Missing skills directory: $SKILLS_DIR"
fi

if [[ ! -f "$CLAUDE_CONTEXT_FILE" ]]; then
  error "Missing product context file: $CLAUDE_CONTEXT_FILE"
fi

if [[ ! -d "$AGENTS_DIR" ]]; then
  error "Missing .agents compatibility directory: $AGENTS_DIR"
fi

if [[ ! -L "$AGENTS_SKILLS_LINK" ]]; then
  error "Missing .agents skills symlink: $AGENTS_SKILLS_LINK"
fi

if [[ ! -L "$AGENTS_CONTEXT_FILE" ]]; then
  error "Missing .agents product context symlink: $AGENTS_CONTEXT_FILE"
fi

if [[ ! -f "$SOURCE_FILE" ]]; then
  error "Missing source metadata file: $SOURCE_FILE"
fi

if [[ ! -f "$PROFILE_FILE" ]]; then
  error "Missing skills profile file: $PROFILE_FILE"
fi

if [[ ! -f "$VERSIONS_FILE" ]]; then
  error "Missing versions file: $VERSIONS_FILE"
fi

ref_value="$(sed -n 's/.*"ref": "\([^"]*\)".*/\1/p' "$SOURCE_FILE" | head -n 1)"
commit_value="$(sed -n 's/.*"commit": "\([^"]*\)".*/\1/p' "$SOURCE_FILE" | head -n 1)"

if [[ -z "$ref_value" ]]; then
  error "Could not read ref from $SOURCE_FILE"
fi

if [[ -z "$commit_value" || ! "$commit_value" =~ ^[0-9a-f]{40}$ ]]; then
  error "Invalid or missing commit SHA in $SOURCE_FILE"
fi

if [[ "$ref_value" != "v1.3.0" ]]; then
  error "Unexpected ref in source metadata ($ref_value). Expected v1.3.0"
fi

if ! rg -q "Synced upstream marketing skills to .*v1.3.0" "$VERSIONS_FILE"; then
  error "VERSIONS.md is missing the v1.3.0 sync record"
fi

installed_skills=()
while IFS= read -r line; do
  installed_skills+=("$line")
done < <(
  find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name ".*" -print \
    | sed "s#^$SKILLS_DIR/##" \
    | sort
)

skill=""
for skill in "${UPSTREAM_SKILLS[@]}"; do
  skill_file="$SKILLS_DIR/$skill/SKILL.md"
  if [[ ! -f "$skill_file" ]]; then
    error "Missing required skill: $skill"
    continue
  fi

  if ! rg -q '^  version: 1.3.0$' "$skill_file"; then
    error "Version mismatch in $skill_file (expected 1.3.0)"
  fi

  if ! rg -q '^## PayeTax Context' "$skill_file"; then
    error "Missing PayeTax Context section in $skill_file"
  fi
done

for skill in "${EXCLUDED_SKILLS[@]}"; do
  if contains_item "$skill" "${installed_skills[@]}"; then
    error "Excluded skill should not be installed: $skill"
  fi
done

if (( error_count > 0 )); then
  printf "Skills validation failed with %d issue(s).\n" "$error_count" >&2
  exit 1
fi

printf "Skills validation passed.\n"
printf "Ref: %s\n" "$ref_value"
printf "Commit: %s\n" "$commit_value"
printf "Installed skills: %d\n" "${#installed_skills[@]}"
