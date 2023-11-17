import { useState } from 'react';
import DatePicker from 'react-native-date-picker';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { DATE_TIME_PICKER } from './const';
import { setManualDate } from '../../redux/activity/activity';

export default function DateTimePicker() {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const { language } = useSelector(({ language }) => language);
  const dispatch = useDispatch();

  return (
    <>
      <Button icon="calendar" onPress={() => setOpen(true)} mode="outlined" style={{ marginTop: 10 }}>
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
