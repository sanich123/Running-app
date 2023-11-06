import { SegmentedButtons } from 'react-native-paper';
import { useSelector } from 'react-redux';

type GenderBtnsProps = {
  gender: string;
  setGender: (arg: string) => void;
  isDisabled: boolean;
};

export default function GenderBtns({ gender, isDisabled, setGender }: GenderBtnsProps) {
  const { isDisabledWhileSendingProfile } = useSelector(({ profile }) => profile);
  return (
    <SegmentedButtons
      value={gender}
      onValueChange={(gender) => setGender(gender)}
      buttons={[
        {
          value: 'male',
          label: 'Male',
          icon: 'human-male',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
        {
          value: 'female',
          label: 'Female',
          icon: 'human-female',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
        {
          value: 'packman',
          label: 'Packman',
          icon: 'pac-man',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
      ]}
      style={{ marginTop: 15, paddingLeft: 15, paddingRight: 15 }}
    />
  );
}
