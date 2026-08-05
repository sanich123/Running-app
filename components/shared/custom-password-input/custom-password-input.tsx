import { useState } from 'react';
import { HelperText, TextInput, useTheme } from 'react-native-paper';
import { Controller } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { FONT_FAMILIES } from '@const/fonts';
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
  const { colors } = useTheme();
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
            style={{
              backgroundColor: colors.surface,
              fontSize: 15,
              height: 52,
              marginTop: 12,
              opacity: shouldBeDisabled ? 0.7 : 1,
            }}
            contentStyle={{ fontFamily: FONT_FAMILIES.regular }}
            outlineStyle={{ borderRadius: 8 }}
            onChangeText={(text) => {
              onChange(text);
              callback?.(text);
            }}
            onSubmitEditing={onSubmitEditing}
            value={value}
            error={!!error?.message}
            outlineColor={error ? colors.error : colors.outlineVariant}
            activeOutlineColor={colors.primary}
            textColor={colors.onSurface}
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
            <HelperText type="error" visible={!!error?.message} style={{ fontFamily: FONT_FAMILIES.regular }}>
              {error?.message}
            </HelperText>
          )}
        </>
      )}
    />
  );
}
