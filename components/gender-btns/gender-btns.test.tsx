import { screen, userEvent } from '@testing-library/react-native';

import GenderBtns from './gender-btns';
import { setIsDisabledWhileSendingProfile } from '../../redux/profile/profile';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Gender btns', () => {
  it('should correctly renders', () => {
    renderWithProviders(<GenderBtns gender="" setGender={jest.fn()} isDisabled={false} />, { store: mockStore });
    ['Male', 'Female', 'Packman'].map((gender) => expect(screen.getByText(new RegExp(gender))).toBeOnTheScreen());
  });
  it('should correctly handle user pressing', async () => {
    const setGenderFn = jest.fn();
    renderWithProviders(<GenderBtns gender="" setGender={setGenderFn} isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText('Male');
    const femaleInput = screen.getByText('Female');
    await userEvent.press(maleInput);
    expect(setGenderFn).toHaveBeenCalled();
    expect(setGenderFn).toHaveBeenCalledWith('male');
    await userEvent.press(femaleInput);
    expect(setGenderFn).toHaveBeenCalled();
    expect(setGenderFn).toHaveBeenCalledWith('female');
  });
  it('should correctly handle isDisabled state', async () => {
    const setGenderFn = jest.fn();
    renderWithProviders(<GenderBtns gender="" setGender={setGenderFn} isDisabled />, { store: mockStore });
    const maleInput = screen.getByText('Male');
    const femaleInput = screen.getByText('Female');
    const packmanInput = screen.getByText('Packman');
    [maleInput, femaleInput, packmanInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSendingProfile state', async () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    const setGenderFn = jest.fn();
    renderWithProviders(<GenderBtns gender="" setGender={setGenderFn} isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText('Male');
    const femaleInput = screen.getByText('Female');
    const packmanInput = screen.getByText('Packman');
    [maleInput, femaleInput, packmanInput].map((input) => expect(input).toBeDisabled());
  });
});
