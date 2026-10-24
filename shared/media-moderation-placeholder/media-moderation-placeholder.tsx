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
  borderRadius = 10,
  compact = false,
  hideTitle = false,
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
      accessibilityLabel={compact || status === 'queued' ? title : `${title}. ${detail}`}
      style={[
        overlay ? styles.overlayContainer : styles.container,
        { backgroundColor: overlay ? 'transparent' : colors.surfaceVariant, borderRadius },
      ]}
      pointerEvents="none">
      {blurhash ? (
        <CustomImage source={{ uri: '' }} placeholder={blurhash} contentFit="cover" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={overlay ? styles.overlayContent : compact ? styles.compactContent : styles.content}>
        <Icon
          source={status === 'rejected' || status === 'failed' ? 'alert-circle-outline' : 'clock-outline'}
          size={overlay || compact ? 16 : 24}
          color={blurhash || overlay ? '#fff' : colors.onSurfaceVariant}
        />
        {!hideTitle ? (
          <Text
            variant={overlay || compact ? 'labelSmall' : 'labelLarge'}
            style={[styles.title, { color: blurhash || overlay ? '#fff' : colors.onSurface }]}
            numberOfLines={overlay || compact ? 1 : 2}>
            {title}
          </Text>
        ) : null}
        {!compact && status !== 'queued' ? (
          <Text
            variant="bodySmall"
            style={[styles.detail, { color: blurhash || overlay ? '#fff' : colors.onSurfaceVariant }]}>
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
    flex: 1,
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
  compactContent: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    minHeight: 50,
    padding: 6,
  },
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
