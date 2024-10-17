import LikeBtn from '@C/card/like-btn/like-btn';
import { LikesSize } from '@C/card/likes/const';
import Likes from '@C/card/likes/likes';
import MediaList from '@C/card/media-list/media-list';
import ErrorComponent from '@C/error-component/error-component';
import UserNameSurname from '@C/user-name-surname/user-name-surname';
import UserSportDate from '@C/user-sport-date/user-sport-date';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Card, FAB, Text } from 'react-native-paper';
import Comments from './comments/comments';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import CommentInput from './comment-input/comment-input';
import { MAX_MOBILE_WIDTH } from '@const/const';

export default function CommentFullViewPage() {
  const { width } = useWindowDimensions();
  const { id: activityId } = useLocalSearchParams();
  const {
    isLoading,
    data: activity,
    error,
    isError,
  } = useGetActivityByActivityIdQuery(`${activityId}`, { skip: !activityId });
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);
  const [idOfUpdatingComment, setIdOfUpdatingComment] = useState('');

  return (
    <ScrollView
      contentContainerStyle={[
        (isLoading || isError) && styles.isInCenter,
        {
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      <BottomSheetModalProvider>
        {error || activity?.message ? <ErrorComponent error={error || activity} /> : null}
        {isLoading && <ActivityIndicator size="large" />}
        {activity && (
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
                isShowingTextInput={isShowingTextInput}
                setIsShowingTextInput={setIsShowingTextInput}
                activityId={activityId.toString()}
                idOfUpdatingComment={idOfUpdatingComment}
                setIdOfUpdatingComment={setIdOfUpdatingComment}
                commentsModalRef={{
                  current: {
                    present: () => {},
                  } as BottomSheetModalMethods,
                }}
              />
              {isShowingTextInput && !idOfUpdatingComment ? (
                <CommentInput
                  profile={activity?.profile}
                  idOfUpdatingComment={idOfUpdatingComment}
                  activityId={`${activityId}`}
                  setIsShowingTextInput={setIsShowingTextInput}
                  commentId=""
                  setIdOfUpdatingComment={setIdOfUpdatingComment}
                />
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
        )}
      </BottomSheetModalProvider>
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
