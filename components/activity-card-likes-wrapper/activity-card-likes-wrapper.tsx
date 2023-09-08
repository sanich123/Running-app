import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';

import { useGetLikesByActivityIdQuery } from '../../redux/runnich-api/runnich-api';
import { View } from '../Themed';
import AvatarShowable from '../avatar/avatar-showable';

export default function ActivityCardLikesWrapper({ activityId }: { activityId: string }) {
  const { isLoading, error, data: likes } = useGetLikesByActivityIdQuery(activityId);
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/home/likes/${activityId}`)}>
      <View style={[styles.likesLayout, !likes?.length && styles.withoutLikesLayout]}>
        {isLoading && <ActivityIndicator />}
        {error ? <Text variant="bodyMedium">An error occured</Text> : null}
        {likes ? likes?.map(({ authorId, id }) => <AvatarShowable size={30} id={authorId} key={id} />) : null}
        {likes?.length ? (
          <Text variant="bodyMedium">{`${likes.length} gave like${likes.length > 1 ? 's' : ''}`}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  likesLayout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
  },
  withoutLikesLayout: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
});
