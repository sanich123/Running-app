import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { EDIT_BTN } from './const';

export default function EditBtn() {
  const { push } = useRouter();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isLoading } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  return (
    <Button
      compact
      loading={isLoading}
      disabled={isLoading}
      onPress={() => push(`/${ROUTES.profile}/${ROUTES.profileSettings}/`)}
      style={styles.layout}>
      {!isLoading && (
        <Text variant="titleMedium" style={{ color: colors.primary }}>
          {EDIT_BTN[language].edit}
        </Text>
      )}
    </Button>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
