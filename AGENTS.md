# Project instructions

## Shared instructions

- Keep `AGENTS.md` synchronized between Runich and Clean Car: whenever instruction changes are made in either project, apply the same changes to the counterpart file in the other project during the same task, while preserving project-specific instructions.

## JSX and TSX components

- Put every `.jsx` and `.tsx` component in its own folder under its parent component folder, for example `parent/child/child.tsx`.
- Name the component file after its component using kebab-case, not camelCase; for example, `ReadyCheckCard` lives in `ready-check-card.tsx`.
- A component file must default-export a function component that returns JSX. Aside from imports, keep only that component and its styles in the file; do not add named exports, helper functions, types, or unrelated constants there.
- Put component-specific variables, types, and helpers in the component's folder when there are more than two. When there are only one or two, put them in the parent folder's `const.ts`, `types.ts`, or `utils.ts`, according to their role.
- Keep Expo Router route modules at their required route paths and exports. Route-level lazy imports and Suspense fallbacks may stay in the route module; put screen UI in dedicated component folders.
- When sibling elements share the same rendering condition, group them in one conditional fragment instead of repeating the condition.
- Keep JSX markup primarily in the component's `return` statement. Do not store JSX elements or fragments in variables; render components directly in the markup with their props.

## Component tests

- Every component must have a colocated test file in its component folder, named after the component with a `.test.tsx` or `.test.jsx` suffix.
- Component tests must cover the component's user-visible behavior and its callbacks.
- Keep tests for Expo Router route modules outside the `app/` directory, in the corresponding screen implementation folder. Expo Router scans files in `app/` and may register test files as routes.

## Callback handlers

- Keep a callback inline in its event handler when it is used by only one handler. Extract it into a named variable only when it is shared by multiple handlers.

## Redux selectors

- In new or modified code, destructure values from the selected state slice instead of selecting individual properties in the `useAppSelector` callback. For example, use `const { userId } = useAppSelector(({ auth }) => auth);` rather than `const userId = useAppSelector(({ auth }) => auth.userId);`.

## Helper functions

- Do not create a helper for a simple one-line expression used once; keep it at the call site. Extract a helper when the logic is reused, non-obvious, or a useful name makes the domain intent clearer.

## Component encapsulation

- Keep data and state inside the lowest-level component that needs them when higher-level components do not use them. For example, if a component uses or updates a single query parameter, read and manage that parameter inside the component instead of passing it through its parents.

## App preview by platform

- For Android, find the available emulator with `adb devices -l` and use the listed device ID.
- Open the web version in Google Chrome.
- Run and inspect the iOS version in iOS Simulator.

## Functional changes

- When changing functionality, review the previous implementation and its call sites for components, hooks, props, state, helpers, and tests that are no longer needed. Remove or update obsolete pieces as part of the change.

## Git and GitLab

- Try Git operations through the `git` CLI first and GitLab operations through the `glab` CLI first.
- If the CLI is unavailable, lacks the required operation, or cannot access the account, use the browser UI for that operation.

## Verification before completion

- For every task that changes application code, run the full project checks from this directory before reporting completion:
  - `yarn eslint .`
  - `yarn tsc --noEmit`
  - `yarn test`
- `yarn test` collects coverage and enforces the configured global branch coverage threshold of at least 85%.
- If coverage is below 85%, add meaningful behavior tests for uncovered code until the full test run reaches the threshold. Do not lower the threshold or exclude code just to make coverage pass.
- Fix failures and rerun the affected checks after the final code changes. If a check cannot run or remains failing, report the exact command and reason; do not describe verification as passing.
