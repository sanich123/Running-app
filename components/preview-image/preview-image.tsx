import { CustomImage } from '@C/custom-image/custom-image';
import { useAppSelector } from '@R/typed-hooks';
import { useWindowDimensions } from 'react-native';

type PreviewImageProps = {
  image: string;
  index: number;
  isDisabled: boolean;
};

export default function PreviewImage({ image, index, isDisabled }: PreviewImageProps) {
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { width } = useWindowDimensions();
  return (
    <CustomImage
      testID={`imagePreview-${index}`}
      source={{ uri: image }}
      style={[
        { marginTop: 15, width: width / 3 - 10, height: 100 },
        (isDisabled || isDisabledWhileSending) && { opacity: 0.5 },
      ]}
    />
  );
}
