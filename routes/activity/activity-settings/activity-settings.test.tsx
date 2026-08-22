import { act, fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import * as Speech from 'expo-speech';
import {
  addActivityReminder,
  changeLanguage,
  setActivityReminderEnabled,
  resetActivityReminders,
  setActivityVoiceEnabled,
  setActivityVoiceMetrics,
} from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivitySettings from './activity-settings';

describe('ActivitySettings', () => {
  beforeEach(() => {
    mockStore.dispatch(setActivityVoiceEnabled(true));
    mockStore.dispatch(setActivityVoiceMetrics(['pace', 'movingTime', 'elevation']));
    mockStore.dispatch(setActivityReminderEnabled(false));
    mockStore.dispatch(resetActivityReminders());
  });

  it('shows settings under the corresponding enabled switch', async () => {
    await renderWithProviders(<ActivitySettings settingsModalRef={{ current: null }} />);

    expect(screen.getByText('Настройки активности')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-voice-enabled')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-voice-metric-pace')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-reminders-enabled')).toBeOnTheScreen();
    expect(screen.queryByTestId('activity-reminder-interval')).toBeNull();
    expect(screen.queryByTestId('activity-reminder-text-input')).toBeNull();

    await act(async () => {
      screen.getByTestId('activity-voice-enabled').props.onChange({ nativeEvent: { value: false } });
    });
    expect(screen.queryByTestId('activity-voice-metric-pace')).toBeNull();

    await act(async () => {
      screen.getByTestId('activity-reminders-enabled').props.onChange({ nativeEvent: { value: true } });
    });
    expect(screen.getByTestId('activity-reminder-interval')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-reminder-text-input')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-reminder-install')).toBeOnTheScreen();
    expect(screen.getByText('Напоминания не установлены')).toBeOnTheScreen();
  });

  it('updates voice announcements and reminders from native switch events', async () => {
    await renderWithProviders(<ActivitySettings settingsModalRef={{ current: null }} />);

    await act(async () => {
      screen.getByTestId('activity-voice-enabled').props.onChange({ nativeEvent: { value: false } });
    });
    expect(mockStore.getState().settings.activityVoiceEnabled).toBe(false);

    await act(async () => {
      screen.getByTestId('activity-voice-enabled').props.onChange({ nativeEvent: { value: true } });
    });
    expect(mockStore.getState().settings.activityVoiceEnabled).toBe(true);

    await act(async () => {
      screen.getByTestId('activity-reminders-enabled').props.onChange({ nativeEvent: { value: true } });
    });
    expect(mockStore.getState().settings.activityReminderEnabled).toBe(true);

    await act(async () => {
      screen.getByTestId('activity-reminders-enabled').props.onChange({ nativeEvent: { value: false } });
    });
    expect(mockStore.getState().settings.activityReminderEnabled).toBe(false);
  });

  it('shows and removes a saved reminder', async () => {
    mockStore.dispatch(setActivityReminderEnabled(true));
    mockStore.dispatch(addActivityReminder({ id: 'water-reminder', intervalMinutes: 20, text: 'Пора попить воды.' }));
    await renderWithProviders(<ActivitySettings settingsModalRef={{ current: null }} />);

    expect(screen.getByText('20 мин')).toBeOnTheScreen();
    expect(screen.getByText('Пора попить воды.')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('activity-reminder-delete-water-reminder'));

    expect(mockStore.getState().settings.activityReminders).toEqual([]);
  });

  it('saves the draft only after confirming installation', async () => {
    mockStore.dispatch(setActivityReminderEnabled(true));
    await renderWithProviders(<ActivitySettings settingsModalRef={{ current: null }} />);

    await act(async () => {
      screen.getByTestId('activity-reminder-interval').props.onChangeText('20');
      screen.getByTestId('activity-reminder-text-input').props.onChangeText('Пора сделать глоток воды.');
    });

    expect(mockStore.getState().settings.activityReminders).toEqual([]);
    fireEvent.press(screen.getByTestId('activity-reminder-install'));

    expect(mockStore.getState().settings.activityReminders).toEqual([
      expect.objectContaining({ intervalMinutes: 20, text: 'Пора сделать глоток воды.' }),
    ]);
  });

  it('persists selected voice metrics', async () => {
    await renderWithProviders(<ActivitySettings settingsModalRef={{ current: null }} />);

    await act(async () => {
      screen.getByTestId('activity-voice-metric-elevation').props.onChange({ nativeEvent: { value: false } });
    });

    expect(mockStore.getState().settings.activityVoiceMetrics).toEqual(['pace', 'movingTime']);
  });

  it('previews the selected voice', async () => {
    await renderWithProviders(<ActivitySettings settingsModalRef={{ current: null }} />);

    const voiceButton = await screen.findByTestId('activity-voice-mock-russian-voice');
    const user = userEvent.setup();
    await user.press(voiceButton);

    await waitFor(() =>
      expect(Speech.speak).toHaveBeenCalledWith(
        'Первый километр. Темп пять минут тридцать секунд на километр. Время движения пять минут тридцать секунд. Набор высоты десять метров.',
        {
          language: 'ru-RU',
          voice: 'mock-russian-voice',
          rate: 0.9,
          useApplicationAudioSession: false,
        },
      ),
    );
  });

  it('falls back to voices from another locale and supports selecting the system voice', async () => {
    mockStore.dispatch(changeLanguage('english'));
    mockStore.dispatch(setActivityVoiceMetrics([]));
    (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([
      { identifier: 'russian-only-voice', language: 'ru-RU', name: 'Russian only', quality: 'Default' },
    ]);
    await renderWithProviders(<ActivitySettings settingsModalRef={{ current: null }} />);

    const voice = await screen.findByTestId('activity-voice-russian-only-voice');
    expect(voice).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByTestId('activity-system-voice'));
    expect(Speech.speak).toHaveBeenCalledWith(
      'First kilometre. Pace five minutes thirty seconds per kilometre. Moving time five minutes thirty seconds. Elevation gain ten meters.',
      expect.objectContaining({ language: 'en-US', voice: undefined }),
    );

    await act(async () => {
      screen.getByTestId('activity-voice-metric-pace').props.onChange({ nativeEvent: { value: true } });
    });
    expect(mockStore.getState().settings.activityVoiceMetrics).toEqual(['pace']);
  });

  it('shows unavailable voices, ignores invalid reminders and survives preview errors', async () => {
    mockStore.dispatch(changeLanguage('english'));
    mockStore.dispatch(setActivityReminderEnabled(true));
    (Speech.getAvailableVoicesAsync as jest.Mock).mockRejectedValue(new Error('voices unavailable'));
    (Speech.stop as jest.Mock).mockRejectedValue(new Error('stop unavailable'));
    (Speech.speak as jest.Mock).mockImplementation(() => {
      throw new Error('speech unavailable');
    });
    await renderWithProviders(<ActivitySettings settingsModalRef={{ current: null }} />);

    await waitFor(() => expect(screen.getByText('No system voices available')).toBeOnTheScreen());
    await act(async () => {
      screen.getByTestId('activity-reminder-interval').props.onChangeText('0');
      screen.getByTestId('activity-reminder-text-input').props.onChangeText('   ');
    });
    fireEvent.press(screen.getByTestId('activity-reminder-install'));
    expect(mockStore.getState().settings.activityReminders).toEqual([]);
    const user = userEvent.setup();
    await expect(user.press(screen.getByTestId('activity-system-voice'))).resolves.toBeUndefined();
  });
});
