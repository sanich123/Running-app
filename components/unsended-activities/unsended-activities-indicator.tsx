import { resetActivitySlice } from '@R/slices/activity/activity';
import { useAddActivityByUserIdMutation } from '@R/services/activity/activity';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { UNSENDED_ACTIVITIES } from './const';
import { refreshUnsendedActivitiesList } from '@R/slices/unsended-activity/unsended-activity';

export default function UnsendedActivitiesIndicator() {
  const dispatch = useAppDispatch();
  const { unsyncedActivities } = useAppSelector(({ unsendedActivity }) => unsendedActivity);
  const [sendActivity, { isLoading }] = useAddActivityByUserIdMutation();
  const { language } = useAppSelector(({ language }) => language);

  async function activitySender() {
    const lastActivity = unsyncedActivities[unsyncedActivities.length - 1];
    await sendActivity(lastActivity)
      .unwrap()
      .then(() => {
        const reducedUnsyncedList = unsyncedActivities.slice(0, -1);
        dispatch(refreshUnsendedActivitiesList(reducedUnsyncedList));
      })
      .catch((error) => showCrossPlatformToast('Ошибка во время отправки активности'));
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
          <Button loading={isLoading} onPress={activitySender}>
            Вручную
          </Button>
          <Button loading={isLoading} onPress={() => dispatch(resetActivitySlice())}>
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
