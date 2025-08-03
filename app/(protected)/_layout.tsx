import { useAppSelector } from '@R/typed-hooks';
import { Redirect, Stack } from 'expo-router';
import { LABELS, ROUTES } from '@const/enums';
import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import SaveBtn from '@C/activity/save-btn/save-btn';
import { useTheme } from 'react-native-paper';
import useInitialState from '@U/hooks/use-initial-state';
import FullPageActivityLoader from '@C/shared/full-page-activity-loader/full-page-activity-loader';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function ProtectedLayout() {
  const { isLoading, isError, isUninitialized, isSuccess } = useInitialState();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { isCameraVisible } = useAppSelector(({ manualActivity }) => manualActivity);
  if (isLoading || isUninitialized) {
    return <FullPageActivityLoader />;
  } else if (isError) {
    return <Redirect href="/sign-in" />;
  } else if (isSuccess) {
    return (
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surfaceVariant },
          headerTintColor: colors.onSurfaceVariant,
          headerTitleStyle: { fontWeight: 'bold' },
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
