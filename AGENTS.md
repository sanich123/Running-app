# Project instructions

## Verification before completion

- For every task that changes application code, run the full project checks from this directory before reporting completion:
  - `yarn eslint .`
  - `yarn tsc --noEmit`
  - `yarn test`
- `yarn test` collects coverage and enforces the configured global branch coverage threshold of at least 85%.
- If coverage is below 85%, add meaningful behavior tests for uncovered code until the full test run reaches the threshold. Do not lower the threshold or exclude code just to make coverage pass.
- Fix failures and rerun the affected checks after the final code changes. If a check cannot run or remains failing, report the exact command and reason; do not describe verification as passing.
