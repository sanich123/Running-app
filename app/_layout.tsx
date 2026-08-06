import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { configureFonts, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { COLORS } from '@const/theme-colors';
import { toastConfig } from '@const/toast-config';
import { persistor, store } from '@R/store';
import { useAppSelector } from '@R/typed-hooks';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 1500,
  fade: true,
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_800ExtraBold,
  });
  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<FullPageActivityLoader />} persistor={persistor}>
        <AppShell />
      </PersistGate>
    </Provider>
  );
}

function AppShell() {
  const systemColorScheme = useColorScheme();
  const { theme } = useAppSelector(({ language }) => language);
  const colorScheme = theme ?? systemColorScheme;
  const fonts = configureFonts({ config: { fontFamily: FONT_FAMILIES.regular } });
  const paperTheme =
    colorScheme === 'dark'
      ? { ...MD3DarkTheme, roundness: 2, fonts, colors: COLORS.dark }
      : { ...MD3LightTheme, roundness: 2, fonts, colors: COLORS.light };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <SystemBars style="auto" />
          <PaperProvider theme={paperTheme}>
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
                <Stack.Screen name="(protected)" />
                <Stack.Screen name="sign-in" />
              </Stack>
              <Toast visibilityTime={2000} topOffset={90} config={toastConfig} />
            </BottomSheetModalProvider>
          </PaperProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
