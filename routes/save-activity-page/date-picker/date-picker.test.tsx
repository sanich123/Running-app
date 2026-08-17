import { act, screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setIsDisableWhileSending } from '@R/slices/activity/activity';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { DATE_TIME_PICKER, DATE_TIME_PICKER_BTN_ID } from './const';
import DateTimePicker from './date-picker';

const mockSetParams = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ manualDate: '2026-08-06T10:00:00.000Z' }),
  useRouter: () => ({ setParams: mockSetParams }),
}));

jest.mock('react-native-date-picker', () => {
  const { View } = jest.requireActual('react-native');
  return (props: any) => <View testID="native-date-picker" {...props} />;
});

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

  it('opens the picker and stores the confirmed date', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setIsDisableWhileSending(false));
    await renderWithProviders(<DateTimePicker isDisabled={false} />);
    await user.press(screen.getByTestId(DATE_TIME_PICKER_BTN_ID));
    expect(screen.getByTestId('native-date-picker').props.open).toBe(true);
    const selectedDate = new Date('2026-08-06T10:00:00.000Z');
    await act(async () => screen.getByTestId('native-date-picker').props.onConfirm(selectedDate));
    expect(mockSetParams).toHaveBeenCalledWith({ manualDate: selectedDate.toISOString() });
  });
});
