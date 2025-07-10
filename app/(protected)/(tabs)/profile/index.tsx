import ProfilePage from '@C/profile/profile';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useWindowDimensions, View } from 'react-native';
import { useState } from 'react';
import { useTheme } from 'react-native-paper';
import Activities from '@C/activities/activities';

const renderScene = SceneMap({
  openTasks: ProfilePage,
  closeTasks: Activities,
});

export default function ProfileIndexPage() {
  const {
    colors: { surfaceVariant, primary, onSurfaceDisabled },
  } = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  return (
    <View style={{ flex: 1 }}>
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
            indicatorStyle={{ backgroundColor: primary }}
            style={{ backgroundColor: surfaceVariant }}
            contentContainerStyle={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
            tabStyle={{ width: width / 2 }}
            pressColor="white-smoke"
            activeColor={primary}
            inactiveColor={onSurfaceDisabled}
          />
        )}
      />
    </View>
  );
}
