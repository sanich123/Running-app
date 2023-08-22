import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { AppRegistry } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';

import { expo as appName } from '../../project/app.json';
import { AuthProvider } from '../auth/context/auth-context';
import SplashIcon from '../components/splash-screen/splash-screen';
import { store } from '../redux/store';
import { useGetFontsThemeSettings } from '../utils/hooks/use-get-fonts-theme-settings';

export default function RootLayout() {
  const { loaded, colorScheme, theme } = useGetFontsThemeSettings();

  return (
    <>
      {!loaded && <SplashIcon />}
      {loaded && (
        <Provider store={store}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <PaperProvider theme={theme}>
              <AuthProvider>
                <Slot />
              </AuthProvider>
            </PaperProvider>
          </ThemeProvider>
        </Provider>
      )}
    </>
  );
}

AppRegistry.registerComponent(appName.name, () => RootLayout);
