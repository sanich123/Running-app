import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { CITY_TEST_ID, InputsWeightCityProps, WEIGHT_CITY, WEIGHT_TEST_ID } from './const';

export default function InputsWeightCity({ city, setCity, weight, setWeight, isDisabled }: InputsWeightCityProps) {
  const { isDisabledWhileSendingProfile } = useSelector(({ profile }) => profile);
  const { language } = useSelector(({ language }) => language);
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        testID={CITY_TEST_ID}
        mode="outlined"
        style={{ width: '50%' }}
        label={WEIGHT_CITY[language].cityLabel}
        placeholder={WEIGHT_CITY[language].cityPlaceholder}
        value={city}
        onChangeText={(city) => setCity(city)}
        disabled={isDisabled || isDisabledWhileSendingProfile}
      />
      <TextInput
        testID={WEIGHT_TEST_ID}
        mode="outlined"
        style={{ width: '50%' }}
        label={WEIGHT_CITY[language].weightLabel}
        placeholder={WEIGHT_CITY[language].weightPlaceholder}
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
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 15,
    marginRight: 15,
  },
});
