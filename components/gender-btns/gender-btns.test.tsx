import { changeLanguage } from '@R/language/language';
import { setIsDisabledWhileSendingProfile } from '@R/profile/profile';
import { LANGUAGES } from '@const/enums';
import { screen, userEvent } from '@testing-library/react-native';

import { GENDER_BTNS, GENDER_BTNS_VALUES } from './const';
import GenderBtns from './gender-btns';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Gender btns', () => {
  it('should correctly handle user pressing', async () => {
    renderWithProviders(<GenderBtns isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.english.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.english.femaleLabel);
    await userEvent.press(maleInput);
    expect(mockStore.getState().profile.settings.gender).toEqual(GENDER_BTNS_VALUES.male);
    await userEvent.press(femaleInput);
    expect(mockStore.getState().profile.settings.gender).toEqual(GENDER_BTNS_VALUES.female);
  });
  it('should correctly handle isDisabled state', async () => {
    renderWithProviders(<GenderBtns isDisabled />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.english.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.english.femaleLabel);
    expect(maleInput).toBeDisabled();
    expect(femaleInput).toBeDisabled();
  });
  it('should correctly handle isDisabledWhileSending state', async () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    renderWithProviders(<GenderBtns isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.english.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.english.femaleLabel);
    expect(maleInput).toBeDisabled();
    expect(femaleInput).toBeDisabled();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<GenderBtns isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.russian.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.russian.femaleLabel);
    expect(maleInput).toBeOnTheScreen();
    expect(femaleInput).toBeOnTheScreen();
  });
});
