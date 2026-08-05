# Changelog

All notable changes to Runich are documented here.

## [Unreleased]

### Added

- User-facing `errorToast` and `successToast` handling for important asynchronous operations.
- Retryable error states for standalone pages.
- Activity map controls for centering on the current location and viewing battery optimization guidance.
- Styled activity statistics charts, training calendar, sport chips and sport selection modal.
- Contributor documentation and development validation instructions.

### Changed

- Standardized page rendering to `loading → success → error` states.
- Reworked location permission cards and permission explanation modals.
- Activity start is blocked by missing foreground/background permissions, but not by battery optimization.
- Restyled the activity details page, metrics, kilometer splits, profile media label and navigation actions.
- Improved users page scrolling and prevented duplicate navigation to already-open settings/search pages.

### Fixed

- Prevented map crashes caused by incomplete location coordinates.
- Prevented kilometer split crashes when altitude or duration data is missing.
- Added safe fallbacks for incomplete activity route data.

## 4.0.0

- Migrated to Expo SDK 53.

## 2.1.9

- Added email notifications.

## 2.1.8

- Tested the application functionality, fixed issues and refactored code.

## 2.1.7

- Added statistics routes and functionality.

## 2.1.6

- Added Strava migration functionality.

## 2.1.5

- Migrated to a new Supabase project.
- Added account deletion and improved registration/profile creation and updates.
- Added location, permission and battery optimization checks before activity tracking.

## 2.1.4

- Updated Redux Toolkit to version 2.

## 2.1.3

- Removed React Compiler and migrated to React Native 0.74.3 with the new architecture.

## 2.1.2

- Migrated to React Compiler.

## 2.1.1

- Improved bottom sheets and added native dependencies.

## 2.1.0

- Optimized HTTP requests and migrated to SDK 51.
- Added optimization, infinite scrolling and pagination across major routes.

## 2.0.9

- Removed NativeWind.
