import { Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { getHeaderIconSource, HEADER_ICON_SIZE } from '@S/header-icon-source';
import { getSingleActionButtonStyle, isSingleActionButtonPress } from '../const';
import { usersSettingsIconsStyles } from '../styles';
import { settingsBtnStyles as styles } from './styles';

export default function SettingsBtn({ iconSize }: { iconSize?: number }) {
  const { colors, dark } = useTheme();
  const isIOS = Platform.OS === 'ios';
  const resolvedIconSize = iconSize ?? (isIOS ? HEADER_ICON_SIZE : 26);
  const { push } = useRouter();
  const pathname = usePathname();
  const isSettingsPage = pathname === `/${ROUTES.settings}`;
  const iconButtonStyle = iconSize
    ? [styles.iconButton, usersSettingsIconsStyles.singleActionButton, getSingleActionButtonStyle(dark)]
    : styles.iconButton;

  return (
    <IconButton
      testID="settingsIcon"
      icon={getHeaderIconSource('cog-outline', 'gearshape', colors.onSurface, resolvedIconSize)}
      animated
      iconColor={isIOS ? colors.onSurface : colors.primary}
      size={resolvedIconSize}
      style={iconButtonStyle}
      onPress={(event) => {
        if (iconSize && !isSingleActionButtonPress(event)) return;
        if (!isSettingsPage) push(`/${ROUTES.settings}`);
      }}
    />
  );
}
