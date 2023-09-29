import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, ToastAndroid, Pressable } from 'react-native';
import { ActivityIndicator, Divider, Searchbar, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../../auth/context/auth-context';
import { View } from '../../../components/Themed';
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

  useEffect(() => {
    if (isNeedToSend) {
      setIsStartSending(true);
      sendActivityToServer();
    }
  }, []);

  async function sendActivityToServer() {
    try {
      await sendActivity({ body: activityToSend, id: user.id })
        .unwrap()
        .then((data) => {
          console.log(data);
          ToastAndroid.show('Successfully sended data to server!', ToastAndroid.SHORT);
          setIsStartSending(false);
          dispatch(setIsNeedToSendActivity(false));
        })
        .catch((error) => {
          setIsErrorSending(true);
          ToastAndroid.show('Some error occured', ToastAndroid.SHORT);
          console.log(error);
        });
    } catch (error) {
      errorHandler(error);
    }
  }
  return (
    <>
      <SafeAreaView
        style={[{ flex: 1 }, (isLoading || !activities?.length) && { alignItems: 'center', justifyContent: 'center' }]}>
        {(isStartSending || isErrorSending) && (
          <Pressable
            onPress={() => {
              if (isErrorSending) {
                dispatch(setIsNeedToSendActivity(true));
              }
            }}>
            <View
              style={{
                height: 30,
                position: 'absolute',
                top: 0,
                backgroundColor: !isErrorSending ? 'green' : 'red',
              }}>
              <Text variant="bodyMedium">
                {isStartSending ? 'Sending an activity' : 'An error occured, try to refetch manually'}
              </Text>
            </View>
          </Pressable>
        )}
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
            ListHeaderComponent={<Searchbar placeholder="Search something" value="" />}
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
