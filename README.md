# Runich

Runich is a cross-platform running and activity-tracking application. Users can record activities with foreground and background location tracking, view routes and statistics, share photos, follow other users and interact with activities.

The client targets Android, iOS and web and is built with Expo, React Native, Expo Router and TypeScript.

## Technology

- Expo SDK 57 and React Native
- React and TypeScript
- Expo Router with typed file-based routes
- Redux Toolkit, RTK Query and Redux Persist
- React Native Paper
- Mapbox maps and Expo Location
- Jest, React Native Testing Library and MSW
- EAS Build, Expo Updates and Netlify web deployment

## Requirements

- Node.js compatible with the current Expo SDK
- Corepack and Yarn
- Android Studio and an Android SDK for Android development
- Xcode and CocoaPods for iOS development on macOS
- A configured Runich backend with S3-compatible storage and a Mapbox public token

## Getting started

Run commands from the project directory:

```bash
corepack enable
yarn install
```

Create a local `.env` file when local or alternate services are required:

```dotenv
EXPO_PUBLIC_BASE_URL=http://localhost:3000
EXPO_PUBLIC_MAPBOX_TOKEN=<mapbox-public-token>
```

Never commit `.env`, access tokens, signing files or other credentials. The Mapbox `sk...` download token belongs in EAS Secrets and must not be placed in the repository or in the client bundle.

## Running the application

Start the development server:

```bash
yarn dev
```

Run a local native build:

```bash
yarn android
yarn ios
```

Release configurations are also available:

```bash
yarn android:release
yarn ios:release
```

Native dependencies or Expo plugins may require regenerated native projects:

```bash
yarn prebuild:clean
```

This recreates `android/` and `ios/`; do not run it with uncommitted manual native changes.

## Testing and quality checks

Run the full test suite:

```bash
yarn test
```

Run a focused test or debug open handles:

```bash
yarn test path/to/file.test.tsx
yarn test:debug path/to/file.test.tsx
```

Run static checks:

```bash
yarn tsc --noEmit
yarn eslint .
```

## Web

Export and serve the web application:

```bash
yarn web:export:stage
yarn web:export:production
yarn web:serve:single
```

The static output is written to `dist/`. GitHub Actions deploys commits to `stage` to
`https://stage-web.runich-app.ru` and commits to `master` to `https://runich-app.ru`.
Netlify remains available during the migration; see [Timeweb web deployment](docs/timeweb-web-deploy.md).

## EAS builds

Build profiles are defined in `eas.json`:

| Profile       | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `development` | Internal development client                      |
| `preview`     | Internal preview build; Android output is an APK |
| `production`  | Release build                                    |

Examples:

```bash
yarn build:dev:android
yarn build:preview:internal:android
yarn build:production:android
yarn build:dev:ios
yarn build:preview:internal:ios
yarn build:production:ios
```

Local iOS builds require macOS. EAS project access, credentials and the Mapbox download secret must be configured before building.

### Huawei AppGallery

Create an Android app in AppGallery Connect with the package name from `app.config.ts`, register the SHA-256 fingerprint of the Android release signing key, and enable Location Kit. Keep the downloaded `agconnect-services.json` outside Git and make it available to the build as the `HUAWEI_AGCONNECT_SERVICES_FILE` file environment variable.

For a local production build, point the variable at the private file:

```bash
HUAWEI_AGCONNECT_SERVICES_FILE=/path/to/agconnect-services.json yarn build:production:android
```

Android location uses Google Play Services when available, Huawei Location Kit when GMS is unavailable and HMS Core is ready, then the Android system provider if neither fused service can serve the request. The AppGallery Connect file is copied into the generated Android project during prebuild and is excluded from Git.

## Android route testing

Start an Android Emulator, grant foreground and background location permissions, then replay the bundled Moscow GPX route:

```bash
yarn location:android:route
```

The route can be customized:

```bash
yarn location:android:route --route scripts/routes/runich-moscow.gpx --points 5000 --interval 100
yarn location:android:route --device emulator-5554
```

Alternatively use `More (...) → Location → Routes` in the Android Emulator.

Activity start requires foreground and background location permissions. Battery optimization is advisory: it may interrupt background recording but does not block starting an activity.

## Local Android E2E with Maestro

The repository contains a local-only Android smoke flow. It uses a native debug build from `expo run:android`, the backend from `../../runich-backend/project` (the sibling `runich-backend` directory), PostgreSQL in Docker and an Android Emulator. EAS is not involved.

Install Java 17+ and the mobile Maestro CLI once, start an Android Emulator, then run:

```bash
java -version
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

```bash
yarn e2e:android
```

The command will:

- start an isolated PostgreSQL 18.6 container with the same timezone, volume layout and healthcheck settings as the backend on `127.0.0.1:55432`, then apply backend migrations;
- seed a deterministic local user (`e2e@runich.app`) and activities;
- start the backend on `localhost:3000` and complete the test profile through the API;
- build and install the development Android app with `http://10.0.2.2:3000` as its API;
- grant location permissions, play the bundled GPX route and run `.maestro/smoke.yaml`.

Useful options:

```bash
yarn e2e:android --skip-build
yarn e2e:android --backend-only
yarn e2e:android --no-route
yarn e2e:android --route-points 120 --route-interval 500
ANDROID_SERIAL=emulator-5554 yarn e2e:android
```

If the backend is already running, use `--skip-backend`. For another backend location, set `RUNICH_BACKEND_DIR`; for another emulator API address, set `RUNICH_E2E_ANDROID_BASE_URL`. The local E2E password can be overridden with `RUNICH_E2E_PASSWORD`, but it must match the password used by the backend seed.

Run a single flow directly after the app and backend are prepared:

```bash
maestro test -e E2E_EMAIL=e2e@runich.app -e 'E2E_PASSWORD=7FWD&rlm' .maestro/smoke.yaml
```

## Project structure

```text
app/                    Expo Router routes and layouts
routes/                 Feature screens and workflow components
shared/                 Reusable UI components
redux/services/         RTK Query API services
redux/slices/           Client-side Redux state
tests/                  MSW handlers, fixtures and test utilities
utils/                  Hooks and platform utilities
assets/                 Images, icons and fonts
scripts/                Development and route-testing scripts
app.config.ts           Expo and native configuration
eas.json                EAS build profiles
```

API requests belong in `redux/services/`; local client state belongs in `redux/slices/`; route composition belongs in `app/`; feature behavior belongs in `routes/` and reusable UI belongs in `shared/`.

## Import aliases

Aliases are configured in `tsconfig.json`:

| Alias       | Directory     |
| ----------- | ------------- |
| `@Routes/*` | `routes/*`    |
| `@S/*`      | `shared/*`    |
| `@const/*`  | `constants/*` |
| `@R/*`      | `redux/*`     |
| `@U/*`      | `utils/*`     |
| `@A/*`      | `auth/*`      |
| `@T/*`      | `tests/*`     |

## Documentation

- [Product presentation and functionality review](https://circular-citron-a0b.notion.site/Runich-2529e9858819472abb55d104d5fcf324)
- [Changelog](./CHANGELOG.md)
- [Contributing guide](./CONTRIBUTING.md)
