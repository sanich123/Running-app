import type { ReactNode } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

interface SettingsRowProps {
  testID?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  onPress?: () => void;
  leading?: ReactNode;
  right?: ReactNode;
  destructive?: boolean;
}

export default function SettingsRow({
  testID,
  icon,
  title,
  description,
  onPress,
  leading,
  right,
  destructive,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const content = (
    <View style={styles.content}>
      {icon && (
        <View style={[styles.icon, { backgroundColor: destructive ? colors.errorContainer : colors.primaryContainer }]}>
          <MaterialCommunityIcons name={icon} size={21} color={destructive ? colors.error : colors.primary} />
        </View>
      )}
      {leading && <View style={styles.leading}>{leading}</View>}
      <View style={styles.copy}>
        <Text variant="titleMedium" style={{ color: destructive ? colors.error : colors.onSurface }}>
          {title}
        </Text>
        {description && (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 2 }}>
            {description}
          </Text>
        )}
      </View>
      {right}
    </View>
  );

  return (
    <TouchableRipple
      testID={testID}
      borderless
      onPress={onPress}
      rippleColor={colors.primaryContainer}
      style={[styles.container, { backgroundColor: colors.surface }]}>
      {content}
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
    borderRadius: 18,
    overflow: 'hidden',
  },
  content: {
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  leading: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 8 : 0,
  },
});
