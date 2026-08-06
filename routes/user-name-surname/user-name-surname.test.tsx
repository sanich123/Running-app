import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { MOCK_BAD_REQUEST } from '@T/mocks/mock-requests';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { errorExtracter } from '@U/error-handler';
import UserNameSurname from './user-name-surname';

describe('User name surname', () => {
  it('should correctly renders with data', async () => {
    await renderWithProviders(<UserNameSurname userId="someUserId" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(MOCK_PROFILE.name)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.surname)).toBeOnTheScreen();
  });
  it('should correctly render with isLoading and an error in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<UserNameSurname userId="someUserIdWithAnError" size="bodyLarge" />, {
      store: mockStore,
    });
    expect(await screen.findByText(`An error: ${errorExtracter(MOCK_BAD_REQUEST)}`)).toBeOnTheScreen();
  });
  it('should correctly render with isLoading and an error in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<UserNameSurname userId="someUserIdWithAnError" size="bodyLarge" />, {
      store: mockStore,
    });
    expect(await screen.findByText(`Ошибка: ${errorExtracter(MOCK_BAD_REQUEST)}`)).toBeOnTheScreen();
  });
});
