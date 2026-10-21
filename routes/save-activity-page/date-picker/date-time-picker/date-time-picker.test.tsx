import { act, screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setSavingDisabled } from '@R/slices/activity/activity';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { DATE_TIME_PICKER, DATE_TIME_PICKER_BTN_ID } from '../const';
import DateTimePicker from './date-time-picker';
import { formatSelectedDate, setTimeOnDate } from '../utils';
import type * as MockNativeViewTools from '@T/utils/mock-native-view';
import type { MockNativeViewProps } from '@T/utils/mock-native-view';

const mockSetParams = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ manualDate: '2026-08-06T10:00:00.000Z' }),
  useRouter: () => ({ setParams: mockSetParams }),
}));

jest.mock('react-native-paper-dates', () => {
  const { createMockNativeView } = require('@T/utils/mock-native-view') as typeof MockNativeViewTools;
  return {
    DatePickerModal: (props: MockNativeViewProps) => createMockNativeView(props, undefined, 'date-picker-modal'),
    TimePickerModal: (props: MockNativeViewProps) => createMockNativeView(props, undefined, 'time-picker-modal'),
    en: {},
    registerTranslation: jest.fn(),
    ru: {},
  };
});

describe('Date time picker', () => {
  it('should correctly renders open btn in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<DateTimePicker />, { store: mockStore });
    expect(screen.getByTestId(DATE_TIME_PICKER_BTN_ID)).toHaveProp(
      'accessibilityLabel',
      DATE_TIME_PICKER.english.title,
    );
    expect(
      screen.getByText(formatSelectedDate(new Date('2026-08-06T10:00:00.000Z'), LANGUAGES.english)),
    ).toBeOnTheScreen();
  });
  it('should correctly renders open btn in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<DateTimePicker />, { store: mockStore });
    expect(screen.getByTestId(DATE_TIME_PICKER_BTN_ID)).toHaveProp(
      'accessibilityLabel',
      DATE_TIME_PICKER.russian.title,
    );
  });
  it('should correctly handle isSavingDisabled state', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setSavingDisabled(true));
    await renderWithProviders(<DateTimePicker />, { store: mockStore });
    expect(screen.getByTestId(DATE_TIME_PICKER_BTN_ID)).toHaveProp(
      'accessibilityLabel',
      DATE_TIME_PICKER.russian.title,
    );
  });

  it('opens the picker and stores the confirmed date', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setSavingDisabled(false));
    await renderWithProviders(<DateTimePicker />);
    await user.press(screen.getByTestId(DATE_TIME_PICKER_BTN_ID));
    const selectedDate = new Date('2026-08-06T10:00:00.000Z');
    await act(async () => screen.getByTestId('date-picker-modal').props.onConfirm({ date: selectedDate }));
    expect(screen.getByTestId('time-picker-modal')).toHaveProp('visible', true);
    await act(async () => screen.getByTestId('time-picker-modal').props.onConfirm({ hours: 14, minutes: 30 }));
    expect(mockSetParams).toHaveBeenCalledWith({ manualDate: setTimeOnDate(selectedDate, 14, 30).toISOString() });
  });

  it('does not store a future date when a maximum date is provided', async () => {
    const user = userEvent.setup();
    const maximumDate = new Date('2026-08-06T12:00:00.000Z');
    mockSetParams.mockClear();
    await renderWithProviders(<DateTimePicker maximumDate={maximumDate} />);
    await user.press(screen.getByTestId(DATE_TIME_PICKER_BTN_ID));

    expect(screen.getByTestId('date-picker-modal').props.validRange).toEqual({ endDate: maximumDate });
    const futureDate = new Date('2026-08-07T10:00:00.000Z');
    await act(async () => screen.getByTestId('date-picker-modal').props.onConfirm({ date: futureDate }));
    await act(async () => screen.getByTestId('time-picker-modal').props.onConfirm({ hours: 15, minutes: 0 }));

    expect(mockSetParams).toHaveBeenLastCalledWith({ manualDate: maximumDate.toISOString() });
  });
});
