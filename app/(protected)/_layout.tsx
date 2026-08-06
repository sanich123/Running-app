import { useEffect } from 'react';
import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import SaveBtn from '@Routes/activity/save-btn/save-btn';
import UsersSettingsIcons from '@Routes/users-settings-icons/users-settings-icons';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';
import useInitialState from '@U/hooks/use-initial-state';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function ProtectedLayout() {
  const { isLoading, isError, isUninitialized, isSuccess, hasAccessToken } = useInitialState();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { isCameraVisible } = useAppSelector(({ manualActivity }) => manualActivity);

  useEffect(() => {
    if (rootNavigationState?.key && (hasAccessToken === false || isError)) {
      router.replace('/sign-in');
    }
  }, [hasAccessToken, isError, rootNavigationState?.key, router]);

  if (!rootNavigationState?.key || hasAccessToken === null || isLoading || isUninitialized) {
    return <FullPageActivityLoader />;
  } else if (hasAccessToken === false || isError) {
    return <FullPageActivityLoader />;
  } else if (isSuccess) {
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
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: 'Главная' }} />
        <Stack.Screen
          name={`${ROUTES.comment}/[id]`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].comment }}
        />
        <Stack.Screen
          name={`${ROUTES.activity}/[id]`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].activity }}
        />
        <Stack.Screen
          name={`${ROUTES.followers}/[id]`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].followers }}
        />
        <Stack.Screen
          name={`${ROUTES.following}/[id]`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].followings }}
        />
        <Stack.Screen
          name={`${ROUTES.likes}/[id]`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].likes }}
        />
        <Stack.Screen
          name={`${ROUTES.map}/[id]`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].map }}
        />
        <Stack.Screen
          name={`${ROUTES.media}/[photoUrl]`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].photo }}
        />
        <Stack.Screen
          name={`${ROUTES.mediaGrid}/[id]`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].photos }}
        />
        <Stack.Screen
          name={`${ROUTES.profile}/[id]`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].profile }}
        />
        <Stack.Screen
          name={`${ROUTES.manualActivity}/${ROUTES.index}`}
          options={{
            headerRight: () => <SaveBtn />,
            title: '',
            headerShown: !isCameraVisible,
          }}
        />
        <Stack.Screen
          name={`${ROUTES.settings}/${ROUTES.index}`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].settings }}
        />
        <Stack.Screen
          name={`${ROUTES.users}/${ROUTES.index}`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].users }}
        />
        <Stack.Screen
          name={`${ROUTES.monthStatistic}/${ROUTES.index}`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].statistics }}
        />
        <Stack.Screen
          name={`${ROUTES.activitiesList}/[...ids]`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].activities }}
        />
        <Stack.Screen
          name={`${ROUTES.migration}/${ROUTES.index}`}
          options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].migration }}
        />
      </Stack>
    );
  }
}
