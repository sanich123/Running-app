import { Platform } from 'react-native';
import { HelperText, TextInput, useTheme } from 'react-native-paper';
import type { FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import type { CustomTextInputProps } from './types';

export default function CustomTextInput<T extends FieldValues>({
  control,
  fieldName,
  validation = { required: 'Обязательно для заполнения' },
  label,
  autoCapitalize = 'none',
  maxLength,
  returnKeyType = 'done',
  returnKeyLabel,
  callback,
  inputMode,
  multiline = false,
  numberOfLines,
  autoComplete = 'off',
  capitalizeValue = false,
  replaceCommaToDot = false,
  onSubmitEditing,
  accessibilityLabel,
  compact = false,
}: CustomTextInputProps<T>) {
  const { isDisabledWhenLogining } = useAppSelector(({ logining }) => logining);
  const { colors } = useTheme();
  const shouldBeDisabled = isDisabledWhenLogining;
  return (
    <Controller
      name={fieldName}
      control={control}
      rules={validation}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <TextInput
            label={compact ? undefined : label}
            placeholder={compact ? label : undefined}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            autoComplete={autoComplete}
            inputMode={inputMode}
            mode="outlined"
            style={{
              marginTop: compact ? 4 : 12,
              backgroundColor: colors.surface,
              fontSize: 15,
              height: compact && !multiline ? 52 : undefined,
              minHeight: multiline ? 96 : 52,
              opacity: shouldBeDisabled ? 0.7 : 1,
            }}
            contentStyle={{
              fontFamily: FONT_FAMILIES.regular,
              includeFontPadding: compact ? false : undefined,
              paddingBottom: compact && !multiline && Platform.OS === 'android' ? 3 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            }}
            outlineStyle={{ borderRadius: 8 }}
            onChangeText={(text) => {
              let editedText = text;
              if (capitalizeValue) {
                editedText = editedText.toLocaleUpperCase();
              }
              if (inputMode === 'email') {
                editedText = editedText.trim();
              }
              if (replaceCommaToDot) {
                editedText = editedText.replace(/,/g, '.');
                if (editedText[0] === '0') {
                  editedText = editedText.slice(1);
                }
                if (/^\d+(\.\d{0,2})?$/.test(editedText) || editedText === '') {
                  onChange(editedText);
                }
              } else {
                onChange(editedText);
                callback?.(editedText);
              }
            }}
            onSubmitEditing={onSubmitEditing}
            value={value}
            error={!!error?.message}
            outlineColor={error ? colors.error : colors.outlineVariant}
            activeOutlineColor={colors.primary}
            textColor={colors.onSurface}
            maxLength={maxLength}
            accessibilityLabel={accessibilityLabel}
            testID={label}
            disabled={shouldBeDisabled}
            returnKeyLabel={returnKeyLabel}
            returnKeyType={returnKeyType}
            multiline={multiline}
            numberOfLines={numberOfLines}
          />
          {!!error?.message && (
            <HelperText type="error" visible={!!error?.message} style={{ fontFamily: FONT_FAMILIES.regular }}>
              {error?.message}
            </HelperText>
          )}
        </>
      )}
    />
  );
}
