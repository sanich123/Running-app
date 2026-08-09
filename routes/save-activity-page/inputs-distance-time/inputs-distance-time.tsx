import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { setManualDistance, setManualHours, setManualMinutes } from '@R/slices/manual-activity/manual-activity';
import { store } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { INPUT_DISTANCE_ID, INPUTS_DISTANCE_TIME, INPUT_HOURS_ID, INPUT_MINUTES_ID } from './const';

export default function InputsDistanceTime({ isDisabled }: { isDisabled: boolean }) {
  const [distance, setDistance] = useState(store.getState().manualActivity.manualDistance.toString());
  const [hours, setHours] = useState(store.getState().manualActivity.manualHours.toString());
  const [minutes, setMinutes] = useState(store.getState().manualActivity.manualMinutes.toString());
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabled || isDisabledWhileSending;

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
        value={distance}
        onFocus={() => setDistance('')}
        onChangeText={(distance) => {
          setDistance(distance);
          dispatch(setManualDistance(distance));
        }}
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
        value={hours}
        onFocus={() => setHours('')}
        onChangeText={(hours) => {
          setHours(hours);
          dispatch(setManualHours(hours));
        }}
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
        value={minutes}
        onFocus={() => setMinutes('')}
        onChangeText={(minutes) => {
          setMinutes(minutes);
          dispatch(setManualMinutes(minutes));
        }}
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
