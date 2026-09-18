import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useAppSelector } from '@R/typed-hooks';
import Checkbox from '@Routes/save-activity-page/checkbox/checkbox';
import DatePickerWeb from '@Routes/save-activity-page/date-picker-web/date-picker-web';
import CameraLauncher from './camera/camera';
import DateTimePicker from './date-picker/date-picker';
import DeclineBtn from './decline-btn/decline-btn';
import EmotionBtns from './emotion-btns/emotion-btns';
import InputsDistanceTime from './inputs-distance-time/inputs-distance-time';
import { useManualActivityParams } from './manual-activity-params';
import PreviewImages from './preview-images/preview-images';
import ShowCameraBtn from './show-camera-btn/show-camera-btn';
import SportsBtns from './sports-btns/sports-btns';
import TextInputs from './text-inputs/text-inputs';
import { MAX_ACTIVITY_MEDIA, UPLOAD_PHOTO_BTN } from './upload-photos-btn/ const';
import UploadPhotosBtn from './upload-photos-btn/upload-photos-btn';
import type { ActivityPhoto } from '@R/slices/activity/types';

export default function SaveResult() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isCameraVisible, isManualAdding, isEditingActivity } = useManualActivityParams();
  const { language } = useAppSelector(({ settings }) => settings);
  const { photoVideoUrls } = useAppSelector(({ activity }) => activity);
  const [images, setImages] = useState<ActivityPhoto[]>(photoVideoUrls);
  const [isMediaUploadDisabled, setIsMediaUploadDisabled] = useState(false);
  const isDisabled = false;

  return (
    <View style={styles.page}>
      <KeyboardAwareScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, Platform.OS === 'web' && styles.webContent]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}>
        <View style={{ paddingBottom: insets.bottom + 24 }}>
          <TextInputs isDisabled={isDisabled} />
          <SportsBtns isDisabled={isDisabled} />
          <EmotionBtns isDisabled={isDisabled} />
          <Checkbox isDisabled={isDisabled} />
          {!isEditingActivity && (
            <>
              <View style={styles.mediaButtons}>
                <UploadPhotosBtn
                  isDisabled={isDisabled || isMediaUploadDisabled}
                  setIsDisabled={setIsMediaUploadDisabled}
                  setImages={setImages}
                  images={images}
                />
                <ShowCameraBtn isDisabled={isDisabled || isMediaUploadDisabled} />
              </View>
              <Text style={[styles.mediaHint, { color: colors.onSurfaceVariant }]}>
                {UPLOAD_PHOTO_BTN[language].uploadHint}
              </Text>
              <PreviewImages setImages={setImages} images={images} isDisabled={isDisabled || isMediaUploadDisabled} />
            </>
          )}
          {(isManualAdding || isEditingActivity) && Platform.OS !== 'web' && (
            <DateTimePicker isDisabled={isDisabled} maximumDate={isManualAdding ? new Date() : undefined} />
          )}
          {(isManualAdding || isEditingActivity) && Platform.OS === 'web' && (
            <DatePickerWeb isDisabled={isDisabled} maximumDate={isManualAdding ? new Date() : undefined} />
          )}
          {(isManualAdding || isEditingActivity) && <InputsDistanceTime isDisabled={isDisabled} />}
          <DeclineBtn isDisabled={isDisabled} />
          <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </View>
      </KeyboardAwareScrollView>
      {isCameraVisible && (
        <View style={styles.cameraOverlay}>
          <CameraLauncher photos={images} setPhotos={setImages} maxPhotos={MAX_ACTIVITY_MEDIA} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 10,
  },
  webContent: {
    marginHorizontal: 'auto',
    maxWidth: MAX_MOBILE_WIDTH,
    width: '100%',
  },
  mediaButtons: { flexDirection: 'row', gap: 8, marginHorizontal: 4 },
  mediaHint: { fontSize: 12, lineHeight: 17, marginHorizontal: 4, marginTop: 6, textAlign: 'center' },
  cameraOverlay: { bottom: 0, elevation: 20, left: 0, position: 'absolute', right: 0, top: 0, zIndex: 20 },
});
