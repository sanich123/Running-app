import { saveIsPublic } from '@R/activity/activity';
import { store } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';

import { CHECKBOX_TEST_ID, CHECKBOX } from './const';

export default function Checkbox({ isDisabled }: { isDisabled: boolean }) {
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhileSending, isEditingActivity } = useAppSelector(({ activity }) => activity);
  const [isPublic, setIsPublic] = useState(
    isEditingActivity ? store.getState().activity.additionalInfo.isPublic : true,
  );
  const dispatch = useAppDispatch();

  return (
    <View style={styles.switcherWrapper}>
      <Switch
        value={isPublic}
        onValueChange={() => {
          dispatch(saveIsPublic(!isPublic));
          setIsPublic(!isPublic);
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
