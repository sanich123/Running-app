import { AuthProvider } from '@A/context/auth-context';
import { persistor, store } from '@R/store';
import { Slot } from 'expo-router';
import { useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { COLORS } from '@const/theme-colors';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@const/toast-config';

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
    <PersistGate
      loading={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }
      persistor={persistor}>
      <Provider store={store}>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <KeyboardProvider>
                <SystemBars style="auto" />
                <PaperProvider theme={paperTheme}>
                  <Toast visibilityTime={3000} topOffset={90} config={toastConfig} />
                  <Slot />
                </PaperProvider>
              </KeyboardProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </Provider>
    </PersistGate>
  );
}
