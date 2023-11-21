import { screen } from '@testing-library/react-native';

import UserNameSurname from './user-name-surname';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { MOCK_PROFILE } from '../../tests/mocks/mock-location';
import { MOCK_BAD_REQUEST } from '../../tests/mocks/mock-requests';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { errorExtracter } from '../../utils/error-handler';

describe('User name surname', () => {
  it('should correctly renders with data', async () => {
    renderWithProviders(<UserNameSurname userId="someUserId" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(MOCK_PROFILE.name)).toBeOnTheScreen();
    expect(await screen.findByText(MOCK_PROFILE.surname)).toBeOnTheScreen();
  });
  it('should correctly render with isLoading and an error in english', async () => {
    renderWithProviders(<UserNameSurname userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(`An error: ${errorExtracter(MOCK_BAD_REQUEST)}`)).toBeOnTheScreen();
  });
  it('should correctly render with isLoading and an error in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<UserNameSurname userId="someUserIdWithAnError" size="bodyLarge" />, { store: mockStore });
    expect(await screen.findByText(`Ошибка: ${errorExtracter(MOCK_BAD_REQUEST)}`)).toBeOnTheScreen();
  });
});
