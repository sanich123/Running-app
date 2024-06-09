import { useAuth } from '@A/context/auth-context';
import PreviewImage from '@C/save-activity-page/preview-image/preview-image';
import { addPhotoUrl } from '@R/activity/activity';
import { useAppDispatch } from '@R/typed-hooks';
import { errorHandler } from '@U/error-handler';
import { compressAndSendFile } from '@U/file-sending';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

type PreviewUploadableImageProps = {
  image: string;
  index: number;
  isDisabled: boolean;
};

export default function PreviewUploadableImage({ image, index, isDisabled }: PreviewUploadableImageProps) {
  const { user } = useAuth();
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
          if (user) {
            const fileWithThumbnail = await compressAndSendFile(image, user.id);
            if (fileWithThumbnail) {
              const { url, thumbnail } = fileWithThumbnail;
              dispatch(addPhotoUrl({ url, thumbnail }));
              setIsLoading(false);
              setIsSuccess(true);
              setTimeout(() => setIsSuccess(false), 3000);
            }
          }
        } catch (error) {
          errorHandler(error);
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
