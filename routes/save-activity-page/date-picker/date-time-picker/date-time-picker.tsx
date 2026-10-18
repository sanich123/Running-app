import { useState } from 'react';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { useManualActivityParams, useSetManualActivityParams } from '../../manual-activity-params';
import { DATE_TIME_PICKER_BTN_ID, DATE_TIME_PICKER } from '../const';
import { clampDateToMaximum, formatSelectedDate, setTimeOnDate } from '../utils';
import type { DateTimePickerProps } from './types';
import './register-translations';

export default function DateTimePicker({ maximumDate }: DateTimePickerProps) {
  const { manualDate } = useManualActivityParams();
  const { setManualDate } = useSetManualActivityParams();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const shouldBeDisabled = isSavingDisabled;
  const displayedDate = clampDateToMaximum(new Date(manualDate), maximumDate);
  const locale = language === 'russian' ? 'ru' : 'en';

  return (
    <>
      <Pressable
        testID={DATE_TIME_PICKER_BTN_ID}
        onPress={() => {
          setSelectedDate(displayedDate);
          setDatePickerOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={DATE_TIME_PICKER[language].title}
        disabled={shouldBeDisabled}
        style={({ pressed }) => [
          styles.button,
          { borderColor: colors.outlineVariant },
          shouldBeDisabled && styles.disabledButton,
          pressed && !shouldBeDisabled && styles.pressedButton,
        ]}>
        <View style={styles.content}>
          <Icon source="calendar-edit" size={24} color={colors.onSurfaceVariant} />
          <Text
            variant="bodyMedium"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: colors.onSurface, flex: 1 }}>
            {formatSelectedDate(displayedDate, language)}
          </Text>
          <Icon source="chevron-down" size={22} color={colors.onSurfaceVariant} />
        </View>
      </Pressable>
      <DatePickerModal
        mode="single"
        visible={datePickerOpen}
        date={displayedDate}
        locale={locale}
        label={DATE_TIME_PICKER[language].title}
        saveLabel={DATE_TIME_PICKER[language].confirm}
        startWeekOnMonday
        validRange={maximumDate ? { endDate: maximumDate } : undefined}
        onDismiss={() => setDatePickerOpen(false)}
        onConfirm={({ date }) => {
          if (!date) return;
          const nextDate = clampDateToMaximum(date, maximumDate);
          setDatePickerOpen(false);
          setSelectedDate(nextDate);
          setTimePickerOpen(true);
        }}
      />
      <TimePickerModal
        visible={timePickerOpen}
        locale={locale}
        label={DATE_TIME_PICKER[language].timeTitle}
        cancelLabel={DATE_TIME_PICKER[language].cancel}
        confirmLabel={DATE_TIME_PICKER[language].confirm}
        use24HourClock
        hours={(selectedDate ?? displayedDate).getHours()}
        minutes={(selectedDate ?? displayedDate).getMinutes()}
        onDismiss={() => setTimePickerOpen(false)}
        onConfirm={({ hours, minutes }) => {
          const dateWithTime = setTimeOnDate(selectedDate ?? displayedDate, hours, minutes);
          setTimePickerOpen(false);
          setManualDate(clampDateToMaximum(dateWithTime, maximumDate));
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 56,
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  content: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 12, width: '100%' },
  disabledButton: { opacity: 0.7 },
  pressedButton: { opacity: 0.7 },
});
