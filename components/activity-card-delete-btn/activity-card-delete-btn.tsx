import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';

import { useDeleteActivityByIdMutation } from '../../redux/runnich-api/runnich-api';
import { ActivityCardBtnsContext } from '../../utils/context/activity-card-btns';
import { errorHandler } from '../../utils/error-handler';

export default function ActivityCardDeleteBtn({ activityId }: { activityId: string }) {
  const [deleteActivityById, { data, error }] = useDeleteActivityByIdMutation();
  const { isLoading, isDisabled, setIsLoading, setIsDisabled } = useContext(ActivityCardBtnsContext);
  const router = useRouter();
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
      icon="delete"
      iconColor={MD3Colors.primary50}
      size={20}
      onPress={async () => {
        try {
          Alert.alert(
            'Deleting activity',
            'Are you sure?',
            [
              {
                text: 'Yes, I am sure',
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
