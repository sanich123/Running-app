import { AuthProvider } from '@A/context/auth-context';
// import SplashIcon from '@C/splash-screen/splash-screen';
import { persistor, store } from '@R/store';
import { useGetFontsThemeSettings } from '@U/hooks/use-get-fonts-theme-settings';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { AppRegistry, View } from 'react-native';
import { ActivityIndicator, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { RootSiblingParent } from 'react-native-root-siblings';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import expo from '../app.config';

export default function RootLayout() {
  const { loaded, colorScheme, theme } = useGetFontsThemeSettings();

  const paperTheme =
    colorScheme === 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light };
  return (
    <>
      {!loaded ? (
        //были неполадки со splash-screen на preview ios, временно заменен на просто лоадер
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <Provider store={store}>
          <PersistGate loading={<ActivityIndicator size="large" />} persistor={persistor}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <PaperProvider theme={paperTheme}>
                <AuthProvider>
                  <RootSiblingParent>
                    <Slot />
                  </RootSiblingParent>
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
