import { Platform, View } from 'react-native';
import { Badge, Icon, TouchableRipple, useTheme } from 'react-native-paper';
import { getHeaderIconSource, HEADER_ICON_SIZE } from '@S/header-icon-source';
import { NOTIFICATIONS_OVERFLOW_LABEL } from './const';
import { notificationsBtnStyles as styles } from './styles';
import useNotificationsButton from './use-notifications-button';

export default function NotificationsBtn() {
  const { colors } = useTheme();
  const { unreadCount, openNotifications } = useNotificationsButton();
  const isIOS = Platform.OS === 'ios';
  const iconSize = isIOS ? HEADER_ICON_SIZE : 26;
  const buttonRadius = (iconSize + 16) / 2;

  return (
    <TouchableRipple
      testID="notificationsIcon"
      style={[
        styles.button,
        {
          width: iconSize + 16,
          height: iconSize + 16,
          borderRadius: (iconSize + 16) / 2,
        },
      ]}
      borderless
      hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
      accessibilityRole="button"
      onPress={({ nativeEvent }) => {
        const x = nativeEvent.locationX ?? buttonRadius;
        const y = nativeEvent.locationY ?? buttonRadius;
        const hitRadius = buttonRadius + 10;
        const distanceFromCenter = Math.hypot(x - buttonRadius, y - buttonRadius);

        if (distanceFromCenter <= hitRadius) openNotifications();
      }}>
      <View pointerEvents="none" style={styles.contents}>
        <Icon
          source={getHeaderIconSource('bell-outline', 'bell', colors.onSurface)}
          color={Platform.OS === 'ios' ? colors.onSurface : colors.primary}
          size={iconSize}
        />
        {unreadCount > 0 ? (
          <Badge
            testID="notificationsBadge"
            size={16}
            style={[styles.badge, { backgroundColor: colors.primary, color: colors.onPrimary }]}>
            {unreadCount > 99 ? NOTIFICATIONS_OVERFLOW_LABEL : unreadCount}
          </Badge>
        ) : null}
      </View>
    </TouchableRipple>
  );
}
