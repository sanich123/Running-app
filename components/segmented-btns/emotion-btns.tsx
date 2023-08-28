import { SegmentedButtons } from 'react-native-paper';

type EmotionBtnsProps = {
  emotion: string;
  setEmotion: (arg: string) => void;
  isDisabled: boolean;
};

export default function EmotionBtns({ emotion, setEmotion, isDisabled }: EmotionBtnsProps) {
  return (
    <SegmentedButtons
      value={emotion}
      onValueChange={setEmotion}
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
