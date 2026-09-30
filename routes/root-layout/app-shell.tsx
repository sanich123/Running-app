import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  MaterialDesignIcons,
  type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons/static';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, useColorScheme } from 'react-native';
import { Redirect, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { configureFonts, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { COLORS } from '@const/theme-colors';
import { useAppSelector } from '@R/typed-hooks';
import SubscriptionStatusSync from '@Routes/subscription/subscription-status-sync';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';
import useAppInitialization from '@U/hooks/use-app-initialization';
import { LazySaveBtn, LazyUsersSettingsIcons, PUBLIC_ROUTES } from './const';
import LazyHeader from './lazy-header';

export default function AppShell() {
  useAppInitialization();
  const systemColorScheme = useColorScheme();
  const { theme } = useAppSelector(({ settings }) => settings);
  const { accessToken, refreshToken } = useAppSelector(({ auth }) => auth);
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

  if (!accessToken && !refreshToken && !PUBLIC_ROUTES.has(pathname)) {
    return <Redirect href={`/${ROUTES.signIn}`} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <SystemBars style="auto" />
          <PaperProvider
            theme={paperTheme}
            settings={{
              icon: ({ name, color, size, direction, testID }) => (
                <MaterialDesignIcons
                  name={name as MaterialDesignIconsIconName}
                  color={color}
                  size={size}
                  testID={testID}
                  style={{
                    transform: [{ scaleX: direction === 'rtl' ? -1 : 1 }],
                    lineHeight: size,
                  }}
                />
              ),
            }}>
            <BottomSheetModalProvider>
              <SubscriptionStatusSync />
              <Stack
                screenOptions={{
                  gestureEnabled: false,
                  contentStyle: { backgroundColor: appColors.background },
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
                <Stack.Screen
                  name={ROUTES.tabs}
                  options={{ headerShown: false, title: 'Главная', animation: 'none' }}
                />
                <Stack.Screen name={ROUTES.signIn} options={{ headerShown: false, animation: 'none' }} />
                <Stack.Screen
                  name={ROUTES.feedback}
                  options={{ title: language === 'russian' ? 'Обратная связь' : 'Feedback' }}
                />
                <Stack.Screen name={ROUTES.loginFromUrl} options={{ headerShown: false, animation: 'none' }} />
                <Stack.Screen
                  name={ROUTES.privacyPolicy}
                  options={{ title: 'Политика в отношении обработки персональных данных' }}
                />
                <Stack.Screen name={ROUTES.legalInformation} options={{ title: 'Юридическая информация' }} />
                <Stack.Screen
                  name={ROUTES.privacyPolicyEnglish}
                  options={{ title: 'Personal Data Processing Policy' }}
                />
                <Stack.Screen name={ROUTES.consents} options={{ title: 'Согласие на обработку персональных данных' }} />
                <Stack.Screen
                  name={ROUTES.consentsEnglish}
                  options={{ title: 'Consent to Personal Data Processing' }}
                />
                <Stack.Screen name={ROUTES.userAgreement} options={{ title: 'Пользовательское соглашение' }} />
                <Stack.Screen name={ROUTES.userAgreementEnglish} options={{ title: 'User Agreement' }} />
                <Stack.Screen
                  name={ROUTES.locationConsent}
                  options={{ title: 'Согласие на обработку  данных геолокации' }}
                />
                <Stack.Screen name={ROUTES.locationConsentEnglish} options={{ title: 'Location Consent' }} />
                <Stack.Screen name={ROUTES.accountDeletion} options={{ title: 'Удаление аккаунта' }} />
                <Stack.Screen name={ROUTES.accountDeletionEnglish} options={{ title: 'Account Deletion' }} />
                <Stack.Screen name={ROUTES.legalInformationEnglish} options={{ title: 'Legal Information' }} />
                <Stack.Screen name={ROUTES.legal} options={{ title: 'Юридическая информация' }} />
                <Stack.Screen name={ROUTES.maintenance} options={{ headerShown: false }} />
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
                <Stack.Screen name={`${ROUTES.media}/${ROUTES.photoUrl}`} options={{ headerShown: false }} />
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
            </BottomSheetModalProvider>
          </PaperProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
