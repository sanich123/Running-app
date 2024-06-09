import CameraLauncher from '@C/camera/camera';
import Checkbox from '@C/checkbox/checkbox';
import NetworkIndicator from '@C/network-indicator/network-indicator';
import DatePickerWeb from '@C/save-activity-page/date-picker-web/date-picker-web';
import { useAppSelector } from '@R/typed-hooks';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

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
  const [isDisabled, setIsDisabled] = useState(false);
  const {
    isManualAdding,
    isEditingActivity,
    isCameraVisible,
    additionalInfo: { photoVideoUrls },
  } = useAppSelector(({ activity }) => activity);
  const [images, setImages] = useState<{ url: string; thumbnail: string | null }[]>([]);

  return (
    <>
      {!isCameraVisible ? (
        <ScrollView style={!isCameraVisible && styles.container}>
          <NetworkIndicator />
          <TextInputs isDisabled={isDisabled} />
          <SportsBtns isDisabled={isDisabled} />
          <EmotionBtns isDisabled={isDisabled} />
          <Checkbox isDisabled={isDisabled} />
          {(isManualAdding || isEditingActivity) && Platform.OS !== 'web' && <DateTimePicker isDisabled={isDisabled} />}
          {(isManualAdding || isEditingActivity) && Platform.OS === 'web' && <DatePickerWeb isDisabled={isDisabled} />}
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
    paddingLeft: 10,
    paddingRight: 10,
  },
  cameraUploadBtns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
