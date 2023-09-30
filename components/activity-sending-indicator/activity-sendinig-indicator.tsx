import { useEffect, useState } from 'react';
import { View, Pressable, ToastAndroid } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { setIsNeedToSendActivity } from '../../redux/activity/activity';
import { useAddActivityByUserIdMutation } from '../../redux/runich-api/runich-api';
import { errorHandler } from '../../utils/error-handler';

export default function ActivitySendingIndicator() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { activityToSend, isNeedToSend } = useSelector(({ activity }) => activity);
  const [sendActivity] = useAddActivityByUserIdMutation();
  const [isFetching, setIsFetching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (isNeedToSend) {
      setIsFetching(true);
      sendActivityToServer();
      dispatch(setIsNeedToSendActivity(false));
    }
  }, [isNeedToSend]);

  async function sendActivityToServer() {
    try {
      await sendActivity({ body: activityToSend, id: user.id })
        .unwrap()
        .then(() => {
          setIsFetching(false);
          setIsSuccess(true);
          setIsError(false);
          setTimeout(() => setIsSuccess(false), 2000);
        })
        .catch((error) => {
          setIsFetching(false);
          setIsSuccess(false);
          setIsError(true);
          ToastAndroid.show('Some error occured', ToastAndroid.SHORT);
          console.log(error);
        });
    } catch (error) {
      setIsFetching(false);
      setIsSuccess(false);
      setIsError(true);
      ToastAndroid.show('Some error occured', ToastAndroid.SHORT);
      console.log(error);
      errorHandler(error);
    }
  }
  return (
    <>
      {(isNeedToSend || isFetching || isSuccess || isError) && (
        <>
          <View
            style={[
              {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 30,
              },
              isFetching && { backgroundColor: 'yellow' },
              isError && { backgroundColor: 'red' },
              isSuccess && { backgroundColor: 'green' },
            ]}>
            <Text variant="bodyMedium">
              {isFetching && 'Sending an activity...'}
              {isSuccess && 'Successfully sended!'}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              if (isError) {
                dispatch(setIsNeedToSendActivity(true));
              }
            }}>
            <View
              style={[
                {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 30,
                },
                isError && { backgroundColor: 'red' },
              ]}>
              <Text variant="bodyMedium"> {isError && 'An error occured, try manually'}</Text>
            </View>
          </Pressable>
        </>
      )}
    </>
  );
}
