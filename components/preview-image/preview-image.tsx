import { Image, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';

type PreviewImageProps = {
  image: string;
  index: number;
  isDisabled: boolean;
};

export default function PreviewImage({ image, index, isDisabled }: PreviewImageProps) {
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
  const { width } = useWindowDimensions();
  return (
    <Image
      testID={`imagePreview-${index}`}
      source={{ uri: image }}
      style={[{ marginTop: 15 }, (isDisabled || isDisabledWhileSending) && { opacity: 0.5 }]}
      width={width / 3 - 10}
      height={100}
    />
  );
}
