#!/usr/bin/env bash

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/coreyhaines31/marketingskills}"
UPSTREAM_REF="${UPSTREAM_REF:-v1.7.0}"
EXPECTED_COMMIT="${EXPECTED_COMMIT:-}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_SKILLS_DIR="$PROJECT_ROOT/.agents/skills"
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

usage() {
  cat <<'EOF'
Usage:
  scripts/sync-marketing-skills.sh --sync [--tag vX.Y.Z] [--commit <sha>]
  scripts/sync-marketing-skills.sh --check [--tag vX.Y.Z] [--commit <sha>]

Options:
  --sync    Fetch upstream skills and sync selected skills into .agents/skills
  --check   Compare local synced commit vs upstream commit
  --tag     Override UPSTREAM_REF for this invocation
  --commit  Require exact upstream commit SHA

Environment overrides:
  REPO_URL      (default: https://github.com/coreyhaines31/marketingskills)
  UPSTREAM_REF  (default: v1.7.0)
  CACHE_DIR     (default: /tmp/marketingskills-sync)
  SKIP_FETCH    (default: 0)
EOF
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
  cat >"$LOCAL_SOURCE_FILE" <<EOF
{
  "repo": "$REPO_URL",
  "ref": "$UPSTREAM_REF",
  "commit": "$commit",
  "synced_at_utc": "$synced_at"
}
EOF
}

ref_to_version() {
  local ref="$1"
  echo "${ref#v}"
}

format_skills_inline() {
  if [[ $# -eq 0 ]]; then
    echo "_none_"
    return
  fi

  local output=""
  local skill
  for skill in "$@"; do
    if [[ -n "$output" ]]; then
      output+=", "
    fi
    output+="\`$skill\`"
  done

  echo "$output"
}

sync_single_skill() {
  local skill="$1"
  local upstream_dir="$CACHE_DIR/skills/$skill"
  local local_dir="$LOCAL_SKILLS_DIR/$skill"
  local local_skill_file="$local_dir/SKILL.md"

  if [[ ! -d "$upstream_dir" ]]; then
    echo "Missing upstream skill directory: $upstream_dir" >&2
    exit 1
  fi

  mkdir -p "$local_dir"
  rsync -a --delete "$upstream_dir/" "$local_dir/"

  if [[ -f "$local_skill_file" ]]; then
    sed -i '' -E "s/^  version: .*/  version: $(ref_to_version "$UPSTREAM_REF")/" "$local_skill_file"
  fi
}

apply_payetax_overrides() {
  local skill
  local skill_file

  for skill in "${KEEP_UPSTREAM_SKILLS[@]}"; do
    skill_file="$LOCAL_SKILLS_DIR/$skill/SKILL.md"
    if [[ ! -f "$skill_file" ]]; then
      continue
    fi

    perl -0pi -e 's# \Q(or `.claude/product-marketing-context.md` in older setups)\E##g' "$skill_file"

    if grep -q ".agents/product-marketing-context.md" "$skill_file" \
      && ! grep -q ".agents/skills/payetax-context/SKILL.md" "$skill_file"; then
      perl -0pi -e 's#(If `\.agents/product-marketing-context\.md` exists[^\n]*\.)#$1\nIf you are working inside `PayeTax`, also read `.agents/skills/payetax-context/SKILL.md` first and apply its constraints.#' "$skill_file"
    fi
  done

  local product_context_file="$LOCAL_SKILLS_DIR/product-marketing-context/SKILL.md"
  if [[ -f "$product_context_file" ]]; then
    perl -0pi -e 's#\QFirst, check if `.agents/product-marketing-context.md` already exists. Also check `.claude/product-marketing-context.md` for older setups — if found there but not in `.agents/`, offer to move it.\E#First, check if `.agents/product-marketing-context.md` already exists.#g' "$product_context_file"
    if ! grep -q ".agents/skills/payetax-context/SKILL.md" "$product_context_file"; then
      perl -0pi -e 's#\QThe document is stored at `.agents/product-marketing-context.md`.\E#The document is stored at `.agents/product-marketing-context.md`.\nIf you are working inside `PayeTax`, also read `.agents/skills/payetax-context/SKILL.md` first and apply its constraints while drafting or updating marketing context.#' "$product_context_file"
    fi
  fi

  local product_context_evals="$LOCAL_SKILLS_DIR/product-marketing-context/evals/evals.json"
  if [[ -f "$product_context_evals" ]]; then
    perl -0pi -e 's# \(and the older \.claude/product-marketing-context\.md location\)##g' "$product_context_evals"
    perl -0pi -e 's#Checks both file locations#Checks the agents file location#g' "$product_context_evals"
  fi

  local ai_seo_ref="$LOCAL_SKILLS_DIR/ai-seo/references/platform-ranking-factors.md"
  if [[ -f "$ai_seo_ref" ]] && ! rg -q "^> Evidence note:" "$ai_seo_ref"; then
    perl -0pi -e 's#\nSources cited throughout:#\n> Evidence note: treat benchmark percentages in this document as directional unless independently verified with a current primary source before quoting them in audits or recommendations.\n\nSources cited throughout:#' "$ai_seo_ref"
  fi
}

write_versions_tracking() {
  local upstream_commit="$1"
  local synced_at
  synced_at="$(date -u +"%Y-%m-%d")"
  local versions_file="$LOCAL_SKILLS_DIR/VERSIONS.md"

  local upstream_skills=()
  while IFS= read -r line; do
    upstream_skills+=("$line")
  done < <(
    find "$CACHE_DIR/skills" -mindepth 1 -maxdepth 1 -type d -print \
      | sed "s#^$CACHE_DIR/skills/##" \
      | sort
  )

  local installed_skills=()
  while IFS= read -r line; do
    installed_skills+=("$line")
  done < <(
    find "$LOCAL_SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name ".*" -print \
      | sed "s#^$LOCAL_SKILLS_DIR/##" \
      | sort
  )

  local included_upstream=()
  local excluded_upstream=()
  local local_only=()
  local skill

  for skill in "${installed_skills[@]}"; do
    if contains_item "$skill" "${upstream_skills[@]}"; then
      included_upstream+=("$skill")
    else
      local_only+=("$skill")
    fi
  done

  for skill in "${upstream_skills[@]}"; do
    if ! contains_item "$skill" "${included_upstream[@]}"; then
      excluded_upstream+=("$skill")
    fi
  done

  local included_count excluded_count local_only_count
  local included_inline excluded_inline local_only_inline
  set +u
  included_count="${#included_upstream[@]}"
  excluded_count="${#excluded_upstream[@]}"
  local_only_count="${#local_only[@]}"
  included_inline="$(format_skills_inline "${included_upstream[@]}")"
  excluded_inline="$(format_skills_inline "${excluded_upstream[@]}")"
  local_only_inline="$(format_skills_inline "${local_only[@]}")"
  set -u

  cat >"$versions_file" <<EOF
# Skills Version Tracking

Canonical source for upstream skill provenance and local inclusion policy.

## Upstream Reference

- Repository: $REPO_URL
- Version tag: \`$UPSTREAM_REF\`
- Commit: \`$upstream_commit\`

## Freshness Check ($synced_at)

- Local sync metadata is stored in \`.agents/skills/.sources/marketingskills.json\`.
- Upstream skills at tag: ${#upstream_skills[@]} total
- Included upstream skills: $included_count
- Local-only skills: $local_only_count

## Upstream Skills Included ($included_count/${#upstream_skills[@]})

$included_inline

## Upstream Skills Excluded ($excluded_count)

$excluded_inline

## Local-Only Skills ($local_only_count)

$local_only_inline

## Optimization Policy

1. Canonical skills path is \`.agents/skills/\` (agents-first route).
2. Shared product context lives in \`.agents/product-marketing-context.md\`.
3. Shared project constraints live in \`.agents/skills/payetax-context/SKILL.md\`.
4. Upstream marketing skills stay close to upstream; PayeTax-specific rules are centralized instead of duplicated in every synced skill.
5. \`scripts/validate-marketing-skills-setup.sh\` must pass after every sync/update.
EOF
}

sync_skills() {
  mkdir -p "$LOCAL_SKILLS_DIR"

  local skill
  for skill in "${KEEP_UPSTREAM_SKILLS[@]}"; do
    sync_single_skill "$skill"
  done

  apply_payetax_overrides
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
      write_versions_tracking "$upstream_commit"
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
