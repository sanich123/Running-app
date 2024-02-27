import ActivityCardLikeBtn from '@C/card-like-btn/card-like-btn';
import CardLikes, { CardLikesSize } from '@C/card-likes/card-likes';
import CardMapImagesList from '@C/card-map-images-list/card-map-images-list';
import CardTitle from '@C/card-title/card-title';
import CommentInput from '@C/comment-input/comment-input';
import Comments from '@C/comments/comments';
import ErrorComponent from '@C/error-component/error-component';
import FloatingBtn from '@C/floating-btn/floating-btn';
import UserNameSurname from '@C/user-name-surname/user-name-surname';
import UserSportDate from '@C/user-sport-date/user-sport-date';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';

export default function CommentFullViewPage() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error, isError } = useGetActivityByActivityIdQuery(`${activityId}`);
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);

  return (
    <ScrollView contentContainerStyle={[(isLoading || isError) && styles.isInCenter]}>
      {isLoading && <ActivityIndicator size="large" />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <View style={[{ flex: 1 }, isLoading && styles.inCenter]}>
          {(activity?.locations?.length || activity?.photoUrls?.length > 0) && (
            <CardMapImagesList photoUrls={activity?.photoUrls} id={`${activityId}`} />
          )}
          <Card.Content style={styles.contentLayout}>
            <CardTitle title={activity?.title} />
            <UserNameSurname userId={activity?.user_id} size="titleMedium" />
            <View style={styles.columnsLayout}>
              <UserSportDate sport={activity?.sport} date={activity?.date} />
              <Text variant="bodyMedium">{` ${activity?.distance / 1000} км`}</Text>
            </View>
            <View style={styles.columnsLayout}>
              <ActivityCardLikeBtn activityId={activity?.id} />
              <CardLikes activityId={activity?.id} size={CardLikesSize.big} />
            </View>
          </Card.Content>
          <Comments id={`${activityId}`} />
          {isShowingTextInput && <CommentInput activityId={`${activityId}`} />}
          {!isShowingTextInput && <FloatingBtn onPressFn={() => setIsShowingTextInput(true)} />}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentLayout: {
    display: 'flex',
    columnGap: 5,
    marginBottom: 10,
  },
  columnsLayout: {
    display: 'flex',
    flexDirection: 'row',
  },
});
