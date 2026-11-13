import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Button, Icon, Surface, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { GROUPS_COPY } from '../../../const';
import GroupPhoto from '../../../group-photo/group-photo';
import { isGroupPhotoUnderModeration } from '../../../group-photo/utils';
import type { GroupPost } from '@R/services/groups/types';

export default function GroupPostCard({ post, onRefreshStatus }: { post: GroupPost; onRefreshStatus?: () => void }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { member, postPhotoUnavailable, postTextPending, postTextHidden, refreshModerationStatus } =
    GROUPS_COPY[language];
  const locale = language === LANGUAGES.russian ? 'ru-RU' : 'en-US';
  const {
    id,
    text,
    createdAt,
    author,
    photoUrl,
    photoPreviewUrl,
    photoBlurhash,
    photoReviewStatus,
    hasPhoto,
    photoPending,
  } = post;
  const authorName = author?.name || member;
  const authorUserId = author?.userId;
  const authorProfilePhoto = author?.profilePhoto;
  const postPhotoUrl = photoUrl ?? photoPreviewUrl;
  const isPhotoUnderModeration = isGroupPhotoUnderModeration({
    photoUrl,
    photoPreviewUrl,
    photoBlurhash,
    photoReviewStatus,
    photoPending,
  });
  const isTextUnderModeration = post.moderationStatus === 'pending' || post.moderationStatus === 'processing';
  const isTextHiddenByModeration = post.moderationStatus === 'hidden' || post.moderationStatus === 'removed';
  const canViewText = !post.moderationStatus || post.moderationStatus === 'visible' || authorUserId === userId;

  return (
    <Surface style={[styles.post, { backgroundColor: colors.surface }]} elevation={1}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={authorName}
        disabled={!authorUserId}
        onPress={() => {
          if (authorUserId) router.push(`/profile/${authorUserId}` as never);
        }}
        style={styles.postHeader}
        testID={`group-post-author-${id}`}>
        {authorProfilePhoto ? (
          <Avatar.Image size={40} source={{ uri: authorProfilePhoto }} />
        ) : (
          <Avatar.Icon size={40} icon="account" />
        )}
        <View style={styles.postAuthor}>
          <Text variant="titleSmall">{authorName}</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {new Date(createdAt).toLocaleString(locale)}
          </Text>
        </View>
      </Pressable>
      {isTextUnderModeration || isTextHiddenByModeration ? (
        <View style={styles.moderationNotice}>
          <Icon source={isTextUnderModeration ? 'clock-outline' : 'eye-off-outline'} size={18} color={colors.primary} />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, flex: 1 }}>
            {isTextUnderModeration ? postTextPending : postTextHidden}
          </Text>
          {isTextUnderModeration && onRefreshStatus ? (
            <Button mode="text" compact onPress={onRefreshStatus} style={styles.refreshButton}>
              {refreshModerationStatus}
            </Button>
          ) : null}
        </View>
      ) : null}
      {canViewText && text ? <Text variant="bodyLarge">{text}</Text> : null}
      {hasPhoto && (postPhotoUrl || isPhotoUnderModeration) ? (
        <GroupPhoto
          photoUrl={photoUrl}
          photoPreviewUrl={photoPreviewUrl}
          photoBlurhash={photoBlurhash}
          photoReviewStatus={photoReviewStatus}
          photoPending={photoPending}
          isOwner={Boolean(authorUserId && userId && authorUserId === userId)}
          fallbackIcon="image-off-outline"
          style={[styles.postPhoto, { backgroundColor: colors.surfaceVariant }]}
          testID={`group-post-photo-${id}`}
        />
      ) : null}
      {hasPhoto && !isPhotoUnderModeration && !postPhotoUrl ? (
        <View style={styles.postPhotoNotice}>
          <Icon source="image-off-outline" size={16} color={colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {postPhotoUnavailable}
          </Text>
        </View>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  post: { borderRadius: 16, gap: 12, padding: 14 },
  postHeader: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  postAuthor: { flex: 1, gap: 2 },
  moderationNotice: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  refreshButton: { marginVertical: -6 },
  postPhoto: { aspectRatio: 1.4, borderRadius: 12, width: '100%' },
  postPhotoNotice: { alignItems: 'center', flexDirection: 'row', gap: 6 },
});
