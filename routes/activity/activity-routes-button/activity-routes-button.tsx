import { SymbolView } from 'expo-symbols';
import { Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { MAP_CONTROL_BUTTON_BACKGROUND } from '@S/map-control-button/const';

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
      style={{
        alignItems: 'center',
        backgroundColor: MAP_CONTROL_BUTTON_BACKGROUND,
        borderRadius: 20,
        height: 40,
        justifyContent: 'center',
        width: 40,
      }}
      testID="activity-routes-button">
      <SymbolView name="map" size={23} tintColor={colors.primary} weight="medium" />
    </Pressable>
  ) : (
    <IconButton
      accessibilityLabel={LABELS[language].routes}
      containerColor={MAP_CONTROL_BUTTON_BACKGROUND}
      icon="map-marker-path"
      iconColor={colors.primary}
      mode="contained-tonal"
      onPress={openRoutes}
      size={24}
      style={{ margin: 0 }}
      testID="activity-routes-button"
    />
  );
}
