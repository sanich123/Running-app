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
- A configured Runich backend, Supabase project and Mapbox public token

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
EXPO_PUBLIC_SUPABASE_URL=<supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
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

The static output is written to `dist/`. Stage and production deployments are configured through `netlify.toml`.

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
