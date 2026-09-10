import { useCallback, useContext, useEffect, memo, useState } from 'react';
import { Animated } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useSendEmailAfterSendingLikeMutation } from '@R/services/emails/emails';
import {
  useDeleteLikeMutation,
  useGetLikesByActivityIdQuery,
  useGetLikesLengthByActivityIdQuery,
  useSendLikeMutation,
} from '@R/services/likes/likes';
import { setActivityIdWhichLikesToUpdate } from '@R/slices/main-feed/main-feed';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import {
  CARD_LIKE_BTN_TEST_ID_LIKED,
  CARD_LIKE_BTN_TEST_ID_NOT_LIKED,
  CARD_LIKE_BTN_ICON_LIKED,
  CARD_LIKE_BTN_ICON_NOT_LIKED,
} from './const';
import { LIKE_BTN } from '../likes/const';
import type { LikeBtnProps } from '../types';

export default memo(function LikeBtn({ activityId, likesLength, profile, mapPhotoUrl }: LikeBtnProps) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isDisabled, isLoading } = useContext(ActivityCardBtnsContext);
  const { language } = useAppSelector(({ settings }) => settings);
  const { activityIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const {
    profileFromServer: { profilePhoto, name, surname },
  } = useAppSelector(({ profile }) => profile);

  const {
    data: likes,
    isError,
    isLoading: isLikesLoading,
  } = useGetLikesByActivityIdQuery(activityId, { skip: !activityId });
  const likesList = likes ?? [];
  const isNeedToGetUpdatedLikes = activityIdWhichLikesToUpdate === activityId;
  const { isError: isErrorLoadingUpdatedLikes } = useGetLikesLengthByActivityIdQuery(activityId, {
    skip: !isNeedToGetUpdatedLikes || likesLength === undefined,
  });
  const [sendEmailNotification] = useSendEmailAfterSendingLikeMutation();
  const [sendLike, { isSuccess: isSuccessSending }] = useSendLikeMutation();

  const [deleteLike] = useDeleteLikeMutation();
  const recipientEmail = profile?.email ?? profile?.user?.email;

  const isLikedByYou = likesList.filter(({ authorId }) => authorId === userId);
  const hasLikesFromOthers = likesList.length > 0 && !isLikedByYou.length;
  const [likeScale] = useState(() => new Animated.Value(1));

  const animateLike = useCallback(() => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 0.82,
        useNativeDriver: true,
        speed: 30,
        bounciness: 4,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();
  }, [likeScale]);

  useEffect(() => {
    if (isSuccessSending && profile?.emailNotifications && recipientEmail) {
      sendEmailNotification({
        name: name ?? '',
        surname: surname ?? '',
        profilePhoto: profilePhoto ?? '',
        recepientName: profile.name ?? '',
        recepientSurname: profile.surname ?? '',
        recepientEmail: recipientEmail,
        mapPhotoUrl: mapPhotoUrl || '',
        activityId,
      });
    }
  }, [
    activityId,
    isSuccessSending,
    mapPhotoUrl,
    name,
    profile,
    profilePhoto,
    recipientEmail,
    sendEmailNotification,
    surname,
  ]);

  return (
    <Animated.View style={{ transform: [{ scale: likeScale }] }}>
      <IconButton
        testID={isLikedByYou.length > 0 ? CARD_LIKE_BTN_TEST_ID_LIKED : CARD_LIKE_BTN_TEST_ID_NOT_LIKED}
        icon={isLikedByYou.length || hasLikesFromOthers ? CARD_LIKE_BTN_ICON_LIKED : CARD_LIKE_BTN_ICON_NOT_LIKED}
        iconColor={
          isError ? colors.error : isLikedByYou.length || !hasLikesFromOthers ? colors.primary : colors.secondary
        }
        size={isLikedByYou.length ? 29 : 25}
        onPress={async () => {
          if (userId) {
            animateLike();
            try {
              if (isLikedByYou.length > 0) {
                await deleteLike({ id: isLikedByYou[0].id, activityId }).unwrap();
              } else {
                await sendLike({ activityId, authorId: userId, profilePhoto: profilePhoto ?? '' }).unwrap();
              }
              dispatch(setActivityIdWhichLikesToUpdate(activityId));
            } catch (error) {
              errorToast(LIKE_BTN[language].errorAction(isLikedByYou.length ? 'delete' : 'send'), error);
            }
          }
        }}
        disabled={isLoading || isDisabled || isError || isLikesLoading || isErrorLoadingUpdatedLikes}
      />
    </Animated.View>
  );
});
