# AI Study Dialog Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a protected Qwen-powered study dialog to the Vercel edition while preserving the six offline single-file sites and their calculation anchors.

**Architecture:** Treat signed commit `7996142` and tree `dd70074` as an immutable baseline. Keep `sanshi/academy.html` as the CSP-safe offline source and generate `dist/academy.html` by deterministically injecting the AI panel assets. A dependency-free Node gateway is shared by local development and Vercel functions; secrets remain in environment variables.

**Tech Stack:** Node.js 20, native `fetch`/`http`/`crypto`, static HTML/CSS/JavaScript, Playwright, Vercel Functions, GitHub Actions.

**Plan Version:** `1.0.0` · **Operation:** `OP-20260705-001` · **Target:** `1.1.0`

---

## File Map

- Modify `AGENTS.md`: merge version, operation, build-output, and release rules into the only collaboration constitution.
- Create `VERSION`: semantic product version.
- Create `WORKLOG.md`: operation claims and status.
- Create `release.json`: release metadata consumed at build time.
- Modify `sanshi/CHANGELOG.md`: record operation `OP-20260705-001`.
- Create `package.json`: build, local server, regression, and CI commands.
- Create `package-lock.json`: reproducible Playwright development dependency.
- Modify `.gitignore`: secrets, dependencies, generated output, and screenshots.
- Create `.env.example`: non-secret configuration names.
- Create `sanshi/ai/system-prompt.md`: Claude canonical v1, imported byte-for-byte.
- Create `sanshi/ai/panel.html`: accessible AI workspace markup.
- Create `sanshi/ai/client.css`: desktop rail and mobile drawer styles.
- Create `sanshi/ai/client.js`: context consent, sessions, streaming, export, and safe rendering.
- Create `scripts/build-academy.mjs`: deterministic fragment injection into the offline academy.
- Create `scripts/check-release.mjs`: validate version, release metadata, changelog, and operation ID.
- Create `server/config.mjs`: validated environment configuration.
- Create `server/validate.mjs`: request and context validation.
- Create `server/gateway.mjs`: authorization, system prompt injection, upstream streaming, and normalized errors.
- Create `server/local.mjs`: local static and API server.
- Create `api/health.mjs`: Vercel readiness endpoint.
- Create `api/chat.mjs`: Vercel streaming endpoint.
- Create `vercel.json`: build/output/function configuration and security headers.
- Create `sanshi/tests/playwright-launch.cjs`: portable Chromium launcher.
- Modify six `sanshi/tests/*.cjs` files: use portable launcher without changing calculation assertions.
- Create `sanshi/tests/ai-build.test.mjs`: build and offline/online separation tests.
- Create `sanshi/tests/ai-validate.test.mjs`: explicit-context and payload tests.
- Create `sanshi/tests/ai-gateway.test.mjs`: auth, prompt, upstream, timeout, and secret-leak tests.
- Create `sanshi/tests/ai-ui.cjs`: desktop/mobile interaction and export tests.
- Create `.github/workflows/ci.yml`: release, build, gateway, UI, and six engine suites.

## Chunk 1: Frozen Baseline and Collaboration Controls

### Task 1: Record and enforce the logical operation

**Files:**
- Modify: `AGENTS.md`
- Create: `VERSION`
- Create: `WORKLOG.md`
- Create: `release.json`
- Modify: `sanshi/CHANGELOG.md`
- Test: `scripts/check-release.mjs`

- [ ] **Step 1: Write the failing release check**

Create `scripts/check-release.mjs` to read `VERSION`, `release.json`, `WORKLOG.md`, and `sanshi/CHANGELOG.md`; assert that all contain `1.1.0` or `OP-20260705-001` as appropriate, that the operation ID occurs exactly once in the active-work table, and that release metadata contains no unresolved commit placeholder.

- [ ] **Step 2: Run the check and verify failure**

Run: `node scripts/check-release.mjs`

Expected: FAIL because the release-control files do not exist.

- [ ] **Step 3: Add release-control files**

Use:

```text
VERSION: 1.1.0
WORKLOG active row: OP-20260705-001 | 1.1.0 | Codex | codex/ai-dialog-v1 | in-progress
release.json: {"version":"1.1.0","operationId":"OP-20260705-001","baseline":"7996142680f9d593d36c1a1433e31b221d2a56e2","promptVersion":"canonical-v1"}
```

Append the operation to `sanshi/CHANGELOG.md`. Amend `AGENTS.md` so that:

- published offline artifacts remain self-contained single HTML files;
- source fragments and deterministic builds are allowed;
- `AGENTS.md` is the sole rulebook and `WORKLOG.md` is state only;
- each merged logical operation bumps the version once;
- intermediate commits do not bump versions;
- engine anchors and generated-output checks are mandatory.

- [ ] **Step 4: Run the release check**

Run: `node scripts/check-release.mjs`

Expected: PASS with `release 1.1.0 / OP-20260705-001`.

- [ ] **Step 5: Commit**

```text
git add AGENTS.md VERSION WORKLOG.md release.json sanshi/CHANGELOG.md scripts/check-release.mjs
git commit -m "建立 1.1.0 协作与发布控制"
```

## Chunk 2: Deterministic AI-Enabled Artifact

### Task 2: Import and lock the canonical prompt

**Files:**
- Create: `sanshi/ai/system-prompt.md`
- Test: `sanshi/tests/ai-build.test.mjs`

- [ ] **Step 1: Write a failing prompt-integrity test**

The test reads `sanshi/ai/system-prompt.md`, verifies the canonical heading, the four-part response structure, the five-step method, the Qimen identity boundary, and the deterministic-language prohibition. Record the SHA-256 in `release.json` after import.

- [ ] **Step 2: Run and verify failure**

Run: `node --test sanshi/tests/ai-build.test.mjs`

Expected: FAIL because the prompt file is absent.

- [ ] **Step 3: Import Claude's prompt unchanged**

Copy `D:\Github\test2026\systemprompt.md` to `sanshi/ai/system-prompt.md`. Do not edit its canonical prompt block. Compute SHA-256 and set `promptSha256` in `release.json`.

- [ ] **Step 4: Run and verify pass**

Run: `node --test sanshi/tests/ai-build.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```text
git add sanshi/ai/system-prompt.md release.json sanshi/tests/ai-build.test.mjs
git commit -m "纳入 AI 助教 canonical v1 提示词"
```

### Task 3: Build the AI-enhanced academy without changing the offline source

**Files:**
- Create: `sanshi/ai/panel.html`
- Create: `sanshi/ai/client.css`
- Create: `sanshi/ai/client.js`
- Create: `scripts/build-academy.mjs`
- Modify: `sanshi/tests/ai-build.test.mjs`
- Create: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Add failing artifact-boundary tests**

Test that `sanshi/academy.html` contains no `/api/health`, `/api/chat`, or `fetch(`; build output must contain the panel, version metadata, and API routes; running the build twice must produce identical bytes.

- [ ] **Step 2: Run and verify failure**

Run: `node --test sanshi/tests/ai-build.test.mjs`

Expected: FAIL because the builder and fragments do not exist.

- [ ] **Step 3: Implement deterministic injection**

`scripts/build-academy.mjs` reads the offline academy and inserts:

- `client.css` before `</style>`;
- `panel.html` before the closing `.page` container;
- `client.js` and frozen release metadata before `</body>`.

Write `dist/academy.html` with UTF-8 and no timestamp. Inject the source revision
from `VERCEL_GIT_COMMIT_SHA`, `BUILD_COMMIT`, or local `git rev-parse HEAD` at
build time; do not store a self-referential commit in tracked `release.json`.
`client.js` probes `/api/health`; it reveals the launcher only after a successful
ready response and otherwise leaves the complete offline course unchanged.

- [ ] **Step 4: Run build and tests**

Run: `npm run build && node --test sanshi/tests/ai-build.test.mjs`

Expected: PASS and deterministic `dist/academy.html`.

- [ ] **Step 5: Commit**

```text
git add package.json .gitignore sanshi/ai scripts/build-academy.mjs sanshi/tests/ai-build.test.mjs
git commit -m "生成带 AI 工作区的研习院单文件产物"
```

## Chunk 3: Protected Qwen Gateway

### Task 4: Validate configuration and explicit context

**Files:**
- Create: `.env.example`
- Create: `server/config.mjs`
- Create: `server/validate.mjs`
- Create: `sanshi/tests/ai-validate.test.mjs`

- [ ] **Step 1: Write failing validation tests**

Cover missing secrets, invalid roles, unknown context types, unchecked-context omission, oversized question/context/history, and safe non-secret health metadata.

- [ ] **Step 2: Run and verify failure**

Run: `node --test sanshi/tests/ai-validate.test.mjs`

Expected: FAIL because validation modules are absent.

- [ ] **Step 3: Implement validation**

Allow only `current-tab`, `selected-section`, `progress`, `quiz`, and `notes`. Bound question, each context, total context, and history length. Default configuration remains environment-driven; `.env.example` contains names and safe examples only.

- [ ] **Step 4: Run and verify pass**

Run: `node --test sanshi/tests/ai-validate.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```text
git add .env.example server/config.mjs server/validate.mjs sanshi/tests/ai-validate.test.mjs
git commit -m "验证 AI 网关配置与显式上下文"
```

### Task 5: Stream safe upstream responses

**Files:**
- Create: `server/gateway.mjs`
- Create: `api/health.mjs`
- Create: `api/chat.mjs`
- Create: `sanshi/tests/ai-gateway.test.mjs`

- [ ] **Step 1: Write failing gateway tests**

Use a local fake upstream. Verify timing-safe bearer authentication, canonical system prompt as the first message, selected contexts as user reference data, SSE token/completion/error events, timeout abort, client abort, concurrency rejection, and absence of secrets from errors/logs.

- [ ] **Step 2: Run and verify failure**

Run: `node --test sanshi/tests/ai-gateway.test.mjs`

Expected: FAIL because gateway modules are absent.

- [ ] **Step 3: Implement the gateway**

Use native Node APIs. Send OpenAI-compatible `POST {AI_BASE_URL}/chat/completions` with the configured model, canonical system prompt, bounded history, and selected context. Relay only normalized SSE events. Keep the base URL configurable; do not commit the credential supplied during planning.

- [ ] **Step 4: Run and verify pass**

Run: `node --test sanshi/tests/ai-gateway.test.mjs`

Expected: PASS without external network calls.

- [ ] **Step 5: Commit**

```text
git add server/gateway.mjs api/health.mjs api/chat.mjs sanshi/tests/ai-gateway.test.mjs
git commit -m "实现受保护的千问流式网关"
```

### Task 6: Add the local development server

**Files:**
- Create: `server/local.mjs`
- Modify: `package.json`
- Test: `sanshi/tests/ai-gateway.test.mjs`

- [ ] **Step 1: Add a failing local-server smoke test**

Verify `/` serves the built academy, `/api/health` returns non-secret metadata, unknown paths return 404, and traversal paths are rejected.

- [ ] **Step 2: Run and verify failure**

Run: `node --test sanshi/tests/ai-gateway.test.mjs`

Expected: FAIL because local server is absent.

- [ ] **Step 3: Implement and pass**

Serve only `dist/academy.html` and explicit static assets. Reuse the same health/chat handlers as Vercel.

- [ ] **Step 4: Commit**

```text
git add server/local.mjs package.json sanshi/tests/ai-gateway.test.mjs
git commit -m "提供本地 AI 研习院服务"
```

## Chunk 4: Guided Dialog Product Experience

### Task 7: Implement consent-first context and local sessions

**Files:**
- Modify: `sanshi/ai/panel.html`
- Modify: `sanshi/ai/client.css`
- Modify: `sanshi/ai/client.js`
- Create: `sanshi/tests/ai-ui.cjs`

- [ ] **Step 1: Write failing Playwright journeys**

Cover launcher visibility only when the gateway is ready, desktop rail, mobile drawer, unchecked progress/quiz/notes omission, disclosure summary equality, session persistence under `academy-ai-sessions-v1`, session-only access token, stop/retry without duplicate user turns, safe text rendering, and Markdown export.

- [ ] **Step 2: Run and verify failure**

Run: `npm run build && npm run test:ai-ui`

Expected: FAIL on missing interactions.

- [ ] **Step 3: Implement the product flow**

Use `textContent` for model output in v1.1.0. Preserve the draft on all failures. Cap stored sessions and show an export/remove-old-sessions prompt on quota pressure. Provide suggested questions based on the canonical epistemic stance.

- [ ] **Step 4: Verify desktop and mobile**

Run: `npm run test:ai-ui`

Expected: PASS at 1280x800 and 390x844 with no overlap.

- [ ] **Step 5: Commit**

```text
git add sanshi/ai sanshi/tests/ai-ui.cjs
git commit -m "完成可勾选上下文的 AI 研习对话"
```

## Chunk 5: Engine Regression and Continuous Integration

### Task 8: Make the six existing Playwright suites portable

**Files:**
- Create: `sanshi/tests/playwright-launch.cjs`
- Modify: `sanshi/tests/zwtest.cjs`
- Modify: `sanshi/tests/bztest.cjs`
- Modify: `sanshi/tests/qmtest.cjs`
- Modify: `sanshi/tests/vaulttest2.cjs`
- Modify: `sanshi/tests/acatest.cjs`
- Modify: `sanshi/tests/lunartest2.cjs` only if it launches Chromium
- Modify: `package.json`

- [ ] **Step 1: Capture the current environment failure**

Run: `npm run test:engines`

Expected before adaptation: FAIL because `/opt/pw-browsers/chromium` is unavailable locally.

- [ ] **Step 2: Add a shared portable launcher**

Use `PLAYWRIGHT_CHROMIUM_PATH` when set; otherwise call `chromium.launch()` with Playwright's bundled browser. Change only launch wiring and reliable file paths, not any expected engine result.

- [ ] **Step 3: Run all existing anchors**

Run: `npm run test:engines`

Expected: all six scripts exit zero and retain their original expected values.

- [ ] **Step 4: Commit**

```text
git add sanshi/tests package.json
git commit -m "让六站引擎测试适配本机与 CI"
```

### Task 9: Add CI and deployment configuration

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `vercel.json`
- Modify: `package.json`

- [ ] **Step 1: Add CI commands locally**

Define `check:release`, `build`, `test:unit`, `test:engines`, `test:ai-ui`, and
`test` scripts. Generate and commit `package-lock.json` so `npm ci` is valid.

- [ ] **Step 2: Run the full local gate**

Run: `npm test`

Expected: release, build, gateway, UI, and all six inherited suites pass.

- [ ] **Step 3: Add GitHub Actions**

Use Node 20, `npm ci`, `npx playwright install --with-deps chromium`, and `npm test`. Upload screenshots only on failure. Do not expose prompt, answer, or secret values in logs.

- [ ] **Step 4: Add Vercel configuration**

Build with `npm run build`, serve `dist`, route `/api/*` to Node functions, and set CSP/security headers. Keep production secrets in Vercel environment variables.

- [ ] **Step 5: Commit**

```text
git add .github/workflows/ci.yml vercel.json package.json
git commit -m "建立全量测试与 Vercel 发布门禁"
```

## Chunk 6: Final Verification and GitHub Handoff

### Task 10: Verify, close the operation, and publish the branch

**Files:**
- Modify: `WORKLOG.md`
- Modify: `release.json`
- Modify: `sanshi/CHANGELOG.md`

- [ ] **Step 1: Run secret and artifact scans**

Run searches for credential prefixes, planning credentials, `/api/` references in offline artifacts, and provider keys in Git-tracked files. Expected: no secrets; only the generated Vercel artifact references APIs.

- [ ] **Step 2: Run the complete gate from a clean build**

Run: `npm ci && npm test`

Expected: PASS.

- [ ] **Step 3: Update release records**

Set operation status to `review` and append validation results to the changelog.
Keep tracked `release.json` limited to stable version, operation, baseline, and
prompt metadata; the build records the source revision in generated output.

- [ ] **Step 4: Commit**

```text
git add WORKLOG.md release.json sanshi/CHANGELOG.md
git commit -m "完成 1.1.0 AI 研习对话候选版本"
```

- [ ] **Step 5: Push without rewriting the signed baseline**

Push both `claude/elegant-dijkstra-emmcop` and `codex/ai-dialog-v1` through an authenticated Git transport. Verify on GitHub that the Claude baseline is commit `7996142`, tree `dd70074`, and shows its SSH signature. Open a draft PR from `codex/ai-dialog-v1` to `main`.

- [ ] **Step 6: Merge and deploy only after review**

After PR and CI approval, merge to `main`, tag `v1.1.0`, configure fresh deployment credentials, deploy to Vercel, and verify that the Artifact/offline edition still exposes no AI network path.
