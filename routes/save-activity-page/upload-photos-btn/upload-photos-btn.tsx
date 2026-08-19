import { useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { addPhotoUrl } from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { getAccessToGallery, compressAndSendFile } from '@U/file-sending';
import { UPLOAD_PHOTO_BTN } from './ const';
import type { UploadPhotoBtnProps } from './ const';

export default function UploadPhotosBtn({ isDisabled, setIsDisabled, setImages, images }: UploadPhotoBtnProps) {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabled || isSavingDisabled;

  return (
    <>
      {Platform.OS === 'web' ? (
        <label htmlFor="image-video-uploader" style={styles.webUploadLabel}>
          <input
            style={{ display: 'none' }}
            id="image-video-uploader"
            type="file"
            disabled={shouldBeDisabled}
            onChange={async (e) => {
              if (userId && e.target.files) {
                const fileSrc = e.target.files[0];
                try {
                  setIsDisabled(true);
                  setIsLoading(true);
                  const fileWithThumbnail = await compressAndSendFile(fileSrc, userId);
                  if (fileWithThumbnail) {
                    setImages([...images, fileWithThumbnail]);
                    dispatch(addPhotoUrl(fileWithThumbnail));
                  }
                } catch (error) {
                  errorToast('', error);
                } finally {
                  setIsDisabled(false);
                  setIsLoading(false);
                }
              }
            }}
          />
          <View
            style={[
              styles.webUploadButton,
              { borderColor: colors.outlineVariant },
              shouldBeDisabled && styles.disabledButton,
            ]}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={{ color: colors.onSurface }}>{UPLOAD_PHOTO_BTN[language].isInitial}</Text>
            )}
          </View>
        </label>
      ) : (
        <Button
          mode="outlined"
          icon="upload-outline"
          compact
          onPress={async () => {
            setIsDisabled(true);
            setIsLoading(true);
            try {
              const result = await getAccessToGallery();
              if (result && !result.canceled) {
                const fileSrc = result.assets[0].uri;
                if (userId) {
                  const fileWithThumbnail = await compressAndSendFile(fileSrc, userId);
                  if (fileWithThumbnail) {
                    setImages([...images, fileWithThumbnail]);
                    dispatch(addPhotoUrl(fileWithThumbnail));
                  }
                }
              }
            } catch (error) {
              errorToast('', error);
            } finally {
              setIsDisabled(false);
              setIsLoading(false);
            }
          }}
          style={[styles.uploadBtn, { borderColor: colors.outlineVariant }, shouldBeDisabled && styles.disabledButton]}
          contentStyle={styles.content}
          textColor={colors.onSurface}
          loading={isLoading}
          disabled={shouldBeDisabled}>
          {!isLoading && UPLOAD_PHOTO_BTN[language].isInitial}
        </Button>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  uploadBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flex: 1,
    marginTop: 12,
  },
  content: { minHeight: 42 },
  disabledButton: { opacity: 0.7 },
  webUploadButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 42,
    paddingHorizontal: 12,
    width: '100%',
  },
  webUploadLabel: { display: 'flex', flex: 1 },
});
