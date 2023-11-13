import { screen } from '@testing-library/react-native';

import UserBio from './user-bio';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { MOCK_PROFILE } from '../../tests/mocks/mock-location';
import { MOCK_BAD_REQUEST } from '../../tests/mocks/mock-requests';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
describe('User bio', () => {
  it('should correctly renders from server', async () => {
    renderWithProviders(<UserBio userId="someUserId" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(MOCK_PROFILE.bio)).toBeOnTheScreen();
  });
  it('should correctly handle an error in english', async () => {
    renderWithProviders(<UserBio userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(`An error: ${MOCK_BAD_REQUEST.status}`)).toBeOnTheScreen();
  });
  it('should correctly handle an error in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<UserBio userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(`Ошибка: ${MOCK_BAD_REQUEST.status}`)).toBeOnTheScreen();
  });
});
