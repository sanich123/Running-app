import { useAuth } from '@A/context/auth-context';
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
  manualAddLike,
}: {
  activityId: string;
  size: CardLikesSize;
  likes: LikeType[];
  manualAddLike: string | undefined;
}) {
  console.log(manualAddLike);
  const { user } = useAuth();
  const { push } = useRouter();
  const lastLikeInTheRow = size === CardLikesSize.big ? MAX_IN_ROW : MAX_NUMBER_IN_ROW_OTHER_PAGE;
  const lessThanNineLikes = size === CardLikesSize.big && likes?.length > 0 && likes?.length <= MAX_IN_ROW;
  const moreThanNineLikes = size === CardLikesSize.big && likes?.length > 0 && likes?.length > MAX_IN_ROW;
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const mockUserLike = {
    id: 'someId',
    date: new Date().toString(),
    activityId,
    authorId: `${user?.id}`,
  };

  let modifiedLikes;
  if (!manualAddLike) {
    modifiedLikes = likes;
  } else if (manualAddLike === 'not-liked') {
    modifiedLikes = likes.filter(({ authorId }) => authorId !== user?.id);
  } else {
    modifiedLikes = [mockUserLike, ...likes.filter(({ authorId }) => authorId !== user?.id)];
  }

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
        {modifiedLikes?.length ? (
          <View style={{ position: 'relative' }}>
            {modifiedLikes
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
        {modifiedLikes?.length && size === CardLikesSize.small ? <NumberOfLikes likes={modifiedLikes} /> : null}
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
