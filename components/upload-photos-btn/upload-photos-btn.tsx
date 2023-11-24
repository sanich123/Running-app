import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { UPLOAD_PHOTO_BTN, UploadPhotoBtnProps } from './ const';
import { useAuth } from '../../auth/context/auth-context';
import { getSignedUrl } from '../../auth/supabase/storage/upload-photo';
import { EXPIRED_TIME } from '../../constants/const';
import { addPhotoUrl, resetPhotoUrls } from '../../redux/activity/activity';
import { errorHandler } from '../../utils/error-handler';
import { compressAndSendPhoto, getAccessToGallery } from '../../utils/file-sending';

export default function UploadPhotosBtn({ isDisabled, setIsDisabled, setImages, images }: UploadPhotoBtnProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { language } = useSelector(({ language }) => language);

  useEffect(() => {
    if (isNeedToResetInputs) {
      dispatch(resetPhotoUrls());
      setImages([]);
    }
  }, [isNeedToResetInputs]);

  return (
    <Button
      mode="outlined"
      icon="upload-outline"
      onPress={async () => {
        setIsDisabled(true);
        setIsLoading(true);
        try {
          const result = await getAccessToGallery();
          if (!result.canceled) {
            const imgSrc = result.assets[0].uri;
            const pathToPhoto = await compressAndSendPhoto(imgSrc, user.id);
            const url = await getSignedUrl(pathToPhoto, EXPIRED_TIME);
            setImages([...images, url]);
            dispatch(addPhotoUrl(url));
          }
        } catch (error) {
          errorHandler(error);
        } finally {
          setIsDisabled(false);
          setIsLoading(false);
        }
      }}
      style={styles.uploadBtn}
      loading={isLoading}
      disabled={isDisabled || isDisabledWhileSending}>
      {isLoading ? UPLOAD_PHOTO_BTN[language].isLoading : UPLOAD_PHOTO_BTN[language].isInitial}
    </Button>
  );
}

const styles = StyleSheet.create({
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    width: '45%',
  },
});
