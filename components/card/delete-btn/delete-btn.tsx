import { useContext } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { useDeleteActivityByIdMutation } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { errorHandler } from '@U/error-handler';
import { CARD_DELETE_BTN_TEST_ID, CARD_DELETE_BTN_ICON, CARD_DELETE_BTN } from './const';

export default function CardDeleteBtn({ activityId }: { activityId: string }) {
  const [deleteActivityById] = useDeleteActivityByIdMutation();
  const { isLoading, isDisabled, setIsLoading, setIsDisabled } = useContext(ActivityCardBtnsContext);
  const { replace } = useRouter();
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();

  async function successHandler() {
    setIsLoading(true);
    setIsDisabled(true);
    await deleteActivityById(activityId)
      .unwrap()
      .then()
      .catch((error) => errorHandler(error))
      .finally(() => {
        setIsLoading(false);
        setIsDisabled(false);
      });
    replace('/');
  }

  return (
    <IconButton
      testID={CARD_DELETE_BTN_TEST_ID}
      icon={CARD_DELETE_BTN_ICON}
      iconColor={colors.primary}
      size={20}
      onPress={async () => {
        if (Platform.OS === 'web') {
          successHandler();
        } else {
          Alert.alert(
            CARD_DELETE_BTN[language].deleteActivity,
            CARD_DELETE_BTN[language].question,
            [
              {
                text: CARD_DELETE_BTN[language].accept,
                onPress: successHandler,
                style: 'cancel',
              },
            ],
            { cancelable: true },
          );
        }
      }}
      disabled={isLoading || isDisabled}
    />
  );
}
