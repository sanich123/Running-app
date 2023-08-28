import { useContext } from 'react';
import { SegmentedButtons } from 'react-native-paper';

import { SaveSettingsContext } from '../../utils/context/settings';

export default function SportsBtns() {
  const { sport, isDisabled, setSport } = useContext(SaveSettingsContext);

  return (
    <SegmentedButtons
      value={sport}
      onValueChange={setSport}
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
      style={{ marginTop: 15, paddingLeft: 15, paddingRight: 15 }}
    />
  );
}
