import { changeLanguage } from '@R/language/language';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { MOCK_BAD_REQUEST } from '@T/mocks/mock-requests';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import UserBio from './user-bio';

describe('User bio', () => {
  it('should correctly renders from server', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<UserBio userId="someUserId" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(MOCK_PROFILE.bio)).toBeOnTheScreen();
  });
  it('should correctly handle an error in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<UserBio userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(`An error: ${MOCK_BAD_REQUEST.status}`)).toBeOnTheScreen();
  });
  it('should correctly handle an error in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<UserBio userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(`Ошибка: ${MOCK_BAD_REQUEST.status}`)).toBeOnTheScreen();
  });
});
