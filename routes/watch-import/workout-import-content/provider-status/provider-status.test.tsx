import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { WORKOUT_IMPORT_COPY } from '../../workout-import/const';
import ProviderStatus from './provider-status';

describe('ProviderStatus', () => {
  it('shows the update guidance and opens Google Play or retries', async () => {
    const openHealthConnectInstallPage = jest.fn(async () => undefined);
    const refreshHealthConnection = jest.fn(async () => undefined);

    await renderWithProviders(
      <ProviderStatus
        availability="provider-update-required"
        copy={WORKOUT_IMPORT_COPY.en}
        isIOS={false}
        isLoading={false}
        needsHealthConnectApp={false}
        openHealthConnectInstallPage={openHealthConnectInstallPage}
        refreshHealthConnection={refreshHealthConnection}
      />,
    );

    expect(screen.getByTestId('health-connect-open-provider')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('health-connect-open-provider'));
    await fireEvent.press(screen.getByTestId('health-connect-retry'));

    expect(openHealthConnectInstallPage).toHaveBeenCalledTimes(1);
    expect(refreshHealthConnection).toHaveBeenCalledTimes(1);
  });

  it('shows the provider install action only when Health Connect needs installation', async () => {
    const props = {
      availability: 'provider-not-available' as const,
      copy: WORKOUT_IMPORT_COPY.en,
      isIOS: false,
      isLoading: false,
      openHealthConnectInstallPage: jest.fn(async () => undefined),
      refreshHealthConnection: jest.fn(async () => undefined),
    };

    await renderWithProviders(<ProviderStatus {...props} needsHealthConnectApp={false} />);
    expect(screen.queryByTestId('health-connect-open-provider')).toBeNull();
    expect(screen.getByTestId('health-connect-retry')).toBeOnTheScreen();
  });

  it('shows the platform unavailable message without a retry action when unsupported', async () => {
    await renderWithProviders(
      <ProviderStatus
        availability="not-supported"
        copy={WORKOUT_IMPORT_COPY.en}
        isIOS
        isLoading={false}
        needsHealthConnectApp={false}
        openHealthConnectInstallPage={jest.fn(async () => undefined)}
        refreshHealthConnection={jest.fn(async () => undefined)}
      />,
    );

    expect(screen.getByText(/not available on this device/)).toBeOnTheScreen();
    expect(screen.queryByTestId('health-connect-retry')).toBeNull();
  });
});
