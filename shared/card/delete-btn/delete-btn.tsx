import { useState } from 'react';
import { Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { useDeleteActivityByIdMutation } from '@R/services/activity/activity';
import { finishLoading, startLoading } from '@R/slices/loading/loading';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { errorToast } from '@S/error-toast/error-toast';
import { CARD_DELETE_BTN_TEST_ID, CARD_DELETE_BTN_ICON, CARD_DELETE_BTN } from './const';
import { useActivityCard } from '../context';

export default function CardDeleteBtn() {
  const { activity, isShowDeleteBtn } = useActivityCard();
  const { userId: ownerId, id: activityId } = activity;
  const [deleteActivityById, { isLoading: isDeleteRequestLoading }] = useDeleteActivityByIdMutation();
  const dispatch = useAppDispatch();
  const { back } = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { isLoading } = useAppSelector(({ loading }) => loading);
  const { colors } = useTheme();
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);

  if (userId !== ownerId || !isShowDeleteBtn) return null;

  async function successHandler() {
    dispatch(startLoading());
    try {
      await deleteActivityById(activityId).unwrap();
      setIsConfirmDialogVisible(false);
      back();
    } catch (error) {
      errorToast('', error);
    } finally {
      dispatch(finishLoading());
    }
  }

  return (
    <View>
      <IconButton
        testID={CARD_DELETE_BTN_TEST_ID}
        icon={CARD_DELETE_BTN_ICON}
        iconColor={colors.primary}
        size={20}
        onPress={async () => {
          if (Platform.OS === 'web') await successHandler();
          else setIsConfirmDialogVisible(true);
        }}
        disabled={isLoading || isDeleteRequestLoading}
      />
      <ConfirmDialog
        visible={isConfirmDialogVisible}
        title={CARD_DELETE_BTN[language].deleteActivity}
        message={CARD_DELETE_BTN[language].question}
        confirmText={CARD_DELETE_BTN[language].accept}
        cancelText={CARD_DELETE_BTN[language].cancel}
        destructive
        loading={isDeleteRequestLoading}
        onDismiss={() => setIsConfirmDialogVisible(false)}
        onConfirm={successHandler}
      />
    </View>
  );
}
