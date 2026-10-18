import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { CHECK_EMAIL } from '../const';
import SignInNeedToConfirmEmail from './sign-in-need-to-confirm-email';

jest.mock('expo-router', () => ({ Stack: { Screen: () => null } }));

describe('Sign-in-need-to-confirm page', () => {
  it('should correctly renders in russian', async () => {
    await renderWithProviders(<SignInNeedToConfirmEmail />);
    expect(screen.getByText(CHECK_EMAIL.russian.mailHasBeenSent)).toBeOnTheScreen();
    expect(screen.getByText(CHECK_EMAIL.russian.needToCheckEmail)).toBeOnTheScreen();
    expect(screen.getByText(CHECK_EMAIL.russian.spam)).toBeOnTheScreen();
  });
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<SignInNeedToConfirmEmail />, { store: mockStore });
    expect(screen.getByText(CHECK_EMAIL.english.mailHasBeenSent)).toBeOnTheScreen();
    expect(screen.getByText(CHECK_EMAIL.english.needToCheckEmail)).toBeOnTheScreen();
    expect(screen.getByText(CHECK_EMAIL.english.spam)).toBeOnTheScreen();
  });
});
