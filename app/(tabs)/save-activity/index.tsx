import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import Checkbox from '../../../components/checkbox/checkbox';
import DeclineBtn from '../../../components/decline-btn/decline-btn';
import EmotionBtns from '../../../components/emotion-btns/emotion-btns';
import SportsBtns from '../../../components/sports-btns/sports-btns';
import TextInputs from '../../../components/text-inputs/text-inputs';
import UploadPhotosBtn from '../../../components/upload-photos-btn/upload-photos-btn';
import { setIsNeedToResetInputs } from '../../../redux/activity/activity';

export default function SaveResult() {
  const [isDisabled, setIsDisabled] = useState(false);
  const { isNeedToResetInputs } = useSelector(({ activity }) => activity);
  const dispatch = useDispatch();
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (isNeedToResetInputs) {
      dispatch(setIsNeedToResetInputs(false));
    }
  }, [isNeedToResetInputs]);

  return (
    <ScrollView style={styles.container}>
      <Button onPress={() => setOpen(true)}>Open</Button>
      <DatePicker
        modal
        open={open}
        date={date}
        onConfirm={(date) => {
          setOpen(false);
          setDate(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
      <TextInputs isDisabled={isDisabled} />
      <SportsBtns isDisabled={isDisabled} />
      <EmotionBtns isDisabled={isDisabled} />
      <Checkbox isDisabled={isDisabled} />
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
