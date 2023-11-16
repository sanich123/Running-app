import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { INPUTS_DISTANCE_TIME } from './const';

export default function InputsDistanceTime() {
  const [distance, setDistance] = useState('0');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');

  const { language } = useSelector(({ language }) => language);

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        mode="outlined"
        style={{ width: '33%' }}
        label={INPUTS_DISTANCE_TIME[language].distanceLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].distancePlaceholder}
        keyboardType="numeric"
        value={distance}
        onChangeText={(distance) => setDistance(distance)}
      />
      <TextInput
        mode="outlined"
        style={{ width: '33%' }}
        label={INPUTS_DISTANCE_TIME[language].hoursLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].hoursPlaceholder}
        keyboardType="numeric"
        value={hours}
        onChangeText={(hours) => setHours(hours)}
      />
      <TextInput
        mode="outlined"
        style={{ width: '33%' }}
        label={INPUTS_DISTANCE_TIME[language].minutesLabel}
        placeholder={INPUTS_DISTANCE_TIME[language].minutesPlaceholder}
        keyboardType="numeric"
        value={minutes}
        onChangeText={(minutes) => setMinutes(minutes)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
    paddingRight: 10,
    marginRight: 15,
    marginTop: 10,
  },
});
