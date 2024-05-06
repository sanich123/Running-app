import { screen } from '@testing-library/react-native';

import { DATE_TIME_PICKER } from './const';
import DateTimePicker from './date-picker';
import { LANGUAGES } from '../../constants/enums';
import { setIsDisableWhileSending } from '../../redux/activity/activity';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

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
