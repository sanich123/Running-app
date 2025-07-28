import { FieldValues, Path } from 'react-hook-form';
import { CustomTextInputProps } from '../custom-text-input/types';

export interface CustomPasswordInputProps<T extends FieldValues> extends CustomTextInputProps<T> {
  onSubmitEditing?: () => void;
  fieldName: Path<T>;
}
