import { View, StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { PROFILE_INPUT_LIMITS, normalizeWeightInput } from '@const/input-limits';
import { useAppSelector } from '@R/typed-hooks';
import { useProfileFormParams, useSetProfileFormParams } from '../profile-settings-params';
import { CITY_TEST_ID, WEIGHT_CITY, WEIGHT_TEST_ID } from './const';
import type { InputsWeightCityProps } from './types';

export default function InputsWeightCity({ isDisabled, variant = 'both', compact = false }: InputsWeightCityProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const { city, weight } = useProfileFormParams();
  const { setCity, setWeight } = useSetProfileFormParams();
  const shouldBeDisabled = isDisabled;
  const fields = variant === 'city' ? ['city'] : variant === 'weight' ? ['weight'] : ['city', 'weight'];

  return (
    <View
      style={
        variant === 'both'
          ? styles.inputWrapper
          : [styles.singleInput, compact && variant === 'weight' && styles.compactInput]
      }>
      {fields.map((field) => (
        <TextInput
          key={field}
          testID={field === 'city' ? CITY_TEST_ID : WEIGHT_TEST_ID}
          mode="outlined"
          style={[
            styles.input,
            variant === 'both' && styles.inputColumn,
            { backgroundColor: colors.surface },
            shouldBeDisabled && styles.disabledInput,
          ]}
          contentStyle={styles.content}
          outlineStyle={styles.outline}
          outlineColor={colors.outlineVariant}
          activeOutlineColor={colors.primary}
          textColor={colors.onSurface}
          label={field === 'city' ? WEIGHT_CITY[language].cityLabel : WEIGHT_CITY[language].weightLabel}
          placeholder={
            field === 'city' ? WEIGHT_CITY[language].cityPlaceholder : WEIGHT_CITY[language].weightPlaceholder
          }
          maxLength={field === 'city' ? PROFILE_INPUT_LIMITS.city : PROFILE_INPUT_LIMITS.weight}
          inputMode={field === 'weight' ? 'numeric' : undefined}
          value={field === 'city' ? city : weight}
          onChangeText={(value) => (field === 'city' ? setCity(value) : setWeight(normalizeWeightInput(value)))}
          disabled={shouldBeDisabled}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  singleInput: { width: '100%' },
  compactInput: { flex: 1, width: 'auto' },
  input: { flex: 1, minWidth: 0, minHeight: 52, fontSize: 15 },
  inputColumn: { flex: 1, minWidth: 0 },
  content: { fontFamily: FONT_FAMILIES.regular },
  outline: { borderRadius: 8 },
  disabledInput: { opacity: 0.7 },
});
