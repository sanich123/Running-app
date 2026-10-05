import { useCallback, useEffect, useState } from 'react';
import { Animated } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useSendEmailAfterSendingLikeMutation } from '@R/services/emails/emails';
import {
  useDeleteLikeMutation,
  useGetLikesByActivityIdInfiniteQuery,
  useSendLikeMutation,
} from '@R/services/likes/likes';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { setActivityIdWhichLikesToUpdate } from '@R/slices/main-feed/main-feed';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { useActivityCard } from '../context';
import {
  CARD_LIKE_BTN_TEST_ID_LIKED,
  CARD_LIKE_BTN_TEST_ID_NOT_LIKED,
  CARD_LIKE_BTN_ICON_LIKED,
  CARD_LIKE_BTN_ICON_NOT_LIKED,
} from './const';
import { LIKE_BTN } from '../likes/const';

export default function LikeBtn() {
  const { activity } = useActivityCard();
  const { id: activityId, userId: activityOwnerId, likesLength, profile, mapPhotoUrl } = activity;
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data: currentUserProfile } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const { language } = useAppSelector(({ settings }) => settings);
  const { activityIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const { profilePhoto, name, surname } = currentUserProfile ?? {};

  const isLikesMarkedForUpdate = activityIdWhichLikesToUpdate === activityId;
  const shouldLoadLikes = likesLength !== 0 || isLikesMarkedForUpdate;

  const {
    data: likesPages,
    isError,
    isLoading: isLikesLoading,
  } = useGetLikesByActivityIdInfiniteQuery(
    { activityId },
    {
      skip: !activityId || !shouldLoadLikes,
    },
  );
  const likesList = likesPages?.pages.flatMap(({ likes }) => likes) ?? [];
  const currentUserLike =
    likesPages?.pages[0]?.currentUserLike ?? likesList.find(({ authorId }) => authorId === userId) ?? null;
  const [sendEmailNotification] = useSendEmailAfterSendingLikeMutation();
  const [sendLike, { isLoading: isSendingLike, isSuccess: isSuccessSending }] = useSendLikeMutation();

  const [deleteLike, { isLoading: isDeletingLike }] = useDeleteLikeMutation();
  const recipientEmail = profile?.email ?? profile?.user?.email;

  const isLikedByYou = currentUserLike ? [currentUserLike] : [];
  const hasLikesFromOthers =
    likesList.some(({ authorId }) => authorId !== userId) || (likesLength ?? 0) > Number(Boolean(currentUserLike));
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
        disabled={
          isError ||
          isLikesLoading ||
          isSendingLike ||
          isDeletingLike ||
          (profile?.allowActivityInteractions === false && activityOwnerId !== userId)
        }
      />
    </Animated.View>
  );
}
