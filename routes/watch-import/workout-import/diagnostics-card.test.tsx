import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { WORKOUT_IMPORT_COPY } from './const';
import DiagnosticsCard from './diagnostics-card';
import type { WatchWorkout } from '../../../modules/runich-health/src/RunichHealth';

const workout: WatchWorkout = {
  source: 'health-connect',
  sourceActivityId: 'health-record-1',
  date: '2026-10-08T07:00:00.000Z',
  timeZone: 'Europe/Moscow',
  sport: 'run',
  duration: 600_000,
  distance: 2_000,
  locations: [
    { timestamp: 1_000, coords: { latitude: 55.75, longitude: 37.61 } },
    { timestamp: 2_000, coords: { latitude: 55.76, longitude: 37.62 } },
  ],
  diagnostics: {
    dataOrigin: 'com.example.watch',
    sessionRecordId: 'health-record-1',
    routeStatus: 'route-in-record',
    routePointCount: 2,
  },
};

describe('DiagnosticsCard', () => {
  it('shows the route point count for each found workout', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <DiagnosticsCard
        availability="available"
        healthPermissions={{
          available: true,
          granted: true,
          details: { exerciseSession: true, distance: true, steps: true },
        }}
        healthStatusErrorCode={null}
        isConnected
        isReading={false}
        isRussian
        readDiagnostics={null}
        uploadDiagnostics={null}
        userId="user-1"
        workouts={[workout]}
      />,
    );

    await user.press(screen.getByLabelText(WORKOUT_IMPORT_COPY.ru.diagnostics.title));

    expect(screen.getByText(/точек: 2/)).toBeOnTheScreen();
  });
});
