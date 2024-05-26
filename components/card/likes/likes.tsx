import { AvatarShowableTestIds } from '@C/avatar/showable/const';
import { LikeType, ProfileType } from '@C/card/const ';
import NumberOfLikes from '@C/card/number-of-likes/number-of-likes';
import { CustomImage } from '@C/custom-image/custom-image';
import { useGetLikesByActivityIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { Fragment, memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { LikesProps, LikesSize, MAX_IN_ROW, MAX_NUMBER_IN_ROW_OTHER_PAGE, SHIFT_RIGHT } from './const';

export default memo(function Likes({ activityId, size, likes }: LikesProps) {
  const { dark } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const [isNeedToGetUpdatedLikes, setIsNeedToGetUpdatedLikes] = useState(true);
  const { activityIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const { data: updatedLikes, isLoading } = useGetLikesByActivityIdQuery(activityId, {
    skip: !isNeedToGetUpdatedLikes,
  });

  const whatLikesToIterate = !isNeedToGetUpdatedLikes ? likes : updatedLikes;
  const lastLikeInTheRow = size === LikesSize.big ? MAX_IN_ROW : MAX_NUMBER_IN_ROW_OTHER_PAGE;
  const lessThanNineLikes =
    size === LikesSize.big && whatLikesToIterate?.length > 0 && whatLikesToIterate?.length <= MAX_IN_ROW;
  const moreThanNineLikes =
    size === LikesSize.big && whatLikesToIterate?.length > 0 && whatLikesToIterate?.length > MAX_IN_ROW;
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;

  useEffect(() => {
    if (activityIdWhichLikesToUpdate === activityId) {
      setIsNeedToGetUpdatedLikes(true);
    }
  }, [activityIdWhichLikesToUpdate, activityId]);

  return (
    <TouchableRipple
      testID="pushToActivityLikes"
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${place}/${ROUTES.likes}/${activityId}`)}
      borderless
      style={{ borderRadius: 10 }}
      disabled={isLoading}>
      <View style={styles.likesWrapper}>
        <View
          style={[
            styles.likesLayout,
            lessThanNineLikes && { width: likes?.length * SHIFT_RIGHT + 10 },
            moreThanNineLikes && { width: MAX_IN_ROW * SHIFT_RIGHT + 10 },
          ]}>
          {whatLikesToIterate?.length ? (
            <View style={{ position: 'relative' }}>
              {whatLikesToIterate
                ?.slice(0, lastLikeInTheRow)
                ?.sort((a: LikeType, b: LikeType) => Date.parse(b.date) - Date.parse(a.date))
                .map(({ authorId, id, profile }: LikeType & { profile: ProfileType }, index: number) => (
                  <Fragment key={`${id}/${index}/${authorId}`}>
                    {whatLikesToIterate.length > MAX_IN_ROW && index === MAX_IN_ROW - 1 ? (
                      <View style={[styles.lastAvatarWrapper, { left: index * SHIFT_RIGHT + 13 }]}>
                        <Text variant="bodySmall">{`+${likes?.length - MAX_IN_ROW}`}</Text>
                      </View>
                    ) : null}
                    <View
                      style={[
                        styles.avatarWrapper,
                        { left: index * SHIFT_RIGHT },
                        whatLikesToIterate.length > MAX_IN_ROW && index === MAX_IN_ROW - 1 && { opacity: 0.1 },
                      ]}>
                      <CustomImage
                        style={{ width: 30, height: 30, borderRadius: 70 }}
                        source={{ uri: profile?.profilePhoto }}
                        contentFit="cover"
                        testID={AvatarShowableTestIds.success}
                      />
                    </View>
                  </Fragment>
                ))}
            </View>
          ) : null}
          {whatLikesToIterate?.length && size === LikesSize.small ? <NumberOfLikes likes={whatLikesToIterate} /> : null}
        </View>
      </View>
    </TouchableRipple>
  );
});

const styles = StyleSheet.create({
  likesWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 5,
    height: 40,
    marginLeft: 15,
  },
  likesLayout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 20,
    backgroundColor: 'transparent',
    height: 40,
    paddingTop: 5,
  },
  withoutLikesLayout: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    height: 0,
  },
  avatarWrapper: {
    position: 'absolute',
    top: -17,
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
