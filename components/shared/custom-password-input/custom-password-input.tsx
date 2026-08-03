import { useState } from 'react';
import { Platform } from 'react-native';
import { HelperText, TextInput, useTheme } from 'react-native-paper';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { useAppSelector } from '@R/typed-hooks';
import type { CustomPasswordInputProps } from './types';

export default function CustomPasswordInput<T extends FieldValues>({
  control,
  fieldName,
  validation = { required: 'Обязательно для заполнения' },
  label,
  autoCapitalize,
  maxLength,
  returnKeyType = 'done',
  returnKeyLabel,
  callback,
  inputMode,
  onSubmitEditing,
}: CustomPasswordInputProps<T>) {
  const { isDisabledWhenLogining } = useAppSelector(({ logining }) => logining);
  const {
    colors: { primary, onBackground },
    dark,
  } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
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
            autoComplete="current-password"
            inputMode={inputMode}
            mode="outlined"
            style={{ marginTop: 12, fontSize: Platform.OS === 'web' ? 16 : 14, opacity: shouldBeDisabled ? 0.7 : 1 }}
            onChangeText={(text) => {
              onChange(text);
              callback?.(text);
            }}
            onSubmitEditing={onSubmitEditing}
            value={value}
            error={!!error?.message}
            outlineColor={dark ? primary : onBackground}
            maxLength={maxLength}
            testID={label}
            disabled={shouldBeDisabled}
            returnKeyLabel={returnKeyLabel}
            returnKeyType={returnKeyType}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword((prevValue) => !prevValue)}
              />
            }
            secureTextEntry={!showPassword}
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
