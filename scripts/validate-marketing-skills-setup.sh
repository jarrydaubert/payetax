#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/.agents/skills"
PROFILE_FILE="$SKILLS_DIR/.profiles/payetax-keep.txt"
SOURCE_FILE="$SKILLS_DIR/.sources/marketingskills.json"
VERSIONS_FILE="$SKILLS_DIR/VERSIONS.md"
AGENTS_CONTEXT_FILE="$PROJECT_ROOT/.agents/product-marketing-context.md"
CLAUDE_CONTEXT_FILE="$PROJECT_ROOT/.claude/product-marketing-context.md"
CLAUDE_SKILLS_DIR="$PROJECT_ROOT/.claude/skills"

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
  "community-marketing"
  "cold-email"
  "competitor-alternatives"
  "content-strategy"
  "copy-editing"
  "copywriting"
  "customer-research"
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

if [[ ! -d "$SKILLS_DIR" ]]; then
  error "Missing skills directory: $SKILLS_DIR"
fi

if [[ ! -f "$AGENTS_CONTEXT_FILE" ]]; then
  error "Missing agents product context: $AGENTS_CONTEXT_FILE"
fi

if [[ -f "$CLAUDE_CONTEXT_FILE" ]]; then
  error "Legacy context file still present: $CLAUDE_CONTEXT_FILE"
fi

if [[ -d "$CLAUDE_SKILLS_DIR" ]]; then
  error "Legacy skills directory still present: $CLAUDE_SKILLS_DIR"
fi

if [[ ! -f "$SOURCE_FILE" ]]; then
  error "Missing source metadata file: $SOURCE_FILE"
fi

if [[ ! -f "$VERSIONS_FILE" ]]; then
  error "Missing skills versions tracking file: $VERSIONS_FILE"
fi

if [[ ! -f "$PROFILE_FILE" ]]; then
  error "Missing skills profile file: $PROFILE_FILE"
fi

if (( error_count > 0 )); then
  exit 1
fi

ref_value="$(sed -n 's/.*"ref": "\([^"]*\)".*/\1/p' "$SOURCE_FILE" | head -n 1)"
commit_value="$(sed -n 's/.*"commit": "\([^"]*\)".*/\1/p' "$SOURCE_FILE" | head -n 1)"
expected_skill_version="${ref_value#v}"

if [[ -z "$ref_value" ]]; then
  error "Could not read ref from $SOURCE_FILE"
fi

if [[ -z "$commit_value" || ! "$commit_value" =~ ^[0-9a-f]{40}$ ]]; then
  error "Invalid or missing commit SHA in $SOURCE_FILE"
fi

if [[ -z "$expected_skill_version" ]]; then
  error "Could not derive skill version from ref value in $SOURCE_FILE"
fi

if ! rg -q "Version tag: \`$ref_value\`" "$VERSIONS_FILE"; then
  error "Version tag in $VERSIONS_FILE does not match source metadata ref ($ref_value)"
fi

if ! rg -q "Commit: \`$commit_value\`" "$VERSIONS_FILE"; then
  error "Commit in $VERSIONS_FILE does not match source metadata commit"
fi

keep_skills=()
while IFS= read -r line; do
  keep_skills+=("$line")
done < <(grep -vE '^\s*#|^\s*$' "$PROFILE_FILE")

if [[ "${#keep_skills[@]}" -eq 0 ]]; then
  error "Profile file has no kept skills: $PROFILE_FILE"
fi

installed_skills=()
while IFS= read -r line; do
  installed_skills+=("$line")
done < <(
  find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name ".*" -print \
    | sed "s#^$SKILLS_DIR/##" \
    | sort
)

for keep_skill in "${keep_skills[@]}"; do
  if ! contains_item "$keep_skill" "${installed_skills[@]}"; then
    error "Kept skill missing from installation: $keep_skill"
  fi
done

for installed_skill in "${installed_skills[@]}"; do
  if ! contains_item "$installed_skill" "${keep_skills[@]}"; then
    error "Installed skill is not in keep profile: $installed_skill"
  fi
done

if rg -n "\.claude/product-marketing-context\.md|\.claude/skills/" "$SKILLS_DIR" >/tmp/payetax-skills-legacy-paths.txt 2>/dev/null; then
  error "Legacy .claude references remain in skills files (see /tmp/payetax-skills-legacy-paths.txt)"
fi

missing_hook_files=()
while IFS= read -r skill_file; do
  if grep -q ".agents/product-marketing-context.md" "$skill_file" \
    && ! grep -q ".agents/skills/payetax-context/SKILL.md" "$skill_file"; then
    missing_hook_files+=("$skill_file")
  fi
done < <(find "$SKILLS_DIR" -type f -name "SKILL.md" | sort)

if [[ "${#missing_hook_files[@]}" -gt 0 ]]; then
  for missing_hook_file in "${missing_hook_files[@]}"; do
    error "Missing payetax-context hook in: $missing_hook_file"
  done
fi

for skill in "${UPSTREAM_SKILLS[@]}"; do
  skill_file="$SKILLS_DIR/$skill/SKILL.md"
  if [[ ! -f "$skill_file" ]]; then
    error "Missing required upstream skill: $skill"
    continue
  fi

  if ! rg -q "^  version: ${expected_skill_version}$" "$skill_file"; then
    error "Version mismatch in $skill_file (expected ${expected_skill_version})"
  fi

  if rg -q '^## PayeTax Context' "$skill_file"; then
    error "Upstream skill still carries duplicated PayeTax Context block: $skill_file"
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
