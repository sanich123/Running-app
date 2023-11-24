import { screen } from '@testing-library/react-native';

import { EDIT_BTN } from '../../components/profile-edit-btn/const';
import ProfileEditBtn from '../../components/profile-edit-btn/profile-edit-btn';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Profile edit btn', () => {
  it('should correctly renders in english', () => {
    renderWithProviders(<ProfileEditBtn />, { store: mockStore });
    expect(screen.getByText(EDIT_BTN.english.edit)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<ProfileEditBtn />, { store: mockStore });
    expect(screen.getByText(EDIT_BTN.russian.edit)).toBeOnTheScreen();
  });
});
