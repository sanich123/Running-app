import { Suspense, useState } from 'react';
import { TabView, TabBar } from 'react-native-tab-view';
import { useWindowDimensions, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LABELS } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { LazyActivities, LazyProfilePage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ProfileIndexPage() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { language } = useAppSelector(({ settings }) => settings);
  const labels = LABELS[language];
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
            { key: 'openTasks', title: labels.profile },
            { key: 'closeTasks', title: labels.activities },
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
