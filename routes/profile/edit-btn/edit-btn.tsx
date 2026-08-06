import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { EDIT_BTN } from './const';

export default function EditBtn() {
  const { push } = useRouter();
  const { colors, dark } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data: profile } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${ROUTES.profile}/${ROUTES.profileSettings}/`)}
      borderless
      style={styles.layout}>
      <Text variant="titleMedium" style={{ color: colors.primary }}>
        {profile ? EDIT_BTN[language].edit : EDIT_BTN[language].create}
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
