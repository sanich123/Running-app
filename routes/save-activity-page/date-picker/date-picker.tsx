import { useState } from 'react';
import DatePicker from 'react-native-date-picker';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import { DATE_TIME_PICKER_BTN_ID, DATE_TIME_PICKER } from './const';

export default function DateTimePicker({ isDisabled }: { isDisabled: boolean }) {
  const { manualDate } = useManualActivityParams();
  const { setManualDate } = useSetManualActivityParams();
  const [open, setOpen] = useState(false);
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabled || isDisabledWhileSending;

  return (
    <>
      <Button
        testID={DATE_TIME_PICKER_BTN_ID}
        icon="calendar-clock"
        compact
        onPress={() => setOpen(true)}
        mode="outlined"
        style={[styles.button, { borderColor: colors.outlineVariant }, shouldBeDisabled && styles.disabledButton]}
        contentStyle={styles.content}
        textColor={colors.onSurface}
        disabled={shouldBeDisabled}>
        {DATE_TIME_PICKER[language].title}
      </Button>
      <DatePicker
        modal
        open={open}
        date={new Date(manualDate)}
        onConfirm={(date) => {
          setOpen(false);
          setManualDate(date);
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
  button: { borderRadius: 8, marginTop: 12 },
  content: { minHeight: 42 },
  disabledButton: { opacity: 0.7 },
});
