import { useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

export { ErrorBoundary } from 'expo-router';

export function useGetFontsThemeSettings() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { loaded };
}
