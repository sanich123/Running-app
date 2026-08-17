import { lazy, Suspense, useEffect } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
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
import { Platform, useColorScheme } from 'react-native';
import { Redirect, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { configureFonts, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { COLORS } from '@const/theme-colors';
import { toastConfig } from '@const/toast-config';
import { persistor, store } from '@R/store';
import { useAppSelector } from '@R/typed-hooks';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';
import useAppInitialization from '@U/hooks/use-app-initialization';

const LazySaveBtn = lazy(() => import('@Routes/activity/save-btn/save-btn'));
const LazyUsersSettingsIcons = lazy(() => import('@S/users-settings-icons/users-settings-icons'));

const PUBLIC_ROUTES = new Set([
  `/${ROUTES.signIn}`,
  `/${ROUTES.loginFromUrl}`,
  `/${ROUTES.confirmEmailCode}`,
  `/${ROUTES.changePassword}`,
  `/${ROUTES.privacyPolicy}`,
  `/${ROUTES.legalInformation}`,
  `/${ROUTES.maintenance}`,
  `/${ROUTES.updateApp}`,
]);

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

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

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
  useAppInitialization();
  const systemColorScheme = useColorScheme();
  const { theme } = useAppSelector(({ settings }) => settings);
  const { accessToken } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { cameraVisible } = useGlobalSearchParams<{ cameraVisible?: string | string[] }>();
  const isCameraVisible = Array.isArray(cameraVisible) ? cameraVisible[0] === 'true' : cameraVisible === 'true';
  const pathname = usePathname();
  const colorScheme = theme ?? systemColorScheme;
  const appColors = colorScheme === 'dark' ? COLORS.dark : COLORS.light;
  const fonts = configureFonts({ config: { fontFamily: FONT_FAMILIES.regular } });
  const paperTheme =
    colorScheme === 'dark'
      ? { ...MD3DarkTheme, roundness: 2, fonts, colors: appColors }
      : { ...MD3LightTheme, roundness: 2, fonts, colors: appColors };

  if (!accessToken && !PUBLIC_ROUTES.has(pathname)) {
    return <Redirect href={`/${ROUTES.signIn}`} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <SystemBars style="auto" />
          <PaperProvider theme={paperTheme}>
            <BottomSheetModalProvider>
              <Stack
                screenOptions={{
                  gestureEnabled: false,
                  headerTitle:
                    Platform.OS === 'web' ? ({ children }) => <FeedHeaderTitle>{children}</FeedHeaderTitle> : undefined,
                  headerStyle: { backgroundColor: appColors.surface },
                  headerTintColor: appColors.onSurface,
                  headerTitleStyle: {
                    color: appColors.primary,
                    fontFamily: FONT_FAMILIES.semiBold,
                    fontSize: 16,
                  },
                }}>
                <Stack.Screen name={ROUTES.tabs} options={{ headerShown: false, title: 'Главная' }} />
                <Stack.Screen name={ROUTES.signIn} options={{ headerShown: false }} />
                <Stack.Screen name={ROUTES.feedback} options={{ title: 'Обратная связь' }} />
                <Stack.Screen name={ROUTES.loginFromUrl} options={{ headerShown: false }} />
                <Stack.Screen name={ROUTES.privacyPolicy} options={{ title: 'Политика конфиденциальности' }} />
                <Stack.Screen name={ROUTES.legalInformation} options={{ title: 'Юридическая информация' }} />
                <Stack.Screen name={ROUTES.maintenance} options={{ headerShown: false }} />
                <Stack.Screen
                  name={`${ROUTES.comment}/${ROUTES.routeId}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].comment,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.activity}/${ROUTES.routeId}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].activity,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.followers}/${ROUTES.routeId}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].followers,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.following}/${ROUTES.routeId}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].followings,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.likes}/${ROUTES.routeId}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].likes,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.map}/${ROUTES.routeId}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].map,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.media}/${ROUTES.photoUrl}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].photo,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.mediaGrid}/${ROUTES.routeId}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].photos,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.profile}/${ROUTES.routeId}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].profile,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.manualActivity}/${ROUTES.index}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazySaveBtn} />,
                    title: '',
                    headerShown: !isCameraVisible,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.settings}/${ROUTES.index}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].settings,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.users}/${ROUTES.index}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].users,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.monthStatistics}/${ROUTES.index}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].statistics,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.activitiesList}/${ROUTES.routeIds}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].activities,
                  }}
                />
                <Stack.Screen
                  name={`${ROUTES.migration}/${ROUTES.index}`}
                  options={{
                    headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                    title: LABELS[language].migration,
                  }}
                />
              </Stack>
              <Toast visibilityTime={2000} topOffset={90} config={toastConfig} />
            </BottomSheetModalProvider>
          </PaperProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function LazyHeader({ component: Component }: { component: LazyExoticComponent<ComponentType> }) {
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}
