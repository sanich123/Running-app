import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { compressMediaFile, getAccessToGallery, uploadMediaFile } from '@U/file-sending';
import { GROUPS_COPY } from '../../const';

export default function GroupPhotoPicker({
  onPhotoAssetChange,
  onUploadingChange,
  initialPhotoUrl = null,
  uploadErrorMessage,
}: {
  onPhotoAssetChange: (assetId: string | null) => void;
  onUploadingChange: (isUploading: boolean) => void;
  initialPhotoUrl?: string | null;
  uploadErrorMessage?: string;
}) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = GROUPS_COPY[language];
  const [photoUri, setPhotoUri] = useState<string | null>(initialPhotoUrl);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const uploadGroupPhoto = async () => {
    const previousPhotoUri = photoUri;
    setIsUploadingPhoto(true);
    onUploadingChange(true);
    try {
      const result = await getAccessToGallery(['images'], { allowsMultipleSelection: false });
      if (!result || result.canceled) return;
      const image = result.assets[0];
      if (!image) return;

      setPhotoUri(image.uri);
      // On web, FormData needs the actual File; appending Expo's blob URI
      // descriptor produces a multipart request without a `file` part.
      const uploadSource = Platform.OS === 'web' ? (image.file ?? image.uri) : image.uri;
      const compressedImage = await compressMediaFile(uploadSource, { fileName: image.fileName, mediaType: 'image' });
      if (!compressedImage) {
        setPhotoUri(previousPhotoUri);
        return errorToast(uploadErrorMessage ?? copy.photoUploadError);
      }
      const upload = await uploadMediaFile(compressedImage, { scope: 'group' });
      if (!upload?.assetId) {
        setPhotoUri(previousPhotoUri);
        return errorToast(copy.photoUploadError);
      }
      onPhotoAssetChange(upload.assetId);
    } catch (error) {
      setPhotoUri(previousPhotoUri);
      errorToast(uploadErrorMessage ?? copy.photoUploadError, error);
    } finally {
      setIsUploadingPhoto(false);
      onUploadingChange(false);
    }
  };

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={photoUri ? copy.changePhoto : copy.addPhoto}
        onPress={() => void uploadGroupPhoto()}
        disabled={isUploadingPhoto}
        style={[styles.photoPicker, { backgroundColor: colors.surfaceVariant }]}>
        {photoUri ? <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
        {photoUri ? (
          <View style={styles.photoOverlay} />
        ) : (
          <Icon source="image-plus" size={34} color={colors.onSurfaceVariant} />
        )}
        <Text variant="bodyMedium" style={[styles.photoLabel, photoUri && styles.photoLabelOnImage]}>
          {isUploadingPhoto ? copy.uploadingPhoto : photoUri ? copy.changePhoto : copy.addPhoto}
        </Text>
      </Pressable>
      {photoUri && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.removePhoto}
          onPress={() => {
            setPhotoUri(null);
            onPhotoAssetChange(null);
          }}
          style={styles.removePhoto}>
          <Icon source="delete-outline" size={18} color={colors.error} />
          <Text variant="bodySmall" style={{ color: colors.error }}>
            {copy.removePhoto}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { width: '100%' },
  removePhoto: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center', paddingVertical: 8 },
  photoPicker: {
    alignItems: 'center',
    borderRadius: 16,
    gap: 10,
    height: 176,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  photoOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0, 0, 0, 0.28)' },
  photoLabel: { zIndex: 1 },
  photoLabelOnImage: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
