import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import {
  ANDROID_ACTIVITY_HEADER_BACKGROUND_COLOR,
  ANDROID_ACTIVITY_HEADER_ICON_COLOR,
  ANDROID_ACTIVITY_HEADER_OUTLINE_COLOR,
  ACTIVITY_HEADER_BUTTON_SIZE,
  IOS_ACTIVITY_HEADER_ICON_COLOR,
  getActivityHeaderButtonStyle,
  isActivityHeaderButtonTap,
} from '@Routes/activity/const';

export default function ActivityRoutesButton() {
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
      <SymbolView name="map" size={24} tintColor={IOS_ACTIVITY_HEADER_ICON_COLOR} weight="medium" />
    </Pressable>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={LABELS[language].routes}
      android_ripple={{ color: ANDROID_ACTIVITY_HEADER_OUTLINE_COLOR, radius: ACTIVITY_HEADER_BUTTON_SIZE / 2 }}
      onPress={(event) => {
        if (isActivityHeaderButtonTap(event)) {
          openRoutes();
        }
      }}
      style={getActivityHeaderButtonStyle(
        ANDROID_ACTIVITY_HEADER_BACKGROUND_COLOR,
        ANDROID_ACTIVITY_HEADER_OUTLINE_COLOR,
      )}
      testID="activity-routes-button">
      <Icon source="map-marker-path" size={24} color={ANDROID_ACTIVITY_HEADER_ICON_COLOR} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iosHeaderButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
});
