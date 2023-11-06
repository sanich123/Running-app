import { SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { saveEmotion } from '../../redux/activity/activity';

type EmotionBtnsProps = {
  emotion: string;
  setEmotion: (arg: string) => void;
  isDisabled: boolean;
};

export default function EmotionBtns({ emotion, setEmotion, isDisabled }: EmotionBtnsProps) {
  const dispatch = useDispatch();
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
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
        },
        {
          value: 'normal',
          label: 'Normal',
          icon: 'emoticon-neutral',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
        },
        {
          value: 'fucked',
          label: 'Fucked',
          icon: 'emoticon-poop-outline',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
        },
      ]}
      style={{ marginTop: 15 }}
    />
  );
}
