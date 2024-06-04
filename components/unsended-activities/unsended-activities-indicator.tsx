import { refreshUnsendedActivitiesList, setIsHaveUnsyncedActivity } from '@R/activity/activity';
import { setIsNeedToRefreshActivities } from '@R/main-feed/main-feed';
import { useAddActivityByUserIdMutation } from '@R/runich-api/runich-api';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { UNSENDED_ACTIVITIES } from './const';

export default function UnsendedActivitiesIndicator() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { unsyncedActivities, isHaveUnsyncedActivity } = useAppSelector(({ activity }) => activity);
  const [sendActivity, { isLoading, isError, isSuccess, data, error }] = useAddActivityByUserIdMutation();
  const { language } = useAppSelector(({ language }) => language);
  const [errorSending, setErrorSending] = useState(false);
  const [successSending, setIsSuccessSending] = useState(false);
  const isInitial = !isLoading && !successSending && !errorSending;

  async function activitySender() {
    const lastActivity = unsyncedActivities[unsyncedActivities.length - 1];
    await sendActivity(lastActivity).unwrap();
  }

  useEffect(() => {
    if (isSuccess) {
      if (!process.env.IS_TESTING) {
        console.log('response', data);
      }
      dispatch(setIsNeedToRefreshActivities(true));
      setIsSuccessSending(true);
      const reducedUnsyncedList = unsyncedActivities.slice(0, -1);
      dispatch(refreshUnsendedActivitiesList(reducedUnsyncedList));
    }
    if (isError) {
      console.log('failure', error);
      if (error && 'message' in error && error?.message === 'Aborted') {
        if (Platform.OS !== 'web') {
          showCrossPlatformToast('Достигнут лимит времени соединения с сервером', ToastDuration.long);
        } else {
          toast.show('Достигнут лимит времени соединения с сервером');
        }
      }
      setErrorSending(true);
      setTimeout(() => setErrorSending(false), 2000);
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (isHaveUnsyncedActivity && !unsyncedActivities.length) {
      dispatch(setIsHaveUnsyncedActivity(false));
    }
    if (isHaveUnsyncedActivity) {
      activitySender();
    }
  }, [isHaveUnsyncedActivity]);

  return (
    <>
      {unsyncedActivities.length > 0 && (
        <View style={[styles.inCenter]}>
          <Text variant="bodyLarge">
            {isInitial &&
              unsyncedActivities.length > 0 &&
              `${UNSENDED_ACTIVITIES[language].initialBegin} ${unsyncedActivities.length} ${UNSENDED_ACTIVITIES[language].initialEnd}`}
            {isLoading && UNSENDED_ACTIVITIES[language].isLoading}
            {successSending && UNSENDED_ACTIVITIES[language].success}
            {/* {errorSending && UNSENDED_ACTIVITIES[language].error} */}
          </Text>
          <Button loading={isLoading} onPress={async () => activitySender()}>
            Manually
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
    height: 50,
    width: '100%',
  },
});
