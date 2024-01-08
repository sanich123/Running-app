import { saveEmotion } from '@R/activity/activity';
import { store } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useEffect, useState } from 'react';
import { SegmentedButtons } from 'react-native-paper';

import { EMOTIONS_BTNS_VALUES, EMOTION_BTNS, EMOTIONS_BTNS_ICONS, EMOTIONS_BTNS_TEST_IDS } from './const';

export default function EmotionBtns({ isDisabled }: { isDisabled: boolean }) {
  const [emotion, setEmotion] = useState<string>(store.getState().activity.additionalInfo.emotion);
  const dispatch = useAppDispatch();
  const { isDisabledWhileSending, isNeedToResetInputs } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ language }) => language);

  useEffect(() => {
    if (isNeedToResetInputs) {
      setEmotion(EMOTIONS_BTNS_VALUES.normal);
      dispatch(saveEmotion(EMOTIONS_BTNS_VALUES.normal));
    }
  }, [isNeedToResetInputs]);

  return (
    <SegmentedButtons
      value={emotion}
      onValueChange={(emotion: string) => {
        dispatch(saveEmotion(emotion));
        setEmotion(emotion);
      }}
      buttons={[
        {
          value: EMOTIONS_BTNS_VALUES.good,
          label: EMOTION_BTNS[language].fineLabel,
          icon: EMOTIONS_BTNS_ICONS.iconHappy,
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: EMOTIONS_BTNS_TEST_IDS.goodInput,
        },
        {
          value: EMOTIONS_BTNS_VALUES.normal,
          label: EMOTION_BTNS[language].normalLabel,
          icon: EMOTIONS_BTNS_ICONS.iconNeutral,
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: EMOTIONS_BTNS_TEST_IDS.normalInput,
        },
        {
          value: EMOTIONS_BTNS_VALUES.fucked,
          label: EMOTION_BTNS[language].fuckedLabel,
          icon: EMOTIONS_BTNS_ICONS.iconFucked,
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: EMOTIONS_BTNS_TEST_IDS.fuckedInput,
        },
      ]}
      style={{ marginTop: 15 }}
    />
  );
}
