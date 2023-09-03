import { usePathname } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';

import ActivityCard from '../../../components/activity-card/activity-card';
import ErrorComponent from '../../../components/error-component/error-component';
import { useGetActivityByActivityIdQuery } from '../../../redux/runnich-api/runnich-api';

export default function ViewActivityFullInfo() {
  const pathname = usePathname();
  const activityId = pathname.replace('/home/', '');
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId);
  return (
    <>
      {isLoading && <ActivityIndicator />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <ActivityCard
          description={activity.description}
          title={activity.title}
          date={activity.date}
          sport={activity.sport}
          id={activity.id}
          locations={activity.locations}
          photoUrl={activity.photoUrl}
          duration={activity.duration}
          speed={activity.speed}
          distance={activity.distance}
        />
      )}
    </>
  );
}
