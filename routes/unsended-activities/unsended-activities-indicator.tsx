import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAddActivityByUserIdMutation } from '@R/services/activity/activity';
import { clearUnsendedActivities, refreshUnsendedActivitiesList } from '@R/slices/unsended-activity/unsended-activity';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { UNSENDED_ACTIVITIES } from './const';

export default function UnsendedActivitiesIndicator() {
  const dispatch = useAppDispatch();
  const { unsyncedActivities } = useAppSelector(({ unsendedActivity }) => unsendedActivity);
  const [sendActivity, { isLoading }] = useAddActivityByUserIdMutation();
  const { language } = useAppSelector(({ language }) => language);

  async function activitySender() {
    let pendingActivities = [...unsyncedActivities];
    while (pendingActivities.length > 0) {
      try {
        await sendActivity(pendingActivities[0]).unwrap();
        pendingActivities = pendingActivities.slice(1);
        dispatch(refreshUnsendedActivitiesList(pendingActivities));
      } catch (error) {
        errorToast('Ошибка во время отправки активности', error);
        break;
      }
    }
  }

  return (
    <>
      {unsyncedActivities.length > 0 && (
        <View style={[styles.inCenter]}>
          <Text variant="bodyLarge">
            {unsyncedActivities.length > 0 &&
              `${UNSENDED_ACTIVITIES[language].initialBegin} ${unsyncedActivities.length} ${UNSENDED_ACTIVITIES[language].initialEnd}`}
            {isLoading && UNSENDED_ACTIVITIES[language].isLoading}
            {/* {successSending && UNSENDED_ACTIVITIES[language].success}
            {errorSending && UNSENDED_ACTIVITIES[language].error} */}
          </Text>
          <Button loading={isLoading} onPress={activitySender} disabled={isLoading}>
            {UNSENDED_ACTIVITIES[language].send}
          </Button>
          <Button loading={isLoading} onPress={() => dispatch(clearUnsendedActivities())}>
            Удалить
          </Button>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  inCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: '100%',
  },
});
