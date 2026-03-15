#!/usr/bin/env bash

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/coreyhaines31/marketingskills}"
UPSTREAM_REF="${UPSTREAM_REF:-v1.4.0}"
EXPECTED_COMMIT="${EXPECTED_COMMIT:-}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_SKILLS_DIR="$PROJECT_ROOT/.claude/skills"
LOCAL_SOURCE_DIR="$LOCAL_SKILLS_DIR/.sources"
LOCAL_SOURCE_FILE="$LOCAL_SOURCE_DIR/marketingskills.json"
CACHE_DIR="${CACHE_DIR:-/tmp/marketingskills-sync}"
SKIP_FETCH="${SKIP_FETCH:-0}"

KEEP_UPSTREAM_SKILLS=(
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

usage() {
  cat <<'USAGE'
Usage:
  scripts/sync-marketing-skills.sh --sync [--tag vX.Y.Z] [--commit <sha>]
  scripts/sync-marketing-skills.sh --check [--tag vX.Y.Z] [--commit <sha>]

Options:
  --sync    Fetch upstream skills and sync selected skills into .claude/skills
  --check   Compare local synced commit vs upstream commit
  --tag     Override UPSTREAM_REF for this invocation
  --commit  Require exact upstream commit SHA

Environment overrides:
  REPO_URL      (default: https://github.com/coreyhaines31/marketingskills)
  UPSTREAM_REF  (default: v1.4.0)
  CACHE_DIR     (default: /tmp/marketingskills-sync)
  SKIP_FETCH    (default: 0)
USAGE
}

ensure_repo() {
  if [[ "$SKIP_FETCH" == "1" ]]; then
    if [[ ! -d "$CACHE_DIR/.git" ]]; then
      echo "SKIP_FETCH=1 but CACHE_DIR is not a git checkout: $CACHE_DIR" >&2
      exit 1
    fi
    return
  fi

  if [[ ! -d "$CACHE_DIR/.git" ]]; then
    git clone --depth 1 --branch "$UPSTREAM_REF" "$REPO_URL" "$CACHE_DIR" >/dev/null
    return
  fi

  git -C "$CACHE_DIR" fetch origin --tags --quiet

  if git -C "$CACHE_DIR" show-ref --verify --quiet "refs/tags/$UPSTREAM_REF"; then
    git -C "$CACHE_DIR" checkout --detach "$UPSTREAM_REF" --quiet
    return
  fi

  git -C "$CACHE_DIR" fetch origin "$UPSTREAM_REF" --quiet
  git -C "$CACHE_DIR" checkout --detach "$UPSTREAM_REF" --quiet
}

get_upstream_commit() {
  git -C "$CACHE_DIR" rev-parse "$UPSTREAM_REF^{commit}"
}

verify_expected_commit() {
  local actual_commit="$1"
  if [[ -n "$EXPECTED_COMMIT" ]] && [[ "$EXPECTED_COMMIT" != "$actual_commit" ]]; then
    echo "Commit mismatch. Expected $EXPECTED_COMMIT, got $actual_commit" >&2
    exit 1
  fi
}

get_local_commit() {
  if [[ ! -f "$LOCAL_SOURCE_FILE" ]]; then
    echo ""
    return
  fi

  sed -n 's/.*"commit": "\([^"]*\)".*/\1/p' "$LOCAL_SOURCE_FILE" | head -n 1
}

write_source_metadata() {
  local commit="$1"
  local synced_at
  synced_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  mkdir -p "$LOCAL_SOURCE_DIR"
  cat >"$LOCAL_SOURCE_FILE" <<JSON
{
  "repo": "$REPO_URL",
  "ref": "$UPSTREAM_REF",
  "commit": "$commit",
  "synced_at_utc": "$synced_at"
}
JSON
}

ref_to_version() {
  local ref="$1"
  echo "${ref#v}"
}

sync_single_skill() {
  local skill="$1"
  local upstream_dir="$CACHE_DIR/skills/$skill"
  local local_dir="$LOCAL_SKILLS_DIR/$skill"
  local local_skill_file="$local_dir/SKILL.md"
  local upstream_skill_file="$upstream_dir/SKILL.md"

  if [[ ! -d "$upstream_dir" ]]; then
    echo "Missing upstream skill directory: $upstream_dir" >&2
    exit 1
  fi

  local ctx_tmp
  ctx_tmp="$(mktemp)"
  if [[ -f "$local_skill_file" ]]; then
    awk 'BEGIN{p=0} /^## PayeTax Context/{p=1} p' "$local_skill_file" > "$ctx_tmp"
  fi

  mkdir -p "$local_dir"
  rsync -a --delete "$upstream_dir/" "$local_dir/"

  if [[ -s "$ctx_tmp" ]] && [[ -f "$upstream_skill_file" ]]; then
    printf "\n" >> "$local_skill_file"
    cat "$ctx_tmp" >> "$local_skill_file"
  fi

  if [[ -f "$local_skill_file" ]]; then
    sed -i '' -E "s/^  version: .*/  version: $(ref_to_version "$UPSTREAM_REF")/" "$local_skill_file"
  fi

  rm -f "$ctx_tmp"
}

ensure_agents_compat() {
  mkdir -p "$PROJECT_ROOT/.agents"

  if [[ ! -e "$PROJECT_ROOT/.agents/skills" ]]; then
    ln -s ../.claude/skills "$PROJECT_ROOT/.agents/skills"
  fi

  if [[ ! -e "$PROJECT_ROOT/.agents/product-marketing-context.md" ]] && [[ -f "$PROJECT_ROOT/.claude/product-marketing-context.md" ]]; then
    ln -s ../.claude/product-marketing-context.md "$PROJECT_ROOT/.agents/product-marketing-context.md"
  fi
}

sync_skills() {
  mkdir -p "$LOCAL_SKILLS_DIR"

  local skill
  for skill in "${KEEP_UPSTREAM_SKILLS[@]}"; do
    sync_single_skill "$skill"
  done

  apply_payetax_overrides
  ensure_agents_compat
}

apply_payetax_overrides() {
  local ai_seo_ref="$LOCAL_SKILLS_DIR/ai-seo/references/platform-ranking-factors.md"
  if [[ -f "$ai_seo_ref" ]] && ! rg -q "^> Evidence note:" "$ai_seo_ref"; then
    perl -0pi -e 's#\nSources cited throughout:#\n> Evidence note: treat benchmark percentages in this document as directional unless independently verified with a current primary source before quoting them in audits or recommendations.\n\nSources cited throughout:#' "$ai_seo_ref"
  fi
}

main() {
  if [[ $# -lt 1 ]]; then
    usage
    exit 1
  fi

  local mode=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --sync|--check)
        if [[ -n "$mode" ]]; then
          echo "Specify only one mode: --sync or --check" >&2
          usage
          exit 1
        fi
        mode="$1"
        shift
        ;;
      --tag|--ref)
        if [[ $# -lt 2 ]]; then
          echo "Missing value for $1" >&2
          usage
          exit 1
        fi
        UPSTREAM_REF="$2"
        shift 2
        ;;
      --commit)
        if [[ $# -lt 2 ]]; then
          echo "Missing value for --commit" >&2
          usage
          exit 1
        fi
        EXPECTED_COMMIT="$2"
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

  if [[ -z "$mode" ]]; then
    usage
    exit 1
  fi

  ensure_repo
  local upstream_commit
  upstream_commit="$(get_upstream_commit)"
  verify_expected_commit "$upstream_commit"

  case "$mode" in
    --sync)
      sync_skills
      write_source_metadata "$upstream_commit"
      echo "Synced selected marketing skills from $REPO_URL@$upstream_commit"
      ;;
    --check)
      local local_commit
      local_commit="$(get_local_commit)"

      echo "Upstream commit: $upstream_commit"
      if [[ -n "$local_commit" ]]; then
        echo "Local commit:    $local_commit"
      else
        echo "Local commit:    <none>"
      fi

      if [[ "$upstream_commit" == "$local_commit" ]]; then
        echo "Status: up to date"
      else
        echo "Status: update available"
      fi
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
