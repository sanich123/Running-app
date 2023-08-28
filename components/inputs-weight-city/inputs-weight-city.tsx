import { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

import { SaveSettingsContext } from '../../utils/context/settings';

export default function InputsWeightCity() {
  const { city, setCity, weight, setWeight, isDisabled } = useContext(SaveSettingsContext);
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        mode="outlined"
        style={{ width: 170 }}
        label="City"
        placeholder="Where are you from"
        value={city}
        onChangeText={(city) => setCity(city)}
        disabled={isDisabled}
      />
      <TextInput
        mode="outlined"
        style={{ width: 170 }}
        label="Weight (kg)"
        placeholder="Type your weight"
        keyboardType="numeric"
        value={weight}
        onChangeText={(weight) => setWeight(weight)}
        disabled={isDisabled}
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
  },
});
