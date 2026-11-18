import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { WORKOUT_IMPORT_COPY } from '../../workout-import/const';
import { SUPPORTED_WATCH_APPS } from './const';
import SupportedWatchApps from './supported-watch-apps';

describe('SupportedWatchApps', () => {
  it('shows only the iOS lists in the accordion', async () => {
    await renderWithProviders(<SupportedWatchApps isRussian platform="ios" />);
    await fireEvent.press(screen.getByTestId('watch-import-supported-apps'));

    expect(screen.getByText(WORKOUT_IMPORT_COPY.ru.supportedApps.ios)).toBeOnTheScreen();
    expect(screen.getByText('Apple Watch')).toBeOnTheScreen();
    expect(screen.getAllByText('Suunto')).toHaveLength(2);
    expect(screen.getAllByText(/Garmin Connect/)).toHaveLength(2);
    expect(SUPPORTED_WATCH_APPS.ios.direct).toContainEqual({
      name: 'Suunto',
      workout: 'yes',
      route: 'no',
      heartRate: 'no',
    });
    expect(screen.getByTestId('watch-app-status-legend-item-close')).toBeOnTheScreen();
    expect(screen.getByTestId('watch-app-status-legend-item-minus')).toBeOnTheScreen();
    expect(screen.getByTestId('watch-app-status-legend-item-help')).toBeOnTheScreen();
    expect(screen.queryByTestId('watch-app-status-legend-item-check')).toBeNull();
    expect(screen.queryByText(WORKOUT_IMPORT_COPY.ru.supportedApps.android)).toBeNull();
  });

  it('shows only the Android lists in the accordion', async () => {
    await renderWithProviders(<SupportedWatchApps isRussian={false} platform="android" />);
    await fireEvent.press(screen.getByTestId('watch-import-supported-apps'));

    expect(screen.getByText(WORKOUT_IMPORT_COPY.en.supportedApps.android)).toBeOnTheScreen();
    expect(screen.getByText(/Zepp/)).toBeOnTheScreen();
    expect(screen.getAllByText(/Samsung Health/)).toHaveLength(2);
    expect(screen.queryByText(WORKOUT_IMPORT_COPY.en.supportedApps.ios)).toBeNull();
  });
});
