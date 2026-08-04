import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { changeNetworkState } from '@R/slices/network/network';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { MOCK_NETWORK_STATE, NETWORK_INDICATOR } from './const';
import NetworkIndicator from './network-indicator';

describe('Network indicator', () => {
  it('should correctly renders when no network and english language', async () => {
    mockStore.dispatch(changeNetworkState({ ...MOCK_NETWORK_STATE, isInternetReachable: false }));
    await renderWithProviders(<NetworkIndicator />, { store: mockStore });
    expect(screen.getByText(NETWORK_INDICATOR.russian.offline)).toBeOnTheScreen();
  });
  it('should correctly renders when no network and russian language', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(changeNetworkState({ ...MOCK_NETWORK_STATE, isInternetReachable: false }));
    await renderWithProviders(<NetworkIndicator />, { store: mockStore });
    expect(screen.getByText(NETWORK_INDICATOR.russian.offline)).toBeOnTheScreen();
  });
});
