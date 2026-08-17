import { StyleSheet, View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { DATE_TIME_PICKER } from '../date-picker/const';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';

function toDateTimeInputValue(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const pad = (part: number) => `${part}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

export default function DatePickerWeb({ isDisabled }: { isDisabled: boolean }) {
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { manualDate } = useManualActivityParams();
  const { setManualDate } = useSetManualActivityParams();
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabled || isDisabledWhileSending;

  return (
    <View style={styles.wrapper}>
      <input
        data-testid="manual-date-picker"
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
        value={toDateTimeInputValue(manualDate)}
        placeholder={DATE_TIME_PICKER[language].title}
        aria-label={DATE_TIME_PICKER[language].title}
        onChange={({ target }) => {
          setManualDate(new Date(Date.parse(target.value)));
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
