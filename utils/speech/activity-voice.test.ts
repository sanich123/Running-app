import * as Speech from 'expo-speech';
import { LANGUAGES } from '@const/enums';
import {
  buildKilometerAnnouncement,
  formatDurationForSpeech,
  speakActivityReminder,
  speakCompletedKilometer,
} from './activity-voice';

describe('activity voice announcements', () => {
  beforeEach(() => jest.clearAllMocks());

  it('formats a kilometre announcement with only selected metrics', () => {
    expect(
      buildKilometerAnnouncement({
        kilometer: 2,
        paceDuration: 330_000,
        movingDuration: 660_000,
        elevationGain: 12.4,
        language: LANGUAGES.russian,
        enabledMetrics: ['pace', 'elevation'],
      }),
    ).toBe('2 километр. темп 5 минут 30 секунд на километр. набор высоты 12 метров.');
  });

  it('speaks with the selected voice and app language', () => {
    speakCompletedKilometer(
      {
        kilometer: 1,
        paceDuration: 300_000,
        movingDuration: 300_000,
        elevationGain: 8,
        language: LANGUAGES.english,
      },
      {
        activityVoiceEnabled: true,
        activityVoiceMetrics: ['movingTime'],
        activityVoiceIdentifier: 'voice-id',
      },
    );

    expect(Speech.speak).toHaveBeenCalledWith('1 kilometer. moving time 5 minutes 0 seconds.', {
      language: 'en-US',
      voice: 'voice-id',
      rate: 0.95,
      useApplicationAudioSession: false,
    });
  });

  it('does not speak when voice announcements are disabled', () => {
    speakCompletedKilometer(
      {
        kilometer: 1,
        paceDuration: 300_000,
        movingDuration: 300_000,
        elevationGain: 0,
        language: LANGUAGES.russian,
      },
      { activityVoiceEnabled: false, activityVoiceMetrics: ['pace'], activityVoiceIdentifier: null },
    );

    expect(Speech.speak).not.toHaveBeenCalled();
  });

  it('formats durations for the selected language', () => {
    expect(formatDurationForSpeech(61_000, LANGUAGES.english)).toBe('1 minute 1 second');
    expect(formatDurationForSpeech(121_000, LANGUAGES.russian)).toBe('2 минут 1 секунда');
  });

  it('speaks the custom activity reminder with the selected voice', () => {
    speakActivityReminder('Пора сделать глоток воды.', LANGUAGES.russian, 'voice-id');

    expect(Speech.speak).toHaveBeenCalledWith('Пора сделать глоток воды.', {
      language: 'ru-RU',
      voice: 'voice-id',
      rate: 0.95,
      useApplicationAudioSession: false,
    });
  });

  it('does not speak an empty activity reminder', () => {
    speakActivityReminder('  ', LANGUAGES.russian, null);

    expect(Speech.speak).not.toHaveBeenCalled();
  });
});
