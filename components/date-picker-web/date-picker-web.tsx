import { setManualDate } from '@R/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useState } from 'react';

export default function DatePickerWeb() {
  const [date, setDate] = useState('');
  const dispatch = useAppDispatch();
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);

  return (
    <input
      disabled={isDisabledWhileSending}
      style={{ opacity: isDisabledWhileSending ? 0.5 : 1, marginTop: 15, marginBottom: 15 }}
      type="datetime-local"
      id="date-picker-date"
      value={date}
      onChange={({ target }) => {
        dispatch(setManualDate(new Date(Date.parse(target.value))));
        setDate(target.value);
      }}
    />
  );
}
