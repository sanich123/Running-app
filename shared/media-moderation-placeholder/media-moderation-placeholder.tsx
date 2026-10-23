import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import CustomImage from '@S/custom-image/custom-image';
import { MEDIA_MODERATION_PLACEHOLDER_COPY } from './const';
import type { MediaModerationPlaceholderProps } from './types';

export default function MediaModerationPlaceholder({
  status,
  blurhash,
  compact = false,
  overlay = false,
  testID = 'media-moderation-placeholder',
}: MediaModerationPlaceholderProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy =
    MEDIA_MODERATION_PLACEHOLDER_COPY[language === LANGUAGES.russian ? LANGUAGES.russian : LANGUAGES.english];
  const title =
    status === 'processing'
      ? copy.processing
      : status === 'review_required'
        ? copy.reviewRequired
        : status === 'approved'
          ? copy.approved
          : status === 'rejected'
            ? copy.rejected
            : status === 'failed'
              ? copy.failed
              : copy.queued;
  const detail = status === 'rejected' || status === 'failed' ? copy.retry : copy.detail;

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={compact ? title : `${title}. ${detail}`}
      style={[overlay ? styles.overlayContainer : styles.container, { backgroundColor: colors.surfaceVariant }]}
      pointerEvents="none">
      {blurhash ? (
        <CustomImage source={{ uri: '' }} placeholder={blurhash} contentFit="cover" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={[overlay ? styles.overlayContent : styles.content, blurhash ? styles.blurredContent : null]}>
        <Icon
          source={status === 'rejected' || status === 'failed' ? 'alert-circle-outline' : 'clock-outline'}
          size={overlay ? 16 : 24}
          color={blurhash ? '#fff' : colors.onSurfaceVariant}
        />
        <Text
          variant={overlay ? 'labelSmall' : 'labelLarge'}
          style={[styles.title, { color: blurhash ? '#fff' : colors.onSurface }]}
          numberOfLines={overlay ? 1 : 2}>
          {title}
        </Text>
        {!compact ? (
          <Text variant="bodySmall" style={[styles.detail, { color: blurhash ? '#fff' : colors.onSurfaceVariant }]}>
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  overlayContainer: {
    borderRadius: 6,
    height: 30,
    left: 4,
    position: 'absolute',
    right: 4,
    top: 4,
    zIndex: 2,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    minHeight: 70,
    padding: 10,
  },
  blurredContent: { backgroundColor: 'rgba(0, 0, 0, 0.46)', borderRadius: 8, margin: 6 },
  overlayContent: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  title: { textAlign: 'center' },
  detail: { lineHeight: 17, textAlign: 'center' },
});
