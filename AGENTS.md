# Project instructions

## Shared instructions

- Keep `AGENTS.md` synchronized between Runich and Clean Car: whenever instruction changes are made in either project, apply the same changes to the counterpart file in the other project during the same task, while preserving project-specific instructions.

## JSX and TSX components

- Do not use explicit `any` in TypeScript or TSX production code or tests. Use a concrete type, `unknown` with narrowing, or a narrowly scoped typed adapter instead.

- Put every `.jsx` and `.tsx` component in its own folder under its parent component folder, for example `parent/child/child.tsx`.
- Name the component file after its component using kebab-case, not camelCase; for example, `ReadyCheckCard` lives in `ready-check-card.tsx`.
- A component file must default-export a function component that returns JSX. Aside from imports, keep only that component and its styles in the file; do not add named exports, helper functions, types, or unrelated constants there.
- When a component has only one or two props, write the prop type inline instead of creating a separate interface or type solely for those props.
- Prefer destructuring objects wherever practical, especially in iteration callbacks: destructure every locally used property instead of repeatedly accessing it through the object, for example `taskMenuActions.map(({ key, dividerBefore, disabled, leadingIcon, title, onPress }) => ...)`. Keep the object intact when it is passed through or destructuring would make the code less clear.
- Prefer a single `return` statement per JSX/TSX component when practical; keep multiple returns when they make distinct render states clearer.
- Put component-specific variables, types, and helpers in the component's folder when there are more than two. When there are only one or two, put them in the parent folder's `const.ts`, `types.ts`, or `utils.ts`, according to their role.
- Keep Expo Router route modules at their required route paths and exports. Route-level lazy imports and Suspense fallbacks may stay in the route module; put screen UI in dedicated component folders.
- When sibling elements share the same rendering condition, group them in one conditional fragment instead of repeating the condition.
- When a render branch must show exactly one of two mutually exclusive results, express the choice once with a conditional expression instead of two independent conditions.
- Do not repeat a check already guaranteed by an enclosing condition, type narrowing, or value invariant. For example, inside `if (Platform.OS === 'ios')`, use iOS-only props directly instead of checking `Platform.OS` again. Keep only conditions that distinguish render branches, and omit redundant truthy checks or optional chaining for guaranteed values.
- Keep JSX markup primarily in the component's `return` statement. Do not store JSX elements or fragments in variables; render components directly in the markup with their props.

## Component tests

- Every component must have a colocated test file in its component folder, named after the component with a `.test.tsx` or `.test.jsx` suffix.
- Component tests must cover the component's user-visible behavior and its callbacks.
- Prioritize tests for scenarios that users can see or interact with.
- When a test asserts a user-facing string rendered by a component, define that text as a shared constant and import it in both the component and its test.
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

- All project Git roots are inside the `project/` directory; run Git commands from that directory.
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

<!-- BEGIN EXPO AGENT CLI MANAGED BLOCK -->
<!-- Generated by `npx @expo/agent-cli agents:setup`. Everything inside the markers is overwritten on the next run. -->

## Expo project

- Project: runich-running-app
- SDK: 58.0.12
- Native: CNG (no native directories; they are generated by `npx expo prebuild`)
- Expo Go: not compatible (18 reasons; needs a development build, run `npx @expo/agent-cli status --json` for the details)
- Dev client: `expo-dev-client` is installed

## Commands

For the operations listed below, use `@expo/agent-cli` in place of the equivalent commands elsewhere in this file or in loaded skills. Package installation still uses Expo’s SDK-compatible version resolution. Use `bunx` instead of `npx` when `bun.lock` is present.

Most commands take `--json` for a machine-readable report.

- `npx @expo/agent-cli status` — where the project is right now, and what would happen next
- `npx @expo/agent-cli status --json` — the same report as one object, with the raw project probe under `probe`
- `npx @expo/agent-cli status --explain` — the deep dive: which sources changed, whether an update can ship over the air, and whether EAS already has a build for this fingerprint
- `npx @expo/agent-cli status --assert js-only` — a gate on what a change costs: exit 20 when it costs more than the class named, 22 when nothing could be measured, 0 otherwise
- `npx @expo/agent-cli dev --ios` — get the app onto that platform's device: it prints the plan, then runs it. The platform flag (--ios, --android, --web) is required; add --plan to print the steps without running them
- `npx @expo/agent-cli start` — `expo start` and nothing else: a dev server no planning may touch
- `npx @expo/agent-cli install <pkg>` — install a package and report what it changes natively
- `npx @expo/agent-cli install --fix` — fix incompatible package versions using Expo's SDK-compatible version resolution
- `npx @expo/agent-cli lint` — run the project's Expo lint command
- `npx @expo/agent-cli doctor` — diagnose dependency and configuration issues with expo-doctor
- `npx @expo/agent-cli typecheck` — run the TypeScript compiler of this project as a gate: exit 20 with the diagnostics, exit 0 when there are none. A bundle that builds and an app that does not throw do not cover this.
- `npx @expo/agent-cli runtime:eval <js>` — evaluate JavaScript in the running app
- `npx @expo/agent-cli runtime:errors` — collect the runtime errors of the running app
- `npx @expo/agent-cli navigate <route>` — open a route as a deep link on a device
- `npx @expo/agent-cli runtime:tree` — what is on the screen of the running app, by testID
- `npx @expo/agent-cli runtime:tap <testID>` — tap an element; `--verify` reports what changed
- `npx @expo/agent-cli runtime:type <text> --testID <id>` — type into an input
- `npx @expo/agent-cli skills:list` — the agent skills the installed packages ship
- `npx @expo/agent-cli new <dir>` / `npx @expo/agent-cli deploy` — create a project headlessly / deploy web and native
- `npx @expo/agent-cli smoke --ios` — the whole gate in one command: the dev server bundles, the app is up, and nothing threw

## Expo docs

The full Expo docs for this project’s SDK can be local Markdown files.

- `npx @expo/agent-cli docs:sync` downloads them and prints two directories: all docs, and this SDK’s API reference. Grep those directories.
- `npx @expo/agent-cli docs:search <query>` returns ranked pages with file paths and line numbers.
  Links in the docs point to `https://docs.expo.dev/<path>.md`. To read one locally, open `<path>.md` in the docs directory that `docs:sync` printed.
  Prefer the local docs over web fetches of docs.expo.dev.

## Devices

Run `npx @expo/agent-cli dev` before `navigate`, `runtime:reload` or `runtime:stop`, or they refuse with `NO_BOUND_DEVICE` and name the command. Never boot, shut down or delete a simulator named `agent-cli …` yourself, and never kill an emulator instance started with `-read-only`; it may be bound to another worktree.

## Expo skills

For Expo or EAS work, start with the `expo-overview` skill when it is available in your agent’s skill list. It routes your goal to the relevant Expo or EAS skill. Then read any matching package skills listed below for guidance specific to the installed packages.

<!-- BEGIN EXPO PACKAGE SKILLS -->

## Package skills

No linked package skills are available.

Run `npx @expo/agent-cli skills:sync` after changing dependencies to refresh this index. Run `npx @expo/agent-cli skills:list` to see available package skills.
<!-- END EXPO PACKAGE SKILLS -->

Commands end with a `Suggested next:` section — suggested follow-up commands, not required steps. Run one only when it serves your current goal.
<!-- END EXPO AGENT CLI MANAGED BLOCK -->
