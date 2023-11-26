import { useAppSelector } from '@R/typed-hooks';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { LOGIN_NAVIGATION, REGISTER_NAVIGATION, RegisterNavigationProps } from './const';

export default function RegisterNavigation({ isRegister, setIsRegister, isDisabled }: RegisterNavigationProps) {
  const { btnWrapper, navigateBtn } = styles;
  const { language } = useAppSelector(({ language }) => language);

  return (
    <View style={btnWrapper}>
      <Text>{isRegister ? REGISTER_NAVIGATION[language].text : LOGIN_NAVIGATION[language].text}</Text>
      <Pressable style={navigateBtn} onPress={() => setIsRegister(!isRegister)} disabled={isDisabled}>
        <Text variant="bodyMedium" style={[{ color: 'white' }, isDisabled && { opacity: 0.5 }]}>
          {isRegister ? REGISTER_NAVIGATION[language].btn : LOGIN_NAVIGATION[language].btn}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  btnWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
    marginTop: 10,
  },
  navigateBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#518be8',
    borderRadius: 8,
    padding: 8,
  },
});
