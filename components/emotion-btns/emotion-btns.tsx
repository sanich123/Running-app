import { useEffect, useState } from 'react';
import { SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { saveEmotion } from '../../redux/activity/activity';

export default function EmotionBtns({ isDisabled }: { isDisabled: boolean }) {
  const [emotion, setEmotion] = useState('normal');
  const dispatch = useDispatch();
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);

  useEffect(() => {
    if (isNeedToResetInputs) {
      setEmotion('normal');
      dispatch(saveEmotion('normal'));
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
          value: 'good',
          label: 'Fine',
          icon: 'emoticon-happy-outline',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: 'goodInput',
        },
        {
          value: 'normal',
          label: 'Normal',
          icon: 'emoticon-neutral',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: 'normalInput',
        },
        {
          value: 'fucked',
          label: 'Fucked',
          icon: 'emoticon-poop-outline',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
          testID: 'fuckedInput',
        },
      ]}
      style={{ marginTop: 15 }}
    />
  );
}
