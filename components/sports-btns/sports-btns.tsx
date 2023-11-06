import { useEffect, useState } from 'react';
import { SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { saveSport } from '../../redux/activity/activity';

export default function SportsBtns({ isDisabled }: { isDisabled: boolean }) {
  const [sport, setSport] = useState('run');
  const dispatch = useDispatch();
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);

  useEffect(() => {
    if (isNeedToResetInputs) {
      setSport('run');
      dispatch(saveSport('run'));
    }
  }, [isNeedToResetInputs]);

  return (
    <SegmentedButtons
      value={sport}
      onValueChange={(sport) => {
        dispatch(saveSport(sport));
        setSport(sport);
      }}
      buttons={[
        {
          value: 'run',
          label: 'Running',
          icon: 'run',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: 'runningBtn',
        },
        {
          value: 'swim',
          label: 'Swimming',
          icon: 'swim',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: 'swimmingBtn',
        },
        {
          value: 'Bike',
          label: 'Riding',
          icon: 'bike',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: 'ridingBtn',
        },
      ]}
      style={{ marginTop: 15 }}
    />
  );
}
