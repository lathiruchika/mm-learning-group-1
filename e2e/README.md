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
| `auth-navigation.feature` | EPMCDMETST-70470 | wrong credentials stay on login, correct login lands on `/welcome/darshan`, LogOut returns to login, protected routes redirect when logged out, reload logs out, header/welcome links, Add CTA opens `/list-todos/-1`, Update opens `/list-todos/{id}` prefilled, 404 page |
| `todo-fields.feature` | EPMCDMETST-70470 | toggling Done persists (`true`/`false` in the list), description/date edits persist after refresh, create with Done checked or unchecked, ids keep increasing across create-delete-create and a reload |
| `delete-guard.feature` | EPMCDMETST-70470 | Delete disabled only on the row in flight, double click sends one delete (API call counter), two rows deleted back to back, failed delete re-enables the button, deleting every todo shows the empty state |
| `resilience.feature` | EPMCDMETST-70470 | Retry clears the list banner at once, flag `0` means no failure, failed save leaves storage untouched, `todo-storage-warning` with unreadable `localStorage` (in-memory fallback, lost on reload), full-quota save/delete errors with stored todos intact |
| `accessibility.feature` | EPMCDMETST-70470 | fields found by label, `aria-invalid` and a single `role="alert"` message per invalid field (create and edit), Save disabled until valid, `role="status"`/`role="alert"` on loading and error banners |

Not covered: `VITE_DUMMY_API_ERROR_RATE` (random failures cannot be asserted reliably), `aria-describedby` links between fields and their messages, keyboard-only flows, other browsers.

Known app bugs, kept as skipped `test.fixme` tests:

- `src/components/Login.jsx:27` calls `authContext.setAuthenticated`, which `AuthProvider.jsx:32` does not provide. Submitting wrong credentials throws a TypeError, so the "Authentication Failed" message (line 38) never appears. Test: `auth-navigation` "Wrong credentials show an Authentication Failed message".
- Even once that is fixed, the message at `Login.jsx:38` has no `role="alert"`. Test: `accessibility` "The login failure message is announced to assistive technology".

Observed behaviour worth knowing: LogOut ends on the login page, never on `LogOut.jsx` ("You are Logged Out"), because `/logout` is a protected route and the session is cleared before it renders.

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
- **API call counter**: `installApiCallCounter` (register before the first navigation) counts
  reads of the `dummy-api:simulate-error` key, which the adapter performs once per API call.
  It lets a test assert that a double click sent exactly one delete.
- **Storage faults**: `resilience.spec.js` uses `page.addInitScript` to make the
  `window.localStorage` getter throw (unreadable storage) or to make `Storage.prototype.setItem`
  throw `QuotaExceededError` while `window.__quotaFull` is true (full storage). Unreadable
  storage blocks `seedStorage`/`readStorage`, so those tests use the default seeded todos only.
