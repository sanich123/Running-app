import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableRipple } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import CustomImage from '@S/custom-image/custom-image';
import type { PreviewImageProps } from './types';

export default function PreviewImage({
  image,
  mediaUrl = image,
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
      <CustomImage
        testID={`imagePreview-${index}`}
        source={{ uri: image }}
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
