import { useEffect } from 'react';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Platform } from 'react-native';
import { toastConfig } from '@const/toast-config';
import { subscribeToPersistenceErrors } from '@R/persistence-errors';
import { persistor, store } from '@R/store';
import AppShell from '@Routes/root-layout/app-shell';
import { VideoPlaybackProvider } from '@S/card/media-list/video-playback-context';
import { errorToast } from '@S/error-toast/error-toast';
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
    ...(Platform.OS === 'web'
      ? {
          MaterialDesignIcons: require('@react-native-vector-icons/material-design-icons/fonts/MaterialDesignIcons.ttf'),
        }
      : {}),
  });

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (!fontsLoaded) return;

    return subscribeToPersistenceErrors(({ message, error }) => {
      try {
        errorToast(message, error);
      } catch {
        // Error reporting must not mask the persistence error.
      }
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<FullPageActivityLoader />} persistor={persistor}>
        <SafeAreaProvider>
          <VideoPlaybackProvider>
            <AppShell />
          </VideoPlaybackProvider>
          <Toast visibilityTime={2000} topOffset={90} config={toastConfig} />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
