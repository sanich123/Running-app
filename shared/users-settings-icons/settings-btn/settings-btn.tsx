import { Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { settingsBtnStyles as styles } from './styles';

export default function SettingsBtn() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const isSettingsPage = pathname === `/${ROUTES.settings}`;

  return (
    <IconButton
      testID="settingsIcon"
      icon="cog-outline"
      animated
      iconColor={colors.primary}
      size={Platform.OS === 'ios' ? 22 : 26}
      style={styles.iconButton}
      onPress={() => {
        if (!isSettingsPage) push(`/${ROUTES.settings}`);
      }}
    />
  );
}
