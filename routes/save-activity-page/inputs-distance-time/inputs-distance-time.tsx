import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import {
  INPUT_DISTANCE_ID,
  INPUTS_DISTANCE_TIME,
  INPUT_HOURS_ID,
  INPUT_MINUTES_ID,
  INPUT_SECONDS_ID,
  normalizeManualActivityDistanceInput,
  MANUAL_ACTIVITY_TIME_INPUT_MAX_LENGTH,
  MANUAL_ACTIVITY_TIME_LIMITS,
  normalizeManualActivityTimeInput,
} from './const';

interface InputValues {
  distance: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export default function InputsDistanceTime({ isDisabled }: { isDisabled: boolean }) {
  const { manualDistance, manualHours, manualMinutes, manualSeconds } = useManualActivityParams();
  const { setManualDistance, setManualHours, setManualMinutes, setManualSeconds } = useSetManualActivityParams();
  const { language } = useAppSelector(({ settings }) => settings);
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabled || isSavingDisabled;
  const [inputValues, setInputValues] = useState<InputValues>(() => ({
    distance: manualDistance,
    hours: manualHours,
    minutes: manualMinutes,
    seconds: manualSeconds,
  }));

  const setInputValue = (field: keyof InputValues, value: string) => {
    setInputValues((currentValues) => ({ ...currentValues, [field]: value }));
  };

  const handleDistanceChange = (value: string) => {
    const normalizedValue = normalizeManualActivityDistanceInput(value);

    setInputValue('distance', normalizedValue);
    setManualDistance(normalizedValue);
  };

  const handleTimeChange = (
    field: keyof Pick<InputValues, 'hours' | 'minutes' | 'seconds'>,
    value: string,
    setParam: (value: string) => void,
    maxValue: number,
  ) => {
    const normalizedValue = normalizeManualActivityTimeInput(value, maxValue);

    setInputValue(field, normalizedValue);
    setParam(normalizedValue);
  };

  const clearZeroOnFocus = (field: keyof InputValues, value: string, setParam: (value: string) => void) => {
    if (value !== '0') {
      return;
    }

    setInputValue(field, '');
    setParam('');
  };

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
        value={inputValues.distance}
        onFocus={() => clearZeroOnFocus('distance', inputValues.distance, setManualDistance)}
        onChangeText={handleDistanceChange}
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
        maxLength={MANUAL_ACTIVITY_TIME_INPUT_MAX_LENGTH}
        value={inputValues.hours}
        onFocus={() => clearZeroOnFocus('hours', inputValues.hours, setManualHours)}
        onChangeText={(value) => handleTimeChange('hours', value, setManualHours, MANUAL_ACTIVITY_TIME_LIMITS.hours)}
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
        maxLength={MANUAL_ACTIVITY_TIME_INPUT_MAX_LENGTH}
        value={inputValues.minutes}
        onFocus={() => clearZeroOnFocus('minutes', inputValues.minutes, setManualMinutes)}
        onChangeText={(value) =>
          handleTimeChange('minutes', value, setManualMinutes, MANUAL_ACTIVITY_TIME_LIMITS.minutes)
        }
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
        maxLength={MANUAL_ACTIVITY_TIME_INPUT_MAX_LENGTH}
        value={inputValues.seconds}
        onFocus={() => clearZeroOnFocus('seconds', inputValues.seconds, setManualSeconds)}
        onChangeText={(value) =>
          handleTimeChange('seconds', value, setManualSeconds, MANUAL_ACTIVITY_TIME_LIMITS.seconds)
        }
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
