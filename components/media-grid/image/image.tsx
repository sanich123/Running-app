import { PhotoVideoType } from '@C/card/types';
import { CustomImage } from '@C/custom-image/custom-image';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';

export default function MediaGridImage({
  url,
  thumbnail,
  blurhash,
  index,
  take,
}: PhotoVideoType & { index: number; take: number }) {
  const { push } = useRouter();
  const { dark } = useTheme();
  const { width } = useWindowDimensions();
  const { id: userId } = useLocalSearchParams();
  const gap = 3;
  const widthOfScreen = width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH;
  const calculatedWidth = (widthOfScreen - gap * 3) / 4;

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      key={url}
      onPress={() =>
        push(
          `/(protected)/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(url) : index}?userId=${userId}&take=${take}`,
        )
      }
      borderless>
      <CustomImage
        style={{ height: calculatedWidth, width: widthOfScreen / 4 }}
        source={{ uri: thumbnail || url }}
        contentFit="cover"
        placeholder={blurhash}
      />
    </TouchableRipple>
  );
}
