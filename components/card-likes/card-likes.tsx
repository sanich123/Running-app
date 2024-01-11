import AvatarShowable from '@C/avatar-showable/avatar-showable';
import NumberOfLikes from '@C/number-of-likes/number-of-likes';
import { useGetLikesByActivityIdQuery } from '@R/runich-api/runich-api';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const MAX_IN_ROW = 9;
const MAX_NUMBER_IN_ROW_OTHER_PAGE = 3;
const SHIFT_RIGHT = 23;

export default function CardLikes({ activityId }: { activityId: string }) {
  const { error, isError, data: likes } = useGetLikesByActivityIdQuery(activityId);
  const { push } = useRouter();
  const pathname = usePathname();
  const isInComment = pathname.includes(ROUTES.comment);
  const isInActivity = pathname.includes(ROUTES.activity);
  const lastLikeInTheRow = isInComment || isInActivity ? MAX_IN_ROW : MAX_NUMBER_IN_ROW_OTHER_PAGE;
  const lessThanNineLikes = (isInComment || isInActivity) && likes?.length > 0 && likes?.length <= MAX_IN_ROW;
  const moreThanNineLikes = (isInComment || isInActivity) && likes?.length > 0 && likes?.length > MAX_IN_ROW;

  return (
    <Pressable
      testID="pushToActivityLikes"
      onPress={() => push(`/${ROUTES.home}/${ROUTES.likes}/${activityId}`)}
      disabled={isError}
      style={({ pressed }) => ({ opacity: pressed || isError ? 0.5 : 1 })}>
      <View
        style={[
          styles.likesLayout,
          lessThanNineLikes && { width: likes?.length * SHIFT_RIGHT + 10 },
          moreThanNineLikes && { width: MAX_IN_ROW * SHIFT_RIGHT + 10 },
        ]}>
        {likes && (
          <View style={{ position: 'relative' }}>
            {likes
              ?.slice(0, lastLikeInTheRow)
              .map(({ authorId, id }: { authorId: string; id: string }, index: number) => (
                <Fragment key={`${id}/${index}/${authorId}`}>
                  {likes.length > MAX_IN_ROW && index === MAX_IN_ROW - 1 ? (
                    <View style={[styles.lastAvatarWrapper, { left: index * SHIFT_RIGHT + 13 }]}>
                      <Text variant="bodySmall">{`+${likes?.length - MAX_IN_ROW}`}</Text>
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.avatarWrapper,
                      { left: index * SHIFT_RIGHT },
                      likes.length > MAX_IN_ROW && index === MAX_IN_ROW - 1 && { opacity: 0.1 },
                    ]}>
                    <AvatarShowable size={30} id={authorId} key={id} />
                  </View>
                </Fragment>
              ))}
          </View>
        )}
        {likes?.length && !isInComment && !isInActivity ? <NumberOfLikes likes={likes} error={error} /> : null}
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
    backgroundColor: 'transparent',
    height: 45,
    width: 'auto',
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
