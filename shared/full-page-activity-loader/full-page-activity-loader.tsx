import { useColorScheme, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { COLORS } from '@const/theme-colors';
import { useAppSelector } from '@R/typed-hooks';

export default function FullPageActivityLoader() {
  const systemColorScheme = useColorScheme();
  const { theme } = useAppSelector(({ settings }) => settings);
  const isDark = theme ? theme === 'dark' : systemColorScheme === 'dark';
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
      <ActivityIndicator testID="full-page-activity-loader" size="large" color={themeColors.primary} />
    </View>
  );
}
