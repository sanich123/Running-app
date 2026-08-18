import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import { CHECKBOX_TEST_ID, CHECKBOX } from './const';

export default function Checkbox({ isDisabled }: { isDisabled: boolean }) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { isPublic } = useManualActivityParams();
  const { setIsPublic } = useSetManualActivityParams();

  return (
    <View style={styles.switcherWrapper}>
      <Switch
        value={isPublic}
        onValueChange={() => setIsPublic(!isPublic)}
        testID={CHECKBOX_TEST_ID}
        disabled={isDisabled || isSavingDisabled}
        style={styles.switch}
      />
      <Text variant="titleSmall" style={[styles.label, (isDisabled || isSavingDisabled) && styles.disabledLabel]}>
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
