#!/usr/bin/env bash
# PostToolUse hook: hard-blocks a workflow JSON write/edit that violates the CLAUDE.md invariants
# (no AI nodes, no webhook/Telegram-Trigger, no forbidden services). Wire in .claude/settings.json.
# Complements the flow-auditor subagent (broader, softer review); this is the mechanical, always-on
# guarantee. Reads the PostToolUse event JSON on stdin. Requires: jq.

set -uo pipefail

input="$(cat)"
file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)" || exit 0
[ -n "$file_path" ] || exit 0

# Match both "workflows/x.json" and "some/dir/workflows/x.json" — a bare glob without a leading
# "*/" only matches the latter, so both forms are listed explicitly.
case "$file_path" in
  workflows/*.json | */workflows/*.json) ;;
  *) exit 0 ;;
esac

[ -f "$file_path" ] || exit 0

forbidden_types='openAi|langchain|lmChat|chatModel|huggingFace|telegramTrigger|googleSheets|n8n-nodes-base\.webhook'

hits="$(jq -r '[.nodes[]?.type // empty] | .[]' "$file_path" 2>/dev/null | grep -Ei "$forbidden_types" || true)"

if [ -n "$hits" ]; then
  reason="workflows/$(basename "$file_path") uses a forbidden node type: $(printf '%s' "$hits" | tr '\n' ',' | sed 's/,$//'). Hard constraints forbid AI/model nodes, webhook-based Telegram triggers, and non-Telegram/non-Postgres services (see CLAUDE.md Invariants). Remove/replace the node and rewrite the file."
  jq -n --arg reason "$reason" '{decision: "block", reason: $reason}'
  exit 0
fi

exit 0
