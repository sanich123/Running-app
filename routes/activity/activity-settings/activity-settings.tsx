import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { MaterialDesignIcons as MaterialCommunityIcons } from '@react-native-vector-icons/material-design-icons/static';
import * as Speech from 'expo-speech';
import { KeyboardAwareScrollView, type KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';
import { ActivityIndicator, Keyboard, Platform, StyleSheet, TextInput, View } from 'react-native';
import {
  Button,
  Divider,
  Icon,
  IconButton,
  RadioButton,
  Switch,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import {
  addActivityReminder,
  removeActivityReminder,
  setActivityVoiceEnabled,
  setActivityVoiceIdentifier,
  setActivityVoiceMetrics,
  setActivityReminderEnabled,
} from '@R/slices/settings/settings';
import { getActivitySettings } from '@R/slices/settings/types';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ACTIVITY_SETTINGS, ACTIVITY_VOICE_METRICS, ACTIVITY_VOICE_PREVIEW, createActivityReminderId } from './const';
import type { ActivitySettingsProps } from './types';
import type { ActivityVoiceMetric } from '@R/slices/settings/types';
import type { Voice } from 'expo-speech';

const ActivitySettingsTextInput = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;

export default function ActivitySettings({
  settingsModalRef,
  locationInfoModalRef: providedLocationInfoModalRef,
}: ActivitySettingsProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(({ settings: state }) => state);
  const { language } = settings;
  const {
    activityVoiceEnabled,
    activityVoiceMetrics,
    activityVoiceIdentifier,
    activityReminderEnabled,
    activityReminders,
  } = getActivitySettings(settings);
  const [intervalInput, setIntervalInput] = useState('');
  const [reminderTextInput, setReminderTextInput] = useState('');
  const reminderTextInputRef = useRef<{ focus: () => void }>(null);
  const settingsScrollViewRef = useRef<KeyboardAwareScrollViewRef>(null);
  const fallbackLocationInfoModalRef = useRef<BottomSheetModal>(null);
  const locationInfoModalRef = providedLocationInfoModalRef ?? fallbackLocationInfoModalRef;
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
        if (isMounted) {
          setVoices(availableVoices);
        }
      })
      .catch(() => {
        if (isMounted) {
          setVoices([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingVoices(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );

  const scrollToReminderFields = useCallback(() => {
    const scrollToEnd = () => settingsScrollViewRef.current?.scrollTo({ y: 10000, animated: true });

    requestAnimationFrame(() => {
      scrollToEnd();
      requestAnimationFrame(scrollToEnd);
    });
  }, []);

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener('keyboardDidShow', scrollToReminderFields);
    return () => keyboardSubscription?.remove();
  }, [scrollToReminderFields]);

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

  const renderSwitchRow = (
    testID: string,
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
  ) => (
    <View style={styles.switchRow}>
      <View style={styles.rowCopy}>
        <Text variant="titleSmall" style={{ color: colors.onSurface }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {description}
        </Text>
      </View>
      <Switch testID={testID} value={value} onChange={({ nativeEvent }) => onValueChange(nativeEvent.value)} />
    </View>
  );

  const installReminder = () => {
    const intervalMinutes = Number(intervalInput);
    const text = reminderTextInput.trim();
    if (!activityReminderEnabled || !Number.isInteger(intervalMinutes) || intervalMinutes <= 0 || !text) {
      return;
    }

    dispatch(
      addActivityReminder({
        id: createActivityReminderId(),
        intervalMinutes,
        text,
      }),
    );
    setIntervalInput('');
    setReminderTextInput('');
  };

  return (
    <BottomSheetModal
      ref={settingsModalRef}
      index={0}
      snapPoints={['90%']}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}>
      <KeyboardAwareScrollView
        ref={settingsScrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        mode="layout"
        bottomOffset={24}
        ScrollViewComponent={BottomSheetScrollView as never}>
        <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
          {labels.title}
        </Text>

        {renderSwitchRow(
          'activity-voice-enabled',
          labels.voiceAnnouncementsEnabled,
          labels.voiceAnnouncementsDescription,
          activityVoiceEnabled,
          (value) => dispatch(setActivityVoiceEnabled(value)),
        )}
        {activityVoiceEnabled && (
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
            {ACTIVITY_VOICE_METRICS.map((metric) => {
              const metricLabels = {
                pace: labels.pace,
                movingTime: labels.movingTime,
                elevation: labels.elevation,
              };
              return (
                <View key={metric} style={styles.metricRow}>
                  <Text style={{ color: colors.onSurface }}>{metricLabels[metric]}</Text>
                  <Switch
                    testID={`activity-voice-metric-${metric}`}
                    value={activityVoiceMetrics.includes(metric)}
                    onChange={({ nativeEvent }) => toggleMetric(metric, nativeEvent.value)}
                    disabled={!activityVoiceEnabled}
                  />
                </View>
              );
            })}
          </View>
        )}

        <Divider />
        {renderSwitchRow(
          'activity-reminders-enabled',
          labels.remindersEnabled,
          labels.remindersDescription,
          activityReminderEnabled,
          (value) => dispatch(setActivityReminderEnabled(value)),
        )}
        {activityReminderEnabled && (
          <View style={styles.sectionContent}>
            <Text variant="titleSmall" style={{ color: colors.onSurface }}>
              {labels.reminderInterval}
            </Text>
            <ActivitySettingsTextInput
              testID="activity-reminder-interval"
              placeholder={labels.reminderIntervalPlaceholder}
              value={intervalInput}
              keyboardType="number-pad"
              editable={activityReminderEnabled}
              placeholderTextColor={colors.onSurfaceVariant}
              style={[styles.textInput, { borderColor: colors.outline, color: colors.onSurface }]}
              onChangeText={(value) => {
                const normalizedValue = value.replace(/\D/g, '').slice(0, 3);
                setIntervalInput(normalizedValue);
              }}
              returnKeyType="next"
              submitBehavior="submit"
              onFocus={scrollToReminderFields}
              onSubmitEditing={() => reminderTextInputRef.current?.focus()}
            />
            <Text variant="titleSmall" style={{ color: colors.onSurface }}>
              {labels.reminderText}
            </Text>
            {Platform.OS === 'web' ? (
              <TextInput
                testID="activity-reminder-text-input"
                placeholder={labels.reminderTextPlaceholder}
                value={reminderTextInput}
                editable={activityReminderEnabled}
                multiline
                placeholderTextColor={colors.onSurfaceVariant}
                style={[
                  styles.textInput,
                  styles.reminderTextInput,
                  { borderColor: colors.outline, color: colors.onSurface },
                ]}
                onChangeText={setReminderTextInput}
                returnKeyType="done"
                submitBehavior="submit"
                enterKeyHint="done"
                onFocus={scrollToReminderFields}
                onSubmitEditing={installReminder}
              />
            ) : (
              <BottomSheetTextInput
                ref={reminderTextInputRef as unknown as ComponentPropsWithRef<typeof BottomSheetTextInput>['ref']}
                testID="activity-reminder-text-input"
                placeholder={labels.reminderTextPlaceholder}
                value={reminderTextInput}
                editable={activityReminderEnabled}
                multiline
                placeholderTextColor={colors.onSurfaceVariant}
                style={[
                  styles.textInput,
                  styles.reminderTextInput,
                  { borderColor: colors.outline, color: colors.onSurface },
                ]}
                onChangeText={setReminderTextInput}
                returnKeyType="done"
                submitBehavior="submit"
                enterKeyHint="done"
                onFocus={scrollToReminderFields}
                onSubmitEditing={installReminder}
              />
            )}
            <Button
              testID="activity-reminder-install"
              mode="contained"
              disabled={
                !activityReminderEnabled || !Number.isInteger(Number(intervalInput)) || !reminderTextInput.trim()
              }
              onPress={installReminder}>
              {labels.installReminder}
            </Button>
            <Text variant="titleSmall" style={{ color: colors.onSurface }}>
              {labels.savedReminders}
            </Text>
            {activityReminders.length ? (
              <View style={styles.remindersList}>
                {activityReminders.map((reminder) => (
                  <View key={reminder.id} style={styles.reminderRow}>
                    <View style={styles.reminderCopy}>
                      <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                        {reminder.intervalMinutes} {labels.minutes}
                      </Text>
                      <Text style={{ color: colors.onSurfaceVariant }}>{reminder.text}</Text>
                    </View>
                    <IconButton
                      testID={`activity-reminder-delete-${reminder.id}`}
                      icon="delete-outline"
                      iconColor={colors.error}
                      size={22}
                      onPress={() => dispatch(removeActivityReminder(reminder.id))}
                      accessibilityLabel={labels.deleteReminder}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {labels.noReminders}
              </Text>
            )}
          </View>
        )}

        <Divider />
        <TouchableRipple
          testID="activity-location-info-button"
          borderless
          onPress={() => locationInfoModalRef.current?.present()}
          style={styles.locationInfoRow}>
          <View style={styles.locationInfoRowContent}>
            <View style={styles.rowCopy}>
              <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                {labels.locationTrackingInfoTitle}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {labels.locationTrackingInfoDescription}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </View>
        </TouchableRipple>
      </KeyboardAwareScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, padding: 20, paddingBottom: 36 },
  sectionContent: { gap: 12 },
  sectionTitle: { marginTop: 4 },
  locationInfoRow: { borderRadius: 12, overflow: 'hidden' },
  locationInfoRowContent: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingVertical: 8 },
  switchRow: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 58 },
  rowCopy: { flex: 1, gap: 2 },
  radioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingLeft: 4,
  },
  textInput: { borderRadius: 4, borderWidth: 1, minHeight: 48, paddingHorizontal: 12 },
  reminderTextInput: { minHeight: 80, textAlignVertical: 'top' },
  remindersList: { gap: 8 },
  reminderRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  reminderCopy: { flex: 1, gap: 2 },
  voiceCopy: { flex: 1, gap: 2 },
  metricRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 44 },
});
