import { StyleSheet, View } from 'react-native';
import { Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import CustomImage from '@S/custom-image/custom-image';
import { infoToast } from '@S/info-toast/info-toast';
import {
  MEDIA_MODERATION_PLACEHOLDER_COPY,
  MEDIA_MODERATION_PLACEHOLDER_STATUS_CONFIG,
  MEDIA_REVIEW_STATUSES,
} from './const';
import type { MediaModerationPlaceholderProps } from './types';

export default function MediaModerationPlaceholder({
  status,
  blurhash,
  borderRadius = 10,
  compact = false,
  hideTitle = false,
  showStatus = true,
  overlay = false,
  overlayIconSize = 20,
  topOffset = 4,
  testID = 'media-moderation-placeholder',
}: MediaModerationPlaceholderProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy =
    MEDIA_MODERATION_PLACEHOLDER_COPY[language === LANGUAGES.russian ? LANGUAGES.russian : LANGUAGES.english];
  const statusConfig = MEDIA_MODERATION_PLACEHOLDER_STATUS_CONFIG[status ?? MEDIA_REVIEW_STATUSES.queued];
  const title = copy[statusConfig.title];
  const detail = copy[statusConfig.detail];
  const shouldShowDetails = status !== MEDIA_REVIEW_STATUSES.queued;

  return overlay ? (
    statusConfig.isStage ? (
      <IconButton
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={title}
        icon={statusConfig.stageIcon}
        iconColor="#fff"
        size={overlayIconSize}
        rippleColor="rgba(255, 255, 255, 0.18)"
        onPress={() => infoToast(title)}
        style={[styles.overlayButton, { height: overlayIconSize * 2, top: topOffset, width: overlayIconSize * 2 }]}
      />
    ) : null
  ) : (
    <View
      testID={testID}
      accessible={showStatus}
      accessibilityRole="text"
      accessibilityLabel={compact || !shouldShowDetails ? title : `${title}. ${detail}`}
      style={[styles.container, { backgroundColor: colors.surfaceVariant, borderRadius }]}
      pointerEvents="none">
      {blurhash ? (
        <CustomImage source={{ uri: '' }} placeholder={blurhash} contentFit="cover" style={StyleSheet.absoluteFill} />
      ) : null}
      {showStatus ? (
        <View style={compact ? styles.compactContent : styles.content}>
          <Icon
            source={statusConfig.statusIcon}
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
          {!compact && shouldShowDetails ? (
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
    left: 4,
    margin: 0,
    position: 'absolute',
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
