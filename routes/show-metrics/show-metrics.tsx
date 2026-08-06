import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';

export default function ShowMetrics({ title, metrics }: { title: string; metrics: string }) {
  const { colors } = useTheme();
  return (
    <View>
      <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
        {title}
      </Text>
      <Text variant="titleSmall" style={{ fontFamily: FONT_FAMILIES.semiBold }}>
        {metrics}
      </Text>
    </View>
  );
}
