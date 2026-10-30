import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Icon, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { compressMediaFile, getAccessToGallery, uploadMediaFile } from '@U/file-sending';
import { GROUPS_COPY } from '../../const';

export default function GroupPhotoPicker({
  onPhotoAssetChange,
  onUploadingChange,
}: {
  onPhotoAssetChange: (assetId: string | null) => void;
  onUploadingChange: (isUploading: boolean) => void;
}) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = GROUPS_COPY[language];
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoAssetId, setPhotoAssetId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const uploadGroupPhoto = async () => {
    setIsUploadingPhoto(true);
    onUploadingChange(true);
    try {
      const result = await getAccessToGallery(['images'], { allowsMultipleSelection: false });
      if (!result || result.canceled) return;
      const image = result.assets[0];
      if (!image) return;

      setPhotoUri(image.uri);
      setPhotoAssetId(null);
      onPhotoAssetChange(null);
      const compressedImage = await compressMediaFile(image.uri, { fileName: image.fileName, mediaType: 'image' });
      if (!compressedImage) {
        setPhotoUri(null);
        errorToast(copy.photoUploadError);
        return;
      }
      const upload = await uploadMediaFile(compressedImage, { scope: 'group' });
      if (!upload?.assetId) {
        setPhotoUri(null);
        errorToast(copy.photoUploadError);
        return;
      }
      setPhotoAssetId(upload.assetId);
      onPhotoAssetChange(upload.assetId);
    } catch (error) {
      setPhotoUri(null);
      setPhotoAssetId(null);
      onPhotoAssetChange(null);
      errorToast(copy.photoUploadError, error);
    } finally {
      setIsUploadingPhoto(false);
      onUploadingChange(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {copy.photo}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.addPhoto}
        onPress={() => void uploadGroupPhoto()}
        disabled={isUploadingPhoto}
        style={[styles.photoPicker, { backgroundColor: colors.surfaceVariant }]}>
        {photoUri ? (
          <Avatar.Image size={96} source={{ uri: photoUri }} />
        ) : (
          <Icon source="image-plus" size={34} color={colors.onSurfaceVariant} />
        )}
        <Text variant="bodyMedium">
          {isUploadingPhoto ? copy.uploadingPhoto : photoAssetId ? copy.changePhoto : copy.addPhoto}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  sectionTitle: { fontWeight: '700', marginTop: 8 },
  photoPicker: { alignItems: 'center', alignSelf: 'center', borderRadius: 24, gap: 10, minWidth: 150, padding: 18 },
});
