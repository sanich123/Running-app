import { SegmentedButtons } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import { EMOTIONS_BTNS_VALUES, EMOTION_BTNS, EMOTIONS_BTNS_ICONS, EMOTIONS_BTNS_TEST_IDS } from './const';

export default function EmotionBtns({ isDisabled }: { isDisabled: boolean }) {
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ settings }) => settings);
  const { emotion } = useManualActivityParams();
  const { setEmotion } = useSetManualActivityParams();

  return (
    <SegmentedButtons
      value={emotion}
      onValueChange={setEmotion}
      buttons={[
        {
          value: EMOTIONS_BTNS_VALUES.good,
          label: EMOTION_BTNS[language].fineLabel,
          icon: EMOTIONS_BTNS_ICONS.iconHappy,
          showSelectedCheck: true,
          disabled: isDisabled || isSavingDisabled,
          testID: EMOTIONS_BTNS_TEST_IDS.goodInput,
        },
        {
          value: EMOTIONS_BTNS_VALUES.normal,
          label: EMOTION_BTNS[language].normalLabel,
          icon: EMOTIONS_BTNS_ICONS.iconNeutral,
          showSelectedCheck: true,
          disabled: isDisabled || isSavingDisabled,
          testID: EMOTIONS_BTNS_TEST_IDS.normalInput,
        },
        {
          value: EMOTIONS_BTNS_VALUES.fucked,
          label: EMOTION_BTNS[language].fuckedLabel,
          icon: EMOTIONS_BTNS_ICONS.iconFucked,
          showSelectedCheck: true,
          disabled: isDisabled || isSavingDisabled,
          testID: EMOTIONS_BTNS_TEST_IDS.fuckedInput,
        },
      ]}
      style={{ marginTop: 12 }}
    />
  );
}
