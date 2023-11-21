import { useEffect, useState } from 'react';
import { SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { RIDE_BTN_TEST_ID, RUN_BTN_TEST_ID, SPORTS_BTNS, SPORTS_BTNS_VALUES, SWIM_BTN_TEST_ID } from './const';
import { saveSport } from '../../redux/activity/activity';

export default function SportsBtns({ isDisabled }: { isDisabled: boolean }) {
  const [sport, setSport] = useState<SPORTS_BTNS_VALUES>(SPORTS_BTNS_VALUES.run);
  const dispatch = useDispatch();
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);
  const { language } = useSelector(({ language }) => language);

  useEffect(() => {
    if (isNeedToResetInputs) {
      setSport(SPORTS_BTNS_VALUES.run);
      dispatch(saveSport(SPORTS_BTNS_VALUES.run));
    }
  }, [isNeedToResetInputs]);

  return (
    <SegmentedButtons
      value={sport}
      onValueChange={(sport) => {
        setSport(sport);
        dispatch(saveSport(sport));
      }}
      buttons={[
        {
          value: SPORTS_BTNS_VALUES.run,
          label: SPORTS_BTNS[language].labelRun,
          icon: SPORTS_BTNS_VALUES.run,
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: RUN_BTN_TEST_ID,
        },
        {
          value: SPORTS_BTNS_VALUES.swim,
          label: SPORTS_BTNS[language].labelSwim,
          icon: SPORTS_BTNS_VALUES.swim,
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: SWIM_BTN_TEST_ID,
        },
        {
          value: SPORTS_BTNS_VALUES.bike,
          label: SPORTS_BTNS[language].labelBike,
          icon: SPORTS_BTNS_VALUES.bike,
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: RIDE_BTN_TEST_ID,
        },
      ]}
      style={{ marginTop: 15 }}
    />
  );
}
