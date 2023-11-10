import { screen } from '@testing-library/react-native';

import { REGISTER_BTN } from './const';
import RegisterBtn from './register-btn';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Register btn', () => {
  it('should correctly renders in english', () => {
    renderWithProviders(<RegisterBtn email="some email" password="some password" />, { store: mockStore });
    expect(screen.getByText(REGISTER_BTN.english.register)).toBeOnTheScreen();
  });
  it('should correctly renders in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<RegisterBtn email="some email" password="some password" />, { store: mockStore });
    expect(screen.getByText(REGISTER_BTN.russian.register)).toBeOnTheScreen();
  });
});
