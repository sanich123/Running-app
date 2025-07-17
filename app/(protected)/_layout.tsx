import { changeNetworkState } from '@R/slices/network/network';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import Mapbox from '@rnmapbox/maps';
import { Redirect, Stack } from 'expo-router';
import mapboxgl from 'mapbox-gl';
import { useEffect } from 'react';
import { Appearance, Platform, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { LABELS, ROUTES } from '@const/enums';
import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import SaveBtn from '@C/activity/save-btn/save-btn';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useLazyVerifyConfigQuery } from '@R/services/authentication/authentication';
import * as SplashScreen from 'expo-splash-screen';
import { setRequiredAppVersion, setUserId } from '@R/slices/auth/auth';
import { store } from '@R/store';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function ProtectedLayout() {
  const [verifyToken, { data: configInfo, isLoading, isError, isSuccess, isUninitialized }] =
    useLazyVerifyConfigQuery();
  const { colors } = useTheme();
  const { theme } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { isCameraVisible } = useAppSelector(({ activity }) => activity);

  useEffect(() => {
    (async () => {
      await verifyToken({ accessToken: store.getState().auth.accessToken }).unwrap();
    })();
  }, [dispatch, verifyToken]);

  useEffect(() => {
    if (isSuccess) {
      const { id, appVersion } = configInfo;
      dispatch(setUserId(id));
      dispatch(setRequiredAppVersion(appVersion));
    }
  }, [configInfo, dispatch, isSuccess]);

  useEffect(() => {
    if (theme) Appearance.setColorScheme(theme);
  }, [theme]);

  useEffect(() => {
    mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
    if (Platform.OS !== 'web') {
      Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || null);
    }
    const networkListener = NetInfo.addEventListener((networkState) => {
      dispatch(changeNetworkState(networkState));
    });
    return () => networkListener();
  }, [dispatch]);
  if (isLoading || isUninitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (isError) {
    SplashScreen.hide();
    return <Redirect href="/sign-in" />;
  } else if (isSuccess) {
    SplashScreen.hide();
    return (
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.secondaryContainer },
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
