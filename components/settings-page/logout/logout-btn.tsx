import { useAuth } from '@A/context/auth-context';
import { Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { SETTINGS } from '../const';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { resetSettings } from '@R/profile/profile';
import { View } from 'react-native';

export default function LogoutBtn() {
  const { signOut } = useAuth();
  const { dark, colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();
  return (
    <>
      {signOut && (
        <TouchableRipple
          rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
          borderless
          onPress={() => {
            dispatch(resetSettings());
            signOut();
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
      )}
      <Divider />
    </>
  );
}
