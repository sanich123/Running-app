import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { AppRegistry } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';

import { expo as appName } from '../../project/app.json';
import SplashIcon from '../components/splash-screen/splash-screen';
import { useGetFontsThemeSettings } from '../hooks/use-get-fonts-theme-settings';
import { store } from '../redux/store';

export default function RootLayout() {
  const { loaded, colorScheme, theme } = useGetFontsThemeSettings();
  return (
    <>
      {!loaded && <SplashIcon />}
      {loaded && (
        <Provider store={store}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <PaperProvider theme={theme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
            </PaperProvider>
          </ThemeProvider>
        </Provider>
      )}
    </>
  );
}

AppRegistry.registerComponent(appName.name, () => RootLayout);
