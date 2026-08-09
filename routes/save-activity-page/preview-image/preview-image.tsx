import { useWindowDimensions } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';
import { CustomImage } from '@S/custom-image/custom-image';

interface PreviewImageProps {
  image: string;
  index: number;
  isDisabled: boolean;
  compact?: boolean;
}

export default function PreviewImage({ image, index, isDisabled, compact = false }: PreviewImageProps) {
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { width } = useWindowDimensions();
  return (
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
        (isDisabled || isDisabledWhileSending) && { opacity: 0.5 },
      ]}
    />
  );
}
