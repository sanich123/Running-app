import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { COLORS } from '@const/theme-colors';

export default function FullPageActivityLoader() {
  const systemColorScheme = useColorScheme();
  const [storedTheme, setStoredTheme] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('persist:root')
      .then((persistedState) => {
        if (!persistedState) return;
        const languageState = JSON.parse(persistedState).language;
        const theme = languageState ? JSON.parse(languageState).theme : null;
        setStoredTheme(theme);
      })
      .catch(() => undefined);
  }, []);

  const isDark = storedTheme ? storedTheme === 'dark' : systemColorScheme === 'dark';
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
      <ActivityIndicator size="large" color={themeColors.primary} />
    </View>
  );
}
