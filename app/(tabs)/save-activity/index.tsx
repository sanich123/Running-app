import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import CameraLauncher from '../../../components/camera/camera';
import Checkbox from '../../../components/checkbox/checkbox';
import DateTimePicker from '../../../components/date-picker/date-picker';
import DeclineBtn from '../../../components/decline-btn/decline-btn';
import EmotionBtns from '../../../components/emotion-btns/emotion-btns';
import InputsDistanceTime from '../../../components/inputs-distance-time/inputs-distance-time';
import NetworkIndicator from '../../../components/network-indicator/network-indicator';
import SportsBtns from '../../../components/sports-btns/sports-btns';
import TextInputs from '../../../components/text-inputs/text-inputs';
import UploadPhotosBtn from '../../../components/upload-photos-btn/upload-photos-btn';
import { setIsNeedToResetInputs } from '../../../redux/activity/activity';

export default function SaveResult() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const { isNeedToResetInputs, isManualAdding } = useSelector(({ activity }) => activity);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isNeedToResetInputs) {
      dispatch(setIsNeedToResetInputs(false));
    }
  }, [isNeedToResetInputs]);

  return (
    <ScrollView style={!isCameraVisible && styles.container}>
      <NetworkIndicator />
      {isCameraVisible && <CameraLauncher setIsCameraVisible={setIsCameraVisible} />}
      {!isCameraVisible && (
        <>
          <TextInputs isDisabled={isDisabled} />
          <SportsBtns isDisabled={isDisabled} />
          <EmotionBtns isDisabled={isDisabled} />
          <Checkbox isDisabled={isDisabled} />
          {isManualAdding && <DateTimePicker isDisabled={isDisabled} />}
          {isManualAdding && <InputsDistanceTime isDisabled={isDisabled} />}
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              icon="camera"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 15,
                width: '45%',
                height: 120,
              }}
              onPress={() => setIsCameraVisible(true)}>
              Take a pic
            </Button>

            <UploadPhotosBtn isDisabled={isDisabled} setIsDisabled={setIsDisabled} />
          </View>
          <DeclineBtn isDisabled={isDisabled} />
        </>
      )}
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
});
