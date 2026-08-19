import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setIsDisabledWhileSendingProfile } from '@R/slices/profile/profile';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { GENDER_BTNS, GENDER_BTNS_VALUES } from './const';
import GenderBtns from './gender-btns';

const mockParams = { gender: '' };
const mockSetParams = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('Gender btns', () => {
  beforeEach(() => {
    mockParams.gender = '';
  });

  it('should correctly handle user pressing', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockParams.gender = GENDER_BTNS_VALUES.male;
    await renderWithProviders(<GenderBtns isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.english.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.english.femaleLabel);
    await userEvent.press(maleInput);
    expect(mockSetParams).toHaveBeenCalledWith({ gender: GENDER_BTNS_VALUES.male });
    await userEvent.press(femaleInput);
    expect(mockSetParams).toHaveBeenCalledWith({ gender: GENDER_BTNS_VALUES.female });
  });
  it('should correctly handle isDisabled state', async () => {
    await renderWithProviders(<GenderBtns isDisabled />, { store: mockStore });
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const maleInput = screen.getByText(GENDER_BTNS.english.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.english.femaleLabel);
    expect(maleInput).toBeDisabled();
    expect(femaleInput).toBeDisabled();
  });
  it('should correctly handle isDisabledWhileSending state', async () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    await renderWithProviders(<GenderBtns isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.english.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.english.femaleLabel);
    expect(maleInput).toBeDisabled();
    expect(femaleInput).toBeDisabled();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<GenderBtns isDisabled={false} />, { store: mockStore });
    const maleInput = screen.getByText(GENDER_BTNS.russian.maleLabel);
    const femaleInput = screen.getByText(GENDER_BTNS.russian.femaleLabel);
    expect(maleInput).toBeOnTheScreen();
    expect(femaleInput).toBeOnTheScreen();
  });
});
