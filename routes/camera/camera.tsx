import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Icon, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import ChangeView from '@Routes/camera/change-view/change-view';
import CloseBtn from '@Routes/camera/close-btn/close-btn';
import FlashBtn from '@Routes/camera/flash-btn/flash-btn';
import ShotBtn from '@Routes/camera/shot-btn/shot-btn';
import PreviewImages from '@Routes/save-activity-page/preview-images/preview-images';
import { errorToast } from '@S/error-toast/error-toast';
import { CAMERA_TEXT } from './const';
import { CameraTypes, FlashModes } from './types';
import type { PhotoVideoType } from '@Routes/card/types';
import type { CameraType, FlashMode } from 'expo-camera';

export default function CameraLauncher() {
  const cameraRef = useRef<CameraView>(null);
  const [photos, setPhotos] = useState<PhotoVideoType[]>([]);
  const [type, setType] = useState<CameraType>(CameraTypes.back);
  const [flashEnable, setFlashEnable] = useState<FlashMode>(FlashModes.off);
  const [permission, requestPermission] = useCameraPermissions();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const copy = CAMERA_TEXT[language];

  const requestAccess = useCallback(async () => {
    try {
      const cameraPermission = await requestPermission();
      if (cameraPermission.granted) {
        await MediaLibrary.requestPermissionsAsync();
      }
    } catch (error) {
      errorToast('Не удалось получить доступ к камере и медиатеке', error);
    }
  }, [requestPermission]);

  useEffect(() => {
    void requestAccess();
  }, [requestAccess]);

  return (
    <View style={styles.container}>
      {!permission && (
        <SafeAreaView style={styles.permissionView}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="titleMedium" style={styles.permissionTitle}>
            {copy.permissionLoading}
          </Text>
        </SafeAreaView>
      )}
      {permission && !permission.granted && (
        <SafeAreaView style={styles.permissionView}>
          <View style={[styles.permissionIcon, { backgroundColor: colors.primaryContainer }]}>
            <Icon source="camera-off-outline" size={34} color={colors.primary} />
          </View>
          <Text variant="headlineSmall" style={[styles.permissionTitle, { color: colors.onSurface }]}>
            {copy.permissionTitle}
          </Text>
          <Text variant="bodyMedium" style={[styles.permissionDescription, { color: colors.onSurfaceVariant }]}>
            {copy.permissionDescription}
          </Text>
          <Button mode="contained" icon="camera-outline" onPress={requestAccess} style={styles.permissionButton}>
            {copy.allowCamera}
          </Button>
        </SafeAreaView>
      )}
      {permission?.granted && (
        <CameraView ref={cameraRef} facing={type} flash={flashEnable} style={StyleSheet.absoluteFill}>
          <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
            <View style={styles.topBar}>
              <CloseBtn />
              <Text variant="titleMedium" style={styles.topBarTitle}>
                {copy.title}
              </Text>
              <View style={styles.topBarSpacer} />
            </View>

            <View style={styles.bottomArea}>
              {photos.length > 0 && (
                <View style={styles.previewPanel}>
                  <PreviewImages setImages={setPhotos} images={photos} isDisabled={false} compact />
                </View>
              )}
              <View style={styles.controls}>
                <FlashBtn setFlashEnable={setFlashEnable} flashEnable={flashEnable} />
                <ShotBtn cameraRef={cameraRef} setPhotos={setPhotos} photos={photos} />
                <ChangeView setType={setType} type={type} />
              </View>
            </View>
          </SafeAreaView>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#050505', flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topBarTitle: { color: '#fff', fontWeight: '700' },
  topBarSpacer: { height: 48, width: 48 },
  bottomArea: { gap: 14, paddingBottom: 12, paddingHorizontal: 16 },
  controls: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  previewPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 14,
    maxHeight: 82,
    overflow: 'hidden',
    padding: 6,
  },
  permissionView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  permissionIcon: {
    alignItems: 'center',
    borderRadius: 22,
    height: 76,
    justifyContent: 'center',
    marginBottom: 20,
    width: 76,
  },
  permissionTitle: { marginBottom: 8, textAlign: 'center' },
  permissionDescription: { maxWidth: 340, textAlign: 'center' },
  permissionButton: { marginTop: 24 },
});
