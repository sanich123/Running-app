import { useAppSelector } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { EDIT_BTN } from './const';

export default function ProfileEditBtn() {
  const { push } = useRouter();
  const { colors, dark } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${ROUTES.profile}/${ROUTES.profileSettings}/`)}
      borderless
      style={{ padding: 5, borderRadius: 10 }}>
      <Text variant="titleMedium" style={{ color: colors.primary, marginRight: 15 }}>
        {EDIT_BTN[language].edit}
      </Text>
    </TouchableRipple>
  );
}
