import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import CameraLauncher from '../../../components/camera/camera';
import Checkbox from '../../../components/checkbox/checkbox';
import DateTimePicker from '../../../components/date-picker/date-picker';
import DeclineBtn from '../../../components/decline-btn/decline-btn';
import EmotionBtns from '../../../components/emotion-btns/emotion-btns';
import InputsDistanceTime from '../../../components/inputs-distance-time/inputs-distance-time';
import NetworkIndicator from '../../../components/network-indicator/network-indicator';
import PreviewImages from '../../../components/preview-images/preview-images';
import ShowCameraBtn from '../../../components/show-camera-btn/show-camera-btn';
import SportsBtns from '../../../components/sports-btns/sports-btns';
import TextInputs from '../../../components/text-inputs/text-inputs';
import UploadPhotosBtn from '../../../components/upload-photos-btn/upload-photos-btn';
import { setIsNeedToResetInputs } from '../../../redux/activity/activity';

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
