#!/usr/bin/env bash
# PostToolUseFailure hook: capture a lesson stub when a test/validate command fails.
# Wired in .claude/settings.json. COMMAND_PATTERN is tuned for this agent's actual
# commands (eval harness, schema apply) — extend it if a new validate-style command
# is added. Reads the hook event JSON on stdin; appends a stub to memory/lessons.md
# and nudges Claude to reflect. Requires: jq.
# Note: PostToolUse fires only on success — failure capture MUST use PostToolUseFailure.

set -uo pipefail
COMMAND_PATTERN='test|spec|validate|lint|pytest|jest|build|eval|psql|schema'

input="$(cat)"
command="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null)" || exit 0
[ -n "$command" ] || exit 0
printf '%s' "$command" | grep -Eiq "$COMMAND_PATTERN" || exit 0

# PostToolUseFailure carries `error_message` (a string). Older/other shapes may
# put a string in `tool_response`. Never assume an object; never crash on shape.
error_message="$(printf '%s' "$input" | jq -r '
  if (.error_message // null) != null then .error_message
  elif ((.tool_response // null) | type) == "string" then .tool_response
  else "" end' 2>/dev/null)" || error_message=""
# Success-shaped payload (object tool_response, no error_message): nothing to capture.
[ -n "$error_message" ] || exit 0
first_line="$(printf '%s' "$error_message" | head -n 1 | cut -c1-160)"

root="${CLAUDE_PROJECT_DIR:-.}"
lessons="$root/memory/lessons.md"
mkdir -p "$root/memory"
[ -f "$lessons" ] || printf '# Lessons (index)\n' > "$lessons"

date_str="$(date +%Y-%m-%d)"
{
  printf '\n## pending-review (%s)\n' "$date_str"
  printf -- '- FAILURE during: `%s` (%s). Reflect on the root cause and rewrite as a NEVER/ALWAYS lesson, then dedupe.\n' \
    "$command" "${first_line:-no error detail}"
} >> "$lessons"

jq -n '{ hookSpecificOutput: { hookEventName: "PostToolUseFailure", additionalContext:
  "A test/validate command failed. A stub was appended to memory/lessons.md under pending-review. Reflect on the root cause and record a proper lesson per .claude/rules/self-improvement.md (then run /retro to consider promotion)." } }'
