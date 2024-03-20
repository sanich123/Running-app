import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { EDIT_BTN } from './const';
import ProfileEditBtn from './profile-edit-btn';

describe('Profile edit btn', () => {
  it('should correctly renders in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<ProfileEditBtn />, { store: mockStore });
    expect(screen.getByText(EDIT_BTN.english.edit)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<ProfileEditBtn />, { store: mockStore });
    expect(screen.getByText(EDIT_BTN.russian.edit)).toBeOnTheScreen();
  });
});
