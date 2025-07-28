import { Controller, FieldValues } from 'react-hook-form';
import { HelperText, TextInput, useTheme } from 'react-native-paper';
import { CustomTextInputProps } from './types';
import { Platform } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';

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
}: CustomTextInputProps<T>) {
  const { isDisabledWhenLogining } = useAppSelector(({ logining }) => logining);
  const {
    colors: { primary, onBackground },
    dark,
  } = useTheme();
  const shouldBeDisabled = isDisabledWhenLogining;
  return (
    <Controller
      name={fieldName}
      control={control}
      rules={validation}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <TextInput
            label={label}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            autoComplete={autoComplete}
            inputMode={inputMode}
            mode="outlined"
            style={{
              marginTop: 12,
              fontSize: Platform.OS === 'web' ? 16 : 14,
              opacity: shouldBeDisabled ? 0.7 : 1,
            }}
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
            outlineColor={dark ? primary : onBackground}
            activeOutlineColor={primary}
            maxLength={maxLength}
            testID={label}
            disabled={shouldBeDisabled}
            returnKeyLabel={returnKeyLabel}
            returnKeyType={returnKeyType}
            multiline={multiline}
            numberOfLines={numberOfLines}
          />
          {!!error?.message && (
            <HelperText type="error" visible={!!error?.message}>
              {error?.message}
            </HelperText>
          )}
        </>
      )}
    />
  );
}
