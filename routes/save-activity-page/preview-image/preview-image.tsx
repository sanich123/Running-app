import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import MediaThumbnail from '@S/media-thumbnail/media-thumbnail';
import type { PreviewImageProps } from './types';

export default function PreviewImage({
  image,
  mediaUrl = image,
  isVideo,
  index,
  isDisabled,
  compact = false,
}: PreviewImageProps) {
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const isPreviewDisabled = isDisabled || isSavingDisabled;

  return (
    <TouchableRipple
      onPress={() => push(`/${ROUTES.media}/${encodeURIComponent(mediaUrl)}`)}
      disabled={isPreviewDisabled}
      borderless>
      <MediaThumbnail
        testID={`imagePreview-${index}`}
        mediaUrl={mediaUrl}
        thumbnail={mediaUrl === image ? null : image}
        isVideo={isVideo}
        style={[
          {
            marginTop: compact ? 0 : 12,
            width: compact ? width / 4 - 14 : width / 3 - 10,
            height: compact ? 68 : 100,
            borderRadius: compact ? 10 : 0,
          },
          isPreviewDisabled && { opacity: 0.5 },
        ]}
      />
    </TouchableRipple>
  );
}
