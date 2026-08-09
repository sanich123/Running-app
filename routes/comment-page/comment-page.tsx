import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Card, FAB, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import UserNameSurname from '@Routes/comment-page/user-name-surname/user-name-surname';
import UserSportDate from '@Routes/comment-page/user-sport-date/user-sport-date';
import LikeBtn from '@S/card/like-btn/like-btn';
import { LikesSize } from '@S/card/likes/const';
import Likes from '@S/card/likes/likes';
import MediaList from '@S/card/media-list/media-list';
import CommentInput from '@S/comments/comment-input/comment-input';
import Comments from '@S/comments/comments/comments';
import ErrorComponent from '@S/error-component/error-component';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

export default function CommentFullViewPage() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
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
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        { flexGrow: 1, backgroundColor: colors.background },
        (isLoading || isError) && styles.isInCenter,
        {
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="comment-page-loading" />
      ) : isSuccess && !activity?.message ? (
        <View style={[Platform.OS === 'web' ? styles.webContent : styles.nativeContent, isLoading && styles.inCenter]}>
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
                  icon="plus"
                  style={styles.commentAddButton}
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
  scroll: {
    flex: 1,
  },
  isInCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeContent: {
    flex: 1,
  },
  webContent: {
    width: '100%',
  },
  commentAddButton: {
    alignSelf: 'flex-end',
    margin: 10,
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
