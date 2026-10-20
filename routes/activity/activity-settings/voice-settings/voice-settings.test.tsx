import { act, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setActivityVoiceEnabled, setActivityVoiceMetrics, changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { ACTIVITY_SETTINGS } from '../const';
import VoiceSettings from './voice-settings';

describe('VoiceSettings', () => {
  beforeEach(() => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setActivityVoiceEnabled(true));
    mockStore.dispatch(setActivityVoiceMetrics(['pace', 'movingTime', 'elevation']));
  });

  it('renders translated controls and updates voice and metric preferences', async () => {
    await renderWithProviders(<VoiceSettings />);
    const copy = ACTIVITY_SETTINGS[LANGUAGES.russian];

    expect(screen.getByText(copy.voiceAnnouncementsEnabled)).toBeOnTheScreen();
    expect(screen.getByText(copy.voice)).toBeOnTheScreen();
    await act(async () =>
      screen.getByTestId('activity-voice-enabled').props.onChange({ nativeEvent: { value: false } }),
    );
    expect(mockStore.getState().settings.activityVoiceEnabled).toBe(false);
    expect(screen.queryByTestId('activity-voice-metric-pace')).toBeNull();

    await act(async () =>
      screen.getByTestId('activity-voice-enabled').props.onChange({ nativeEvent: { value: true } }),
    );
    await act(async () =>
      screen.getByTestId('activity-voice-metric-elevation').props.onChange({ nativeEvent: { value: false } }),
    );
    expect(mockStore.getState().settings.activityVoiceMetrics).toEqual(['pace', 'movingTime']);
  });
});
