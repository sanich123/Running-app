import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { INPUTS_DISTANCE_TIME } from './const';
import { setManualDistance, setManualHours, setManualMinutes } from '../../redux/activity/activity';

export default function InputsDistanceTime() {
  const [distance, setDistance] = useState('0');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const dispatch = useDispatch();
  const { language } = useSelector(({ language }) => language);
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);

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
        mode="outlined"
        style={{ width: '33%' }}
        label={INPUTS_DISTANCE_TIME[language].distanceLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].distancePlaceholder}
        keyboardType="numeric"
        value={distance}
        onChangeText={(distance) => {
          setDistance(distance);
          dispatch(setManualDistance(distance));
        }}
        disabled={isDisabledWhileSending}
      />
      <TextInput
        mode="outlined"
        style={{ width: '33%' }}
        label={INPUTS_DISTANCE_TIME[language].hoursLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].hoursPlaceholder}
        keyboardType="numeric"
        value={hours}
        onChangeText={(hours) => {
          setHours(hours);
          dispatch(setManualHours(hours));
        }}
        disabled={isDisabledWhileSending}
      />
      <TextInput
        mode="outlined"
        style={{ width: '33%' }}
        label={INPUTS_DISTANCE_TIME[language].minutesLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].minutesPlaceholder}
        keyboardType="numeric"
        value={minutes}
        onChangeText={(minutes) => {
          setMinutes(minutes);
          dispatch(setManualMinutes(minutes));
        }}
        disabled={isDisabledWhileSending}
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
