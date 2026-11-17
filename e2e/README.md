# E2E & UI-quality suite

Runs against a **running stack** (`make up`) using the locally installed Google Chrome
(no browser download). Results and screenshots go to `e2e/.output/`.

```bash
cd e2e && npm install
npm run flow    # core journeys: sign-up → enrol → learn, account, role guards, admin curriculum
npm run rich    # rich lessons: highlighting, callouts, notes, quiz, Python (Pyodide) & JS exercises, quiz builder
npm run audit   # 24 pages × 3 viewports × 2 themes: overflow, clipping, type scale, tap targets, axe WCAG 2.2 AA
npm run all
```

- `flow`/`rich` reset the dev Redis rate-limit counters first (they create fresh test accounts).
- `audit` accepts `ONLY=<path fragment>` to audit a subset, and `--shots` to save screenshots.
- Tests create data (test learners, attempts). Restore the pristine demo with `make seed-reset`.
- Env overrides: `SITE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `LEARNER_PASSWORD`.
