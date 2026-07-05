# AI Study Dialog Design

## Document Control

- Design version: `1.3.0`
- Operation ID: `OP-20260705-001`
- Provisional product target version: `1.1.0` (reconcile after bundle import)
- Owner: Codex
- Branch: `codex/ai-dialog-v1`
- Status: Approved for implementation planning
- Canonical baseline required before implementation: Claude bundle commit `7996142`
  with tree `dd70074`

## Goal

Add a guided AI interpretation and inquiry workspace to the Sanshi Academy
website while preserving its existing course, progress, quiz, dual-theme, and
epistemic-guardrail behavior. The feature must support safe personal use online
and a Git-based Claude/Codex collaboration loop.

The site-facing assistant uses the configured Qwen model. Claude and Codex are
development collaborators that coordinate through GitHub; they are not the
runtime assistant shown inside the site.

## Non-Goals

- No public multi-user service in version `1.1.0`.
- No user account system or cloud conversation database.
- No API key stored in browser code, browser storage, logs, or Git.
- No automatic transmission of course progress, quiz results, or notes.
- No rewrite of the existing course into a framework application.

## Required Baseline Import

Implementation must not begin from the recovered cache-only page. First import
and verify the updated Claude Git bundle:

- Expected commit: `7996142`
- Expected tree: `dd70074`
- Expected author: `Claude <noreply@anthropic.com>`
- Expected signature: valid SSH signature reported by Git
- Expected branch: `claude/elegant-dijkstra-emmcop`
- Expected content: six sites, Playwright tests, `AGENTS.md`, and collaboration
  documentation

Commit `7996142` is a frozen transfer baseline. Neither Claude nor Codex adds a
commit to that branch before import verification. New work, including the AI
system prompt, begins only on `codex/ai-dialog-v1` after the commit, tree, file
list, and signature have been checked.

Run `git bundle verify`, inspect the expected commit and file list, then fetch
the bundle into the existing `fdpers/test2026` repository without overwriting
the dirty `main` worktree. The current cache-recovery branch already occupies
the expected Claude branch name, so archive that ref and its untracked recovery
files before importing the bundle under its canonical branch name. Recreate or
rebase `codex/ai-dialog-v1` from the verified Claude branch and reconcile this
design, target version, and operation record with the imported `AGENTS.md`,
`VERSION`, and `CHANGELOG.md` if present.

## Product Architecture

### 1. Course Frontend

Keep the existing zero-dependency course experience. Source files may use a
deterministic build step, but each published site artifact remains a single,
self-contained HTML file with no runtime package dependency. Add a collapsible
AI study workspace on the right side of desktop layouts. On narrow screens it
becomes a bottom drawer. The main course remains readable and usable when the
workspace is closed or the backend is unavailable.

### 2. Context Composer

The user explicitly chooses which information accompanies each question:

- Current tab content
- Current visible section or selected excerpt
- Twelve-week course progress
- Quiz result
- User-entered notes

Progress, quiz results, and notes are off by default. Before sending, the UI
shows a concise disclosure summary of exactly what will be transmitted.

### 3. AI Gateway

One shared gateway implementation supports local development and online
serverless deployment.

Configuration is provided only through environment variables:

```text
AI_PROVIDER=custom
AI_BASE_URL=<OpenAI-compatible base URL>
AI_MODEL=qwen3.7-plus
AI_API_KEY=<secret>
APP_ACCESS_TOKEN=<secret>
```

The gateway does not hard-code a billing plan or provider endpoint. The owner
selects an OpenAI-compatible endpoint through deployment environment variables;
credentials and endpoint eligibility are operational configuration, not tracked
source. Public or multi-user deployment requires a fresh eligibility review.

The local Node service and the Vercel function both call the provider's
OpenAI-compatible chat endpoint using native `fetch`. They stream the response
to the browser with server-sent events. The gateway enforces authentication,
bounded concurrency, timeouts, bounded payload size, and normalized errors.

### 4. Collaboration and Release Control

GitHub is the only source of truth for development. Claude uses `claude/*`
branches and Codex uses `codex/*` branches. The imported root `AGENTS.md` is the
single collaboration constitution: Codex's version, operation, and claim rules
must be merged into it rather than maintained as a competing instruction file.
Each logical change is claimed in `WORKLOG.md` before editing and receives one
operation ID and one target product version.

The repository contains:

- `VERSION`: current semantic version
- `CHANGELOG.md`: user-visible changes by version and operation ID
- `WORKLOG.md`: owner, branch, status, files, and operation ID
- `release.json`: version, operation ID, commit, and build time for the UI

CI rejects a completed logical operation or release that changes product files
without updating `VERSION` and `CHANGELOG.md`. Intermediate commits on the same
operation do not each require a version bump. Completed releases receive an
annotated Git tag such as `v1.1.0`.

Signed commits are recommended but not a functional requirement. Codex may use
the owner's existing SSH signing setup after confirming it is configured; the
implementation must not invent, export, or commit signing keys.

## Interface Design

### Desktop

The right-side workspace is persistent, resizable within a bounded width, and
collapsible. It contains:

1. Conversation/session selector
2. Context checkboxes
3. Transmission disclosure summary
4. Suggested inquiry prompts
5. Streaming message history
6. Composer and send/stop controls
7. Markdown export command

The user can continue reading and switching course tabs while the conversation
remains visible.

### Mobile

The workspace becomes a bottom drawer with stable collapsed and expanded
heights. It must not cover navigation or trap page scrolling. The current draft
and streamed answer survive drawer collapse.

### Inquiry Guidance

Suggested prompts follow the site's epistemic stance:

- Explain the verifiable facts in this section.
- Separate factual, symbolic, and reflective claims.
- What assumptions should I verify before accepting this interpretation?
- Turn this interpretation into a testable observation.
- Compare this section with another selected system.

The gateway always prepends a fixed, version-controlled system prompt. Claude
owns the first canonical wording and Codex owns its integration and tests. The
prompt requires the runtime assistant to distinguish verifiable facts, symbolic
interpretation, uncertainty, and practical next steps. It must state that the
arts are reflective hypothesis generators, not prediction tools, and follow the
five-step analysis method. Qimen answers the current situation, decision, and
direction; it must not use a momentary chart to define who a person is. Symbolic
claims must never be presented as deterministic outcomes.

Claude's canonical v1 prompt is added unchanged on the Codex feature branch at
`sanshi/ai/system-prompt.md`. Its checksum is recorded after the attachment is
downloaded so later edits are explicit, reviewable prompt versions rather than
silent wording drift.

## Data Flow

1. User selects context and writes a question.
2. Frontend builds a bounded context object.
3. Disclosure panel renders a human-readable transmission summary.
4. User sends the request with a session-only access token.
5. Gateway validates the token, payload, rate, and configuration.
6. Gateway sends the request to the configured Qwen endpoint.
7. Tokens stream back to the conversation panel.
8. Completed turns are persisted locally and can be exported to Markdown.

No context category is included merely because it exists in local storage.
Only selected categories are serialized into the request.

## Local Persistence and Export

Existing keys remain unchanged:

- `academy-weeks`
- `academy-quiz-best`

New data uses versioned keys:

- `academy-ai-sessions-v1`
- `academy-ai-preferences-v1`

The access token is kept in `sessionStorage`, not `localStorage`. The provider
API key is never sent to the browser.

Conversation persistence has a fixed session and character budget. When browser
storage approaches its quota, the UI asks the user to export and remove older
sessions rather than silently dropping the current conversation.

Markdown exports include site version, date, session title, selected-context
labels, user questions, assistant answers, and a verification-notes section.
The export is designed for handoff to Claude or Codex without exposing secrets.

## API Contract

### `GET /api/health`

Returns gateway readiness and non-secret model metadata. It never returns keys,
tokens, raw provider errors, or environment values.

### `POST /api/chat`

Request fields:

```json
{
  "sessionId": "local-generated-id",
  "question": "User question",
  "contexts": [
    {"type": "current-tab", "label": "知识地图", "content": "Bounded text"}
  ],
  "history": [
    {"role": "user", "content": "Previous question"},
    {"role": "assistant", "content": "Previous answer"}
  ]
}
```

The gateway rejects unknown roles, oversized strings, excessive history, and
unsupported context types. The response is an SSE stream containing token,
completion, and normalized error events.

The request carries the personal access token in the
`Authorization: Bearer <token>` header. The token is never accepted in a URL or
query string.

## Security and Failure Handling

- Compare the personal access token server-side using a timing-safe method.
- Restrict CORS to configured production and local origins.
- Enforce a small per-instance concurrency limit and configure provider-side
  budget alerts. A distributed rate limiter is deferred until multi-user login
  is introduced; an in-memory counter must not be presented as global control.
- Cap context, history, and output sizes.
- Abort upstream calls after the configured timeout.
- Do not log prompts, answers, authorization headers, or provider payloads.
- Render model output as text or sanitized Markdown; never execute returned
  HTML or code.
- Serve a restrictive content security policy and do not load third-party
  scripts from the course page.
- Preserve the user's draft after timeout, network loss, or authentication
  failure.
- Provide retry without silently duplicating the saved user message.

Because a provider credential was shared during planning, rotate it after the
deployment is configured.

## Deployment

- GitHub hosts the canonical repository and pull-request workflow.
- Vercel deploys the static site and serverless gateway from the protected main
  branch. This is the AI-enabled edition maintained operationally by Codex.
- GitHub Pages may publish a read-only static mirror with AI controls disabled.
- Claude Artifact remains a separately published offline mirror maintained by
  Claude. Artifact CSP prohibits the external gateway request and is never
  weakened to enable AI.

The frontend uses progressive enhancement. It checks the configured gateway
health endpoint during startup. When no gateway is configured or reachable, the
AI entry point is hidden and the course remains a complete offline experience.
The same generated site file can therefore serve Vercel, Pages, and Artifact
without divergent content forks.

After feature review and all tests pass, merge the frozen Claude baseline and
the AI feature into `main` together, create the `v1.1.0` tag, and only then
allow Vercel production deployment. No production deployment is sourced
directly from either agent branch.

Only the owner uses the online AI feature in `1.1.0`. A formal login system is a
future version and is not simulated with insecure client-side identity checks.

## Test Strategy

### Regression

- Existing tabs remain navigable.
- Existing theme behavior remains intact.
- Twelve-week progress persists under its original key.
- Quiz scoring and best score persist under the original key.
- Existing epistemic guardrails remain visible.
- Every existing `sanshi/tests/*.cjs` engine-accuracy anchor remains green,
  including day-pillar dual anchors, Ziwei/Tianfu mirroring, Qimen Fuyin, and
  lunar-calendar conversion. The build must not change engine results.

### Context Privacy

- Unchecked progress, quiz, and notes never appear in a request.
- The disclosure summary matches the serialized request.
- Oversized and unknown contexts are rejected.

### Gateway

- Missing configuration produces a safe readiness error.
- Invalid access token is rejected.
- Provider timeout and failure are normalized without leaking secrets.
- Streaming completion and client abort both clean up correctly.
- Logs and static bundles contain no provider key.

### Interface

- Desktop right rail opens, closes, and preserves the draft.
- Mobile bottom drawer does not overlap navigation or content controls.
- Streaming, stop, retry, session switching, and Markdown export work.
- Keyboard focus, labels, and status announcements are accessible.

### Release Discipline

- A completed logical operation fails CI without a version bump; intermediate
  commits within that operation may share the operation's target version.
- `VERSION`, `CHANGELOG.md`, `release.json`, and Git tag agree.
- Duplicate operation IDs are rejected.

## Acceptance Criteria

1. The verified Claude bundle commit `7996142`, tree `dd70074`, is the actual
   implementation baseline.
2. A user can ask Qwen about manually selected course context.
3. The UI discloses exactly what will be sent before transmission.
4. Unselected local data is not transmitted.
5. Conversations persist locally and export as Markdown.
6. No secret appears in Git history or browser-delivered assets.
7. Existing course, progress, quiz, themes, and guardrails pass regression tests.
8. The site is deployable from GitHub to Vercel for protected personal use.
9. Claude and Codex can avoid duplicate work through branch, operation, and
   version records.
