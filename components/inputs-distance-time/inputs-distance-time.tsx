import { setManualDistance, setManualHours, setManualMinutes } from '@R/activity/activity';
import { store } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

import { INPUT_DISTANCE_ID, INPUTS_DISTANCE_TIME, INPUT_HOURS_ID, INPUT_MINUTES_ID } from './const';

export default function InputsDistanceTime({ isDisabled }: { isDisabled: boolean }) {
  const [distance, setDistance] = useState(store.getState().activity.manualDistance.toString());
  const [hours, setHours] = useState(store.getState().activity.manualHours.toString());
  const [minutes, setMinutes] = useState(store.getState().activity.manualMinutes.toString());
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhileSending, isNeedToResetInputs } = useAppSelector(({ activity }) => activity);

  useEffect(() => {
    if (isNeedToResetInputs) {
      setDistance('0');
      setHours('0');
      setMinutes('0');
    }
  }, [isNeedToResetInputs]);

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        testID={INPUT_DISTANCE_ID}
        mode="outlined"
        style={[{ width: '33%' }, (isDisabledWhileSending || isDisabled) && { opacity: 0.5 }]}
        label={INPUTS_DISTANCE_TIME[language].distanceLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].distancePlaceholder}
        keyboardType="numeric"
        value={distance}
        onChangeText={(distance) => {
          setDistance(distance);
          dispatch(setManualDistance(distance));
        }}
        disabled={isDisabledWhileSending || isDisabled}
      />
      <TextInput
        mode="outlined"
        testID={INPUT_HOURS_ID}
        style={[{ width: '33%' }, (isDisabledWhileSending || isDisabled) && { opacity: 0.5 }]}
        label={INPUTS_DISTANCE_TIME[language].hoursLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].hoursPlaceholder}
        keyboardType="numeric"
        value={hours}
        onChangeText={(hours) => {
          setHours(hours);
          dispatch(setManualHours(hours));
        }}
        disabled={isDisabledWhileSending || isDisabled}
      />
      <TextInput
        mode="outlined"
        testID={INPUT_MINUTES_ID}
        style={[{ width: '33%' }, (isDisabledWhileSending || isDisabled) && { opacity: 0.5 }]}
        label={INPUTS_DISTANCE_TIME[language].minutesLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].minutesPlaceholder}
        keyboardType="numeric"
        value={minutes}
        onChangeText={(minutes) => {
          setMinutes(minutes);
          dispatch(setManualMinutes(minutes));
        }}
        disabled={isDisabledWhileSending || isDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingRight: 10,
    marginRight: 15,
    marginTop: 10,
  },
});
