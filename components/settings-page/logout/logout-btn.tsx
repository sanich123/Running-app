import { Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { SETTINGS } from '../const';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetAuthSlice } from '@R/slices/auth/auth';

export default function LogoutBtn() {
  const { dark, colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { replace } = useRouter();
  const dispatch = useAppDispatch();
  return (
    <>
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        onPress={async () => {
          await AsyncStorage.removeItem('accessToken');
          dispatch(resetAuthSlice());
          replace('/sign-in');
        }}>
        <View
          style={{
            display: 'flex',
            backgroundColor: colors.background,
            justifyContent: 'center',
            padding: 10,
          }}>
          <Text variant="titleMedium">{SETTINGS[language].logout}</Text>
        </View>
      </TouchableRipple>

      <Divider />
    </>
  );
}
