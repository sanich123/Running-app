import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { CHECKBOX, CHECKBOX_TEST_ID } from './const';
import { saveIsSwitchOn } from '../../redux/activity/activity';
import { store } from '../../redux/store';

export default function Checkbox({ isDisabled }: { isDisabled: boolean }) {
  const { language } = useSelector(({ language }) => language);
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);
  const [isSwitchOn, setIsSwitchOn] = useState(store.getState().activity.additionalInfo.isSwitchOn);
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
        testID={CHECKBOX_TEST_ID}
        disabled={isDisabled || isDisabledWhileSending}
      />
      <Text variant="titleSmall" style={(isDisabled || isDisabledWhileSending) && { opacity: 0.5 }}>
        {CHECKBOX[language].public}
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
