import { persistor, store } from '@R/store';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { COLORS } from '@const/theme-colors';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@const/toast-config';
import FullPageActivityLoader from '@C/shared/full-page-activity-loader/full-page-activity-loader';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 1500,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme =
    colorScheme === 'dark' ? { ...MD3DarkTheme, colors: COLORS.dark } : { ...MD3LightTheme, colors: COLORS.light };

  return (
    <PersistGate loading={<FullPageActivityLoader />} persistor={persistor}>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <KeyboardProvider>
              <SystemBars style="auto" />
              <PaperProvider theme={paperTheme}>
                <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
                  <Stack.Screen name="(protected)" />
                  <Stack.Screen name="sign-in" />
                  <Stack.Screen
                    name="confirm-email"
                    options={{
                      presentation: 'modal',
                      headerTitle: 'Confirm Email',
                      gestureEnabled: true,
                    }}
                  />
                  <Stack.Screen
                    name="need-to-confirm-email"
                    options={{
                      presentation: 'modal',
                      headerTitle: 'Need to confirm email',
                      gestureEnabled: true,
                    }}
                  />
                  <Stack.Screen
                    name="reset-password"
                    options={{
                      presentation: 'modal',
                      headerTitle: 'Reset password',
                      gestureEnabled: true,
                    }}
                  />
                </Stack>
                <Toast visibilityTime={2000} topOffset={90} config={toastConfig} />
              </PaperProvider>
            </KeyboardProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </Provider>
    </PersistGate>
  );
}
