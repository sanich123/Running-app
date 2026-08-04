import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { RESET_NAVIGATION } from './const';
import RegisterNavigation from './login-register-navigation';

describe('Register navigation', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<RegisterNavigation />);
    expect(screen.getByText(RESET_NAVIGATION.english.text)).toBeOnTheScreen();
    expect(screen.getByText(RESET_NAVIGATION.english.btn)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<RegisterNavigation />);
    expect(screen.getByText(RESET_NAVIGATION.russian.text)).toBeOnTheScreen();
    expect(screen.getByText(RESET_NAVIGATION.russian.btn)).toBeOnTheScreen();
  });
});
