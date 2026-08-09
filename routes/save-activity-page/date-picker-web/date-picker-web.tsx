import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { setManualDate } from '@R/slices/manual-activity/manual-activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { DATE_TIME_PICKER } from '../date-picker/const';

function toDateTimeInputValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const pad = (part: number) => `${part}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

export default function DatePickerWeb({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { manualDate } = useAppSelector(({ manualActivity }) => manualActivity);
  const { language } = useAppSelector(({ language }) => language);
  const [date, setDate] = useState(() => toDateTimeInputValue(manualDate));
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabled || isDisabledWhileSending;

  return (
    <View style={styles.wrapper}>
      <input
        {...({ testID: 'manual-date-picker' } as Record<string, string>)}
        disabled={shouldBeDisabled}
        style={{
          ...styles.picker,
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
          boxSizing: 'border-box',
          color: colors.onSurface,
          maxWidth: '100%',
          ...(shouldBeDisabled ? styles.disabledInput : {}),
        }}
        type="datetime-local"
        id="date-picker-date"
        value={date}
        placeholder={DATE_TIME_PICKER[language].title}
        aria-label={DATE_TIME_PICKER[language].title}
        onChange={({ target }) => {
          dispatch(setManualDate(new Date(Date.parse(target.value))));
          setDate(target.value);
        }}
      />
      <View pointerEvents="none" style={styles.inputIcon}>
        <Icon source="calendar-clock" size={20} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
    position: 'relative',
    width: '100%',
  },
  picker: {
    borderRadius: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 15,
    minHeight: 52,
    paddingLeft: 48,
    paddingRight: 12,
    width: '100%',
  },
  inputIcon: {
    left: 16,
    position: 'absolute',
    top: 16,
  },
  disabledInput: { opacity: 0.7 },
});
