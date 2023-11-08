import { screen } from '@testing-library/react-native';

import UserCityAge from './user-city-age';
import { MOCK_PROFILE } from '../../tests/mocks/mock-location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
describe('User city age', () => {
  it('should correctly renders', async () => {
    renderWithProviders(<UserCityAge userId="someUserId" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(MOCK_PROFILE.city)).toBeOnTheScreen();
  });
  it('should correctly handle an error', async () => {
    renderWithProviders(<UserCityAge userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText('bad request, 401 code')).toBeOnTheScreen();
  });
});
