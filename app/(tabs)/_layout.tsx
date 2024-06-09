import CustomTabBar from '@C/custom-tab-bar/custom-tab-bar';
import { ROUTES } from '@const/enums';
import { useAuth } from 'auth/context/auth-context';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name={ROUTES.home} options={{ headerShown: false }} />
      <Tabs.Screen name={ROUTES.activity} options={{ headerShown: false }} />
      {user && <Tabs.Screen name={ROUTES.profile} options={{ headerShown: false }} />}
    </Tabs>
  );
}
