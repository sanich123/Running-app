import { saveSport } from '@R/activity/activity';
import { store } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useEffect, useState } from 'react';
import { SegmentedButtons } from 'react-native-paper';

import { SPORTS_BTNS_VALUES, SPORTS_BTNS, RUN_BTN_TEST_ID, SWIM_BTN_TEST_ID, RIDE_BTN_TEST_ID } from './const';

export default function SportsBtns({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { isDisabledWhileSending, isNeedToResetInputs } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);
  const [sport, setSport] = useState<string>(store.getState().activity.additionalInfo.sport);

  useEffect(() => {
    if (isNeedToResetInputs) {
      setSport(SPORTS_BTNS_VALUES.run);
      dispatch(saveSport(SPORTS_BTNS_VALUES.run));
    }
  }, [isNeedToResetInputs]);

  return (
    <SegmentedButtons
      value={sport}
      onValueChange={(sport: string) => {
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
