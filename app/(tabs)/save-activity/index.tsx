import CameraLauncher from '@C/camera/camera';
import Checkbox from '@C/checkbox/checkbox';
import DateTimePicker from '@C/date-picker/date-picker';
import DeclineBtn from '@C/decline-btn/decline-btn';
import EmotionBtns from '@C/emotion-btns/emotion-btns';
import InputsDistanceTime from '@C/inputs-distance-time/inputs-distance-time';
import NetworkIndicator from '@C/network-indicator/network-indicator';
import PreviewImages from '@C/preview-images/preview-images';
import ShowCameraBtn from '@C/show-camera-btn/show-camera-btn';
import SportsBtns from '@C/sports-btns/sports-btns';
import TextInputs from '@C/text-inputs/text-inputs';
import UploadPhotosBtn from '@C/upload-photos-btn/upload-photos-btn';
import { setIsNeedToResetInputs } from '@R/activity/activity';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function SaveResult() {
  const [isDisabled, setIsDisabled] = useState(false);
  const {
    isNeedToResetInputs,
    isManualAdding,
    isCameraVisible,
    additionalInfo: { photoUrls },
  } = useSelector(({ activity }) => activity);
  const dispatch = useDispatch();
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (isNeedToResetInputs) {
      dispatch(setIsNeedToResetInputs(false));
    }
  }, [isNeedToResetInputs]);

  return (
    <>
      {!isCameraVisible ? (
        <ScrollView style={!isCameraVisible && styles.container}>
          <NetworkIndicator />
          <TextInputs isDisabled={isDisabled} />
          <SportsBtns isDisabled={isDisabled} />
          <EmotionBtns isDisabled={isDisabled} />
          <Checkbox isDisabled={isDisabled} />
          {isManualAdding && <DateTimePicker isDisabled={isDisabled} />}
          {isManualAdding && <InputsDistanceTime isDisabled={isDisabled} />}
          <View style={styles.cameraUploadBtns}>
            <ShowCameraBtn isDisabled={isDisabled} />
            <UploadPhotosBtn
              isDisabled={isDisabled}
              setIsDisabled={setIsDisabled}
              setImages={setImages}
              images={images}
            />
          </View>
          <PreviewImages images={photoUrls} setImages={setImages} isDisabled={isDisabled} />
          <DeclineBtn isDisabled={isDisabled} />
          <StatusBar style="auto" />
        </ScrollView>
      ) : (
        <CameraLauncher />
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
