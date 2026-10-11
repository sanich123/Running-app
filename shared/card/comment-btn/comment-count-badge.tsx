import { StyleSheet } from 'react-native';
import { Badge, useTheme } from 'react-native-paper';
import { commentsApi, useGetCommentsLengthByActivityIdQuery } from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import type { ActivityCardData } from '../types';

interface CommentCountBadgeProps {
  activity: Pick<ActivityCardData, 'id' | 'userId' | 'commentsLength' | 'profile'>;
}

export default function CommentCountBadge({ activity }: CommentCountBadgeProps) {
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isLoading } = useAppSelector(({ loading }) => loading);
  const { id: activityId, userId: activityOwnerId, commentsLength, profile } = activity;
  const canViewComments = profile?.allowActivityInteractions !== false || activityOwnerId === userId;
  const shouldLoadCommentsCount = canViewComments && commentsLength > 0;
  const { data: commentsCount } = useGetCommentsLengthByActivityIdQuery(activityId, {
    skip: !shouldLoadCommentsCount,
  });
  const { data: cachedCommentsCount } = useAppSelector(
    commentsApi.endpoints.getCommentsLengthByActivityId.select(activityId),
  );
  const countToRender = commentsCount ?? cachedCommentsCount ?? commentsLength;

  if (!canViewComments || !countToRender) return null;

  return (
    <Badge
      style={[styles.badge, { backgroundColor: colors.primary }, (isLoading || !canViewComments) && styles.disabled]}>
      {countToRender}
    </Badge>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    right: 10,
    zIndex: 10,
  },
  disabled: {
    opacity: 0.38,
  },
});
