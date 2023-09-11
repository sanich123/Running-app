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
        {likes && (
          <View style={{ position: 'relative' }}>
            {likes?.slice(0, 3).map(({ authorId, id }, key) => (
              <View
                style={{
                  position: 'absolute',
                  top: -15,
                  left: key * 18,
                  backgroundColor: 'transparent',
                  borderRadius: 50,
                  borderColor: 'white',
                  borderStyle: 'solid',
                  borderWidth: 1,
                }}>
                <AvatarShowable size={30} id={authorId} key={id} />
              </View>
            ))}
          </View>
        )}
        {likes?.length ? (
          <Text style={{ marginLeft: 60 }} variant="bodyMedium">{`${likes.length} gave like${
            likes.length > 1 ? 's' : ''
          }`}</Text>
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
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  withoutLikesLayout: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
});
