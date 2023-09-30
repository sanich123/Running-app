import { useState } from 'react';
import { View, Pressable, ToastAndroid } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

// import { useAuth } from '../../auth/context/auth-context';
import { setIsNeedToSendActivity } from '../../redux/activity/activity';
import { useAddActivityByUserIdMutation } from '../../redux/runich-api/runich-api';
import { errorHandler } from '../../utils/error-handler';

export default function ActivitySendingIndicator() {
  // const { user } = useAuth();
  const dispatch = useDispatch();
  const { activityToSend, isNeedToSend } = useSelector(({ activity }) => activity);
  const [sendActivity] = useAddActivityByUserIdMutation();
  const [isFetching, setIsFetching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  if (isNeedToSend) {
    setIsFetching(true);
    sendActivityToServer();
    dispatch(setIsNeedToSendActivity(false));
  }

  async function sendActivityToServer() {
    try {
      return await sendActivity({ body: activityToSend, id: 7 })
        .unwrap()
        .then(() => {
          setIsFetching(false);
          setIsError(false);
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 2000);
        })
        .catch((error) => {
          setIsError(true);
          setIsFetching(false);
          setIsSuccess(false);
          ToastAndroid.show('Some error occured', ToastAndroid.SHORT);
          console.log(error);
        });
    } catch (error) {
      errorHandler(error);
    }
  }
  return (
    <>
      {(isFetching || isSuccess) && (
        <View
          style={[
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 30,
            },
            isFetching && { backgroundColor: 'yellow' },
            isSuccess && { backgroundColor: 'green' },
          ]}>
          <Text variant="bodyMedium">
            {isFetching && 'Sending an activity...'}
            {isSuccess && 'Successfully sended!'}
          </Text>
        </View>
      )}
      {isError && (
        <Pressable
          onPress={() => {
            if (isError) dispatch(setIsNeedToSendActivity(true));
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
      )}
    </>
  );
}
