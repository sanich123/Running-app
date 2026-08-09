import { Platform, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { CustomImage } from '@S/custom-image/custom-image';
import type { PhotoVideoType } from '@S/card/types';

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
          `/${ROUTES.media}/${Platform.OS === 'web' ? encodeURIComponent(url) : index}?userId=${userId}&take=${take}`,
        )
      }
      borderless>
      <CustomImage
        testID={url}
        style={{ height: calculatedWidth, width: widthOfScreen / 4 }}
        source={{ uri: thumbnail || url }}
        contentFit="cover"
        placeholder={blurhash}
      />
    </TouchableRipple>
  );
}
