import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { EDIT_BTN } from './const';

export default function ProfileEditBtn() {
  const { push } = useRouter();
  const { colors } = useTheme();
  const { language } = useSelector(({ language }) => language);
  return (
    <Pressable onPress={() => push('/profile/settings')}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginRight: 15 }}>
        {EDIT_BTN[language].edit}
      </Text>
    </Pressable>
  );
}
