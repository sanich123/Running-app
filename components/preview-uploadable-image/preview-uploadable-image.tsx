import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { getSignedUrl } from '../../auth/supabase/storage/upload-photo';
import { EXPIRED_TIME } from '../../constants/const';
import { addPhotoUrl } from '../../redux/activity/activity';
import { errorHandler } from '../../utils/error-handler';
import { compressAndSendPhoto } from '../../utils/file-sending';
import PreviewImage from '../preview-image/preview-image';

type PreviewUploadableImageProps = {
  image: string;
  index: number;
  isDisabled: boolean;
};

export default function PreviewUploadableImage({ image, index, isDisabled }: PreviewUploadableImageProps) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <Pressable
      onPress={async () => {
        setIsLoading(true);
        try {
          const pathToPhoto = await compressAndSendPhoto(image, user.id);
          const url = await getSignedUrl(pathToPhoto, EXPIRED_TIME);
          dispatch(addPhotoUrl(url));
          setIsLoading(false);
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 3000);
        } catch (error) {
          errorHandler(error);
          setIsError(true);
          setTimeout(() => setIsError(false), 3000);
        } finally {
          setIsLoading(false);
        }
      }}>
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
