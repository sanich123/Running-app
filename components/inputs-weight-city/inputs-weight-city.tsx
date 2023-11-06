import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

type InputsWeightCityProps = {
  city: string;
  weight: string;
  isDisabled: boolean;
  setCity: (arg: string) => void;
  setWeight: (arg: string) => void;
};

export default function InputsWeightCity({ city, setCity, weight, setWeight, isDisabled }: InputsWeightCityProps) {
  const { isDisabledWhileSendingProfile } = useSelector(({ profile }) => profile);
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        testID="inputCity"
        mode="outlined"
        style={{ width: 170 }}
        label="City"
        placeholder="Where are you from"
        value={city}
        onChangeText={(city) => setCity(city)}
        disabled={isDisabled || isDisabledWhileSendingProfile}
      />
      <TextInput
        testID="inputWeight"
        mode="outlined"
        style={{ width: 170 }}
        label="Weight (kg)"
        placeholder="Type your weight"
        keyboardType="numeric"
        value={weight}
        onChangeText={(weight) => setWeight(weight)}
        disabled={isDisabled || isDisabledWhileSendingProfile}
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
