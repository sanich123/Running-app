import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { UNSENDED_ACTIVITIES } from './const';
import { refreshUnsendedActivitiesList, setIsHaveUnsyncedActivity } from '../../redux/activity/activity';
import { useAddActivityByUserIdMutation } from '../../redux/runich-api/runich-api';

export default function UnsendedActivitiesIndicator() {
  const { unsyncedActivities, isHaveUnsyncedActivity } = useSelector(({ activity }) => activity);
  const [sendActivity, { isLoading }] = useAddActivityByUserIdMutation();
  const { language } = useSelector(({ language }) => language);
  const [errorSending, setErrorSending] = useState(false);
  const [successSending, setIsSuccessSending] = useState(false);
  const dispatch = useDispatch();
  const isInitial = !isLoading && !successSending && !errorSending;

  async function activitySender() {
    const lastActivity = unsyncedActivities[unsyncedActivities.length - 1];
    await sendActivity(lastActivity)
      .then((response) => {
        if ('error' in response) {
          if ((response.error.status as number) >= 400) {
            setErrorSending(true);
            setTimeout(() => setErrorSending(false), 2000);
          }
        } else {
          setIsSuccessSending(true);
          const reducedUnsyncedList = unsyncedActivities.slice(0, -1);
          dispatch(refreshUnsendedActivitiesList(reducedUnsyncedList));
          if (!unsyncedActivities.length) {
            dispatch(setIsHaveUnsyncedActivity(true));
          }
          setTimeout(() => setIsSuccessSending(false), 2000);
        }
      })
      .catch((error) => {
        console.log('failure', error);
        setErrorSending(true);
        setTimeout(() => setErrorSending(false), 2000);
      });
  }

  useEffect(() => {
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
            {errorSending && UNSENDED_ACTIVITIES[language].error}
          </Text>
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
