import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { AppRegistry, View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';

import { expo as appName } from '../../project/app.json';
import SplashIcon from '../components/splash-screen/splash-screen';
import { currentAuth } from '../firebaseConfig';
import { useGetFontsThemeSettings } from '../hooks/use-get-fonts-theme-settings';
import { store } from '../redux/store';

export default function RootLayout() {
  const { loaded, colorScheme, theme } = useGetFontsThemeSettings();
  const [user, error] = useAuthState(currentAuth);
  console.log(user);
  return (
    <>
      {!loaded && <SplashIcon />}
      {loaded && (
        <Provider store={store}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <PaperProvider theme={theme}>
              <Stack>
                {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                {/* <Stack.Screen name="(auth)" options={{ headerShown: false }} /> */}
              </Stack>
            </PaperProvider>
          </ThemeProvider>
        </Provider>
      )}
      {error && (
        <View>
          <Text>Sorry, during authorization an error occured</Text>
        </View>
      )}
    </>
  );
}

AppRegistry.registerComponent(appName.name, () => RootLayout);
