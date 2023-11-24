import { setManualDate } from '@R/activity/activity';
import { store } from '@R/store';
import { useState } from 'react';
import DatePicker from 'react-native-date-picker';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { DATE_TIME_PICKER_BTN_ID, DATE_TIME_PICKER } from './const';

export default function DateTimePicker({ isDisabled }: { isDisabled: boolean }) {
  const [date, setDate] = useState(store.getState().activity.manualDate || new Date());
  const [open, setOpen] = useState(false);
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
  const { language } = useSelector(({ language }) => language);
  const dispatch = useDispatch();

  return (
    <>
      <Button
        testID={DATE_TIME_PICKER_BTN_ID}
        icon="calendar"
        onPress={() => setOpen(true)}
        mode="outlined"
        style={[{ marginTop: 10 }, (isDisabledWhileSending || isDisabled) && { opacity: 0.5 }]}
        disabled={isDisabledWhileSending || isDisabled}>
        {DATE_TIME_PICKER[language as keyof typeof DATE_TIME_PICKER].title}
      </Button>
      <DatePicker
        modal
        open={open}
        date={date}
        onConfirm={(date) => {
          setOpen(false);
          setDate(date);
          dispatch(setManualDate(date));
        }}
        onCancel={() => setOpen(false)}
        title={DATE_TIME_PICKER[language as keyof typeof DATE_TIME_PICKER].title}
        confirmText={DATE_TIME_PICKER[language as keyof typeof DATE_TIME_PICKER].confirm}
        cancelText={DATE_TIME_PICKER[language as keyof typeof DATE_TIME_PICKER].cancel}
      />
    </>
  );
}
