import { Camera, MapView } from '@rnmapbox/maps';
import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, ToastAndroid, View } from 'react-native';
import { ActivityIndicator, Card, FAB, Text, TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

import AvatarShowable from '../../../../components/avatar/avatar-showable';
import Comments from '../../../../components/comments/comments';
import RouteLine from '../../../../components/map/route-line/route-line';
import {
  useGetActivityByActivityIdQuery,
  usePostCommentWithActivityIdMutation,
} from '../../../../redux/runnich-api/runnich-api';
import useFakeLocations from '../../../../utils/hooks/use-fake-locations';
import { formatDate } from '../../../../utils/time-formatter';

export default function Comment() {
  const pathname = usePathname();
  const activityId = pathname.replace('/home/comment/', '');
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId);
  const { cameraRef } = useFakeLocations();
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);
  const { id: userId } = useSelector(({ userInfo }) => userInfo);
  const [postComment, { isLoading: isCommentSending, error: commentSendingError, data: commentResponse }] =
    usePostCommentWithActivityIdMutation();
  const [comment, setComment] = useState('');
  useEffect(() => {
    if (commentResponse) {
      ToastAndroid.show('Successfully sent comment!', ToastAndroid.SHORT);
      console.log(commentResponse);
      setComment('');
    }
    if (commentSendingError) {
      ToastAndroid.show('An error occured!', ToastAndroid.SHORT);
      console.log(commentSendingError);
    }
  }, [commentSendingError, commentResponse]);
  return (
    <ScrollView>
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
            <AvatarShowable size={40} id={userId} />

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
              value={comment}
              onChangeText={(comment) => setComment(comment)}
              disabled={isCommentSending}
              right={
                <TextInput.Icon
                  icon="pencil"
                  onPress={async () => {
                    const body = { comment, authorId: userId };
                    await postComment({ body, id: activityId }).unwrap();
                  }}
                />
              }
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
    </ScrollView>
  );
}
