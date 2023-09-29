import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';

import ActivityCardLikeBtn from '../../../../components/activity-card-like-btn/activity-card-like-btn';
import ActivityCardLikesWrapper from '../../../../components/activity-card-likes-wrapper/activity-card-likes-wrapper';
import ActivityCardTitle from '../../../../components/activity-card-title/activity-card-title';
import CommentInput from '../../../../components/comment-input/comment-input';
import Comments from '../../../../components/comments/comments';
import DisplayActivityMap from '../../../../components/display-activity-map/display-activity-map';
import ErrorComponent from '../../../../components/error-component/error-component';
import FloatingBtn from '../../../../components/floating-btn/floating-btn';
import UserNameSurname from '../../../../components/user-name-surname/user-name-surname';
import UserSportDate from '../../../../components/user-sport-date/user-sport-date';
import { useGetActivityByActivityIdQuery } from '../../../../redux/runich-api/runich-api';

export default function Comment() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId);
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);

  return (
    <ScrollView>
      <View style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
        {isLoading && <ActivityIndicator />}
        {error ? <ErrorComponent error={error} /> : null}
        {activity && (
          <View style={[{ flex: 1 }, isLoading && { justifyContent: 'center', alignItems: 'center' }]}>
            <DisplayActivityMap locations={activity?.locations} distance={activity?.distance} />
            <Card.Content style={{ display: 'flex', columnGap: 5, marginBottom: 10 }}>
              <ActivityCardTitle title={activity?.title} />
              <UserNameSurname userId={activity?.user_id} size="titleMedium" />
              <View style={{ display: 'flex', flexDirection: 'row' }}>
                <UserSportDate sport={activity?.sport} date={activity?.date} />
                <Text variant="bodyMedium">{` ${activity?.distance / 1000} км`}</Text>
              </View>
              <View style={{ display: 'flex', flexDirection: 'row' }}>
                <ActivityCardLikeBtn activityId={activity?.id} />
                <ActivityCardLikesWrapper activityId={activity?.id} />
              </View>
            </Card.Content>
            <Comments id={`${activityId}`} />
            {isShowingTextInput && <CommentInput activityId={`${activityId}`} />}
            {!isShowingTextInput && <FloatingBtn onPressFn={() => setIsShowingTextInput(true)} />}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
