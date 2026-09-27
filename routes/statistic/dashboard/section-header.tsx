import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';

export default function DashboardSectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontFamily: FONT_FAMILIES.extraBold },
});
