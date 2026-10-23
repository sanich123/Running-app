import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { toastConfig } from '@const/toast-config';
import { subscribeToPersistenceErrors } from '@R/persistence-errors';
import { persistor, store } from '@R/store';
import AppShell from '@Routes/root-layout/app-shell/app-shell';
import VideoPlaybackProvider from '@S/card/media-list/video-playback-provider/video-playback-provider';
import { errorToast } from '@S/error-toast/error-toast';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';
import useAppFonts from '@U/hooks/use-app-fonts';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 1500,
  fade: true,
});

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

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
