# Confluence-ready page drafts

Drafts produced by the CodeMie Documentation agent from verified evidence, then reviewed against the code.
**Not yet published**: the agent has no Confluence tool, so these must be pasted into space `mmlearning`
(use Insert -> Markup -> Confluence Wiki). The "Design" links point at a page that still describes an older
app and needs the corrections listed in section 3.

## 2) Confluence-ready pages (Confluence wiki markup)

### 2(a) Build Instructions

```text
h1. Build Instructions

h2. Repo
* GitHub: https://github.com/lathiruchika/mm-learning-group-1

h2. Tech stack (implemented)
* React 18 + Vite
* Plain JavaScript (.jsx)
* Single-page app (no router)
* No backend required in dummy mode

h2. Install
{code:bash}
npm ci
{code}

h2. Build (production)
*Dummy mode build (no backend; uses browser localStorage):*
{code:bash}
VITE_API_MODE=dummy npm run build
{code}

h3. Build output
* dist/

h2. Configuration (build-time)
h3. VITE_API_MODE
Selects API provider at *build time*:
* dummy: browser localStorage provider (no backend)
* real: axios provider to VITE_API_BASE_URL
If unset, defaults to *real*.

*Build-time warning:* changing VITE_API_MODE requires a rebuild (runtime switching is not provided).

h3. VITE_API_BASE_URL
Used only when VITE_API_MODE=real.
Default: http://localhost:8080
```

---

### 2(b) Local Deployment Guide

```text
h1. Local Deployment Guide (no Docker)

h2. Goal
Serve the production build locally and verify it works in dummy mode (no backend).

h2. Build
{code:bash}
VITE_API_MODE=dummy npm run build
{code}

h2. Serve (vite preview)
{code:bash}
npm run preview -- --host 127.0.0.1 --port 4173
{code}

h2. Verify
Expected:
* App available at: http://127.0.0.1:4173
* HTTP 200 on / and on the JS asset (asset path not provided)

h2. Verified results (2026-10-25)
* Production build succeeded (about 204 kB JS, 3 kB CSS)
* Served via vite preview at http://127.0.0.1:4173 in dummy mode
* HTTP 200 on / and on the JS asset
* E2E verification against served build:
** 31 e2e tests + 1 deployment smoke test = 32/32 passed
* Smoke test confirmed:
** 3 seeded todos
** add + reload persistence
** zero requests to any other host
** zero console errors

h2. Notes / limitations
* Docker deployment not built or verified (Docker not available)
```

---

### 2(c) Test Cases and Execution Results (Gherkin summary + verified results)

```text
h1. Test Cases and Execution Results

h2. Scope
This page summarizes test coverage for:
* EPMCDMETST-58998 (search/filter/sort + empty states)
* EPMCDMETST-66717 (validation + inline edit behaviors)

Test types:
* Unit tests (Node built-in runner)
* E2E tests (Playwright, Chromium only)

----

h2. EPMCDMETST-58998 — Search, Status Filter, Target-Date Sort

h3. Gherkin summary (high level)

h4. Search
*Given* a list of todos exists  
*When* the user types a search query with leading/trailing spaces  
*Then* the query is trimmed and applied as a case-insensitive substring match.

h4. Status filter
*Given* todos exist with done and not-done statuses  
*When* the user selects All / Done / Not done  
*Then* the list shows only todos matching the selected status.

h4. Sort by target date
*Given* todos exist with and without target dates  
*When* the user selects none / date-asc / date-desc  
*Then* the list ordering updates accordingly  
*And* undated todos always appear last.

h4. Clear controls
*Given* any combination of search/filter/sort is applied  
*When* the user clicks Clear  
*Then* search/filter/sort are reset.

h4. Empty states
*Given* there are no todos  
*Then* the UI shows "No todos yet. Add one above."  
*And* list controls are not shown.

*Given* todos exist but none match the current filters  
*Then* the UI shows "No todos match your filters."

----

h2. EPMCDMETST-66717 — Add-form and Inline-edit Validation

h3. Gherkin summary (high level)

h4. Description validation
*Given* the user is adding or editing a todo  
*When* description is empty or < 8 characters after trimming  
*Then* it is invalid.

h4. Target date validation
*Given* the target date field is empty  
*Then* it is allowed (optional).

*Given* the user sets a target date  
*When* it is not a real calendar date  
*Then* it is invalid.

*Given* the user sets a target date  
*When* it is in the past  
*Then* it is invalid.

h4. Add button behavior
*Given* the form is invalid  
*Then* Add is disabled.

*Given* a save is in progress  
*Then* Add is disabled  
*And* double-submit is guarded.

h4. Inline edit behaviors
*Given* the user is editing a todo inline  
*When* Enter is pressed or the input blurs  
*Then* it attempts to save.

*When* Escape is pressed  
*Then* it cancels.

*When* the edit is unchanged  
*Then* it closes without saving.

*When* a save fails  
*Then* an inline role=alert message is shown.

----

h2. Execution results (verified locally)

h3. Unit tests
Command:
{code:bash}
npm test
{code}

Verified on 2026-10-25:
* 25 passed, 0 failed
** 12 listUtils
** 13 validation

h3. E2E tests (Playwright)
Command:
{code:bash}
npm run test:e2e
{code}

Notes:
* Chromium only
* Runs in dummy mode on port 5199
* HTML report: playwright-report/index.html (git-ignored)

Verified on 2026-10-25:
* 31 passed, 0 failed
** 15 tests for EPMCDMETST-58998
** 16 tests for EPMCDMETST-66717
* One test initially failed due to a test bug (locator.check() on a row that leaves the filtered view); fixed by using click().

h3. Production deployment smoke test (served build)
Verified on 2026-10-25:
* 31 e2e tests + 1 deployment smoke test = 32/32 passed against vite preview served build at http://127.0.0.1:4173
* Smoke test confirmed:
** 3 seeded todos
** add + reload persistence
** zero requests to any other host
** zero console errors

----

h2. Known test gaps (state of coverage)
* save-on-blur (valid path) is not covered by tests
* loading state is not covered by tests
* error banner / Retry state is not covered by tests
* Chromium only (no cross-browser coverage)
```

---

### 2(d) Demo Script (exact order, commands, expected outcomes)

```text
h1. Demo Script

h2. Preconditions
* Node/npm installed (versions not provided)
* Repo available: https://github.com/lathiruchika/mm-learning-group-1
* Demo uses dummy mode (no backend)

h2. Step 1 — Install dependencies
{code:bash}
npm ci
{code}
Expected:
* Install completes successfully (exact output not provided)

h2. Step 2 — Run unit tests
{code:bash}
npm test
{code}
Expected:
* 25 passed, 0 failed (12 listUtils + 13 validation)

h2. Step 3 — Run E2E tests (Chromium)
{code:bash}
npm run test:e2e
{code}
Expected:
* 31 passed, 0 failed
* HTML report generated at playwright-report/index.html (git-ignored)

h2. Step 4 — Build production bundle (dummy mode)
{code:bash}
VITE_API_MODE=dummy npm run build
{code}
Expected:
* Build succeeds
* dist/ created
* Bundle size noted from verification: about 204 kB JS and 3 kB CSS

h2. Step 5 — Serve production build locally
{code:bash}
npm run preview -- --host 127.0.0.1 --port 4173
{code}
Expected:
* App available at http://127.0.0.1:4173
* HTTP 200 on / and on the JS asset

h2. Step 6 — UI walkthrough (in browser)
Open: http://127.0.0.1:4173

Expected initial state (dummy mode):
* 3 seeded todos (verified in deployment smoke test)

Demo EPMCDMETST-58998:
1) Search:
* Type a query with spaces and mixed case
* Expected: search trims spaces and matches case-insensitive substring

2) Status filter:
* Toggle All / Done / Not done
* Expected: list updates accordingly

3) Sort:
* Switch sort none / date-asc / date-desc
* Expected: ordering updates; undated todos always last

4) Clear:
* Click Clear
* Expected: all controls reset

5) Empty states:
* When list has no todos: show "No todos yet. Add one above." and no controls
* When filters match none: show "No todos match your filters."

Demo EPMCDMETST-66717:
6) Add-form validation:
* Try short/blank description
* Expected: invalid; Add disabled
* Enter a description >= 8 chars after trimming
* Expected: valid (assuming date rules satisfied)

7) Target date validation:
* Leave date empty
* Expected: allowed
* Set an invalid calendar date
* Expected: invalid
* Set a past date
* Expected: invalid

8) Inline edit:
* Enter edit, press Enter to save OR blur to save
* Press Escape to cancel
* Expected: unchanged edit closes without saving
* If save fails, expected: inline role=alert message (exact failure trigger not provided)

h2. Step 7 — Deployment verification run (served build)
Run the same E2E suite against the served build (method not provided; result is verified):
Expected (verified 2026-10-25):
* The 31 e2e tests plus one deployment smoke test = 32/32 passed
* Smoke test confirmed:
** add + reload persistence
** zero requests to any other host
** zero console errors
```

---

### 2(e) Traceability Matrix (table)

```text
h1. Traceability Matrix

|| Story (Jira) || Design || PR || Tests || Deployment verification || Doc ||
| EPMCDMETST-58998 | https://test12-new.atlassian.net/wiki/spaces/mmlearning/pages/24346625 (STALE - needs correction) | https://github.com/lathiruchika/mm-learning-group-1/pull/6 | Unit: npm test (listUtils covered; exact mapping not provided). E2E: 15 tests (part of 31 total), verified 31/31 pass on 2026-10-25. | Served build via vite preview at http://127.0.0.1:4173 (dummy mode). 31 e2e + 1 smoke test = 32/32 passed on 2026-10-25. | not created yet |
| EPMCDMETST-66717 | https://test12-new.atlassian.net/wiki/spaces/mmlearning/pages/24346625 (STALE - needs correction) | https://github.com/lathiruchika/mm-learning-group-1/pull/7 | Unit: npm test (validation covered; exact mapping not provided). E2E: 16 tests (part of 31 total), verified 31/31 pass on 2026-10-25. | Served build via vite preview at http://127.0.0.1:4173 (dummy mode). 31 e2e + 1 smoke test = 32/32 passed on 2026-10-25. | not created yet |
| EPMCDMETST-69689 | https://test12-new.atlassian.net/wiki/spaces/mmlearning/pages/24346625 (STALE - needs correction) | https://github.com/lathiruchika/mm-learning-group-1/pull/6 (earlier work in diff) | not provided (known gap: loading/error/Retry states not covered by tests) | not provided | not created yet |
```

---

## 3) Corrections needed for the existing Confluence design page

Page: https://test12-new.atlassian.net/wiki/spaces/mmlearning/pages/24346625

Corrections to make (based only on provided facts):
1. Update architecture description to match the implemented app: **single-page React 18 + Vite**, plain **.jsx**, **no router**.
2. Remove/replace stale references to **login**, **Formik**, and **backend required** (dummy mode requires no backend).
3. Document the implemented API abstraction correctly:
   - `src/api/apiAdapter.js`
   - Providers in `src/api/providers/` (`dummyTodoProvider`, `realTodoProvider`)
   - Storage in `src/api/storage/localStorageRepo.js`
4. Document the **build-time** configuration behavior:
   - `VITE_API_MODE` selects provider at build time (`dummy` vs `real`), defaults to `real` if unset
   - `VITE_API_BASE_URL` default `http://localhost:8080`
   - `.env.example` sets `dummy`
5. Update feature/design sections to match implemented functionality:
   - Search/filter/sort behavior (trimmed, case-insensitive substring; All/Done/Not done; undated always last; Clear reset; empty states messages)
   - Validation rules (description >= 8 trimmed; target date optional; if set must be real and not past; inline edit behaviors + role=alert on failure)
6. Remove/replace any mention that filtering is performed by a backend; in this repo it is **client-side**.

---

## 4) Jira comment text (paste-ready)

### Comment for EPMCDMETST-58998

```text
Implementation update (frontend-only SPA):

PR: https://github.com/lathiruchika/mm-learning-group-1/pull/6 (open; base main)

Delivered behavior:
- Search: case-insensitive substring match; input is trimmed
- Status filter: All / Done / Not done
- Sort: none / date-asc / date-desc; undated todos always last
- Clear button resets search/filter/sort
- Empty states:
  - With zero todos: "No todos yet. Add one above." (controls not shown)
  - With todos but no filter matches: "No todos match your filters."
- Note: Filtering/sorting is client-side (no backend required in dummy mode)

Tests (verified locally on 2026-10-25):
- Unit: `npm test` -> 25 passed, 0 failed (includes listUtils coverage; exact mapping not provided)
- E2E: `npm run test:e2e` -> 31 passed, 0 failed total (includes 15 tests for EPMCDMETST-58998), Chromium only
- Production build: succeeded (about 204 kB JS, 3 kB CSS)

Local deployment verification (no Docker; verified 2026-10-25):
- Built with `VITE_API_MODE=dummy npm run build` and served with `npm run preview -- --host 127.0.0.1 --port 4173`
- 31 e2e tests + 1 deployment smoke test = 32/32 passed against the served build
- Smoke test confirmed: 3 seeded todos, add+reload persistence, zero requests to any other host, zero console errors

Known gaps:
- Loading/error/Retry states not covered by tests
- E2E is Chromium only
- Docker deployment not verified
```

### Comment for EPMCDMETST-66717

```text
Implementation update (validation + inline edit):

PR: https://github.com/lathiruchika/mm-learning-group-1/pull/7 (open; stacked on #6 and includes merge of #6)

Delivered behavior:
- Description validation: required; >= 8 characters after trimming
- Target date: optional; if set must be a real calendar date and not in the past
- Add button disabled while invalid or saving; double-submit guarded
- Inline edit:
  - Save on Enter or blur
  - Cancel on Escape
  - Unchanged edit closes without saving
  - Failed save shows inline message with role=alert

Tests (verified locally on 2026-10-25):
- Unit: `npm test` -> 25 passed, 0 failed (includes validation coverage; exact mapping not provided)
- E2E: `npm run test:e2e` -> 31 passed, 0 failed total (includes 16 tests for EPMCDMETST-66717), Chromium only
- Note: One E2E test initially failed due to a test bug (locator.check() on a row that leaves the filtered view); fixed by using click().

Local deployment verification (no Docker; verified 2026-10-25):
- Served production build via `npm run preview -- --host 127.0.0.1 --port 4173` in dummy mode
- 31 e2e tests + 1 deployment smoke test = 32/32 passed against the served build

Known gaps:
- save-on-blur (valid path) not covered by tests
- Loading/error/Retry states not covered by tests
- E2E is Chromium only
- Docker deployment not verified
```
