import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { AppRegistry } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { enGB, registerTranslation } from 'react-native-paper-dates';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { expo as appName } from '../../project/app.json';
import { AuthProvider } from '../auth/context/auth-context';
import SplashIcon from '../components/splash-screen/splash-screen';
import { persistor, store } from '../redux/store';
import { useGetFontsThemeSettings } from '../utils/hooks/use-get-fonts-theme-settings';

export default function RootLayout() {
  const { loaded, colorScheme, theme } = useGetFontsThemeSettings();
  registerTranslation('en-GB', enGB);
  return (
    <>
      {!loaded && <SplashIcon />}
      {loaded && (
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <PaperProvider theme={theme}>
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

AppRegistry.registerComponent(appName.name, () => RootLayout);
