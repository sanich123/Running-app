import { useState } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDeleteActivityByIdMutation } from '@R/services/activity/activity';
import { finishLoading, startLoading } from '@R/slices/loading/loading';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { ACTIVITY_DELETE_CONFIRMATION } from '../const';
import type { ActivityResponse } from '@R/runich-api/types';

export default function useDeleteActivityAction(activity?: ActivityResponse | null) {
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const [deleteActivityById, { isLoading: isDeleteRequestLoading }] = useDeleteActivityByIdMutation();
  const dispatch = useAppDispatch();
  const { back } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isLoading } = useAppSelector(({ loading }) => loading);

  async function deleteActivity() {
    if (!activity) return;

    dispatch(startLoading());
    try {
      await deleteActivityById(activity.id).unwrap();
      setIsConfirmDialogVisible(false);
      back();
    } catch (error) {
      errorToast('', error);
    } finally {
      dispatch(finishLoading());
    }
  }

  function handleDeleteActionPress() {
    if (!activity || userId !== activity.userId || isLoading || isDeleteRequestLoading) return;

    if (Platform.OS === 'web') void deleteActivity();
    else setIsConfirmDialogVisible(true);
  }

  return {
    confirmation: ACTIVITY_DELETE_CONFIRMATION[language],
    isActivityOwner: Boolean(activity && userId === activity.userId),
    isConfirmDialogVisible,
    isDeleteRequestLoading,
    onConfirm: deleteActivity,
    onDismiss: () => setIsConfirmDialogVisible(false),
    onPress: handleDeleteActionPress,
  };
}
