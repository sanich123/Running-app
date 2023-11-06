import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { saveIsSwitchOn } from '../../redux/activity/activity';

export default function Checkbox({ isDisabled }: { isDisabled: boolean }) {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isNeedToResetInputs) {
      setIsSwitchOn(false);
      dispatch(saveIsSwitchOn(false));
    }
  }, [isNeedToResetInputs]);

  return (
    <View style={styles.switcherWrapper}>
      <Switch
        value={isSwitchOn}
        onValueChange={() => {
          dispatch(saveIsSwitchOn(!isSwitchOn));
          setIsSwitchOn(!isSwitchOn);
        }}
        testID="Switcher"
        disabled={isDisabled || isDisabledWhileSending}
      />
      <Text variant="titleSmall" style={isDisabledWhileSending && { opacity: 0.5 }}>
        Don't publish on Home or Club feeds
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
});
