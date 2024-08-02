import { setIsNeedToRefreshActivities } from '@R/main-feed/main-feed';
import { useDeleteActivityByIdMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { errorHandler } from '@U/error-handler';
import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';

import { CARD_DELETE_BTN_TEST_ID, CARD_DELETE_BTN_ICON, CARD_DELETE_BTN } from './const';

export default function CardDeleteBtn({ activityId }: { activityId: string }) {
  const dispatch = useAppDispatch();
  const [deleteActivityById, { data, error }] = useDeleteActivityByIdMutation();
  const { isLoading, isDisabled, setIsLoading, setIsDisabled } = useContext(ActivityCardBtnsContext);
  const { back } = useRouter();
  const { language } = useAppSelector(({ language }) => language);

  useEffect(() => {
    if (data) {
      setIsLoading(false);
      setIsDisabled(false);
    }
    if (error) {
      errorHandler(error);
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [data, error, setIsDisabled, setIsLoading]);

  async function successHandler() {
    setIsLoading(true);
    setIsDisabled(true);
    await deleteActivityById(activityId).unwrap();
    dispatch(setIsNeedToRefreshActivities(true));
    back();
  }

  return (
    <IconButton
      testID={CARD_DELETE_BTN_TEST_ID}
      icon={CARD_DELETE_BTN_ICON}
      iconColor={MD3Colors.primary50}
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
