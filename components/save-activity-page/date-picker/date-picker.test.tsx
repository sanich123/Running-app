import { setIsDisableWhileSending } from '@R/activity/activity';
import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { DATE_TIME_PICKER } from './const';
import DateTimePicker from './date-picker';

describe('Date time picker', () => {
  it('should correctly renders open btn in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<DateTimePicker isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(DATE_TIME_PICKER.english.title))).toBeOnTheScreen();
  });
  it('should correctly renders open btn in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<DateTimePicker isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(DATE_TIME_PICKER.russian.title))).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled state', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<DateTimePicker isDisabled />, { store: mockStore });
    expect(screen.getByText(new RegExp(DATE_TIME_PICKER.russian.title))).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled WhileSending state', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setIsDisableWhileSending(true));
    renderWithProviders(<DateTimePicker isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(new RegExp(DATE_TIME_PICKER.russian.title))).toBeOnTheScreen();
  });
});
