import { View, StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { useProfileFormParams, useSetProfileFormParams } from '../profile-settings-params';
import { CITY_TEST_ID, WEIGHT_CITY, WEIGHT_TEST_ID } from './const';

export default function InputsWeightCity({ isDisabled }: { isDisabled: boolean }) {
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const { city, weight } = useProfileFormParams();
  const { setCity, setWeight } = useSetProfileFormParams();
  const shouldBeDisabled = isDisabled || isDisabledWhileSendingProfile;

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        testID={CITY_TEST_ID}
        mode="outlined"
        style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
        contentStyle={styles.content}
        outlineStyle={styles.outline}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        label={WEIGHT_CITY[language].cityLabel}
        placeholder={WEIGHT_CITY[language].cityPlaceholder}
        value={city}
        onChangeText={setCity}
        disabled={shouldBeDisabled}
      />
      <TextInput
        testID={WEIGHT_TEST_ID}
        mode="outlined"
        style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
        contentStyle={styles.content}
        outlineStyle={styles.outline}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        label={WEIGHT_CITY[language].weightLabel}
        placeholder={WEIGHT_CITY[language].weightPlaceholder}
        inputMode="numeric"
        value={weight}
        onChangeText={setWeight}
        disabled={shouldBeDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  input: { flex: 1, minWidth: 0, minHeight: 52, fontSize: 15 },
  content: { fontFamily: FONT_FAMILIES.regular },
  outline: { borderRadius: 8 },
  disabledInput: { opacity: 0.7 },
});
