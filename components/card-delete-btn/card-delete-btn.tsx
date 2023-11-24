import { useDeleteActivityByIdMutation } from '@R/runich-api/runich-api';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { errorHandler } from '@U/error-handler';
import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { CARD_DELETE_BTN_TEST_ID, CARD_DELETE_BTN_ICON, CARD_DELETE_BTN } from './const';

export default function ActivityCardDeleteBtn({ activityId }: { activityId: string }) {
  const [deleteActivityById, { data, error }] = useDeleteActivityByIdMutation();
  const { isLoading, isDisabled, setIsLoading, setIsDisabled } = useContext(ActivityCardBtnsContext);
  const router = useRouter();
  const { language } = useSelector(({ language }) => language);
  useEffect(() => {
    if (data) {
      console.log(data);
      setIsLoading(false);
      setIsDisabled(false);
    }
    if (error) {
      console.log(error);
    }
  }, [data, error]);

  return (
    <IconButton
      testID={CARD_DELETE_BTN_TEST_ID}
      icon={CARD_DELETE_BTN_ICON}
      iconColor={MD3Colors.primary50}
      size={20}
      onPress={async () => {
        try {
          Alert.alert(
            CARD_DELETE_BTN[language as keyof typeof CARD_DELETE_BTN].deleteActivity,
            CARD_DELETE_BTN[language as keyof typeof CARD_DELETE_BTN].question,
            [
              {
                text: CARD_DELETE_BTN[language as keyof typeof CARD_DELETE_BTN].accept,
                onPress: async () => {
                  setIsLoading(true);
                  setIsDisabled(true);
                  await deleteActivityById(activityId).unwrap();
                  router.push('/');
                },
                style: 'cancel',
              },
            ],
            {
              cancelable: true,
            },
          );
        } catch (error) {
          errorHandler(error);
          setIsLoading(false);
          setIsDisabled(false);
        }
      }}
      disabled={isLoading || isDisabled}
    />
  );
}
