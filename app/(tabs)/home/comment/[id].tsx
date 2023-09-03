import { Camera, MapView } from '@rnmapbox/maps';
import { usePathname } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Card, FAB, Text, TextInput } from 'react-native-paper';

import AvatarShowable from '../../../../components/avatar/avatar-showable';
import Comments from '../../../../components/comments/comments';
import RouteLine from '../../../../components/map/route-line/route-line';
import { useGetActivityByActivityIdQuery } from '../../../../redux/runnich-api/runnich-api';
import useFakeLocations from '../../../../utils/hooks/use-fake-locations';
import { formatDate } from '../../../../utils/time-formatter';

export default function Comment() {
  const pathname = usePathname();
  const activityId = pathname.replace('/home/comment/', '');
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId);
  const { cameraRef } = useFakeLocations();
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);

  return (
    <>
      {isLoading && <ActivityIndicator />}
      {error && (
        <View>
          <Text>An error occured</Text>
        </View>
      )}
      {activity && (
        <View style={{ flex: 1 }}>
          <MapView style={{ display: 'flex', height: 200 }} scaleBarEnabled={false}>
            <Camera
              animationMode="flyTo"
              animationDuration={1000}
              zoomLevel={25}
              ref={cameraRef}
              centerCoordinate={[activity.locations[0].coords.latitude, activity.locations[0].coords.longitude]}
            />
            {activity.locations.length > 1 && <RouteLine locations={activity.locations} />}
          </MapView>
          <Card.Content
            style={{ display: 'flex', flexDirection: 'row', columnGap: 5, marginBottom: 10, alignItems: 'center' }}>
            <AvatarShowable size={40} />

            <View style={{ display: 'flex' }}>
              <Text variant="bodyLarge">
                {activity.name} {activity.surname}
              </Text>
              <Text variant="bodySmall">
                {formatDate(activity.date)}, {activity.sport}
              </Text>
              <Text variant="headlineSmall">{activity.title}</Text>
            </View>
          </Card.Content>
          <Comments id={activityId} />
          {isShowingTextInput && (
            <TextInput
              mode="outlined"
              style={{ marginTop: 'auto', marginBottom: 20 }}
              placeholder="Add a comment"
              right={<TextInput.Icon icon="pencil" />}
              label="Comment"
              autoFocus
            />
          )}
          {!isShowingTextInput && (
            <FAB
              icon="comment"
              style={{
                position: 'absolute',
                margin: 16,
                right: 0,
                bottom: 40,
              }}
              onPress={() => setIsShowingTextInput(true)}
            />
          )}
        </View>
      )}
    </>
  );
}
