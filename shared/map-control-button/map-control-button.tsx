import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Icon, useTheme } from 'react-native-paper';
import { getMapControlButtonSize, getMapControlButtonStyle } from './const';
import type { MapControlButtonProps } from './types';

export default function MapControlButton({
  accessibilityLabel,
  androidIcon,
  iosSymbol,
  androidOverlayIcon,
  iosOverlaySymbol,
  onPress,
  testID,
  disabled = false,
  iconColor,
  loading = false,
  loadingTestID,
  selected = false,
}: MapControlButtonProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const buttonSize = getMapControlButtonSize(width);
  const iconSize = Math.round(buttonSize * 0.43);
  const resolvedIconColor = iconColor ?? colors.onSurface;
  const isUnavailable = disabled || loading;
  const hasOverlayIcon = Boolean(androidOverlayIcon || iosOverlaySymbol);
  const buttonStyle = [
    getMapControlButtonStyle(buttonSize, colors.surface, colors.outlineVariant),
    {
      borderColor: selected ? colors.primary : colors.outlineVariant,
      borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
      opacity: isUnavailable ? 0.45 : 1,
    },
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isUnavailable, selected }}
      android_ripple={Platform.OS === 'android' ? { color: colors.onSurface, radius: buttonSize / 2 } : undefined}
      disabled={isUnavailable}
      onPress={onPress}
      style={buttonStyle}
      testID={testID}>
      {loading ? (
        <ActivityIndicator size="small" color={resolvedIconColor} testID={loadingTestID} />
      ) : hasOverlayIcon ? (
        <View style={[styles.compositeIcon, { height: iconSize + 8, width: iconSize + 8 }]}>
          {Platform.OS === 'ios' ? (
            <SymbolView name={iosSymbol} size={iconSize} tintColor={resolvedIconColor} weight="medium" />
          ) : (
            <Icon source={androidIcon} size={iconSize} color={resolvedIconColor} />
          )}
          <View style={[styles.iconBadge, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            {Platform.OS === 'ios' ? (
              <SymbolView
                name={iosOverlaySymbol ?? 'arrow.down'}
                size={10}
                tintColor={colors.onSurface}
                weight="semibold"
              />
            ) : (
              <Icon source={androidOverlayIcon ?? 'download'} size={11} color={colors.onSurface} />
            )}
          </View>
        </View>
      ) : Platform.OS === 'ios' ? (
        <SymbolView name={iosSymbol} size={iconSize} tintColor={resolvedIconColor} weight="medium" />
      ) : (
        <Icon source={androidIcon} size={iconSize} color={resolvedIconColor} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compositeIcon: { alignItems: 'center', justifyContent: 'center' },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: -2,
    height: 15,
    justifyContent: 'center',
    position: 'absolute',
    right: -3,
    width: 15,
  },
});
