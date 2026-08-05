# Runich

Runich is a cross-platform running and activity-tracking app built with Expo, React Native, Expo Router and TypeScript. Users can record activities with foreground/background location tracking, view routes and statistics, share photos, follow users and interact with activities.

## Documentation

- [Product presentation and functionality review](https://circular-citron-a0b.notion.site/Runich-2529e9858819472abb55d104d5fcf324)
- [Changelog](./CHANGELOG.md)
- [Contributing guide](./CONTRIBUTING.md)

## Requirements

- Node.js compatible with the current Expo SDK
- Yarn
- Xcode and an iOS Simulator for iOS development
- Android Studio and an Android Emulator for Android development
- A configured Runich backend, Supabase project and Mapbox token

Install dependencies from the project directory:

```bash

yarn install

```

Create a local `.env` file. Do not commit credentials or tokens:

```dotenv

EXPO_PUBLIC_BASE_URL=http://localhost:3000
EXPO_PUBLIC_MAPBOX_TOKEN=<mapbox-token>
EXPO_PUBLIC_SUPABASE_URL=<supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>

```

## Development

```bash

yarn dev

```

Run native projects:

```bash

yarn ios
yarn android

```

Build commands for development, preview and production iOS/Android artifacts are available in [`package.json`](./package.json).

## Testing and validation

```bash

yarn test
yarn tsc --noEmit
yarn eslint .

```

## Android location route testing

Start an Android Emulator, grant Runich foreground and background location permissions, then start an activity. Replay the bundled Moscow GPX route:

```bash

yarn location:android:route

```

Customize the route, point count, interval or emulator:

```bash

yarn location:android:route --route scripts/routes/runich-moscow.gpx --points 5000 --interval 100
yarn location:android:route --device emulator-5554

```

Alternatively, use `More (...) → Location → Routes` in the Android Emulator and import the GPX file.

## Location behavior

The activity start button requires foreground and background location permissions. Android battery optimization is advisory: it does not block starting an activity, but it may interrupt background route recording. The app provides guidance for disabling it.
