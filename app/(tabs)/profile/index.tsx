import { lazy, Suspense, useState } from 'react';
import { TabView, TabBar } from 'react-native-tab-view';
import { useWindowDimensions, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyActivities = lazy(() => import('@Routes/activities/activities'));
const LazyProfilePage = lazy(() => import('@Routes/profile/profile'));

export default function ProfileIndexPage() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const renderScene = ({ route }: { route: { key: string } }) => (
    <Suspense fallback={<FullPageActivityLoader />}>
      {route.key === 'openTasks' ? <LazyProfilePage /> : <LazyActivities />}
    </Suspense>
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabView
        lazy
        navigationState={{
          index,
          routes: [
            { key: 'openTasks', title: 'Профиль' },
            { key: 'closeTasks', title: 'Тренировки' },
          ],
        }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: colors.primary }}
            style={{ backgroundColor: colors.surfaceVariant }}
            contentContainerStyle={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
            tabStyle={{ width: width / 2 }}
            pressColor="white-smoke"
            activeColor={colors.primary}
            inactiveColor={colors.onSurfaceDisabled}
          />
        )}
      />
    </View>
  );
}
