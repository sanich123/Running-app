# Runich client/API compatibility

This ledger records which Runich client release is paired with which backend release. Keep one copy in the Runich client repository and one in Runich Backend; update both together.

## Current source baseline

| Runich client | Compatible Runich Backend | Swagger `info.version` | Compatibility status                                                                        | Evidence and date                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------- | ------------------------- | ---------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1.3.1`       | `1.3.1`                   | `1.3.1`                | Starting repository baseline; a separate client/backend compatibility test is not recorded. | Client and backend version metadata plus Swagger configuration checked on `2026-10-28`; deployed Stage/Production versions are not verified.                                                                                                                                                                                                                                                                                                  |
| `1.3.2`       | `1.3.1`                   | `1.3.1`                | Source contract expanded; integration check pending.                                        | Groups support the four configured sports, category tags, moderated group photos, member preferences, sharing links, group posts/events, timezone-aware monthly public-activity distance statistics, and the authenticated route-workout list with server-side search, date filters, available filter values, and GPS point counts. Source reviewed on `2026-10-30`; API integration and deployed Stage/Production versions are not verified. |

## Minimum supported client version

The backend returns `appVersion: 1.3.1` from `GET /auth/config`. The Runich client compares this value with its Expo app version on the home page and redirects versions below the minimum to the app-update screen. This is a client-side gate; the backend does not reject every request based on `x-app-version`.

Evidence in source: client `package.json` and `app.config.ts`, backend `package.json`, and backend `src/main.ts` (`DocumentBuilder.setVersion`).

## How to maintain the ledger

- Add a new row for each client release and list the exact backend release or releases it supports. Keep old rows so supported client versions remain auditable.
- Record compatibility as `verified` only with the check performed and its date. A matching client/backend version number is a release mapping, not proof that the pair was tested or deployed.
- Record deployed versions separately when known, including environment and backend image tag or commit. Repository versions do not establish what is running in Stage or Production.
- Keep the Swagger `info.version` equal to the Runich Backend `package.json` version. It identifies the API description version; it is not proof of compatibility by itself. The client can remain on an older supported release, which must have its own row.
