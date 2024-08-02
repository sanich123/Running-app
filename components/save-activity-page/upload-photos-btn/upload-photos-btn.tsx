import { useAuth } from '@A/context/auth-context';
import { addPhotoUrl } from '@R/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorHandler } from '@U/error-handler';
import { getAccessToGallery, compressAndSendFile } from '@U/file-sending';
import { useState } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { Button } from 'react-native-paper';

import { UploadPhotoBtnProps, UPLOAD_PHOTO_BTN } from './ const';

export default function UploadPhotosBtn({ isDisabled, setIsDisabled, setImages, images }: UploadPhotoBtnProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      {Platform.OS === 'web' ? (
        <label htmlFor="image-video-uploader">
          <input
            style={{ display: 'none' }}
            id="image-video-uploader"
            type="file"
            onChange={async (e) => {
              if (user && e.target.files) {
                const fileSrc = e.target.files[0];
                try {
                  setIsDisabled(true);
                  setIsLoading(true);
                  const fileWithThumbnail = await compressAndSendFile(fileSrc, user.id);
                  if (fileWithThumbnail) {
                    setImages([...images, fileWithThumbnail]);
                    dispatch(addPhotoUrl(fileWithThumbnail));
                  }
                } catch (error) {
                  errorHandler(error);
                } finally {
                  setIsDisabled(false);
                  setIsLoading(false);
                }
              }
            }}
          />
          <View>
            <Text>{isLoading ? UPLOAD_PHOTO_BTN[language].isLoading : UPLOAD_PHOTO_BTN[language].isInitial}</Text>
          </View>
        </label>
      ) : (
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
                  const fileWithThumbnail = await compressAndSendFile(fileSrc, user.id);
                  if (fileWithThumbnail) {
                    if (__DEV__) console.log(fileWithThumbnail);
                    setImages([...images, fileWithThumbnail]);
                    dispatch(addPhotoUrl(fileWithThumbnail));
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
      )}
    </>
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
