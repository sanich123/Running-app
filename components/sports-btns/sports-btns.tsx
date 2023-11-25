import { saveSport } from '@R/activity/activity';
import { store } from '@R/store';
import { useEffect, useState } from 'react';
import { SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { SPORTS_BTNS_VALUES, SPORTS_BTNS, RUN_BTN_TEST_ID, SWIM_BTN_TEST_ID, RIDE_BTN_TEST_ID } from './const';

export default function SportsBtns({ isDisabled }: { isDisabled: boolean }) {
  const [sport, setSport] = useState<SPORTS_BTNS_VALUES>(store.getState().activity.additionalInfo.sport);
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
      onValueChange={(sport: SPORTS_BTNS_VALUES) => {
        setSport(sport);
        dispatch(saveSport(sport));
      }}
      buttons={[
        {
          value: SPORTS_BTNS_VALUES.run,
          label: SPORTS_BTNS[language as keyof typeof SPORTS_BTNS].labelRun,
          icon: SPORTS_BTNS_VALUES.run,
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: RUN_BTN_TEST_ID,
        },
        {
          value: SPORTS_BTNS_VALUES.swim,
          label: SPORTS_BTNS[language as keyof typeof SPORTS_BTNS].labelSwim,
          icon: SPORTS_BTNS_VALUES.swim,
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: SWIM_BTN_TEST_ID,
        },
        {
          value: SPORTS_BTNS_VALUES.bike,
          label: SPORTS_BTNS[language as keyof typeof SPORTS_BTNS].labelBike,
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
