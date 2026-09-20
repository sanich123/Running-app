import { useState } from 'react';
import DatePicker from 'react-native-date-picker';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import { DATE_TIME_PICKER_BTN_ID, DATE_TIME_PICKER } from './const';
import { clampDateToMaximum, formatSelectedDate } from './utils';

interface DateTimePickerProps {
  isDisabled: boolean;
  maximumDate?: Date;
}

export default function DateTimePicker({ isDisabled, maximumDate }: DateTimePickerProps) {
  const { manualDate } = useManualActivityParams();
  const { setManualDate } = useSetManualActivityParams();
  const [open, setOpen] = useState(false);
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabled || isSavingDisabled;
  const displayedDate = clampDateToMaximum(new Date(manualDate), maximumDate);

  return (
    <>
      <Pressable
        testID={DATE_TIME_PICKER_BTN_ID}
        onPress={() => setOpen(true)}
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
      <DatePicker
        modal
        open={open}
        date={clampDateToMaximum(new Date(manualDate), maximumDate)}
        maximumDate={maximumDate}
        onConfirm={(date) => {
          setOpen(false);
          setManualDate(clampDateToMaximum(date, maximumDate));
        }}
        onCancel={() => setOpen(false)}
        title={DATE_TIME_PICKER[language].title}
        confirmText={DATE_TIME_PICKER[language].confirm}
        cancelText={DATE_TIME_PICKER[language].cancel}
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
