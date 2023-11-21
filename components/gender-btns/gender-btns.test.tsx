import { screen, userEvent } from '@testing-library/react-native';

import { GENDER_BTNS, GENDER_BTNS_VALUES } from './const';
import GenderBtns from './gender-btns';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { setIsDisabledWhileSendingProfile } from '../../redux/profile/profile';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Gender btns', () => {
  it('should correctly renders in english', () => {
    renderWithProviders(<GenderBtns gender="" setGender={jest.fn()} isDisabled={false} />, { store: mockStore });
    [GENDER_BTNS.english.maleLabel, GENDER_BTNS.english.femaleLabel, GENDER_BTNS.english.packmanLabel].map((gender) =>
      expect(screen.getByText(new RegExp(gender))).toBeOnTheScreen(),
    );
  });

  it('should correctly handle user pressing', async () => {
    const setGenderFn = jest.fn();
    renderWithProviders(<GenderBtns gender="" setGender={setGenderFn} isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.english.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.english.femaleLabel);
    await userEvent.press(maleInput);
    expect(setGenderFn).toHaveBeenCalled();
    expect(setGenderFn).toHaveBeenCalledWith(GENDER_BTNS_VALUES.male);
    await userEvent.press(femaleInput);
    expect(setGenderFn).toHaveBeenCalled();
    expect(setGenderFn).toHaveBeenCalledWith(GENDER_BTNS_VALUES.female);
  });
  it('should correctly handle isDisabled state', async () => {
    const setGenderFn = jest.fn();
    renderWithProviders(<GenderBtns gender="" setGender={setGenderFn} isDisabled />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.english.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.english.femaleLabel);
    const packmanInput = screen.getByText(GENDER_BTNS.english.packmanLabel);
    [maleInput, femaleInput, packmanInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSendingProfile state', async () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    const setGenderFn = jest.fn();
    renderWithProviders(<GenderBtns gender="" setGender={setGenderFn} isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.english.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.english.femaleLabel);
    const packmanInput = screen.getByText(GENDER_BTNS.english.packmanLabel);
    [maleInput, femaleInput, packmanInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<GenderBtns gender="" setGender={jest.fn()} isDisabled={false} />, { store: mockStore });
    [GENDER_BTNS.russian.maleLabel, GENDER_BTNS.russian.femaleLabel, GENDER_BTNS.russian.packmanLabel].map((gender) =>
      expect(screen.getByText(new RegExp(gender))).toBeOnTheScreen(),
    );
  });
});
