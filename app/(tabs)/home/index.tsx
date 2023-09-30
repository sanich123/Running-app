import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, ToastAndroid } from 'react-native';
import { ActivityIndicator, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../../auth/context/auth-context';
import ActivitySendingIndicator from '../../../components/activity-sending-indicator/activity-sendinig-indicator';
import ActivityCard from '../../../components/card/card';
import EmptyActivitiesList from '../../../components/empty-activities-list/empty-activities-list';
import ErrorComponent from '../../../components/error-component/error-component';
import FloatingBtn from '../../../components/floating-btn/floating-btn';
import { setIsNeedToSendActivity } from '../../../redux/activity/activity';
import {
  useAddActivityByUserIdMutation,
  useGetActivitiesByUserIdWithFriendsActivitiesQuery,
} from '../../../redux/runich-api/runich-api';
import { errorHandler } from '../../../utils/error-handler';
import useGetLocation from '../../../utils/hooks/use-get-location';
import useRefresh from '../../../utils/hooks/use-refresh';

export default function Feed() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  useGetLocation();
  const { data: activities, error, isLoading, refetch } = useGetActivitiesByUserIdWithFriendsActivitiesQuery(user.id);
  const [sendActivity] = useAddActivityByUserIdMutation();
  const { onRefresh, refreshing } = useRefresh(refetch);
  const router = useRouter();
  const { activityToSend, isNeedToSend } = useSelector(({ activity }) => activity);
  const [isErrorSending, setIsErrorSending] = useState(false);
  const [isStartSending, setIsStartSending] = useState(false);
  const [isSuccessSending, setIsSuccessSending] = useState(false);
  console.log(isNeedToSend, isStartSending, isErrorSending, isSuccessSending);

  useEffect(() => {
    if (isNeedToSend) {
      setIsStartSending(true);
      sendActivityToServer();
      dispatch(setIsNeedToSendActivity(false));
    }
  }, [isNeedToSend]);

  async function sendActivityToServer() {
    try {
      await sendActivity({ body: activityToSend, id: user.id })
        .unwrap()
        .then((data) => {
          console.log(data);
          ToastAndroid.show('Successfully sended data to server!', ToastAndroid.SHORT);
          dispatch(setIsNeedToSendActivity(false));
          setIsSuccessSending(true);
        })
        .catch((error) => {
          setIsErrorSending(true);
          ToastAndroid.show('Some error occured', ToastAndroid.SHORT);
          console.log(error);
        })
        .finally(() => {
          setIsStartSending(false);
          setTimeout(() => setIsSuccessSending(false), 1000);
        });
    } catch (error) {
      errorHandler(error);
    }
  }
  return (
    <>
      <SafeAreaView
        style={[{ flex: 1 }, (isLoading || !activities?.length) && { alignItems: 'center', justifyContent: 'center' }]}>
        {activities && (
          <FlatList
            onRefresh={onRefresh}
            data={activities}
            refreshing={refreshing}
            renderItem={({ item }) => {
              const { description, title, date, sport, locations, photoUrls, duration, speed, distance, id, user_id } =
                item;
              return (
                <ActivityCard
                  description={description}
                  title={title}
                  date={date}
                  sport={sport}
                  userId={user_id}
                  id={id}
                  locations={locations}
                  key={id}
                  photoUrls={photoUrls}
                  duration={duration}
                  speed={speed}
                  distance={distance}
                />
              );
            }}
            ListEmptyComponent={<EmptyActivitiesList />}
            ListHeaderComponent={
              (isStartSending || isErrorSending) && (
                <ActivitySendingIndicator isStartSending={isStartSending} isErrorSending={isErrorSending} />
              )
            }
            initialNumToRender={5}
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
        {isLoading && <ActivityIndicator size="large" />}
        {error ? <ErrorComponent error={error} /> : null}
        <FloatingBtn onPressFn={() => router.push('/save-activity/')} />
      </SafeAreaView>
    </>
  );
}
