import { SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { saveSport } from '../../redux/activity/activity';

type SportBtnsProps = {
  sport: string;
  isDisabled: boolean;
  setSport: (arg: string) => void;
};

export default function SportsBtns({ sport, isDisabled, setSport }: SportBtnsProps) {
  const dispatch = useDispatch();
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
  return (
    <SegmentedButtons
      value={sport}
      onValueChange={(sport) => {
        dispatch(saveSport(sport));
        setSport(sport);
      }}
      buttons={[
        {
          value: 'run',
          label: 'Running',
          icon: 'run',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
        },
        {
          value: 'swim',
          label: 'Swimming',
          icon: 'swim',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
        },
        {
          value: 'Bike',
          label: 'Riding',
          icon: 'bike',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSending,
        },
      ]}
      style={{ marginTop: 15 }}
    />
  );
}
