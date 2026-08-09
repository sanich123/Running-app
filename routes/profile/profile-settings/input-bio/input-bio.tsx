import { useState } from 'react';
import { TextInput, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { saveBio } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { INPUT_BIO, INPUT_BIO_TEST_ID } from './const';

export default function InputBio({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhileSendingProfile, settings } = useAppSelector(({ profile }) => profile);
  const { colors } = useTheme();
  const [bio, setBio] = useState(settings?.bio);
  const shouldBeDisabled = isDisabled || isDisabledWhileSendingProfile;

  return (
    <TextInput
      testID={INPUT_BIO_TEST_ID}
      mode="outlined"
      style={[styles.input, { backgroundColor: colors.surface }, shouldBeDisabled && styles.disabledInput]}
      contentStyle={styles.content}
      outlineStyle={styles.outline}
      outlineColor={colors.outlineVariant}
      activeOutlineColor={colors.primary}
      textColor={colors.onSurface}
      label={INPUT_BIO[language].label}
      placeholder={INPUT_BIO[language].placeholder}
      multiline
      numberOfLines={4}
      value={bio}
      onChangeText={(bio) => {
        setBio(bio);
        dispatch(saveBio(bio));
      }}
      disabled={shouldBeDisabled}
    />
  );
}

const styles = {
  input: { width: '100%' as const, minHeight: 96, fontSize: 15 },
  content: { fontFamily: FONT_FAMILIES.regular },
  outline: { borderRadius: 8 },
  disabledInput: { opacity: 0.7 },
};
