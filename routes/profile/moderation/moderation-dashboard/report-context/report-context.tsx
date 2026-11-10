import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { isVideoUrl } from '@Routes/photo-viewer/utils';
import { errorToast } from '@S/error-toast/error-toast';
import MediaThumbnail from '@S/media-thumbnail/media-thumbnail';
import type { ModerationReportContextProps } from '../types';

export default function ReportContext({ report, context, copy }: ModerationReportContextProps) {
  if (!context) return null;

  const isVideoUpload = report.targetType === 'media_upload' && context.contentType?.startsWith('video/');
  const previewUrl =
    context.thumbnail ??
    (report.targetType === 'group' ||
    report.targetType === 'media' ||
    (report.targetType === 'media_upload' && !isVideoUpload)
      ? context.url
      : null);
  const contextText = context.comment ?? [context.title, context.description].filter(Boolean).join('\n\n');
  const videoUploadUrl = context.url ?? context.thumbnail;
  const profileName = [context.name, context.surname].filter(Boolean).join(' ');
  const mediaStatusLabel = context.moderationStatus
    ? (copy.mediaStatus as Record<string, string>)[context.moderationStatus]
    : undefined;

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
      {isVideoUpload ? (
        videoUploadUrl ? (
          <MediaThumbnail
            mediaUrl={videoUploadUrl}
            thumbnail={context.thumbnail}
            isVideo
            style={styles.preview}
            testID="moderation-video-upload-preview"
          />
        ) : null
      ) : previewUrl ? (
        <Image source={{ uri: previewUrl }} style={styles.preview} resizeMode="contain" />
      ) : null}
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
      {report.targetType === 'media_upload' && context.moderationStatus ? (
        <Text>
          {copy.mediaCheckStatus}: {mediaStatusLabel ?? context.moderationStatus}
        </Text>
      ) : null}
      {(report.targetType === 'group' || report.targetType === 'media' || report.targetType === 'media_upload') &&
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
  activityMediaContent: { gap: 8, paddingVertical: 4 },
  activityMediaTile: { borderRadius: 8, overflow: 'hidden' },
  activityMediaPreview: { backgroundColor: '#808080', height: 220, width: 160 },
  preview: { height: 260, maxWidth: '100%', width: 360 },
});
