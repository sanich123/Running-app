import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  MaterialDesignIcons,
  type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons/static';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, Text, useColorScheme } from 'react-native';
import { Redirect, Stack, usePathname, useRouter } from 'expo-router';
import { configureFonts, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { COLORS } from '@const/theme-colors';
import { useAppSelector } from '@R/typed-hooks';
import HealthConnectAutoSync from '@Routes/watch-import/health-connect-auto-sync/health-connect-auto-sync';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';
import { IOS_HEADER_ITEM_SPACING, IOS_HEADER_ITEM_WIDTH_PROPS } from '@S/header-toolbar-const';
import useAppInitialization from '@U/hooks/use-app-initialization';
import { LazyUsersSettingsIcons, PUBLIC_ROUTES } from '../const';
import LazyHeader from '../lazy-header/lazy-header';
import NATIVE_RUNTIMES from '../native-runtimes';
import NavigationBar from '../navigation-bar/navigation-bar';
import { getRootScreenContentStyle } from '../screen-content-style';
import SubscriptionStatusRuntime from '../subscription-status-runtime/subscription-status-runtime';

export default function AppShell() {
  useAppInitialization();
  const systemColorScheme = useColorScheme();
  const { theme } = useAppSelector(({ settings }) => settings);
  const { accessToken, refreshToken } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const labels = LABELS[language];
  const { push } = useRouter();
  const pathname = usePathname();
  const hasSession = Boolean(accessToken || refreshToken);
  const colorScheme = theme ?? systemColorScheme;
  const appColors = colorScheme === 'dark' ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();
  const fonts = configureFonts({ config: { fontFamily: FONT_FAMILIES.regular } });
  const paperTheme =
    colorScheme === 'dark'
      ? { ...MD3DarkTheme, roundness: 2, fonts, colors: appColors }
      : { ...MD3LightTheme, roundness: 2, fonts, colors: appColors };
  const getUsersSettingsToolbar = (showUsers: boolean, showSettings: boolean) =>
    Platform.OS === 'ios' ? (
      <Stack.Toolbar placement="right">
        {showUsers ? (
          <Stack.Toolbar.Button
            {...IOS_HEADER_ITEM_WIDTH_PROPS}
            icon="person.2"
            accessibilityLabel={labels.users}
            tintColor={appColors.onSurface}
            onPress={() => push(`/${ROUTES.users}` as never)}
          />
        ) : null}
        {showUsers && showSettings ? <Stack.Toolbar.Spacer width={IOS_HEADER_ITEM_SPACING} /> : null}
        {showSettings ? (
          <Stack.Toolbar.Button
            {...IOS_HEADER_ITEM_WIDTH_PROPS}
            icon="gearshape"
            accessibilityLabel={labels.settings}
            tintColor={appColors.onSurface}
            onPress={() => push(`/${ROUTES.settings}` as never)}
          />
        ) : null}
      </Stack.Toolbar>
    ) : null;

  if (!hasSession && !PUBLIC_ROUTES.has(pathname)) {
    return (
      <Redirect
        href={
          pathname === `/${ROUTES.admin}` || /^\/groups\/[0-9a-f-]+\/requests$/i.test(pathname)
            ? { pathname: `/${ROUTES.signIn}`, params: { returnTo: pathname } }
            : `/${ROUTES.signIn}`
        }
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        {NATIVE_RUNTIMES.map(({ id, component: Runtime }) => (
          <Runtime key={id} />
        ))}
        <StatusBar style="auto" />
        {Platform.OS === 'android' ? <NavigationBar /> : null}
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
            <SubscriptionStatusRuntime />
            <HealthConnectAutoSync />
            <Stack
              screenOptions={({ route, navigation }) => ({
                gestureEnabled: false,
                headerBackButtonDisplayMode: Platform.OS === 'ios' || Platform.OS === 'web' ? 'minimal' : 'default',
                headerBackVisible: Platform.OS === 'android' && route.name !== `${ROUTES.map}/[id]` ? false : undefined,
                headerLeft:
                  Platform.OS === 'android' && route.name !== `${ROUTES.map}/[id]`
                    ? ({ canGoBack, tintColor }) =>
                        canGoBack ? (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={LABELS[language].back}
                            hitSlop={8}
                            onPress={() => navigation.goBack()}
                            style={{ alignItems: 'flex-start', height: 48, justifyContent: 'center', width: 32 }}>
                            <MaterialDesignIcons name="arrow-left" color={tintColor ?? appColors.onSurface} size={24} />
                          </Pressable>
                        ) : null
                    : undefined,
                contentStyle: getRootScreenContentStyle({
                  backgroundColor: appColors.background,
                  bottomInset: insets.bottom,
                  platform: Platform.OS,
                  routeName: route.name,
                }),
                headerTitle:
                  Platform.OS === 'web'
                    ? ({ children }) => <FeedHeaderTitle>{children}</FeedHeaderTitle>
                    : Platform.OS === 'android'
                      ? ({ children }) => (
                          <Text
                            numberOfLines={1}
                            style={{
                              color: appColors.primary,
                              fontFamily: FONT_FAMILIES.semiBold,
                              fontSize: 16,
                              transform: [{ translateY: -2 }],
                            }}>
                            {children}
                          </Text>
                        )
                      : undefined,
                headerStyle: { backgroundColor: appColors.surface },
                headerTintColor: appColors.onSurface,
                headerUserInterfaceStyle: colorScheme === 'dark' ? 'dark' : 'light',
                headerTitleStyle: {
                  color: appColors.primary,
                  fontFamily: FONT_FAMILIES.semiBold,
                  fontSize: 16,
                },
              })}>
              <Stack.Screen name={ROUTES.tabs} options={{ headerShown: false, title: 'Главная', animation: 'none' }} />
              <Stack.Screen name={ROUTES.maps} options={{ title: labels.maps }} />
              <Stack.Screen name={ROUTES.routes} options={{ title: labels.routes }} />
              <Stack.Screen name={ROUTES.favoriteActivities} options={{ title: LABELS[language].favoriteActivities }} />
              <Stack.Screen name={ROUTES.admin} options={{ title: LABELS[language].admin }} />
              <Stack.Screen name={ROUTES.notifications} options={{ title: LABELS[language].notifications }} />
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
              <Stack.Screen name={ROUTES.privacyPolicyEnglish} options={{ title: 'Personal Data Processing Policy' }} />
              <Stack.Screen name={ROUTES.consents} options={{ title: 'Согласие на обработку персональных данных' }} />
              <Stack.Screen name={ROUTES.consentsEnglish} options={{ title: 'Consent to Personal Data Processing' }} />
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
                  title: LABELS[language].activity,
                }}
              />
              <Stack.Screen
                name={`${ROUTES.followers}/${ROUTES.routeId}`}
                options={{
                  headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                  title: LABELS[language].followers,
                }}>
                {getUsersSettingsToolbar(true, true)}
              </Stack.Screen>
              <Stack.Screen
                name={`${ROUTES.following}/${ROUTES.routeId}`}
                options={{
                  headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                  title: LABELS[language].followings,
                }}>
                {getUsersSettingsToolbar(true, true)}
              </Stack.Screen>
              <Stack.Screen
                name={`${ROUTES.likes}/${ROUTES.routeId}`}
                options={{
                  headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                  title: LABELS[language].likes,
                }}>
                {getUsersSettingsToolbar(true, true)}
              </Stack.Screen>
              <Stack.Screen
                name={`${ROUTES.map}/${ROUTES.routeId}`}
                options={{
                  title: LABELS[language].map,
                }}
              />
              <Stack.Screen name={`${ROUTES.media}/${ROUTES.photoUrl}`} options={{ headerShown: false }} />
              <Stack.Screen
                name={`${ROUTES.mediaGrid}/${ROUTES.routeId}`}
                options={{
                  headerBackButtonDisplayMode: 'minimal',
                  headerTitle: LABELS[language].photos,
                }}
              />
              <Stack.Screen
                name={`${ROUTES.profile}/${ROUTES.routeId}`}
                options={{
                  headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                  headerTitle: LABELS[language].profile,
                  title: LABELS[language].profile,
                }}>
                {getUsersSettingsToolbar(false, true)}
              </Stack.Screen>
              <Stack.Screen name={`${ROUTES.manualActivity}/${ROUTES.index}`} options={{ title: '' }} />
              <Stack.Screen
                name={`${ROUTES.settings}/${ROUTES.index}`}
                options={{
                  headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                  title: LABELS[language].settings,
                }}>
                {getUsersSettingsToolbar(true, false)}
              </Stack.Screen>
              <Stack.Screen
                name={`${ROUTES.settings}/${ROUTES.notificationSettings}/${ROUTES.index}`}
                options={{ title: LABELS[language].notificationSettings }}
              />
              <Stack.Screen
                name={`${ROUTES.settings}/${ROUTES.profilePrivacySettings}/${ROUTES.index}`}
                options={{ title: LABELS[language].profilePrivacySettings }}
              />
              <Stack.Screen
                name={`${ROUTES.settings}/${ROUTES.profilePrivacySettings}/${ROUTES.profilePrivacyPreviews}`}
                options={{ title: LABELS[language].profilePrivacyPreviews }}
              />
              <Stack.Screen
                name={`${ROUTES.users}/${ROUTES.index}`}
                options={{
                  headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                  title: LABELS[language].users,
                }}>
                {getUsersSettingsToolbar(false, true)}
              </Stack.Screen>
              <Stack.Screen
                name={`${ROUTES.monthStatistics}/${ROUTES.index}`}
                options={{
                  headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                  title: LABELS[language].statistics,
                }}>
                {getUsersSettingsToolbar(true, true)}
              </Stack.Screen>
              <Stack.Screen
                name={`${ROUTES.activitiesList}/${ROUTES.routeIds}`}
                options={{
                  headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                  title: LABELS[language].activities,
                }}>
                {getUsersSettingsToolbar(true, true)}
              </Stack.Screen>
              <Stack.Screen
                name={`${ROUTES.migration}/${ROUTES.index}`}
                options={{
                  headerRight: () => <LazyHeader component={LazyUsersSettingsIcons} />,
                  title: LABELS[language].migration,
                }}>
                {getUsersSettingsToolbar(true, true)}
              </Stack.Screen>
            </Stack>
          </BottomSheetModalProvider>
        </PaperProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
