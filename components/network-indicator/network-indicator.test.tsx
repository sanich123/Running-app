import { changeLanguage } from '@R/language/language';
import { changeNetworkState } from '@R/network/network';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { MOCK_NETWORK_STATE, NETWORK_INDICATOR } from './const';
import NetworkIndicator from './network-indicator';

describe('Network indicator', () => {
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
});
