import * as Speech from 'expo-speech';
import { LANGUAGES } from '@const/enums';
import type { ActivitySettings, ActivityVoiceMetric } from '@R/slices/settings/types';

const SPEECH_LOCALES = {
  [LANGUAGES.english]: 'en-US',
  [LANGUAGES.russian]: 'ru-RU',
} as const;

type ActivityVoiceSettings = Pick<
  ActivitySettings,
  'activityVoiceEnabled' | 'activityVoiceMetrics' | 'activityVoiceIdentifier'
>;

interface KilometerVoiceAnnouncement {
  kilometer: number;
  paceDuration: number;
  movingDuration: number;
  elevationGain: number;
  language: LANGUAGES;
}

interface KilometerVoiceText extends KilometerVoiceAnnouncement {
  enabledMetrics: ActivityVoiceMetric[];
}

export function formatDurationForSpeech(milliseconds: number, language: LANGUAGES) {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (language === LANGUAGES.english) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ${seconds} second${seconds === 1 ? '' : 's'}`;
  }

  return `${minutes} ${minutes === 1 ? 'минута' : 'минут'} ${seconds} ${seconds === 1 ? 'секунда' : 'секунд'}`;
}

export function buildKilometerAnnouncement({
  kilometer,
  paceDuration,
  movingDuration,
  elevationGain,
  language,
  enabledMetrics,
}: KilometerVoiceText) {
  const metricParts: Record<ActivityVoiceMetric, string> = {
    pace:
      language === LANGUAGES.english
        ? `pace ${formatDurationForSpeech(paceDuration, language)}`
        : `темп ${formatDurationForSpeech(paceDuration, language)} на километр`,
    movingTime:
      language === LANGUAGES.english
        ? `moving time ${formatDurationForSpeech(movingDuration, language)}`
        : `время движения ${formatDurationForSpeech(movingDuration, language)}`,
    elevation:
      language === LANGUAGES.english
        ? `elevation gain ${Math.round(Math.max(0, elevationGain))} meters`
        : `набор высоты ${Math.round(Math.max(0, elevationGain))} метров`,
  };

  const orderedMetrics: ActivityVoiceMetric[] = ['pace', 'movingTime', 'elevation'];
  const metrics = orderedMetrics
    .filter((metric) => enabledMetrics.includes(metric))
    .map((metric) => metricParts[metric]);

  return language === LANGUAGES.english
    ? `${kilometer} kilometer. ${metrics.join('. ')}.`
    : `${kilometer} километр. ${metrics.join('. ')}.`;
}

export function speakCompletedKilometer(announcement: KilometerVoiceAnnouncement, settings: ActivityVoiceSettings) {
  if (!settings.activityVoiceEnabled || !settings.activityVoiceMetrics.length) {
    return;
  }

  const text = buildKilometerAnnouncement({ ...announcement, enabledMetrics: settings.activityVoiceMetrics });

  try {
    Speech.speak(text, {
      language: SPEECH_LOCALES[announcement.language],
      voice: settings.activityVoiceIdentifier ?? undefined,
      rate: 0.95,
      useApplicationAudioSession: false,
    });
  } catch {
    // Text-to-speech must never interrupt location tracking.
  }
}

export function speakActivityMessage(text: string, language: LANGUAGES, voiceIdentifier: string | null) {
  if (!text.trim()) {
    return;
  }

  try {
    Speech.speak(text, {
      language: SPEECH_LOCALES[language],
      voice: voiceIdentifier ?? undefined,
      rate: 0.95,
      useApplicationAudioSession: false,
    });
  } catch {
    // Text-to-speech must never interrupt location tracking.
  }
}

export function speakActivityReminder(text: string, language: LANGUAGES, voiceIdentifier: string | null) {
  speakActivityMessage(text, language, voiceIdentifier);
}
