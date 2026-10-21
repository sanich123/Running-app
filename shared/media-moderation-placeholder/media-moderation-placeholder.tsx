import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { MEDIA_MODERATION_PLACEHOLDER_COPY } from './const';
import type { MediaModerationPlaceholderProps } from './types';

export default function MediaModerationPlaceholder({
  status,
  compact = false,
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
      style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
      <Icon
        source={status === 'rejected' || status === 'failed' ? 'alert-circle-outline' : 'clock-outline'}
        size={24}
        color={colors.onSurfaceVariant}
      />
      <Text variant="labelLarge" style={[styles.title, { color: colors.onSurface }]} numberOfLines={2}>
        {title}
      </Text>
      {!compact ? (
        <Text variant="bodySmall" style={[styles.detail, { color: colors.onSurfaceVariant }]}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    minHeight: 70,
    padding: 10,
  },
  title: { textAlign: 'center' },
  detail: { lineHeight: 17, textAlign: 'center' },
});
