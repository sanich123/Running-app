import { View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useAddActivityByUserIdMutation } from '@R/services/activity/activity';
import { clearUnsendedActivities, removeUnsendedActivityFromList } from '@R/slices/unsended-activity/unsended-activity';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';

export default function UnsendedActivitiesIndicator() {
  const dispatch = useAppDispatch();
  const { unsyncedActivities } = useAppSelector(({ unsendedActivity }) => unsendedActivity);
  const [sendActivity, { isLoading }] = useAddActivityByUserIdMutation();

  return (
    <View style={{ padding: 10, margin: 10 }}>
      <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
        Есть {unsyncedActivities.length} сохраненные активности
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <IconButton
          icon="sync"
          testID="send-unsynced-activities"
          loading={isLoading}
          onPress={async () => {
            if (unsyncedActivities?.[0]) {
              await sendActivity(unsyncedActivities?.[0])
                .unwrap()
                .then(() => {
                  dispatch(removeUnsendedActivityFromList());
                  successToast('Успешно обновили');
                })
                .catch((error) => errorToast('', getErrorMessageFromError(error)));
            }
          }}
          disabled={isLoading}
        />

        <IconButton
          icon="delete"
          testID="delete-unsynced-activities"
          loading={isLoading}
          disabled={isLoading}
          onPress={() => dispatch(clearUnsendedActivities())}
        />
      </View>
    </View>
  );
}
