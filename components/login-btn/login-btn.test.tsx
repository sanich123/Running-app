import { screen } from '@testing-library/react-native';

import { LOGIN_BTN } from './const';
import LoginBtn from './login-btn';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Login btn', () => {
  it('should correctly renders in english', () => {
    renderWithProviders(<LoginBtn email="" password="" />, { store: mockStore });
    expect(screen.getByText(LOGIN_BTN.english.login)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<LoginBtn email="" password="" />, { store: mockStore });
    expect(screen.getByText(LOGIN_BTN.russian.login)).toBeOnTheScreen();
  });
});
