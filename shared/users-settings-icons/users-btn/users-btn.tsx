import { Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { getHeaderIconSource, HEADER_ICON_SIZE, IOS_HEADER_ICON_COLOR } from '@S/header-icon-source';
import { usersBtnStyles as styles } from './styles';

export default function UsersBtn() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const isUsersPage = pathname === `/${ROUTES.users}`;

  return (
    <IconButton
      testID="usersIcon"
      icon={getHeaderIconSource('account-search-outline', 'person.2')}
      iconColor={Platform.OS === 'ios' ? IOS_HEADER_ICON_COLOR : colors.primary}
      size={Platform.OS === 'ios' ? HEADER_ICON_SIZE : 26}
      onPress={() => {
        if (!isUsersPage) push(`/${ROUTES.users}`);
      }}
      style={styles.iconButton}
    />
  );
}
