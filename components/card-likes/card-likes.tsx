import { usePathname, useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';

import { useGetLikesByActivityIdQuery } from '../../redux/runich-api/runich-api';
import AvatarShowable from '../avatar-showable/avatar-showable';
import NumberOfLikes from '../number-of-likes/number-of-likes';

const MAX_IN_ROW = 9;
const MAX_NUMBER_IN_ROW_OTHER_PAGE = 3;

export default function CardLikes({ activityId }: { activityId: string }) {
  const { isLoading, error, data: likes } = useGetLikesByActivityIdQuery(activityId);
  const router = useRouter();
  const pathname = usePathname();
  const isInComment = pathname.includes('comment');
  const isInActivity = pathname.includes('activity');
  const lastLikeInTheRow = isInComment || isInActivity ? MAX_IN_ROW : MAX_NUMBER_IN_ROW_OTHER_PAGE;
  const SHIFT_RIGHT = 23;

  return (
    <Pressable onPress={() => router.push(`/home/likes/${activityId}`)}>
      <View
        style={[
          styles.likesLayout,
          !likes?.length && styles.withoutLikesLayout,
          isInComment && { width: likes?.length * SHIFT_RIGHT + 13, marginTop: 4 },
        ]}>
        {isLoading && <ActivityIndicator />}
        {error ? <Text variant="bodyMedium">An error occured</Text> : null}
        {likes && (
          <View style={{ position: 'relative' }}>
            {likes?.slice(0, lastLikeInTheRow).map(({ authorId, id }, key) => (
              <Fragment key={id}>
                {likes.length > MAX_IN_ROW && key === MAX_IN_ROW - 1 ? (
                  <View style={[styles.lastAvatarWrapper, { left: key * SHIFT_RIGHT + 13 }]}>
                    <Text variant="bodySmall">{`+${likes?.length - MAX_IN_ROW}`}</Text>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.avatarWrapper,
                    { left: key * SHIFT_RIGHT },
                    likes.length > MAX_IN_ROW && key === MAX_IN_ROW - 1 && { opacity: 0.1 },
                  ]}>
                  <AvatarShowable size={30} id={authorId} key={id} />
                </View>
              </Fragment>
            ))}
          </View>
        )}
        {likes?.length && !isInComment && !isInActivity ? <NumberOfLikes likes={likes} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  likesLayout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 20,
    marginLeft: 5,
    marginBottom: 5,
    backgroundColor: 'transparent',
    height: 40,
  },
  withoutLikesLayout: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    height: 0,
  },
  avatarWrapper: {
    position: 'absolute',
    top: -15,
    backgroundColor: 'transparent',
    borderRadius: 50,
    borderColor: 'white',
    borderStyle: 'solid',
    borderWidth: 2,
  },
  lastAvatarWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -7,
  },
});
