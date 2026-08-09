import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { NETWORK_WARNING_TEXT } from './const';
import NetworkStateBanner from './network-state-banner';

const mockNetworkInfo = {
  type: 'cellular',
  isConnected: false,
  isInternetReachable: false,
  details: { cellularGeneration: '3g' },
};

jest.mock('@react-native-community/netinfo', () => ({ useNetInfo: () => mockNetworkInfo }));

describe('NetworkStateBanner', () => {
  it('shows all warnings reported by network state', async () => {
    await renderWithProviders(<NetworkStateBanner />);
    expect(screen.getByText(NETWORK_WARNING_TEXT.noInternet)).toBeOnTheScreen();
    expect(screen.getByText(NETWORK_WARNING_TEXT.cellular('3g'))).toBeOnTheScreen();
  });
});
