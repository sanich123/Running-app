import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { isVideoUrl } from '@Routes/photo-viewer/utils';
import { errorToast } from '@S/error-toast/error-toast';
import MediaThumbnail from '@S/media-thumbnail/media-thumbnail';
import type { ModerationReportContextProps } from '../types';

export default function ReportContext({ report, context, copy }: ModerationReportContextProps) {
  if (!context) return null;

  const isVideoMedia =
    (report.targetType === 'media' || report.targetType === 'media_upload' || report.targetType === 'group_post') &&
    (context.contentType?.startsWith('video/') || Boolean(context.url && isVideoUrl(context.url)));
  const previewUrl =
    context.thumbnail ??
    (report.targetType === 'group' ||
    ((report.targetType === 'media' || report.targetType === 'media_upload' || report.targetType === 'group_post') &&
      !isVideoMedia)
      ? context.url
      : null);
  const contextText = context.comment ?? [context.title, context.description].filter(Boolean).join('\n\n');
  const videoMediaUrl = context.url ?? context.thumbnail;
  const profileName = [context.name, context.surname].filter(Boolean).join(' ');
  const mediaStatus = context.mediaStatus ?? (report.targetType === 'media_upload' ? context.moderationStatus : null);
  const mediaStatusLabel = mediaStatus ? (copy.mediaStatus as Record<string, string>)[mediaStatus] : undefined;
  const hasAutomaticModerationInfo = Boolean(
    mediaStatus || context.scores || context.frameCount !== undefined || context.modelVersion || context.contentType,
  );

  return (
    <View style={styles.context}>
      {contextText ? <Text selectable>{contextText}</Text> : null}
      {profileName ? <Text>{profileName}</Text> : null}
      {report.targetType === 'activity' && context.media?.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activityMediaContent}
          testID="moderation-activity-media-list">
          {context.media.map((media) => {
            const mediaUrl = media.url ?? media.thumbnail;
            if (!mediaUrl) return null;
            const isVideo = Boolean(media.url && isVideoUrl(media.url));
            return (
              <Pressable
                key={media.id}
                accessibilityRole="button"
                accessibilityLabel={copy.openMedia}
                onPress={() => void Linking.openURL(mediaUrl).catch((error) => errorToast(copy.openError, error))}
                testID={`moderation-activity-media-${media.id}`}
                style={styles.activityMediaTile}>
                <MediaThumbnail
                  mediaUrl={mediaUrl}
                  thumbnail={media.thumbnail}
                  isVideo={isVideo}
                  style={styles.activityMediaPreview}
                  testID={`moderation-activity-media-preview-${media.id}`}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
      {isVideoMedia ? (
        videoMediaUrl ? (
          <MediaThumbnail
            mediaUrl={videoMediaUrl}
            thumbnail={context.thumbnail}
            isVideo
            style={styles.preview}
            testID={
              report.targetType === 'media_upload'
                ? 'moderation-video-upload-preview'
                : report.targetType === 'media'
                  ? 'moderation-reported-media-video-preview'
                  : 'moderation-group-post-video-preview'
            }
          />
        ) : null
      ) : previewUrl ? (
        <Image
          source={{ uri: previewUrl }}
          style={styles.preview}
          resizeMode="contain"
          testID="moderation-reported-media-image-preview"
        />
      ) : null}
      {hasAutomaticModerationInfo ? (
        <View style={styles.automaticModeration}>
          <Text variant="titleSmall">{copy.automatedModeration}</Text>
          {context.scores ? (
            <Text selectable>
              {copy.modelScores}:{' '}
              {Object.entries(context.scores)
                .map(([name, value]) => `${name} ${(value * 100).toFixed(1)}%`)
                .join(' · ')}
            </Text>
          ) : null}
          {context.frameCount !== undefined && context.frameCount !== null ? (
            <Text>
              {copy.framesChecked}: {context.frameCount}
            </Text>
          ) : null}
          {mediaStatus ? (
            <Text>
              {copy.mediaCheckStatus}: {mediaStatusLabel ?? mediaStatus}
            </Text>
          ) : null}
          {context.modelVersion ? (
            <Text>
              {copy.modelVersion}: {context.modelVersion}
            </Text>
          ) : null}
          {context.contentType ? (
            <Text>
              {copy.contentType}: {context.contentType}
            </Text>
          ) : null}
        </View>
      ) : null}
      {(report.targetType === 'group' ||
        report.targetType === 'media' ||
        report.targetType === 'media_upload' ||
        report.targetType === 'group_post') &&
      context.url ? (
        <Button
          mode="text"
          onPress={() => void Linking.openURL(context.url!).catch((error) => errorToast(copy.openError, error))}
          testID="moderation-open-media">
          {copy.openMedia}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  context: { gap: 8 },
  automaticModeration: { backgroundColor: '#80808014', borderRadius: 8, gap: 4, padding: 10 },
  activityMediaContent: { gap: 8, paddingVertical: 4 },
  activityMediaTile: { borderRadius: 8, overflow: 'hidden' },
  activityMediaPreview: { backgroundColor: '#808080', height: 220, width: 160 },
  preview: { height: 260, maxWidth: '100%', width: 360 },
});
