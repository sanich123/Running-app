import { AvatarShowableTestIds } from '@C/avatar/showable/const';
import { LikeType, ProfileType } from '@C/card/const ';
import NumberOfLikes from '@C/card/number-of-likes/number-of-likes';
import { CustomImage } from '@C/custom-image/custom-image';
import { useGetLikesByActivityIdQuery } from '@R/runich-api/runich-api';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { Fragment, memo, useContext } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { LikesProps, LikesSize, MAX_IN_ROW, MAX_NUMBER_IN_ROW_OTHER_PAGE, SHIFT_RIGHT } from './const';
import { useAppDispatch } from '@R/typed-hooks';
import { setActivityIdWhichLikesToDownload } from '@R/main-feed/main-feed';
import { ModalLikesListContext } from '@U/context/activity-card-btns';

export default memo(function Likes({ activityId, size }: LikesProps) {
  const dispatch = useAppDispatch();
  const { dark } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const { data: likes, isLoading, isError } = useGetLikesByActivityIdQuery(activityId, { skip: !activityId });
  const { modalRef } = useContext(ModalLikesListContext);
  const lastLikeInTheRow = size === LikesSize.big ? MAX_IN_ROW : MAX_NUMBER_IN_ROW_OTHER_PAGE;
  const lessThanNineLikes = size === LikesSize.big && likes?.length > 0 && likes?.length <= MAX_IN_ROW;
  const moreThanNineLikes = size === LikesSize.big && likes?.length > 0 && likes?.length > MAX_IN_ROW;
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;

  return (
    <>
      {likes?.length > 0 ? (
        <TouchableRipple
          testID="pushToActivityLikes"
          rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
          onPress={() => {
            if (Platform.OS !== 'web' && !pathname.includes(ROUTES.activity) && !pathname.includes(ROUTES.comment)) {
              dispatch(setActivityIdWhichLikesToDownload(activityId));
              modalRef.current?.present();
            } else {
              push(`/${place}/${ROUTES.likes}/${activityId}`);
            }
          }}
          borderless
          disabled={isLoading || isError}
          style={{ borderRadius: 10 }}>
          <View style={styles.likesWrapper}>
            <View
              style={[
                styles.likesLayout,
                lessThanNineLikes && { width: likes?.length * SHIFT_RIGHT + 10 },
                moreThanNineLikes && { width: MAX_IN_ROW * SHIFT_RIGHT + 10 },
              ]}>
              {likes?.length > 0 ? (
                <View style={{ position: 'relative' }}>
                  {likes
                    ?.slice(0, lastLikeInTheRow)
                    ?.sort((a: LikeType, b: LikeType) => Date.parse(b.date) - Date.parse(a.date))
                    .map(({ authorId, id, profile }: LikeType & { profile: ProfileType }, index: number) => (
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
              {likes?.length && size === LikesSize.small ? <NumberOfLikes likes={likes} /> : null}
            </View>
          </View>
        </TouchableRipple>
      ) : (
        <View />
      )}
    </>
  );
});

const styles = StyleSheet.create({
  likesWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    padding: 2,
  },
  likesLayout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 20,
    backgroundColor: 'transparent',
    height: 40,
    paddingVertical: 2,
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
