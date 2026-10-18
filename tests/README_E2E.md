# E2E (Playwright)

## Prereqs
- Node.js LTS

## Install
```bash
npm ci
npx playwright install
```

## Run tests (starts dev server automatically)
```bash
npx playwright test
```

## Run headed
```bash
npx playwright test --headed
```

## Open HTML report
```bash
npx playwright show-report
```

## Notes
- Base URL defaults to `http://127.0.0.1:5173` via `playwright.config.ts`.
- If your dev server runs elsewhere:
  ```bash
  PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npx playwright test
  ```
