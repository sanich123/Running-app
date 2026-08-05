import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setIsDisableWhileSending } from '@R/slices/activity/activity';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { DATE_TIME_PICKER } from './const';
import DateTimePicker from './date-picker';

describe('Date time picker', () => {
  it('should correctly renders open btn in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<DateTimePicker isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(DATE_TIME_PICKER.english.title))).toBeOnTheScreen();
  });
  it('should correctly renders open btn in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<DateTimePicker isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(DATE_TIME_PICKER.russian.title))).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled state', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<DateTimePicker isDisabled />, { store: mockStore });
    expect(screen.getByText(new RegExp(DATE_TIME_PICKER.russian.title))).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled WhileSending state', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setIsDisableWhileSending(true));
    await renderWithProviders(<DateTimePicker isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(DATE_TIME_PICKER.russian.title))).toBeOnTheScreen();
  });
});
