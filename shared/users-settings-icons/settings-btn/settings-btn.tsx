import { Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { getHeaderIconSource, HEADER_ICON_SIZE, IOS_HEADER_ICON_COLOR } from '@S/header-icon-source';
import { settingsBtnStyles as styles } from './styles';

export default function SettingsBtn() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const isSettingsPage = pathname === `/${ROUTES.settings}`;

  return (
    <IconButton
      testID="settingsIcon"
      icon={getHeaderIconSource('cog-outline', 'gearshape')}
      animated
      iconColor={Platform.OS === 'ios' ? IOS_HEADER_ICON_COLOR : colors.primary}
      size={Platform.OS === 'ios' ? HEADER_ICON_SIZE : 26}
      style={styles.iconButton}
      onPress={() => {
        if (!isSettingsPage) push(`/${ROUTES.settings}`);
      }}
    />
  );
}
