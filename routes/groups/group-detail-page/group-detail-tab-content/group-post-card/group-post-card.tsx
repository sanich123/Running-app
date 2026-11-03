import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Icon, Surface, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { GROUPS_COPY } from '../../../const';
import GroupPhoto from '../../../group-photo/group-photo';
import type { GroupPost } from '@R/services/groups/types';

export default function GroupPostCard({ post }: { post: GroupPost }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { member, postPhotoUnavailable } = GROUPS_COPY[language];
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
      <Text variant="bodyLarge">{text}</Text>
      {hasPhoto && (postPhotoUrl || photoPending) ? (
        <GroupPhoto
          photoUrl={photoUrl}
          photoPreviewUrl={photoPreviewUrl}
          photoBlurhash={photoBlurhash}
          photoReviewStatus={photoReviewStatus}
          photoPending={photoPending}
          fallbackIcon="image-off-outline"
          style={[styles.postPhoto, { backgroundColor: colors.surfaceVariant }]}
          testID={`group-post-photo-${id}`}
        />
      ) : null}
      {hasPhoto && !photoPending && !postPhotoUrl ? (
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
  postPhoto: { aspectRatio: 1.4, borderRadius: 12, width: '100%' },
  postPhotoNotice: { alignItems: 'center', flexDirection: 'row', gap: 6 },
});
