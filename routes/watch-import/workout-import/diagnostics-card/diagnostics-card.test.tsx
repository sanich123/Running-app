import { screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import DiagnosticsCard from './diagnostics-card';

const originalPlatformOS = Platform.OS;

describe('DiagnosticsCard', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
  });

  it('shows the route point count for each found workout', async () => {
    await renderWithProviders(
      <DiagnosticsCard
        availability="available"
        healthPermissions={{
          available: true,
          granted: true,
          details: { exerciseSession: true, distance: true, steps: true, heartRate: true },
        }}
        healthStatusErrorCode={null}
        isConnected
        isReading={false}
        isRussian
        readDiagnostics={null}
        uploadDiagnostics={{
          at: '2026-10-08T08:00:00.000Z',
          outcome: 'success',
          workoutCount: 1,
          sourceRoutePointCount: 2,
          payloadRoutePointCount: 2,
          sourceHeartRateSampleCount: 12,
          payloadHeartRateSampleCount: 12,
          workouts: [
            {
              source: 'health-connect',
              sourceActivityId: 'health-record-1',
              sourceHeartRateSampleCount: 12,
              payloadHeartRateSampleCount: 12,
              outcome: 'imported',
            },
          ],
        }}
        userId="user-1"
      />,
    );

    const user = userEvent.setup();
    await user.press(screen.getByTestId('workout-import-diagnostics-accordion'));
    expect(screen.queryByText('Найденные тренировки')).toBeNull();
    expect(screen.queryByText(/источник: com\.example\.watch/)).toBeNull();
    expect(screen.getByText('12 → 12')).toBeOnTheScreen();
    expect(screen.getByText('2 → 2')).toBeOnTheScreen();
    expect(screen.getByText(/настроена ли выгрузка пульса/)).toBeOnTheScreen();
  });
});
