import { Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { usersBtnStyles as styles } from './styles';

export default function UsersBtn() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const isUsersPage = pathname === `/${ROUTES.users}`;

  return (
    <IconButton
      testID="usersIcon"
      icon="account-search-outline"
      iconColor={colors.primary}
      size={Platform.OS === 'ios' ? 22 : 26}
      onPress={() => {
        if (!isUsersPage) push(`/${ROUTES.users}`);
      }}
      style={styles.iconButton}
    />
  );
}
