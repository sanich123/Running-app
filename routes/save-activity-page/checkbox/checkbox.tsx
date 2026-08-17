import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { saveIsPublic } from '@R/slices/activity-additional-info/activity-additional-info';
import { store } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { CHECKBOX_TEST_ID, CHECKBOX } from './const';

export default function Checkbox({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);
  const { isEditingActivity } = useAppSelector(({ manualActivity }) => manualActivity);
  const [isPublic, setIsPublic] = useState(isEditingActivity ? store.getState().additionalInfoActivity.isPublic : true);

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
        style={styles.switch}
      />
      <Text variant="titleSmall" style={[styles.label, (isDisabled || isDisabledWhileSending) && styles.disabledLabel]}>
        {CHECKBOX[language].public}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    width: '100%',
    gap: 10,
  },
  switch: { flexShrink: 0, margin: 0, padding: 0 },
  label: { flex: 1, flexShrink: 1, lineHeight: 20 },
  disabledLabel: { opacity: 0.5 },
});
