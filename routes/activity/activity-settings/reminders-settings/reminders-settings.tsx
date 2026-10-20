import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Keyboard, Platform, StyleSheet, TextInput, View } from 'react-native';
import { Button, IconButton, Switch, Text, useTheme } from 'react-native-paper';
import { addActivityReminder, removeActivityReminder, setActivityReminderEnabled } from '@R/slices/settings/settings';
import { getActivitySettings } from '@R/slices/settings/types';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ActivitySettingsTextInput, ACTIVITY_SETTINGS, createActivityReminderId } from '../const';
import type { ReminderSettingsProps } from '../types';

export default function RemindersSettings({ scrollToReminderFields }: ReminderSettingsProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(({ settings: state }) => state);
  const { language } = settings;
  const { activityReminderEnabled, activityReminders } = getActivitySettings(settings);
  const [intervalInput, setIntervalInput] = useState('');
  const [reminderTextInput, setReminderTextInput] = useState('');
  const reminderTextInputRef = useRef<{ focus: () => void }>(null);
  const labels = ACTIVITY_SETTINGS[language];

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener('keyboardDidShow', scrollToReminderFields);
    return () => keyboardSubscription?.remove();
  }, [scrollToReminderFields]);

  const installReminder = () => {
    const intervalMinutes = Number(intervalInput);
    const text = reminderTextInput.trim();
    if (!activityReminderEnabled || !Number.isInteger(intervalMinutes) || intervalMinutes <= 0 || !text) return;

    dispatch(addActivityReminder({ id: createActivityReminderId(), intervalMinutes, text }));
    setIntervalInput('');
    setReminderTextInput('');
  };

  return (
    <>
      <View style={styles.switchRow}>
        <View style={styles.rowCopy}>
          <Text variant="titleSmall" style={{ color: colors.onSurface }}>
            {labels.remindersEnabled}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {labels.remindersDescription}
          </Text>
        </View>
        <Switch
          testID="activity-reminders-enabled"
          value={activityReminderEnabled}
          onChange={({ nativeEvent }) => {
            dispatch(setActivityReminderEnabled(nativeEvent.value));
          }}
        />
      </View>
      {activityReminderEnabled ? (
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
            onChangeText={(value) => setIntervalInput(value.replace(/\D/g, '').slice(0, 3))}
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
              !Number.isInteger(Number(intervalInput)) || Number(intervalInput) <= 0 || !reminderTextInput.trim()
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
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  sectionContent: { gap: 12 },
  switchRow: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 58 },
  rowCopy: { flex: 1, gap: 2 },
  textInput: { borderRadius: 4, borderWidth: 1, minHeight: 48, paddingHorizontal: 12 },
  reminderTextInput: { minHeight: 80, textAlignVertical: 'top' },
  remindersList: { gap: 8 },
  reminderRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  reminderCopy: { flex: 1, gap: 2 },
});
