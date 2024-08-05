import { setManualDate } from '@R/activity/activity';
import { store } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useState } from 'react';
import DatePicker from 'react-native-date-picker';
import { Button } from 'react-native-paper';

import { DATE_TIME_PICKER_BTN_ID, DATE_TIME_PICKER } from './const';

export default function DateTimePicker({ isDisabled }: { isDisabled: boolean }) {
  const savedDate = store.getState().activity.manualDate;
  const [date, setDate] = useState(savedDate ? new Date(savedDate) : new Date());
  const [open, setOpen] = useState(false);
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();

  return (
    <>
      <Button
        testID={DATE_TIME_PICKER_BTN_ID}
        icon="calendar"
        onPress={() => setOpen(true)}
        mode="outlined"
        style={[{ marginTop: 10 }, (isDisabledWhileSending || isDisabled) && { opacity: 0.5 }]}
        disabled={isDisabledWhileSending || isDisabled}>
        {DATE_TIME_PICKER[language].title}
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
        title={DATE_TIME_PICKER[language].title}
        confirmText={DATE_TIME_PICKER[language].confirm}
        cancelText={DATE_TIME_PICKER[language].cancel}
      />
    </>
  );
}
