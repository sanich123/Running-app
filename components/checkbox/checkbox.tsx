import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { saveIsSwitchOn } from '../../redux/activity/activity';
import { SaveActivityContext } from '../../utils/context/save-activity';

export default function Checkbox() {
  const { isSwitchOn, setIsSwitchOn, isDisabled } = useContext(SaveActivityContext);
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);
  const dispatch = useDispatch();
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
