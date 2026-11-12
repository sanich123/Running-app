import { View, StyleSheet } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import type { ViewWithIconProps } from '../../../types';

export default function ViewWithIcon({ icon, subtitle, title }: ViewWithIconProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={[styles.icon, { backgroundColor: colors.primaryContainer }]}>
        <Icon source={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text variant="titleSmall">{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', gap: 8, minWidth: 0 },
  icon: { alignItems: 'center', borderRadius: 11, height: 34, justifyContent: 'center', width: 34 },
  copy: { flex: 1, gap: 2, minWidth: 0 },
});
