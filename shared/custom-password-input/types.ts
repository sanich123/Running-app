import type { FieldValues, Path } from 'react-hook-form';
import type { CustomTextInputProps } from '../custom-text-input/types';

export interface CustomPasswordInputProps<T extends FieldValues> extends CustomTextInputProps<T> {
  onSubmitEditing?: () => void;
  fieldName: Path<T>;
  placeholder?: string;
  testID?: string;
  visibilityTestID?: string;
}
