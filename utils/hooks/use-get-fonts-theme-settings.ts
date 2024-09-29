import { FontAwesome } from '@expo/vector-icons';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
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


  const { theme } = useMaterial3Theme();
  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { unstable_settings, loaded, theme };
}
