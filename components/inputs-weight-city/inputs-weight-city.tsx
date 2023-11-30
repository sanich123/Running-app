import { useAuth } from '@A/context/auth-context';
import { saveCity, saveWeight } from '@R/profile/profile';
import { useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

import { CITY_TEST_ID, WEIGHT_CITY, WEIGHT_TEST_ID } from './const';

export default function InputsWeightCity({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const { user } = useAuth();
  const { data: profileInfo } = useGetUserProfileByIdQuery(`${user?.id}`);
  const [city, setCity] = useState(profileInfo?.city);
  const [weight, setWeight] = useState(profileInfo?.weight);

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        testID={CITY_TEST_ID}
        mode="outlined"
        style={{ width: '50%' }}
        label={WEIGHT_CITY[language].cityLabel}
        placeholder={WEIGHT_CITY[language].cityPlaceholder}
        value={city}
        onChangeText={(city) => {
          setCity(city);
          dispatch(saveCity(city));
        }}
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
        onChangeText={(weight) => {
          setWeight(weight);
          dispatch(saveWeight(weight));
        }}
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
