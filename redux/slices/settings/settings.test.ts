import { DEFAULT_ACTIVITY_VOICE_METRICS, getActivitySettings, SETTINGS_INITIAL_STATE } from './types';

describe('getActivitySettings', () => {
  it('uses defaults for absent or invalid setting collections', () => {
    expect(getActivitySettings({})).toEqual({
      activityVoiceEnabled: SETTINGS_INITIAL_STATE.activityVoiceEnabled,
      activityVoiceMetrics: DEFAULT_ACTIVITY_VOICE_METRICS,
      activityVoiceIdentifier: null,
      activityReminderEnabled: SETTINGS_INITIAL_STATE.activityReminderEnabled,
      activityReminders: [],
    });
    expect(
      getActivitySettings({
        activityVoiceMetrics: null as never,
        activityReminders: null as never,
        activityVoiceIdentifier: 123 as never,
      }),
    ).toMatchObject({
      activityVoiceMetrics: DEFAULT_ACTIVITY_VOICE_METRICS,
      activityReminders: [],
      activityVoiceIdentifier: null,
    });
  });

  it('filters voice metrics and normalizes valid reminders while rejecting malformed entries', () => {
    const settings = getActivitySettings({
      activityVoiceEnabled: true,
      activityVoiceMetrics: ['pace', 'unknown', 'elevation'] as never,
      activityVoiceIdentifier: 'russian-voice',
      activityReminderEnabled: true,
      activityReminders: [
        { id: '', intervalMinutes: 5, text: 'empty id' },
        { id: 1, intervalMinutes: 5, text: 'invalid id' },
        { id: 'bad-interval', intervalMinutes: Number.NaN, text: 'invalid interval' },
        { id: 'zero-interval', intervalMinutes: 0, text: 'invalid interval' },
        { id: 'bad-text', intervalMinutes: 5, text: '  ' },
        null,
        { id: 'short', intervalMinutes: 0.3, text: '  Drink water  ' },
        { id: 'rounded', intervalMinutes: 2.6, text: 'Stretch' },
      ] as never,
    });

    expect(settings).toEqual({
      activityVoiceEnabled: true,
      activityVoiceMetrics: ['pace', 'elevation'],
      activityVoiceIdentifier: 'russian-voice',
      activityReminderEnabled: true,
      activityReminders: [
        { id: 'short', intervalMinutes: 1, text: 'Drink water' },
        { id: 'rounded', intervalMinutes: 3, text: 'Stretch' },
      ],
    });
  });

  it('keeps an empty valid metrics list and false boolean settings', () => {
    expect(
      getActivitySettings({
        activityVoiceEnabled: false,
        activityVoiceMetrics: [],
        activityReminderEnabled: false,
        activityReminders: [],
      }),
    ).toMatchObject({
      activityVoiceEnabled: false,
      activityVoiceMetrics: [],
      activityReminderEnabled: false,
      activityReminders: [],
    });
  });
});
