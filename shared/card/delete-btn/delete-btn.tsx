import { useContext, useState } from 'react';
import { Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useDeleteActivityByIdMutation } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { errorToast } from '@S/error-toast/error-toast';
import { CARD_DELETE_BTN_TEST_ID, CARD_DELETE_BTN_ICON, CARD_DELETE_BTN } from './const';

export default function CardDeleteBtn({ activityId }: { activityId: string }) {
  const [deleteActivityById] = useDeleteActivityByIdMutation();
  const { isLoading, isDisabled, setIsLoading, setIsDisabled } = useContext(ActivityCardBtnsContext);
  const { replace } = useRouter();
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);

  async function successHandler() {
    setIsLoading(true);
    setIsDisabled(true);
    await deleteActivityById(activityId)
      .unwrap()
      .then(() => replace(ROUTES.root))
      .catch((error) => errorToast('', error))
      .finally(() => {
        setIsLoading(false);
        setIsDisabled(false);
      });
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
        disabled={isLoading || isDisabled}
      />
      <ConfirmDialog
        visible={isConfirmDialogVisible}
        title={CARD_DELETE_BTN[language].deleteActivity}
        message={CARD_DELETE_BTN[language].question}
        confirmText={CARD_DELETE_BTN[language].accept}
        onDismiss={() => setIsConfirmDialogVisible(false)}
        onConfirm={async () => {
          setIsConfirmDialogVisible(false);
          await successHandler();
        }}
      />
    </View>
  );
}
