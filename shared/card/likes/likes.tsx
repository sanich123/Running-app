import { Fragment, memo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useGetLikesByActivityIdQuery, useGetLikesLengthByActivityIdQuery } from '@R/services/likes/likes';
import { setActivityIdWhichLikesToDownload } from '@R/slices/main-feed/main-feed';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { AvatarShowableTestIds } from '@S/avatar/showable/const';
import ModalLikesList from '@S/card/modal-likes-list/modal-likes-list';
import NumberOfLikes from '@S/card/number-of-likes/number-of-likes';
import CustomImage from '@S/custom-image/custom-image';
import { LikesSize, MAX_IN_ROW, MAX_NUMBER_IN_ROW_OTHER_PAGE, SHIFT_RIGHT } from './const';
import type { LikesProps, LikeType } from '../types';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default memo(function Likes({ activityId, size, likesLength }: LikesProps) {
  const dispatch = useAppDispatch();
  const { dark } = useTheme();
  const { activityIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const isNeedToGetUpdatedLikes = activityIdWhichLikesToUpdate === activityId;
  const { data: updatedLikesLength, isError: isErrorLoadingUpdatedLikes } = useGetLikesLengthByActivityIdQuery(
    activityId,
    { skip: !isNeedToGetUpdatedLikes || likesLength === undefined },
  );
  const knownLikesLength = updatedLikesLength ?? likesLength;
  const {
    data: likes,
    isLoading,
    isError,
  } = useGetLikesByActivityIdQuery(activityId, {
    skip: !activityId || (knownLikesLength !== undefined && knownLikesLength === 0),
  });
  const likesList = likes ?? [];
  const whatLikesLengthToRender = updatedLikesLength ?? likesLength ?? likesList.length;
  const hasLikes = whatLikesLengthToRender > 0 || likesList.length > 0;
  const lastLikeInTheRow = size === LikesSize.big ? MAX_IN_ROW : MAX_NUMBER_IN_ROW_OTHER_PAGE;
  const lessThanNineLikes =
    size === LikesSize.big && whatLikesLengthToRender > 0 && whatLikesLengthToRender <= MAX_IN_ROW;
  const moreThanNineLikes = size === LikesSize.big && whatLikesLengthToRender > MAX_IN_ROW;
  const likesListModal = useRef<BottomSheetModal>(null);
  return (
    <>
      {hasLikes ? (
        <TouchableRipple
          testID="pushToActivityLikes"
          rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
          onPress={() => {
            dispatch(setActivityIdWhichLikesToDownload(activityId));
            likesListModal.current?.present?.();
          }}
          borderless
          disabled={isLoading || isError || isErrorLoadingUpdatedLikes}
          style={{ borderRadius: 10 }}>
          <View style={styles.likesWrapper}>
            <View
              style={[
                styles.likesLayout,
                lessThanNineLikes && { width: whatLikesLengthToRender * SHIFT_RIGHT + 10 },
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
                            <Text variant="bodySmall">{`+${whatLikesLengthToRender - MAX_IN_ROW}`}</Text>
                          </View>
                        ) : null}
                        <View
                          style={[
                            styles.avatarWrapper,
                            { left: index * SHIFT_RIGHT },
                            likesList.length > MAX_IN_ROW && index === MAX_IN_ROW - 1 && { opacity: 0.1 },
                          ]}>
                          <CustomImage
                            style={{ width: 30, height: 30, borderRadius: 70 }}
                            source={{ uri: profile?.profilePhoto }}
                            contentFit="cover"
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
                <NumberOfLikes likes={likesList} likesLength={whatLikesLengthToRender} />
              ) : null}
            </View>
          </View>
        </TouchableRipple>
      ) : (
        <View />
      )}
      <ModalLikesList bottomSheetModalRef={likesListModal} likesLength={whatLikesLengthToRender} />
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
