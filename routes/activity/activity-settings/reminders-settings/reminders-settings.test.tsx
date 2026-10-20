import { act, fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setActivityReminderEnabled } from '@R/slices/settings/settings';
import { mockStore, resetMockActivityReminders } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { ACTIVITY_SETTINGS } from '../const';
import RemindersSettings from './reminders-settings';

describe('RemindersSettings', () => {
  beforeEach(() => {
    mockStore.dispatch(resetMockActivityReminders());
    mockStore.dispatch(setActivityReminderEnabled(false));
  });

  it('enables reminders and installs a valid reminder from the entered values', async () => {
    await renderWithProviders(<RemindersSettings scrollToReminderFields={jest.fn()} />);
    expect(screen.getByText(ACTIVITY_SETTINGS[LANGUAGES.russian].remindersEnabled)).toBeOnTheScreen();

    await act(async () =>
      screen.getByTestId('activity-reminders-enabled').props.onChange({ nativeEvent: { value: true } }),
    );
    await act(async () => {
      screen.getByTestId('activity-reminder-interval').props.onChangeText('20');
      screen.getByTestId('activity-reminder-text-input').props.onChangeText('Пора попить воды.');
    });
    fireEvent.press(screen.getByTestId('activity-reminder-install'));

    expect(mockStore.getState().settings.activityReminders).toEqual([
      expect.objectContaining({ intervalMinutes: 20, text: 'Пора попить воды.' }),
    ]);
  });
});
