import { Text, ActivityIndicator } from 'react-native-paper';

import { useGetLikesByActivityIdQuery } from '../../redux/runnich-api/runnich-api';
import { View } from '../Themed';
import AvatarShowable from '../avatar/avatar-showable';

export default function ActivityCardLikesWrapper({ activityId }: { activityId: string }) {
  const { isLoading, error, data: likes } = useGetLikesByActivityIdQuery(activityId);
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      {isLoading && <ActivityIndicator />}
      {error ? <Text variant="bodyMedium">An error occured</Text> : null}
      {likes ? likes?.map(({ authorId, id }) => <AvatarShowable size={25} id={authorId} key={id} />) : null}
      {likes?.length ? <Text variant="bodyMedium">{`${likes.length} guys send like to your activity`}</Text> : null}
    </View>
  );
}
