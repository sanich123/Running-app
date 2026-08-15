import { useContext, useEffect, memo } from 'react';
import { IconButton, useTheme } from 'react-native-paper';
import { useSendEmailAfterSendingLikeMutation } from '@R/services/emails/emails';
import { useDeleteLikeMutation, useGetLikesByActivityIdQuery, useSendLikeMutation } from '@R/services/likes/likes';
import { useAppSelector } from '@R/typed-hooks';
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

export default memo(function LikeBtn({ activityId, profile, mapPhotoUrl }: LikeBtnProps) {
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isDisabled, isLoading } = useContext(ActivityCardBtnsContext);
  const { language } = useAppSelector(({ language }) => language);
  const {
    profileFromServer: { profilePhoto, name, surname },
  } = useAppSelector(({ profile }) => profile);

  const {
    data: likes,
    isError,
    isLoading: isLikesLoading,
  } = useGetLikesByActivityIdQuery(activityId, { skip: !activityId });
  const likesList = likes ?? [];
  const [sendEmailNotification] = useSendEmailAfterSendingLikeMutation();
  const [sendLike, { isSuccess: isSuccessSending }] = useSendLikeMutation();

  const [deleteLike] = useDeleteLikeMutation();

  const isLikedByYou = likesList.filter(({ authorId }) => authorId === userId);
  const hasLikesFromOthers = likesList.length > 0 && !isLikedByYou.length;

  useEffect(() => {
    if (isSuccessSending && profile?.emailNotifications && profile.users?.email) {
      sendEmailNotification({
        name: name ?? '',
        surname: surname ?? '',
        profilePhoto: profilePhoto ?? '',
        recepientName: profile.name ?? '',
        recepientSurname: profile.surname ?? '',
        recepientEmail: profile.users.email,
        mapPhotoUrl: mapPhotoUrl || '',
      });
    }
  }, [isSuccessSending, mapPhotoUrl, name, profile, profilePhoto, sendEmailNotification, surname]);

  return (
    <IconButton
      testID={isLikedByYou.length > 0 ? CARD_LIKE_BTN_TEST_ID_LIKED : CARD_LIKE_BTN_TEST_ID_NOT_LIKED}
      icon={isLikedByYou.length || hasLikesFromOthers ? CARD_LIKE_BTN_ICON_LIKED : CARD_LIKE_BTN_ICON_NOT_LIKED}
      iconColor={
        isError ? colors.error : isLikedByYou.length || !hasLikesFromOthers ? colors.primary : colors.secondary
      }
      size={isLikedByYou.length ? 29 : 25}
      onPress={async () => {
        if (userId) {
          try {
            if (isLikedByYou.length > 0) {
              await deleteLike({ id: isLikedByYou[0].id, activityId }).unwrap();
            } else {
              await sendLike({ activityId, authorId: userId, profilePhoto: profilePhoto ?? '' }).unwrap();
            }
          } catch (error) {
            errorToast(LIKE_BTN[language].errorAction(isLikedByYou.length ? 'delete' : 'send'), error);
          }
        }
      }}
      disabled={isLoading || isDisabled || isError || isLikesLoading}
    />
  );
});
