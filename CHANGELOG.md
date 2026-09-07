# Changelog

All notable changes to Runich are documented here. Maintenance-only merges,
formatting changes and routine dependency updates are omitted unless they
changed the supported platform or development workflow.

## [Unreleased]

### Added

- Feedback entry point in Settings with flows for bug reports, appreciation
  and feature requests.
- Universal login-by-link page with URL token verification and root redirect.
- Yandex and VK ID authentication entry points.
- Introductory content for login, registration and password-change screens.
- Activity map zoom controls and improved route markers.
- Device information collection for activity and feedback workflows.

### Changed

- Reworked authentication navigation and provider error handling.
- Unified logout and account-deletion cleanup through the Redux store reset.
- Improved activity saving, retrying and handling of interrupted recordings.
- Improved map initialization, route bounds and platform-specific behavior.
- Refined location tracking metrics and elevation calculation.
- Continued migration from hosted authentication to the Runich backend.

### Fixed

- Fixed tests after router and account-cleanup flows changed.
- Fixed incomplete activity data and duration normalization before saving.
- Fixed location tracking and map rendering edge cases.
- Fixed authentication, registration and web-routing regressions.

## [4.0.1] - 2026-08-11

- Updated application version and deployment configuration for stage and
  production web builds.
- Consolidated Expo Router authentication and web experience.
- Improved profile, migration, comment and like flows across native and web.
- Added refresh-token support for login by link.
- Updated API contracts and activity map markers.
- Improved location tracking metrics and activity stability.

## [4.0.0] - 2026-08-03

- Migrated the application to Expo SDK 57.
- Modernized Yarn, ESLint, Prettier and Jest configuration.
- Reorganized routes and shared components.
- Expanded automated coverage for routes, shared components and activity
  interactions.
- Added saving after a failed server response, with manual send or deletion of
  saved activities.
- Added pause and resume handling when reopening an interrupted activity.
- Stabilized maps, user search, follower lists and cross-platform navigation.

## 3.x - 2025

- Migrated to Expo SDK 53 and refactored the Redux API into feature services.
- Reworked routing and automatic version increments for preview and production.
- Rebuilt registration, login, logout and account deletion against the Runich
  backend.
- Added Google authentication and password-reset flows.
- Improved theming, comments, activity reducers, error states and media upload.
- Migrated persisted Redux state to MMKV.

## 2.x - 2023-2024

### Activity tracking and maps

- Added foreground and background location tracking, mock locations and
  Mapbox routes.
- Added activity creation, saving, detailed views, camera preview and support
  for iOS, Android and web.
- Added permission and battery-optimization checks before recording.
- Added activity sharing, map-image generation and comments.

### Social and statistics

- Added user search, profiles, followers and following.
- Added likes, comments and bottom-sheet interaction flows.
- Added weekly, monthly and yearly statistics with activity-type filters,
  calendars and dark-theme support.

### Authentication and account management

- Added registration, login and profile creation/update functionality.
- Migrated to a new storage project and added account deletion.
- Added Strava activity migration and email notifications for comments and
  likes.

### Platform and development

- Migrated through Expo SDK 49 and SDK 51 releases.
- Added React Native Paper styling and theming.
- Added linting, Husky hooks, Jest tests and cross-platform build workflows.
- Migrated the production backend endpoint to Railway.

## 1.x - 2023

- Created the Runich application and initial documentation.
- Added the first Redux store and application routing.
- Added the initial map integration and location-based activity prototype.
- Added the first fake-location and activity components.
