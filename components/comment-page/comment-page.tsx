import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Card, FAB, Text } from 'react-native-paper';
import LikeBtn from '@C/card/like-btn/like-btn';
import { LikesSize } from '@C/card/likes/const';
import Likes from '@C/card/likes/likes';
import MediaList from '@C/card/media-list/media-list';
import ErrorComponent from '@C/error-component/error-component';
import UserNameSurname from '@C/user-name-surname/user-name-surname';
import UserSportDate from '@C/user-sport-date/user-sport-date';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import CommentInput from './comment-input/comment-input';
import Comments from './comments/comments';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

export default function CommentFullViewPage() {
  const { width } = useWindowDimensions();
  const { id: activityId } = useLocalSearchParams();
  const {
    isLoading,
    data: activity,
    error,
    isError,
    isSuccess,
    refetch,
  } = useGetActivityByActivityIdQuery(`${activityId}`, { skip: !activityId });
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);
  const [idOfUpdatingComment, setIdOfUpdatingComment] = useState('');

  return (
    <ScrollView
      contentContainerStyle={[
        { flexGrow: 1 },
        (isLoading || isError) && styles.isInCenter,
        {
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : isSuccess && !activity?.message ? (
        <View style={[{ flex: 1 }, isLoading && styles.inCenter]}>
          {(activity?.mapPhotoUrl || activity?.photoVideoUrls?.length > 0) && (
            <MediaList
              photoVideoUrls={activity?.photoVideoUrls}
              mapPhotoUrl={activity?.mapPhotoUrl}
              id={`${activityId}`}
            />
          )}
          <Card.Content style={styles.contentLayout}>
            <Text variant="titleLarge" style={styles.title}>
              {activity?.title}
            </Text>
            <UserNameSurname userId={activity?.user_id} size="titleMedium" />
            <View style={styles.columnsLayout}>
              <UserSportDate sport={activity?.sport} date={activity?.date} />
              <Text variant="bodyMedium">{` ${activity?.distance / 1000} км`}</Text>
            </View>
            <View style={styles.columnsLayout}>
              <LikeBtn activityId={activity?.id} profile={activity?.profile} />
              <Likes activityId={activity?.id} size={LikesSize.big} />
            </View>
          </Card.Content>
          <View style={{ position: 'relative' }}>
            <Comments
              commentsModalRef={{
                current: {
                  present: () => {},
                } as BottomSheetModalMethods,
              }}
            />
            {isShowingTextInput && !idOfUpdatingComment ? (
              <CommentInput profile={activity?.profile} commentId="" />
            ) : (
              <View style={{ zIndex: 9, position: 'relative' }}>
                <FAB
                  testID="floatingBtn"
                  icon="pencil"
                  style={{ position: 'absolute', right: 10, zIndex: 10 }}
                  onPress={() => {
                    setIdOfUpdatingComment('');
                    setIsShowingTextInput(true);
                  }}
                />
              </View>
            )}
          </View>
        </View>
      ) : isError || activity?.message ? (
        <ErrorComponent error={error || activity} refetch={refetch} />
      ) : null}
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
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
});
