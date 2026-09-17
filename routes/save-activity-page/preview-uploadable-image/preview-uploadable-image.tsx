import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { addPhotoUrl } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import PreviewImage from '@Routes/save-activity-page/preview-image/preview-image';
import { errorToast } from '@S/error-toast/error-toast';
import { uploadActivityMedia } from '../utils';
import type { PreviewUploadableImageProps } from './types';

export default function PreviewUploadableImage({ image, index, isDisabled }: PreviewUploadableImageProps) {
  const { userId } = useAppSelector(({ auth }) => auth);
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <Pressable
      testID="previewUploadable"
      disabled={isDisabled}
      onPress={async () => {
        setIsLoading(true);
        try {
          if (userId) {
            const fileWithThumbnail = await uploadActivityMedia(image);
            if (fileWithThumbnail) {
              const { url, thumbnail } = fileWithThumbnail;
              dispatch(addPhotoUrl({ url, thumbnail }));
              setIsLoading(false);
              setIsSuccess(true);
              setTimeout(() => setIsSuccess(false), 3000);
            }
          }
        } catch (error) {
          errorToast('', error);
          setIsError(true);
          setTimeout(() => setIsError(false), 3000);
        } finally {
          setIsLoading(false);
        }
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <PreviewImage image={image} isDisabled={isDisabled} index={index} />
      <Text variant="bodyLarge" style={{ position: 'absolute', top: 50, left: 10, color: colors.onPrimaryContainer }}>
        {isLoading && 'Adding..'}
        {isSuccess && 'Success'}
        {isError && 'Failed'}
        {!isLoading && !isError && !isSuccess && 'Add to activity'}
      </Text>
    </Pressable>
  );
}
