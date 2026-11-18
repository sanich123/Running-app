import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { clearHealthSyncStatus, setHealthSyncStatus } from '@R/slices/health-sync/health-sync';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { beginHealthSyncOperation, finishHealthSyncOperation } from '@U/watch-import/health-sync-cancellation';
import HealthSyncIndicator from './health-sync-indicator';

describe('Health sync indicator', () => {
  beforeEach(() => {
    mockStore.dispatch(clearHealthSyncStatus());
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('shows HealthKit workout discovery while the count is unknown', async () => {
    mockStore.dispatch(
      setHealthSyncStatus({
        id: 'healthkit-reading',
        source: 'healthkit',
        phase: 'reading',
        foundCount: null,
        processedCount: 0,
      }),
    );

    await renderWithProviders(<HealthSyncIndicator />);

    expect(screen.getByText('Apple Health')).toBeOnTheScreen();
    expect(screen.getByText('Checking workouts')).toBeOnTheScreen();
  });

  it('shows the discovered workout count in English', async () => {
    mockStore.dispatch(
      setHealthSyncStatus({
        id: 'healthkit-reading-count',
        source: 'healthkit',
        phase: 'reading',
        foundCount: 5,
        processedCount: 0,
      }),
    );

    await renderWithProviders(<HealthSyncIndicator />);

    expect(screen.getByText('Found workouts: 5')).toBeOnTheScreen();
  });

  it('formats an unknown workout count in Russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(
      setHealthSyncStatus({
        id: 'healthkit-reading-ru',
        source: 'healthkit',
        phase: 'reading',
        foundCount: null,
        processedCount: 0,
      }),
    );

    await renderWithProviders(<HealthSyncIndicator />);

    expect(screen.getByText('Проверяем тренировки')).toBeOnTheScreen();
  });

  it('formats the discovered workout count in Russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(
      setHealthSyncStatus({
        id: 'healthkit-reading-count-ru',
        source: 'healthkit',
        phase: 'reading',
        foundCount: 5,
        processedCount: 0,
      }),
    );

    await renderWithProviders(<HealthSyncIndicator />);

    expect(screen.getByText('Найдено тренировок: 5')).toBeOnTheScreen();
  });

  it('shows Health Connect upload progress with a zero fallback for an unknown count', async () => {
    mockStore.dispatch(
      setHealthSyncStatus({
        id: 'health-connect-sending',
        source: 'health-connect',
        phase: 'sending',
        foundCount: null,
        processedCount: 2,
      }),
    );

    await renderWithProviders(<HealthSyncIndicator />);

    expect(screen.getByText('Health Connect')).toBeOnTheScreen();
    expect(screen.getByText('Sending to Runich · 2 of 0')).toBeOnTheScreen();
  });

  it('cancels the active sync and clears its visible status', async () => {
    const operation = beginHealthSyncOperation();
    if (!operation) throw new Error('Expected a health sync operation to start');
    mockStore.dispatch(
      setHealthSyncStatus({
        id: operation.id,
        source: 'health-connect',
        phase: 'sending',
        foundCount: 3,
        processedCount: 1,
      }),
    );

    const user = userEvent.setup();
    await renderWithProviders(<HealthSyncIndicator />);
    await user.press(screen.getByTestId('cancel-health-sync'));

    expect(operation.signal.aborted).toBe(true);
    expect(mockStore.getState().healthSync.status).toBeNull();
    finishHealthSyncOperation(operation.id);
  });
});
