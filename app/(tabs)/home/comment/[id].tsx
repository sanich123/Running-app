import { usePathname } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import AvatarShowable from '../../../../components/avatar/avatar-showable';
import CommentInput from '../../../../components/comment-input/comment-input';
import Comments from '../../../../components/comments/comments';
import ErrorComponent from '../../../../components/error-component/error-component';
import FloatingBtn from '../../../../components/floating-btn/floating-btn';
import { useGetActivityByActivityIdQuery } from '../../../../redux/runnich-api/runnich-api';
import { formatDate } from '../../../../utils/time-formatter';

export default function Comment() {
  const pathname = usePathname();
  const activityId = pathname.replace('/home/comment/', '');
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId);
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);
  const { id: userId } = useSelector(({ userInfo }) => userInfo);

  return (
    <ScrollView>
      {isLoading && <ActivityIndicator />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <View style={{ flex: 1 }}>
          <Card.Content
            style={{ display: 'flex', flexDirection: 'row', columnGap: 5, marginBottom: 10, alignItems: 'center' }}>
            <AvatarShowable size={40} id={userId} />

            <View style={{ display: 'flex' }}>
              <Text variant="bodyLarge">
                {activity.name} {activity.surname}
              </Text>
              <Text variant="bodySmall">
                {formatDate(activity.date)}, {activity.sport}
              </Text>
              <Text variant="headlineSmall">{activity.title}</Text>
            </View>
          </Card.Content>
          <Comments id={activityId} />
          {isShowingTextInput && <CommentInput userId={userId} activityId={activityId} />}
          {!isShowingTextInput && <FloatingBtn onPressFn={() => setIsShowingTextInput(true)} />}
        </View>
      )}
    </ScrollView>
  );
}
