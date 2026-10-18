import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import CommentBtn from '@S/card/comment-btn/comment-btn';
import DeleteBtn from '@S/card/delete-btn/card-delete-btn/card-delete-btn';
import LikeBtn from '@S/card/like-btn/like-btn';
import ShareBtn from '@S/card/share-btn/share-btn';
import UserInfo from '@S/card/user-info/user-info';
import { ActivityCardContext } from '../context';
import Likes from '../likes/likes';
import MediaList from '../media-list/media-list';
import Metrics from '../metrics/metrics';
import { UserInfoSize } from '../user-info/const';
import type { ActivityCardProps } from '../types';

export default function ActivityCard({
  activity,
  isFullView = false,
  isShowDeleteBtn,
  isShowDescription,
}: ActivityCardProps) {
  const { media, mapPhotoUrl, profile, sport, date, userId } = activity;
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const mediaWidth = width < MAX_MOBILE_WIDTH ? Math.max(width, 0) : MAX_MOBILE_WIDTH;
  const contextValue = { activity, isFullView, isShowDeleteBtn, isShowDescription };

  return (
    <ActivityCardContext.Provider value={contextValue}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
            width: mediaWidth,
            marginBottom: isFullView ? 0 : 16,
          },
          Platform.OS === 'web' ? styles.webStyles : null,
        ]}>
        <UserInfo profile={profile} sport={sport} date={date} userId={userId} size={UserInfoSize.large} />
        {mapPhotoUrl || Boolean(media?.length) ? <MediaList /> : null}
        <Metrics />
        <View style={styles.likes}>
          <Likes />
        </View>
        <Card.Actions style={styles.actions}>
          <LikeBtn />
          <CommentBtn />
          <ShareBtn />
          <DeleteBtn />
        </Card.Actions>
      </View>
    </ActivityCardContext.Provider>
  );
}

const styles = StyleSheet.create({
  webStyles: {
    maxWidth: 550,
    marginHorizontal: 'auto',
  },
  card: {
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    marginHorizontal: 'auto',
    overflow: 'hidden',
    shadowColor: '#262626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    zIndex: 10,
  },
  likes: {
    height: 40,
    paddingHorizontal: 8,
  },
  actions: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
    paddingTop: 0,
  },
});
