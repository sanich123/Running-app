import { useAuth } from '@A/context/auth-context';
import { MaterialTopTabs } from '@C/material-top-tabs-layout/material-top-tabs-layout';
import ProfileEditBtn from '@C/profile-edit-btn/profile-edit-btn';
import { useAppSelector } from '@R/typed-hooks';
import { LABELS } from '@const/enums';
import { Stack } from 'expo-router';
import { Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function ProfileMainLayout() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <MaterialTopTabs
      initialLayout={{ width: Dimensions.get('window').width }}
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12, color: colors.primaryContainer, fontWeight: 'bold' },
        tabBarStyle: { display: 'flex', backgroundColor: colors.primary },
        tabBarItemStyle: { width: Dimensions.get('window').width / 2 },
      }}>
      <Stack.Screen
        name="profile"
        options={{
          title: LABELS[language].profile,
          headerRight: () => user && <ProfileEditBtn />,
        }}
      />
      <Stack.Screen
        name="activities"
        options={{
          title: LABELS[language].activities,
        }}
      />
    </MaterialTopTabs>
  );
}
