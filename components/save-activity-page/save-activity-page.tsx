import CameraLauncher from '@C/camera/camera';
import Checkbox from '@C/checkbox/checkbox';
import DateTimePicker from '@C/date-picker/date-picker';
import DatePickerWeb from '@C/date-picker-web/date-picker-web';
import DeclineBtn from '@C/decline-btn/decline-btn';
import EmotionBtns from '@C/emotion-btns/emotion-btns';
import InputsDistanceTime from '@C/inputs-distance-time/inputs-distance-time';
import NetworkIndicator from '@C/network-indicator/network-indicator';
import PreviewImages from '@C/preview-images/preview-images';
import ShowCameraBtn from '@C/show-camera-btn/show-camera-btn';
import SportsBtns from '@C/sports-btns/sports-btns';
import TextInputs from '@C/text-inputs/text-inputs';
import UploadPhotosBtn from '@C/upload-photos-btn/upload-photos-btn';
import { useAppSelector } from '@R/typed-hooks';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

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
