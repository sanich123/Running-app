import { View, StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { PROFILE_INPUT_LIMITS, normalizeAgeInput, normalizeHeightInput } from '@const/input-limits';
import { useAppSelector } from '@R/typed-hooks';
import { useProfileFormParams, useSetProfileFormParams } from '../profile-settings-params';
import { AGE_TEST_ID, HEIGHT_AGE, HEIGHT_TEST_ID } from './const';
import type { InputsHeightAgeProps } from './types';

export default function InputsHeightAge({ isDisabled, compact = false }: InputsHeightAgeProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const { height, age } = useProfileFormParams();
  const { setHeight, setAge } = useSetProfileFormParams();
  const shouldBeDisabled = isDisabled;

  return (
    <View style={[styles.wrapper, compact && styles.compactWrapper]}>
      <View style={styles.inputColumn}>
        <TextInput
          testID={HEIGHT_TEST_ID}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
          contentStyle={styles.content}
          outlineStyle={styles.outline}
          outlineColor={colors.outlineVariant}
          activeOutlineColor={colors.primary}
          textColor={colors.onSurface}
          label={HEIGHT_AGE[language].heightLabel}
          placeholder={HEIGHT_AGE[language].heightPlaceholder}
          maxLength={PROFILE_INPUT_LIMITS.height}
          inputMode="numeric"
          value={height}
          onChangeText={(value) => setHeight(normalizeHeightInput(value))}
          disabled={shouldBeDisabled}
        />
      </View>
      <View style={styles.inputColumn}>
        <TextInput
          testID={AGE_TEST_ID}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
          contentStyle={styles.content}
          outlineStyle={styles.outline}
          outlineColor={colors.outlineVariant}
          activeOutlineColor={colors.primary}
          textColor={colors.onSurface}
          label={HEIGHT_AGE[language].ageLabel}
          placeholder={HEIGHT_AGE[language].agePlaceholder}
          maxLength={PROFILE_INPUT_LIMITS.age}
          inputMode="numeric"
          value={age}
          onChangeText={(value) => setAge(normalizeAgeInput(value))}
          disabled={shouldBeDisabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, width: '100%' },
  compactWrapper: { flex: 2, width: 'auto' },
  inputColumn: { flex: 1, minWidth: 0 },
  input: { flex: 1, minWidth: 0, minHeight: 52, fontSize: 15 },
  content: { fontFamily: FONT_FAMILIES.regular },
  outline: { borderRadius: 8 },
  disabledInput: { opacity: 0.7 },
});
