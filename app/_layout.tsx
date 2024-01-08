import { AuthProvider } from '@auth/context/auth-context';
import SplashIcon from '@c/splash-screen/splash-screen';
import { persistor, store } from '@r/store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useGetFontsThemeSettings } from '@u/hooks/use-get-fonts-theme-settings';
import { Slot } from 'expo-router';
import { AppRegistry } from 'react-native';
import { ActivityIndicator, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import expo from '../app.config';
import { AuthProvider } from '../auth/context/auth-context';
import SplashIcon from '../components/splash-screen/splash-screen';
import { persistor, store } from '../redux/store';
import { useGetFontsThemeSettings } from '../utils/hooks/use-get-fonts-theme-settings';

export default function RootLayout() {
  const { loaded, colorScheme, theme } = useGetFontsThemeSettings();

  const paperTheme =
    colorScheme === 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light };
  return (
    <>
      {!loaded && <SplashIcon />}
      {loaded && (
        <Provider store={store}>
          <PersistGate loading={<ActivityIndicator size="large" />} persistor={persistor}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <PaperProvider theme={paperTheme}>
                <AuthProvider>
                  <Slot />
                </AuthProvider>
              </PaperProvider>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      )}
    </>
  );
}

AppRegistry.registerComponent(expo.expo.name, () => RootLayout);
