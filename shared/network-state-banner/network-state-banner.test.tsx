import { screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { NETWORK_WARNING_TEXT } from './const';
import { checkAirplaneMode, checkVpn } from './utils';
import NetworkStateBanner from './network-state-banner';

const mockNetworkInfo: {
  type: string;
  isConnected: boolean;
  isInternetReachable: boolean;
  details: { cellularGeneration: string } | null;
} = {
  type: 'cellular',
  isConnected: false,
  isInternetReachable: false,
  details: { cellularGeneration: '3g' },
};
jest.mock('@react-native-community/netinfo', () => ({ useNetInfo: () => mockNetworkInfo }));
jest.mock('./utils', () => ({ checkVpn: jest.fn(), checkAirplaneMode: jest.fn() }));

const mockCheckVpn = checkVpn as jest.Mock;
const mockCheckAirplaneMode = checkAirplaneMode as jest.Mock;

describe('NetworkStateBanner', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    Object.assign(mockNetworkInfo, {
      type: 'cellular',
      isConnected: false,
      isInternetReachable: false,
      details: { cellularGeneration: '3g' },
    });
    mockCheckVpn.mockImplementation((setValue: (value: boolean) => void) => setValue(false));
    mockCheckAirplaneMode.mockImplementation((setValue: (value: boolean) => void) => setValue(false));
  });

  it('shows all warnings reported by network state', async () => {
    await renderWithProviders(<NetworkStateBanner />);
    expect(screen.getByText(NETWORK_WARNING_TEXT.noInternet)).toBeOnTheScreen();
    expect(screen.getByText(NETWORK_WARNING_TEXT.cellular('3g'))).toBeOnTheScreen();
  });

  it('uses the connected warning when internet reachability is unavailable', async () => {
    mockNetworkInfo.type = 'wifi';
    mockNetworkInfo.isConnected = true;
    mockNetworkInfo.details = null;

    await renderWithProviders(<NetworkStateBanner />);

    expect(screen.getByText(NETWORK_WARNING_TEXT.maybeNoInternet)).toBeOnTheScreen();
  });

  it('shows VPN and airplane warnings on Android', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockNetworkInfo.type = 'wifi';
    mockNetworkInfo.isConnected = true;
    mockNetworkInfo.isInternetReachable = true;
    mockNetworkInfo.details = null;
    mockCheckVpn.mockImplementation((setValue: (value: boolean) => void) => setValue(true));
    mockCheckAirplaneMode.mockImplementation((setValue: (value: boolean) => void) => setValue(true));

    await renderWithProviders(<NetworkStateBanner />);

    expect(screen.getByText(NETWORK_WARNING_TEXT.vpn)).toBeOnTheScreen();
    expect(screen.getByText(NETWORK_WARNING_TEXT.airplane)).toBeOnTheScreen();
  });

  it('does not render warnings on the web when the connection is healthy', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockNetworkInfo.type = 'wifi';
    mockNetworkInfo.isConnected = true;
    mockNetworkInfo.isInternetReachable = true;
    mockNetworkInfo.details = null;

    await renderWithProviders(<NetworkStateBanner />);

    expect(screen.queryByText(NETWORK_WARNING_TEXT.vpn)).not.toBeOnTheScreen();
    expect(screen.queryByText(NETWORK_WARNING_TEXT.noInternet)).not.toBeOnTheScreen();
  });
});
