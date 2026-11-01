import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { IOS_ACTIVITY_HEADER_ICON_COLOR } from '@Routes/activity/const';
import { getMapControlButtonStyle } from '@S/map-control-button/const';

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
    <IconButton
      accessibilityLabel={LABELS[language].routes}
      containerColor={colors.surface}
      icon="map-marker-path"
      iconColor={colors.onSurface}
      mode="contained-tonal"
      onPress={openRoutes}
      size={24}
      style={getMapControlButtonStyle(40, colors.surface, colors.outlineVariant)}
      testID="activity-routes-button"
    />
  );
}

const styles = StyleSheet.create({
  iosHeaderButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
});
