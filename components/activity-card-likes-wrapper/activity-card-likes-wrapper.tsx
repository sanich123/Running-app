import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';

import { useGetLikesByActivityIdQuery } from '../../redux/runnich-api/runnich-api';
import { View } from '../Themed';
import AvatarShowable from '../avatar/avatar-showable';
import NumberOfLikes from '../number-of-likes/number-of-likes';

const MAX_NUMBER_IN_ROW_COMMENTS_PAGE = 9;
const MAX_NUMBER_IN_ROW_OTHER_PAGE = 3;

export default function ActivityCardLikesWrapper({ activityId }: { activityId: string }) {
  const { isLoading, error, data: likes } = useGetLikesByActivityIdQuery(activityId);
  const router = useRouter();
  const pathname = usePathname();
  const lastLikeInTheRow = pathname.includes('comment')
    ? MAX_NUMBER_IN_ROW_COMMENTS_PAGE
    : MAX_NUMBER_IN_ROW_OTHER_PAGE;

  return (
    <Pressable onPress={() => router.push(`/home/likes/${activityId}`)}>
      <View style={[styles.likesLayout, !likes?.length && styles.withoutLikesLayout]}>
        {isLoading && <ActivityIndicator />}
        {error ? <Text variant="bodyMedium">An error occured</Text> : null}
        {likes && (
          <View style={{ position: 'relative' }}>
            {likes?.slice(0, lastLikeInTheRow).map(({ authorId, id }, key) => (
              <>
                {likes.length > 9 && key === 8 ? (
                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'absolute',
                      left: key * 23 + 13,
                      top: -7,
                    }}>
                    <Text variant="bodySmall">{`+${likes?.length - 9}`}</Text>
                  </View>
                ) : null}
                <View
                  key={id}
                  style={[
                    {
                      position: 'absolute',
                      top: -15,
                      left: key * 23,
                      backgroundColor: 'transparent',
                      borderRadius: 50,
                      borderColor: 'white',
                      borderStyle: 'solid',
                      borderWidth: 2,
                    },
                    likes.length > 9 && key === 8 && { opacity: 0.1 },
                  ]}>
                  <AvatarShowable size={30} id={authorId} key={id} />
                </View>
              </>
            ))}
          </View>
        )}
        {likes?.length && !pathname.includes('comment') ? <NumberOfLikes likes={likes} /> : null}
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
    marginLeft: 5,
    backgroundColor: 'transparent',
  },
  withoutLikesLayout: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
});
