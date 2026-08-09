import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useAppSelector } from '@R/typed-hooks';
import CameraLauncher from '@Routes/save-activity-page/camera/camera';
import Checkbox from '@Routes/save-activity-page/checkbox/checkbox';
import DatePickerWeb from '@Routes/save-activity-page/date-picker-web/date-picker-web';
import DateTimePicker from './date-picker/date-picker';
import DeclineBtn from './decline-btn/decline-btn';
import EmotionBtns from './emotion-btns/emotion-btns';
import InputsDistanceTime from './inputs-distance-time/inputs-distance-time';
import PreviewImages from './preview-images/preview-images';
import ShowCameraBtn from './show-camera-btn/show-camera-btn';
import SportsBtns from './sports-btns/sports-btns';
import TextInputs from './text-inputs/text-inputs';
import UploadPhotosBtn from './upload-photos-btn/upload-photos-btn';

export default function SaveResult() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isDisabled, setIsDisabled] = useState(false);
  const { isManualAdding, isEditingActivity, isCameraVisible } = useAppSelector(({ manualActivity }) => manualActivity);
  const { photoVideoUrls } = useAppSelector(({ additionalInfoActivity }) => additionalInfoActivity);
  const [images, setImages] = useState<{ url: string; thumbnail: string | null }[]>([]);

  return (
    <>
      {!isCameraVisible ? (
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={[styles.content, Platform.OS === 'web' && styles.webContent]}>
          <View style={{ paddingBottom: insets.bottom + 24 }}>
            <TextInputs isDisabled={isDisabled} />
            <SportsBtns isDisabled={isDisabled} />
            <EmotionBtns isDisabled={isDisabled} />
            <Checkbox isDisabled={isDisabled} />
            {(isManualAdding || isEditingActivity) && Platform.OS !== 'web' && (
              <DateTimePicker isDisabled={isDisabled} />
            )}
            {(isManualAdding || isEditingActivity) && Platform.OS === 'web' && (
              <DatePickerWeb isDisabled={isDisabled} />
            )}
            {(isManualAdding || isEditingActivity) && <InputsDistanceTime isDisabled={isDisabled} />}
            <View style={styles.cameraUploadBtns}>
              {Platform.OS !== 'web' && <ShowCameraBtn isDisabled={isDisabled} />}
              <UploadPhotosBtn
                isDisabled={isDisabled}
                setIsDisabled={setIsDisabled}
                setImages={setImages}
                images={images}
              />
            </View>
            {photoVideoUrls?.length > 0 ? (
              <PreviewImages images={photoVideoUrls} setImages={setImages} isDisabled={isDisabled} />
            ) : null}
            <DeclineBtn isDisabled={isDisabled} />
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
          </View>
        </ScrollView>
      ) : (
        <>{Platform.OS !== 'web' && <CameraLauncher />}</>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
  cameraUploadBtns: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 8,
  },
});
