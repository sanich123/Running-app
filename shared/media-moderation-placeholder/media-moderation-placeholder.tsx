import { StyleSheet, View } from 'react-native';
import { Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import CustomImage from '@S/custom-image/custom-image';
import { infoToast } from '@S/info-toast/info-toast';
import { MEDIA_MODERATION_PLACEHOLDER_COPY } from './const';
import type { MediaModerationPlaceholderProps } from './types';

export default function MediaModerationPlaceholder({
  status,
  blurhash,
  borderRadius = 10,
  compact = false,
  hideTitle = false,
  showStatus = true,
  overlay = false,
  topOffset = 4,
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
  const isStage = status === 'queued' || status === 'processing' || status === 'review_required';
  const stageIcon =
    status === 'processing' ? 'cog-sync-outline' : status === 'review_required' ? 'shield-search' : 'timer-sand';

  return overlay ? (
    isStage ? (
      <IconButton
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={title}
        icon={stageIcon}
        iconColor="#fff"
        size={20}
        rippleColor="rgba(255, 255, 255, 0.18)"
        onPress={() => infoToast(title)}
        style={[styles.overlayButton, { top: topOffset }]}
      />
    ) : null
  ) : (
    <View
      testID={testID}
      accessible={showStatus}
      accessibilityRole="text"
      accessibilityLabel={compact || status === 'queued' ? title : `${title}. ${detail}`}
      style={[styles.container, { backgroundColor: colors.surfaceVariant, borderRadius }]}
      pointerEvents="none">
      {blurhash ? (
        <CustomImage source={{ uri: '' }} placeholder={blurhash} contentFit="cover" style={StyleSheet.absoluteFill} />
      ) : null}
      {showStatus ? (
        <View style={compact ? styles.compactContent : styles.content}>
          <Icon
            source={status === 'rejected' || status === 'failed' ? 'alert-circle-outline' : 'clock-outline'}
            size={compact ? 16 : 24}
            color={blurhash ? '#fff' : colors.onSurfaceVariant}
          />
          {!hideTitle ? (
            <Text
              variant={compact ? 'labelSmall' : 'labelLarge'}
              style={[styles.title, { color: blurhash ? '#fff' : colors.onSurface }]}
              numberOfLines={compact ? 1 : 2}>
              {title}
            </Text>
          ) : null}
          {!compact && status !== 'queued' ? (
            <Text variant="bodySmall" style={[styles.detail, { color: blurhash ? '#fff' : colors.onSurfaceVariant }]}>
              {detail}
            </Text>
          ) : null}
        </View>
      ) : null}
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
  overlayButton: {
    height: 40,
    left: 4,
    margin: 0,
    position: 'absolute',
    top: 4,
    width: 40,
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
  title: { textAlign: 'center' },
  detail: { lineHeight: 17, textAlign: 'center' },
});
