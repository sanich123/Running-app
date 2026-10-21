import { StyleSheet, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { PROFILE_INPUT_LIMITS, normalizeMaxHeartRateInput, normalizeRestingHeartRateInput } from '@const/input-limits';
import { useAppSelector } from '@R/typed-hooks';
import { useProfileFormParams, useSetProfileFormParams } from '../profile-settings-params';
import { HEART_RATE_INPUTS, MAX_HEART_RATE_TEST_ID, RESTING_HEART_RATE_TEST_ID } from './const';
import type { InputsHeartRateProps } from './types';

export default function InputsHeartRate({ isDisabled }: InputsHeartRateProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const { restingHeartRate, maxHeartRate } = useProfileFormParams();
  const { setRestingHeartRate, setMaxHeartRate } = useSetProfileFormParams();
  const copy = HEART_RATE_INPUTS[language];

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text variant="titleMedium">{copy.sectionTitle}</Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {copy.sectionHint}
        </Text>
      </View>
      <View style={styles.inputs}>
        <TextInput
          testID={RESTING_HEART_RATE_TEST_ID}
          mode="outlined"
          label={copy.restingLabel}
          placeholder={copy.restingPlaceholder}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={PROFILE_INPUT_LIMITS.restingHeartRate}
          value={restingHeartRate}
          disabled={isDisabled}
          onChangeText={(value) => setRestingHeartRate(normalizeRestingHeartRateInput(value))}
          style={styles.input}
          contentStyle={styles.content}
          outlineStyle={styles.outline}
        />
        <TextInput
          testID={MAX_HEART_RATE_TEST_ID}
          mode="outlined"
          label={copy.maximumLabel}
          placeholder={copy.maximumPlaceholder}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={PROFILE_INPUT_LIMITS.maxHeartRate}
          value={maxHeartRate}
          disabled={isDisabled}
          onChangeText={(value) => setMaxHeartRate(normalizeMaxHeartRateInput(value))}
          style={styles.input}
          contentStyle={styles.content}
          outlineStyle={styles.outline}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8, marginTop: 8, width: '100%' },
  heading: { gap: 2, paddingHorizontal: 12 },
  inputs: { flexDirection: 'row', gap: 8, width: '100%' },
  input: { flex: 1, minWidth: 0, minHeight: 52, fontSize: 15 },
  content: { fontFamily: FONT_FAMILIES.regular },
  outline: { borderRadius: 8 },
});
