import { NetInfoCellularGeneration } from '@react-native-community/netinfo';
import { screen } from '@testing-library/react-native';

import { MOCK_NETWORK_STATE, NETWORK_INDICATOR } from './const';
import NetworkIndicator from './network-indicator';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { changeNetworkState } from '../../redux/network/network';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Metrics item', () => {
  it('should correctly renders when no network and english language', () => {
    mockStore.dispatch(changeNetworkState({ ...MOCK_NETWORK_STATE, isInternetReachable: false }));
    renderWithProviders(<NetworkIndicator />, { store: mockStore });
    expect(screen.getByText(NETWORK_INDICATOR.english.offline)).toBeOnTheScreen();
  });
  it('should correctly renders when no network and russian language', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(changeNetworkState({ ...MOCK_NETWORK_STATE, isInternetReachable: false }));
    renderWithProviders(<NetworkIndicator />, { store: mockStore });
    expect(screen.getByText(NETWORK_INDICATOR.russian.offline)).toBeOnTheScreen();
  });
  it('should correctly renders when slow network and russian language', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(
      changeNetworkState({
        ...MOCK_NETWORK_STATE,
        details: { ...MOCK_NETWORK_STATE.details, cellularGeneration: NetInfoCellularGeneration['3g'] },
      }),
    );
    renderWithProviders(<NetworkIndicator />, { store: mockStore });
    expect(screen.getByText(new RegExp(`${NETWORK_INDICATOR.russian.slowNetwork}`))).toBeOnTheScreen();
  });
  it('should correctly renders when slow network and english language', () => {
    mockStore.dispatch(
      changeNetworkState({
        ...MOCK_NETWORK_STATE,
        details: { ...MOCK_NETWORK_STATE.details, cellularGeneration: NetInfoCellularGeneration['3g'] },
      }),
    );
    renderWithProviders(<NetworkIndicator />, { store: mockStore });
    expect(screen.getByText(new RegExp(`${NETWORK_INDICATOR.english.slowNetwork}`))).toBeOnTheScreen();
  });
});
