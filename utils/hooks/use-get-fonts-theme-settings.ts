import { FontAwesome } from '@expo/vector-icons';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
export { ErrorBoundary } from 'expo-router';

export function useGetFontsThemeSettings() {
  // eslint-disable-next-line camelcase
  const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '/(tabs)/home',
  };

  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { unstable_settings, loaded, colorScheme, theme };
}
