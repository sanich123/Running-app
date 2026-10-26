import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import { isVideoUrl } from '@Routes/photo-viewer/utils';
import CustomImage from '@S/custom-image/custom-image';
import type { MediaThumbnailProps } from './types';

export default function MediaThumbnail({
  mediaUrl,
  thumbnail,
  isVideo: isVideoProp,
  style,
  testID,
  placeholder,
  recyclingKey,
  onLoad,
}: MediaThumbnailProps) {
  const { colors } = useTheme();
  const [failedThumbnail, setFailedThumbnail] = useState<string | null>(null);
  const isVideo = isVideoProp ?? isVideoUrl(mediaUrl);
  const imageUri = thumbnail ?? (isVideo ? null : mediaUrl);

  if (isVideo && (!imageUri || failedThumbnail === imageUri)) {
    return (
      <View
        style={[styles.fallback, { backgroundColor: colors.surfaceVariant }, style]}
        testID={testID ? `${testID}-fallback` : undefined}>
        <Icon source="movie-open-outline" size={40} color={colors.onSurfaceVariant} />
      </View>
    );
  }

  return (
    <CustomImage
      style={style}
      source={{ uri: imageUri ?? mediaUrl }}
      contentFit="cover"
      placeholderContentFit="cover"
      testID={testID}
      placeholder={placeholder}
      cachePolicy="memory-disk"
      recyclingKey={recyclingKey ?? imageUri}
      onLoad={onLoad}
      onError={isVideo ? () => setFailedThumbnail(imageUri ?? mediaUrl) : undefined}
    />
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
