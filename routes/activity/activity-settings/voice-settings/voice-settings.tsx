import { useEffect, useState } from 'react';
import * as Speech from 'expo-speech';
import { Platform, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Divider,
  Icon,
  RadioButton,
  Switch,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import {
  setActivityVoiceEnabled,
  setActivityVoiceIdentifier,
  setActivityVoiceMetrics,
} from '@R/slices/settings/settings';
import { getActivitySettings } from '@R/slices/settings/types';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ACTIVITY_SETTINGS, ACTIVITY_VOICE_METRICS, ACTIVITY_VOICE_PREVIEW } from '../const';
import type { ActivityVoiceMetric } from '@R/slices/settings/types';
import type { Voice } from 'expo-speech';

export default function VoiceSettings() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(({ settings: state }) => state);
  const { language } = settings;
  const { activityVoiceEnabled, activityVoiceMetrics, activityVoiceIdentifier } = getActivitySettings(settings);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const labels = ACTIVITY_SETTINGS[language];
  const localePrefix = language === LANGUAGES.russian ? 'ru' : 'en';
  const localizedVoices = voices.filter((voice) => voice.language.toLowerCase().startsWith(localePrefix));
  const voiceOptions = localizedVoices.length ? localizedVoices : voices;

  useEffect(() => {
    let isMounted = true;
    Speech.getAvailableVoicesAsync()
      .then((availableVoices) => {
        if (isMounted) setVoices(availableVoices);
      })
      .catch(() => {
        if (isMounted) setVoices([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingVoices(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const previewVoice = async (voiceIdentifier: string | null) => {
    try {
      await Speech.stop();
    } catch {
      // Preview should still work if stopping a previous utterance is unavailable.
    }

    try {
      Speech.speak(ACTIVITY_VOICE_PREVIEW[language], {
        language: language === LANGUAGES.russian ? 'ru-RU' : 'en-US',
        voice: voiceIdentifier ?? undefined,
        rate: 0.9,
        useApplicationAudioSession: false,
      });
    } catch {
      // Text-to-speech preview must not break the settings screen.
    }
  };

  const toggleMetric = (metric: ActivityVoiceMetric, enabled: boolean) => {
    const nextMetrics = enabled
      ? activityVoiceMetrics.includes(metric)
        ? activityVoiceMetrics
        : [...activityVoiceMetrics, metric]
      : activityVoiceMetrics.filter((currentMetric) => currentMetric !== metric);
    dispatch(setActivityVoiceMetrics(nextMetrics));
  };

  const metricLabels = {
    pace: labels.pace,
    movingTime: labels.movingTime,
    elevation: labels.elevation,
  };

  return (
    <>
      <View style={styles.switchRow}>
        <View style={styles.rowCopy}>
          <Text variant="titleSmall" style={{ color: colors.onSurface }}>
            {labels.voiceAnnouncementsEnabled}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {labels.voiceAnnouncementsDescription}
          </Text>
        </View>
        <Switch
          testID="activity-voice-enabled"
          value={activityVoiceEnabled}
          onChange={({ nativeEvent }) => {
            dispatch(setActivityVoiceEnabled(nativeEvent.value));
          }}
        />
      </View>
      {activityVoiceEnabled ? (
        <View style={styles.sectionContent}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
            {labels.voice}
          </Text>
          {isLoadingVoices ? (
            <ActivityIndicator testID="activity-voices-loading" />
          ) : (
            <>
              <TouchableRipple
                testID="activity-system-voice"
                onPress={() => {
                  dispatch(setActivityVoiceIdentifier(null));
                  void previewVoice(null);
                }}
                style={styles.radioRow}>
                <>
                  <Text style={{ color: colors.onSurface }}>{labels.systemVoice}</Text>
                  {Platform.OS === 'web' ? (
                    <Icon
                      source={activityVoiceIdentifier === null ? 'radiobox-marked' : 'radiobox-blank'}
                      size={24}
                      color={colors.primary}
                    />
                  ) : (
                    <RadioButton value="system" status={activityVoiceIdentifier === null ? 'checked' : 'unchecked'} />
                  )}
                </>
              </TouchableRipple>
              {voiceOptions.length ? (
                voiceOptions.map((voice) => (
                  <TouchableRipple
                    key={voice.identifier}
                    testID={`activity-voice-${voice.identifier}`}
                    onPress={() => {
                      dispatch(setActivityVoiceIdentifier(voice.identifier));
                      void previewVoice(voice.identifier);
                    }}
                    style={styles.radioRow}>
                    <>
                      <View style={styles.voiceCopy}>
                        <Text style={{ color: colors.onSurface }}>{voice.name}</Text>
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                          {voice.language}
                        </Text>
                      </View>
                      {Platform.OS === 'web' ? (
                        <Icon
                          source={activityVoiceIdentifier === voice.identifier ? 'radiobox-marked' : 'radiobox-blank'}
                          size={24}
                          color={colors.primary}
                        />
                      ) : (
                        <RadioButton
                          value={voice.identifier}
                          status={activityVoiceIdentifier === voice.identifier ? 'checked' : 'unchecked'}
                        />
                      )}
                    </>
                  </TouchableRipple>
                ))
              ) : (
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  {labels.voicesUnavailable}
                </Text>
              )}
            </>
          )}

          <Divider />
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.onSurface }]}>
            {labels.metrics}
          </Text>
          {ACTIVITY_VOICE_METRICS.map((metric) => (
            <View key={metric} style={styles.metricRow}>
              <Text style={{ color: colors.onSurface }}>{metricLabels[metric]}</Text>
              <Switch
                testID={`activity-voice-metric-${metric}`}
                value={activityVoiceMetrics.includes(metric)}
                onChange={({ nativeEvent }) => toggleMetric(metric, nativeEvent.value)}
                disabled={!activityVoiceEnabled}
              />
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  sectionContent: { gap: 12 },
  sectionTitle: { marginTop: 4 },
  switchRow: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 58 },
  rowCopy: { flex: 1, gap: 2 },
  radioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingLeft: 4,
  },
  voiceCopy: { flex: 1, gap: 2 },
  metricRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 44 },
});
