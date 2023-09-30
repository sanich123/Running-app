import { SegmentedButtons } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { saveSport } from '../../redux/activity/activity';

type SportBtnsProps = {
  sport: string;
  isDisabled: boolean;
  setSport: (arg: string) => void;
};

export default function SportsBtns({ sport, isDisabled, setSport }: SportBtnsProps) {
  const dispatch = useDispatch();
  return (
    <SegmentedButtons
      value={sport}
      onValueChange={() => {
        dispatch(saveSport(sport));
        setSport(sport);
      }}
      buttons={[
        {
          value: 'run',
          label: 'Running',
          icon: 'run',
          showSelectedCheck: true,
          disabled: isDisabled,
        },
        {
          value: 'swim',
          label: 'Swimming',
          icon: 'swim',
          showSelectedCheck: true,
          disabled: isDisabled,
        },
        { value: 'Bike', label: 'Riding', icon: 'bike', showSelectedCheck: true, disabled: isDisabled },
      ]}
      style={{ marginTop: 15 }}
    />
  );
}
