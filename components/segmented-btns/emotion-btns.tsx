import { SegmentedButtons } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { saveEmotion } from '../../redux/activity/activity';

type EmotionBtnsProps = {
  emotion: string;
  setEmotion: (arg: string) => void;
  isDisabled: boolean;
};

export default function EmotionBtns({ emotion, setEmotion, isDisabled }: EmotionBtnsProps) {
  const dispatch = useDispatch();
  return (
    <SegmentedButtons
      value={emotion}
      onValueChange={() => {
        dispatch(saveEmotion(emotion));
        setEmotion(emotion);
      }}
      buttons={[
        {
          value: 'good',
          label: 'Fine',
          icon: 'emoticon-happy-outline',
          showSelectedCheck: true,
          disabled: isDisabled,
        },
        {
          value: 'normal',
          label: 'Normal',
          icon: 'emoticon-neutral',
          showSelectedCheck: true,
          disabled: isDisabled,
        },
        {
          value: 'fucked',
          label: 'Fucked',
          icon: 'emoticon-poop-outline',
          showSelectedCheck: true,
          disabled: isDisabled,
        },
      ]}
      style={{ marginTop: 15 }}
    />
  );
}
