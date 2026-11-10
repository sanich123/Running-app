import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import {
  ACTIVITY_HEADER_BUTTON_SIZE,
  IOS_ACTIVITY_HEADER_ICON_COLOR,
  getActivityHeaderButtonStyle,
  isActivityHeaderButtonTap,
} from '@Routes/activity/const';

export default function ActivityRoutesButton() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);

  function openRoutes() {
    push(`/${ROUTES.routes}`);
  }

  return Platform.OS === 'ios' ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={LABELS[language].routes}
      onPress={openRoutes}
      style={styles.iosHeaderButton}
      testID="activity-routes-button">
      <SymbolView name="map" size={23} tintColor={IOS_ACTIVITY_HEADER_ICON_COLOR} weight="medium" />
    </Pressable>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={LABELS[language].routes}
      android_ripple={{ color: colors.onSurface, radius: ACTIVITY_HEADER_BUTTON_SIZE / 2 }}
      onPress={(event) => {
        if (isActivityHeaderButtonTap(event)) {
          openRoutes();
        }
      }}
      style={getActivityHeaderButtonStyle(colors.surface, colors.outlineVariant)}
      testID="activity-routes-button">
      <Icon source="map-marker-path" size={24} color={colors.onSurface} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iosHeaderButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
});
