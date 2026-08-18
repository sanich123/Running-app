import { lazy, Suspense } from 'react';
import { Platform } from 'react-native';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import {
  getProfileFormValues,
  type ProfileSettingsSearchParams,
} from '@Routes/profile/profile-settings/profile-settings-params';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';
const LazyProfileEditBtn = lazy(() => import('@Routes/profile/edit-btn/edit-btn'));
const LazyProfileUpdateBtn = lazy(() => import('@Routes/profile/update-btn/update-btn'));

export default function ProfileStack() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const profileFormValues = getProfileFormValues(
    useGlobalSearchParams() as Partial<ProfileSettingsSearchParams>,
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: {
          color: colors.primary,
          fontFamily: FONT_FAMILIES.semiBold,
          fontSize: 16,
        },
        title: LABELS[language].profile,
        headerTitle:
          Platform.OS === 'web' ? ({ children }) => <FeedHeaderTitle>{children}</FeedHeaderTitle> : undefined,
      }}>
      <Stack.Screen
        name={`${ROUTES.index}`}
        options={{
          headerRight: () =>
            userId && (
              <Suspense fallback={null}>
                <LazyProfileEditBtn />
              </Suspense>
            ),
        }}
      />
      <Stack.Screen
        name={`${ROUTES.profileSettings}/${ROUTES.index}`}
        options={{
          title: LABELS[language].profileSettings,
          headerRight: () =>
            userId && (
              <Suspense fallback={null}>
                <LazyProfileUpdateBtn formValues={profileFormValues} />
              </Suspense>
            ),
        }}
      />
    </Stack>
  );
}
