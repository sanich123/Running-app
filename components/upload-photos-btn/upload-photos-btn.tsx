import { useAuth } from '@A/context/auth-context';
import { resetPhotoUrls, addPhotoUrl } from '@R/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorHandler } from '@U/error-handler';
import { getAccessToGallery, compressAndSendFile } from '@U/file-sending';
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
            const fileSrc = result.assets[0].uri;
            if (user) {
              const url = await compressAndSendFile(fileSrc, user.id);
              if (url) {
                setImages([...images, url]);
                dispatch(addPhotoUrl(url));
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
