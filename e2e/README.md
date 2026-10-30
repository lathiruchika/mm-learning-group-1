# End-to-end tests (Playwright)

Automated tests for the Todo frontend (Jira EPMCDMETST-70470). Each
`e2e/features/*.feature` file holds the Gherkin scenarios; the matching
`e2e/tests/*.spec.js` mirrors them one-to-one, with the scenario title in the test name.

## Run

```bash
npm install
npx playwright install chromium   # once
npm run test:e2e                  # whole suite
npx playwright test validation    # one spec
npx playwright show-report        # open the HTML report after a run
```

Playwright starts its own dev server (`npx vite --port 5199 --strictPort`) and never
reuses an existing one, so a server on 5173 is left alone. The server is started with
`VITE_DUMMY_API_DELAY_MS=300`: the delay is a build-time Vite variable, so the
loading-indicator scenarios need a nonzero value. `playwright-report/` and
`test-results/` are gitignored.

## What is covered

| Feature file | Jira | Scenarios |
| --- | --- | --- |
| `persistence.feature` | EPMCDMETST-70465 | seeding, CRUD with no request to `localhost:8080`, refresh keeps data, per-user isolation, `[]` stays empty, ids never reused, corrupt storage backed up and re-seeded |
| `ux-states.feature` | EPMCDMETST-70466 | loading indicator, empty state and add CTA, list error banner and Retry, delete failure banner and Retry, not-found panel, edit-load and save failures |
| `validation.feature` | EPMCDMETST-70467 | whitespace-only, too-short, missing, partial and impossible dates, valid save, trimming, errors clearing, 8 emoji accepted, Cancel, existing invalid todo |

Not covered: `todo-storage-warning` (needs localStorage to be blocked) and `VITE_DUMMY_API_ERROR_RATE`.

## How things work

- **Clean state**: every test gets a fresh browser context, so localStorage starts empty.
  Data is seeded after the app origin has loaded, via `seedStorage` in `e2e/support/app.js`.
- **Login is in memory only**: a reload logs the user out, and a direct `page.goto` to a
  protected route redirects to `/`. Tests sign in again after a reload and use in-app
  navigation (`navigateInApp` pushes history, for routes such as `/list-todos/9999`).
- **Failure simulation**: setting localStorage `dummy-api:simulate-error` to `"1"` makes every
  dummy API call fail with `SIMULATED_ERROR`; removing it (or `"0"`) restores normal
  behaviour. Tests use `setSimulatedErrors(page, true|false)` to fail a step and then
  recover, for example to check that Retry works.
- **Locators**: `data-testid` wherever the app provides one. Login has none, so it uses
  `input[name="username"]`, `input[name="password"]` and the Login button role.
- **Backend check**: the `backendRequests` fixture records any request to `localhost:8080`.
- **Impossible-date scenario**: a native date input cannot hold `2025-02-30`, so the test
  switches the input to `type="text"` to reach the YYYY-MM-DD validator.
