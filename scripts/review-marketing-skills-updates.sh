#!/usr/bin/env bash

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/coreyhaines31/marketingskills}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_SKILLS_DIR="$PROJECT_ROOT/.agents/skills"
SOURCE_FILE="$LOCAL_SKILLS_DIR/.sources/marketingskills.json"
UPSTREAM_PROFILE_FILE="$LOCAL_SKILLS_DIR/.profiles/upstream-marketing-skills.txt"
CACHE_DIR="${CACHE_DIR:-/tmp/marketingskills-review}"

usage() {
  cat <<'EOF'
Usage:
  scripts/review-marketing-skills-updates.sh [--latest-tag vX.Y.Z]

Checks the upstream marketing skills repo, compares the latest tag with the
local pinned tag, and prints a review of:
  - new upstream skills
  - existing PayeTax-included skills that changed
  - excluded upstream skills that changed
  - upstream changelog entries newer than the local pin

Environment overrides:
  REPO_URL   (default: https://github.com/coreyhaines31/marketingskills)
  CACHE_DIR  (default: /tmp/marketingskills-review)
EOF
}

latest_tag_override=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --latest-tag|--tag|--ref)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for $1" >&2
        usage
        exit 1
      fi
      latest_tag_override="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

require_file() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    echo "Missing required file: $path" >&2
    exit 1
  fi
}

ensure_repo() {
  if [[ -e "$CACHE_DIR" ]] && ! git -C "$CACHE_DIR" rev-parse --git-dir >/dev/null 2>&1; then
    case "$CACHE_DIR" in
      /tmp/marketingskills-*)
        rm -rf "$CACHE_DIR"
        ;;
      *)
        echo "CACHE_DIR exists but is not a valid git checkout: $CACHE_DIR" >&2
        echo "Use a fresh CACHE_DIR or remove the invalid directory." >&2
        exit 1
        ;;
    esac
  fi

  if [[ ! -d "$CACHE_DIR/.git" ]]; then
    git clone --quiet --no-checkout "$REPO_URL" "$CACHE_DIR"
  else
    git -C "$CACHE_DIR" fetch origin --tags --quiet
  fi
}

read_json_string() {
  local key="$1"
  local file="$2"
  sed -n "s/.*\"$key\": \"\\([^\"]*\\)\".*/\\1/p" "$file" | head -n 1
}

skill_version_at_ref() {
  local ref="$1"
  local skill="$2"
  git -C "$CACHE_DIR" show "$ref:skills/$skill/SKILL.md" 2>/dev/null \
    | sed -n 's/^  version: //p' \
    | head -n 1
}

skill_description_at_ref() {
  local ref="$1"
  local skill="$2"
  git -C "$CACHE_DIR" show "$ref:skills/$skill/SKILL.md" 2>/dev/null \
    | sed -n 's/^description: //p' \
    | head -n 1 \
    | sed 's/^"//; s/"$//'
}

print_skill_files_changed() {
  local skill="$1"
  git -C "$CACHE_DIR" diff --name-status "$local_ref..$latest_tag" -- "skills/$skill" \
    | sed "s#skills/$skill/##" \
    | sed 's/^/    /'
}

require_file "$SOURCE_FILE"
require_file "$UPSTREAM_PROFILE_FILE"
ensure_repo

local_ref="$(read_json_string "ref" "$SOURCE_FILE")"
local_commit="$(read_json_string "commit" "$SOURCE_FILE")"

if [[ -z "$local_ref" || -z "$local_commit" ]]; then
  echo "Could not read local marketing skills ref/commit from $SOURCE_FILE" >&2
  exit 1
fi

if [[ -n "$latest_tag_override" ]]; then
  latest_tag="$latest_tag_override"
else
  latest_tag="$(git -C "$CACHE_DIR" tag --list 'v[0-9]*' --sort=version:refname | tail -n 1)"
fi

if [[ -z "$latest_tag" ]]; then
  echo "No version tags found in $REPO_URL" >&2
  exit 1
fi

git -C "$CACHE_DIR" rev-parse "$local_ref^{commit}" >/dev/null
git -C "$CACHE_DIR" rev-parse "$latest_tag^{commit}" >/dev/null

latest_commit="$(git -C "$CACHE_DIR" rev-parse "$latest_tag^{commit}")"
local_commit_from_repo="$(git -C "$CACHE_DIR" rev-parse "$local_ref^{commit}")"
local_date="$(git -C "$CACHE_DIR" show -s --format=%cs "$local_ref^{commit}")"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

git -C "$CACHE_DIR" ls-tree -d --name-only "$local_ref:skills" | sort >"$tmp_dir/local-skills.txt"
git -C "$CACHE_DIR" ls-tree -d --name-only "$latest_tag:skills" | sort >"$tmp_dir/latest-skills.txt"
grep -vE '^\s*#|^\s*$' "$UPSTREAM_PROFILE_FILE" | sort >"$tmp_dir/included-skills.txt"

comm -13 "$tmp_dir/local-skills.txt" "$tmp_dir/latest-skills.txt" >"$tmp_dir/new-skills.txt"
comm -23 "$tmp_dir/local-skills.txt" "$tmp_dir/latest-skills.txt" >"$tmp_dir/removed-skills.txt"

git -C "$CACHE_DIR" diff --name-only "$local_ref..$latest_tag" -- skills \
  | sed -n 's#^skills/\([^/]*\)/.*#\1#p' \
  | sort -u >"$tmp_dir/changed-skills.txt"

comm -23 "$tmp_dir/changed-skills.txt" "$tmp_dir/new-skills.txt" >"$tmp_dir/changed-existing-skills.txt"
comm -12 "$tmp_dir/changed-existing-skills.txt" "$tmp_dir/included-skills.txt" >"$tmp_dir/changed-included.txt"
comm -23 "$tmp_dir/changed-existing-skills.txt" "$tmp_dir/included-skills.txt" >"$tmp_dir/changed-excluded.txt"

status="up to date"
if [[ "$local_commit_from_repo" != "$latest_commit" ]]; then
  status="update available"
fi

printf "Marketing Skills Upstream Review\n"
printf "================================\n\n"
printf "Repository: %s\n" "$REPO_URL"
printf "Local pin:  %s (%s)\n" "$local_ref" "$local_commit"
printf "Latest tag: %s (%s)\n" "$latest_tag" "$latest_commit"
printf "Status:     %s\n\n" "$status"

if [[ "$local_commit" != "$local_commit_from_repo" ]]; then
  printf "Warning: local metadata commit does not match %s in upstream.\n" "$local_ref"
  printf "Metadata: %s\n" "$local_commit"
  printf "Upstream: %s\n\n" "$local_commit_from_repo"
fi

new_count="$(wc -l <"$tmp_dir/new-skills.txt" | tr -d ' ')"
printf "New Upstream Skills (%s)\n" "$new_count"
printf '%s\n' "-----------------------"
if [[ "$new_count" == "0" ]]; then
  printf "None\n"
else
  while IFS= read -r skill; do
    description="$(skill_description_at_ref "$latest_tag" "$skill")"
    printf -- "- %s\n" "$skill"
    if [[ -n "$description" ]]; then
      if [[ "${#description}" -gt 260 ]]; then
        description="${description:0:257}..."
      fi
      printf "  %s\n" "$description"
    fi
  done <"$tmp_dir/new-skills.txt"
fi
printf "\n"

removed_count="$(wc -l <"$tmp_dir/removed-skills.txt" | tr -d ' ')"
if [[ "$removed_count" != "0" ]]; then
  printf "Removed Upstream Skills (%s)\n" "$removed_count"
  printf '%s\n' "---------------------------"
  sed 's/^/- /' "$tmp_dir/removed-skills.txt"
  printf "\n"
fi

changed_included_count="$(wc -l <"$tmp_dir/changed-included.txt" | tr -d ' ')"
printf "Changed Existing PayeTax Upstream Skills (%s)\n" "$changed_included_count"
printf '%s\n' "---------------------------------------------"
if [[ "$changed_included_count" == "0" ]]; then
  printf "None\n"
else
  while IFS= read -r skill; do
    old_version="$(skill_version_at_ref "$local_ref" "$skill")"
    new_version="$(skill_version_at_ref "$latest_tag" "$skill")"
    printf -- "- %s" "$skill"
    if [[ -n "$old_version" || -n "$new_version" ]]; then
      printf " (%s -> %s)" "${old_version:-unknown}" "${new_version:-unknown}"
    fi
    printf "\n"
    print_skill_files_changed "$skill"
  done <"$tmp_dir/changed-included.txt"
fi
printf "\n"

changed_excluded_count="$(wc -l <"$tmp_dir/changed-excluded.txt" | tr -d ' ')"
printf "Changed Upstream Skills Currently Excluded (%s)\n" "$changed_excluded_count"
printf '%s\n' "----------------------------------------------"
if [[ "$changed_excluded_count" == "0" ]]; then
  printf "None\n"
else
  sed 's/^/- /' "$tmp_dir/changed-excluded.txt"
fi
printf "\n"

printf "Upstream Changelog Since Local Pin\n"
printf '%s\n' "----------------------------------"
if ! git -C "$CACHE_DIR" show "$latest_tag:VERSIONS.md" 2>/dev/null \
  | awk -v min_date="$local_date" '
      /^### / {
        date = substr($0, 5, 10)
        include = (date > min_date)
      }
      include { print }
    '; then
  printf "No upstream VERSIONS.md changelog found.\n"
fi
printf "\n"

printf "Recommended Next Step\n"
printf '%s\n' "---------------------"
if [[ "$status" == "up to date" ]]; then
  printf "No sync is needed. Run scripts/validate-marketing-skills-setup.sh if you changed local profiles.\n"
else
  printf "Review the sections above, decide which new skills belong in PayeTax, then sync deliberately.\n"
  printf "For existing included skills, the normal path is to sync to %s and run validation.\n" "$latest_tag"
fi
