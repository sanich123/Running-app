import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { saveName, saveSurname } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { NAME_SURNAME, NAME_TEST_ID, SURNAME_TEST_ID } from './const';

export default function InputsNameSurname({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { isDisabledWhileSendingProfile, settings } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const [name, setName] = useState(settings?.name);
  const [surname, setSurname] = useState(settings?.surname);
  const shouldBeDisabled = isDisabled || isDisabledWhileSendingProfile;

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        testID={NAME_TEST_ID}
        mode="outlined"
        style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
        contentStyle={styles.content}
        outlineStyle={styles.outline}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        label={NAME_SURNAME[language].nameLabel}
        placeholder={NAME_SURNAME[language].namePlaceholder}
        value={name}
        onChangeText={(name) => {
          setName(name);
          dispatch(saveName(name));
        }}
        disabled={shouldBeDisabled}
      />
      <TextInput
        testID={SURNAME_TEST_ID}
        mode="outlined"
        style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
        contentStyle={styles.content}
        outlineStyle={styles.outline}
        outlineColor={colors.outlineVariant}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        label={NAME_SURNAME[language].surnameLabel}
        placeholder={NAME_SURNAME[language].surnamePlaceholder}
        value={surname}
        onChangeText={(surname) => {
          setSurname(surname);
          dispatch(saveSurname(surname));
        }}
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
    width: '100%',
    gap: 8,
  },
  input: { flex: 1, minWidth: 0, minHeight: 52, fontSize: 15 },
  content: { fontFamily: FONT_FAMILIES.regular },
  outline: { borderRadius: 8 },
  disabledInput: { opacity: 0.7 },
});
