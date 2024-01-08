import { useAppSelector } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { EDIT_BTN } from './const';

export default function ProfileEditBtn() {
  const { push } = useRouter();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <Pressable onPress={() => push(`/${ROUTES.profile}/${ROUTES.settings}`)}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginRight: 15 }}>
        {EDIT_BTN[language].edit}
      </Text>
    </Pressable>
  );
}
