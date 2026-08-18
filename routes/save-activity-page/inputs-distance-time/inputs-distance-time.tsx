import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import { INPUT_DISTANCE_ID, INPUTS_DISTANCE_TIME, INPUT_HOURS_ID, INPUT_MINUTES_ID, INPUT_SECONDS_ID } from './const';

export default function InputsDistanceTime({ isDisabled }: { isDisabled: boolean }) {
  const { manualDistance, manualHours, manualMinutes, manualSeconds } = useManualActivityParams();
  const { setManualDistance, setManualHours, setManualMinutes, setManualSeconds } = useSetManualActivityParams();
  const { language } = useAppSelector(({ settings }) => settings);
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabled || isSavingDisabled;

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        testID={INPUT_DISTANCE_ID}
        mode="outlined"
        style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
        contentStyle={styles.content}
        outlineStyle={styles.outline}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        label={INPUTS_DISTANCE_TIME[language].distanceLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].distancePlaceholder}
        inputMode="numeric"
        value={manualDistance}
        onFocus={() => setManualDistance('')}
        onChangeText={setManualDistance}
        disabled={shouldBeDisabled}
      />
      <TextInput
        mode="outlined"
        testID={INPUT_HOURS_ID}
        style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
        contentStyle={styles.content}
        outlineStyle={styles.outline}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        label={INPUTS_DISTANCE_TIME[language].hoursLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].hoursPlaceholder}
        inputMode="numeric"
        value={manualHours}
        onFocus={() => setManualHours('')}
        onChangeText={setManualHours}
        disabled={shouldBeDisabled}
      />
      <TextInput
        mode="outlined"
        testID={INPUT_MINUTES_ID}
        style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
        contentStyle={styles.content}
        outlineStyle={styles.outline}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        label={INPUTS_DISTANCE_TIME[language].minutesLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].minutesPlaceholder}
        inputMode="numeric"
        value={manualMinutes}
        onFocus={() => setManualMinutes('')}
        onChangeText={setManualMinutes}
        disabled={shouldBeDisabled}
      />
      <TextInput
        mode="outlined"
        testID={INPUT_SECONDS_ID}
        style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
        contentStyle={styles.content}
        outlineStyle={styles.outline}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        label={INPUTS_DISTANCE_TIME[language].secondsLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].secondsPlaceholder}
        inputMode="numeric"
        value={manualSeconds}
        onFocus={() => setManualSeconds('')}
        onChangeText={setManualSeconds}
        disabled={shouldBeDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  input: { flex: 1, minWidth: 0, minHeight: 52, fontSize: 15 },
  content: { fontFamily: FONT_FAMILIES.regular },
  outline: { borderRadius: 8 },
  disabledInput: { opacity: 0.7 },
});
