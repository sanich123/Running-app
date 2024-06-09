import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { CHECK_EMAIL } from './const';
import SignInNeedToConfirmEmail from './need-to-confirm';

describe('Sign-in-need-to-confirm page', () => {
  it('should correctly renders in russian', () => {
    renderWithProviders(<SignInNeedToConfirmEmail />);
    expect(screen.getByText(CHECK_EMAIL.russian.mailHasBeenSent)).toBeOnTheScreen();
    expect(screen.getByText(CHECK_EMAIL.russian.needToCheckEmail)).toBeOnTheScreen();
  });
  it('should correctly renders in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<SignInNeedToConfirmEmail />, { store: mockStore });
    expect(screen.getByText(CHECK_EMAIL.english.mailHasBeenSent)).toBeOnTheScreen();
    expect(screen.getByText(CHECK_EMAIL.english.needToCheckEmail)).toBeOnTheScreen();
  });
});
