import { screen } from '@testing-library/react-native';

import UserBio from './user-bio';
import { MOCK_PROFILE } from '../../tests/mocks/mock-location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
describe('User bio', () => {
  it('should correctly renders from server', async () => {
    renderWithProviders(<UserBio userId="someUserId" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(MOCK_PROFILE.bio)).toBeOnTheScreen();
  });
  it('should correctly handle an error', async () => {
    renderWithProviders(<UserBio userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText('undefined, 401 code')).toBeOnTheScreen();
  });
});
