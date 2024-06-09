import { useAppSelector } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { EDIT_BTN } from './const';

export default function EditBtn() {
  const { push } = useRouter();
  const { colors, dark } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${ROUTES.profile}/${ROUTES.profileSettings}/`)}
      borderless
      style={styles.layout}>
      <Text variant="titleMedium" style={{ color: colors.primary }}>
        {EDIT_BTN[language].edit}
      </Text>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    marginRight: 5,
    borderRadius: 10,
  },
});
