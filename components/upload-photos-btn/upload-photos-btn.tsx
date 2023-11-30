import { useAuth } from '@A/context/auth-context';
import { getSignedUrl } from '@A/supabase/storage/upload-photo';
import { resetPhotoUrls, addPhotoUrl } from '@R/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorHandler } from '@U/error-handler';
import { getAccessToGallery, compressAndSendPhoto } from '@U/file-sending';
import { EXPIRED_TIME } from '@const/const';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { UploadPhotoBtnProps, UPLOAD_PHOTO_BTN } from './ const';

export default function UploadPhotosBtn({ isDisabled, setIsDisabled, setImages, images }: UploadPhotoBtnProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhileSending, isNeedToResetInputs } = useAppSelector(({ activity }) => activity);
  const [isLoading, setIsLoading] = useState(false);

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
          if (result && !result.canceled) {
            const imgSrc = result.assets[0].uri;
            if (user && 'id' in user) {
              const pathToPhoto = await compressAndSendPhoto(imgSrc, user.id);
              if (pathToPhoto) {
                const url = await getSignedUrl(pathToPhoto, EXPIRED_TIME);
                if (url) {
                  setImages([...images, url]);
                  dispatch(addPhotoUrl(url));
                }
              }
            }
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
