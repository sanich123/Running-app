import { Fragment, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { likesApi, useGetLikesByActivityIdInfiniteQuery } from '@R/services/likes/likes';
import { setActivityIdWhichLikesToDownload } from '@R/slices/main-feed/main-feed';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { AvatarShowableTestIds } from '@S/avatar/showable/const';
import UserAvatar from '@S/avatar/user-avatar/user-avatar';
import ModalLikesList from '@S/card/modal-likes-list/modal-likes-list';
import NumberOfLikes from '@S/card/number-of-likes/number-of-likes';
import { useActivityCard } from '../context';
import { LikesSize, MAX_IN_ROW, MAX_NUMBER_IN_ROW_OTHER_PAGE, SHIFT_RIGHT } from './const';
import type { LikeType } from '../types';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function Likes() {
  const { activity, isFullView } = useActivityCard();
  const { id: activityId, likesLength } = activity;
  const size = isFullView ? LikesSize.big : LikesSize.small;
  const dispatch = useAppDispatch();
  const { activityIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const { userId } = useAppSelector(({ auth }) => auth);
  const canViewLikes = activity.profile?.allowActivityInteractions !== false || activity.userId === userId;
  const { isLoading: isAppLoading } = useAppSelector(({ loading }) => loading);
  const isLikesMarkedForUpdate = activityIdWhichLikesToUpdate === activityId;
  const shouldLoadLikes = canViewLikes && (likesLength !== 0 || isLikesMarkedForUpdate);
  const {
    data: likesPages,
    isLoading,
    isError,
  } = useGetLikesByActivityIdInfiniteQuery(
    { activityId },
    {
      skip: !activityId || !shouldLoadLikes,
    },
  );
  const likesList = likesPages?.pages.flatMap(({ likes }) => likes) ?? [];
  const likesCount = canViewLikes && isLikesMarkedForUpdate ? likesList.length : (likesLength ?? likesList.length);
  const hasLikes = likesCount > 0;
  const lastLikeInTheRow = size === LikesSize.big ? MAX_IN_ROW : MAX_NUMBER_IN_ROW_OTHER_PAGE;
  const lessThanNineLikes = size === LikesSize.big && likesCount > 0 && likesCount <= MAX_IN_ROW;
  const moreThanNineLikes = size === LikesSize.big && likesCount > MAX_IN_ROW;
  const likesListModal = useRef<BottomSheetModal>(null);
  if (!canViewLikes) return <View />;

  return (
    <>
      {hasLikes ? (
        <TouchableRipple
          testID="pushToActivityLikes"
          onPress={() => {
            void dispatch(
              likesApi.endpoints.getLikesByActivityId.initiate(
                { activityId },
                { subscribe: false, forceRefetch: true },
              ),
            );
            dispatch(setActivityIdWhichLikesToDownload(activityId));
            likesListModal.current?.present?.();
          }}
          borderless
          disabled={!canViewLikes || isAppLoading || isLoading || isError}
          style={{ borderRadius: 10 }}>
          <View style={styles.likesWrapper}>
            <View
              style={[
                styles.likesLayout,
                lessThanNineLikes && { width: likesCount * SHIFT_RIGHT + 10 },
                moreThanNineLikes && { width: MAX_IN_ROW * SHIFT_RIGHT + 10 },
              ]}>
              {likesList.length > 0 ? (
                <View style={{ position: 'relative' }}>
                  {likesList
                    .slice(0, lastLikeInTheRow)
                    .sort((a: LikeType, b: LikeType) => Date.parse(b.date) - Date.parse(a.date))
                    .map(({ authorId, profile }: LikeType, index: number) => (
                      <Fragment key={authorId}>
                        {likesList.length > MAX_IN_ROW && index === MAX_IN_ROW - 1 ? (
                          <View style={[styles.lastAvatarWrapper, { left: index * SHIFT_RIGHT + 13 }]}>
                            <Text variant="bodySmall">{`+${likesCount - MAX_IN_ROW}`}</Text>
                          </View>
                        ) : null}
                        <View
                          style={[
                            styles.avatarWrapper,
                            { left: index * SHIFT_RIGHT },
                            likesList.length > MAX_IN_ROW && index === MAX_IN_ROW - 1 && { opacity: 0.1 },
                          ]}>
                          <UserAvatar
                            size={30}
                            profilePhoto={profile?.profilePhoto}
                            name={profile?.name}
                            surname={profile?.surname}
                            placeholder={profile?.profilePhotoBlurhash}
                            cachePolicy="memory-disk"
                            recyclingKey={authorId}
                            transition={0}
                            testID={AvatarShowableTestIds.success}
                          />
                        </View>
                      </Fragment>
                    ))}
                </View>
              ) : null}
              {hasLikes && size === LikesSize.small ? (
                <NumberOfLikes likes={likesList} likesLength={likesCount} />
              ) : null}
            </View>
          </View>
        </TouchableRipple>
      ) : (
        <View />
      )}
      <ModalLikesList bottomSheetModalRef={likesListModal} likesLength={likesCount} canViewLikes={canViewLikes} />
    </>
  );
}

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
