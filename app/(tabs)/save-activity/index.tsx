import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Checkbox from '../../../components/checkbox/checkbox';
import DateTimePicker from '../../../components/date-picker/date-picker';
import DeclineBtn from '../../../components/decline-btn/decline-btn';
import EmotionBtns from '../../../components/emotion-btns/emotion-btns';
import NetworkIndicator from '../../../components/network-indicator/network-indicator';
import SportsBtns from '../../../components/sports-btns/sports-btns';
import TextInputs from '../../../components/text-inputs/text-inputs';
import UploadPhotosBtn from '../../../components/upload-photos-btn/upload-photos-btn';
import { setIsNeedToResetInputs } from '../../../redux/activity/activity';

export default function SaveResult() {
  const [isDisabled, setIsDisabled] = useState(false);
  const { isNeedToResetInputs, isManualAdding } = useSelector(({ activity }) => activity);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isNeedToResetInputs) {
      dispatch(setIsNeedToResetInputs(false));
    }
  }, [isNeedToResetInputs]);

  return (
    <ScrollView style={styles.container}>
      <NetworkIndicator />
      <TextInputs isDisabled={isDisabled} />
      <SportsBtns isDisabled={isDisabled} />
      <EmotionBtns isDisabled={isDisabled} />
      <Checkbox isDisabled={isDisabled} />
      {isManualAdding && <DateTimePicker />}
      <UploadPhotosBtn isDisabled={isDisabled} setIsDisabled={setIsDisabled} />
      <DeclineBtn isDisabled={isDisabled} />
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
