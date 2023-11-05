import { screen } from '@testing-library/react-native';

import UserNameSurname from './user-name-surname';
import { MOCK_PROFILE } from '../../tests/mocks/mock-location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('User name surname', () => {
  it('should correctly renders', async () => {
    renderWithProviders(<UserNameSurname userId="someUserId" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(MOCK_PROFILE.name)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.surname)).toBeOnTheScreen();
  });
  it('should correctly handle an error', async () => {
    renderWithProviders(<UserNameSurname userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText('undefined, 401 code')).toBeOnTheScreen();
  });
});
