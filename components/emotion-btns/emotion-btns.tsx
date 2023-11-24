import { useEffect, useState } from 'react';
import { SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { EMOTIONS_BTNS_ICONS, EMOTIONS_BTNS_TEST_IDS, EMOTIONS_BTNS_VALUES, EMOTION_BTNS } from './const';
import { saveEmotion } from '../../redux/activity/activity';
import { store } from '../../redux/store';

export default function EmotionBtns({ isDisabled }: { isDisabled: boolean }) {
  const [emotion, setEmotion] = useState<EMOTIONS_BTNS_VALUES>(store.getState().activity.additionalInfo.emotion);
  const dispatch = useDispatch();
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);
  const { language } = useSelector(({ language }) => language);

  useEffect(() => {
    if (isNeedToResetInputs) {
      setEmotion(EMOTIONS_BTNS_VALUES.normal);
      dispatch(saveEmotion(EMOTIONS_BTNS_VALUES.normal));
    }
  }, [isNeedToResetInputs]);

  return (
    <SegmentedButtons
      value={emotion}
      onValueChange={(emotion) => {
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
