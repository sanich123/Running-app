import { saveIsSwitchOn } from '@R/activity/activity';
import { store } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';

import { CHECKBOX_TEST_ID, CHECKBOX } from './const';

export default function Checkbox({ isDisabled }: { isDisabled: boolean }) {
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhileSending, isNeedToResetInputs } = useAppSelector(({ activity }) => activity);
  const [isSwitchOn, setIsSwitchOn] = useState(store.getState().activity.additionalInfo.isSwitchOn);
  const dispatch = useAppDispatch();

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
