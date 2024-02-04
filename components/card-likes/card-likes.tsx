import AvatarShowable from '@C/avatar-showable/avatar-showable';
import { LikeType } from '@C/card/const ';
import NumberOfLikes from '@C/number-of-likes/number-of-likes';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { Fragment, memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const MAX_IN_ROW = 9;
const MAX_NUMBER_IN_ROW_OTHER_PAGE = 3;
const SHIFT_RIGHT = 23;

export enum CardLikesSize {
  big = 'big',
  small = 'small',
}

export default memo(function CardLikes({
  activityId,
  size,
  likes,
}: {
  activityId: string;
  size: CardLikesSize;
  likes: LikeType[];
}) {
  const { push } = useRouter();
  const lastLikeInTheRow = size === CardLikesSize.big ? MAX_IN_ROW : MAX_NUMBER_IN_ROW_OTHER_PAGE;
  const lessThanNineLikes = size === CardLikesSize.big && likes?.length > 0 && likes?.length <= MAX_IN_ROW;
  const moreThanNineLikes = size === CardLikesSize.big && likes?.length > 0 && likes?.length > MAX_IN_ROW;
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  return (
    <Pressable
      testID="pushToActivityLikes"
      onPress={() => push(`/${place}/${ROUTES.likes}/${activityId}`)}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <View
        style={[
          styles.likesLayout,
          lessThanNineLikes && { width: likes?.length * SHIFT_RIGHT + 10 },
          moreThanNineLikes && { width: MAX_IN_ROW * SHIFT_RIGHT + 10 },
        ]}>
        {likes?.length ? (
          <View style={{ position: 'relative' }}>
            {likes
              .slice()
              .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
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
        ) : null}
        {likes?.length && size === CardLikesSize.small ? <NumberOfLikes likes={likes} /> : null}
      </View>
    </Pressable>
  );
});

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
