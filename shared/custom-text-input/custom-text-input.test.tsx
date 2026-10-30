import { act, fireEvent, screen, userEvent } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { setIsDisabledWhenLogining } from '@R/slices/logining/logining';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import CustomTextInput from './custom-text-input';

function TextInputHarness({
  callback,
  ...props
}: {
  callback?: (value: string) => void;
  capitalizeValue?: boolean;
  compact?: boolean;
  inputMode?: 'email';
  multiline?: boolean;
  replaceCommaToDot?: boolean;
}) {
  const { control } = useForm<{ email: string }>({ defaultValues: { email: '' }, mode: 'onChange' });
  return (
    <CustomTextInput
      control={control}
      fieldName="email"
      label="Test email"
      inputMode="email"
      callback={callback}
      {...props}
    />
  );
}

function NumericInputHarness({ callback }: { callback?: (value: string) => void }) {
  const { control } = useForm<{ value: string }>({ defaultValues: { value: '' } });
  return (
    <CustomTextInput control={control} fieldName="value" label="Test number" replaceCommaToDot callback={callback} />
  );
}

function PlaceholderInputHarness() {
  const { control } = useForm<{ value: string }>({ defaultValues: { value: '' } });
  return <CustomTextInput control={control} fieldName="value" placeholder="Write an update" testID="post-input" />;
}

describe('custom text input', () => {
  it('normalizes email input and reports its value', async () => {
    const user = userEvent.setup();
    const callback = jest.fn();
    await renderWithProviders(<TextInputHarness callback={callback} />);
    await user.type(screen.getByTestId('Test email'), ' user@example.com ');
    expect(screen.getByTestId('Test email').props.value).toBe('user@example.com');
    expect(callback).toHaveBeenLastCalledWith('user@example.com');
  });

  it('uppercases regular input and supports compact multiline props', async () => {
    const user = userEvent.setup();
    const callback = jest.fn();
    await renderWithProviders(<TextInputHarness callback={callback} capitalizeValue compact multiline />);
    const input = screen.getByTestId('Test email');

    await user.type(input, 'ab');

    expect(input.props.value).toBe('AB');
    expect(callback).toHaveBeenLastCalledWith('AB');
  });

  it('replaces decimal commas and ignores invalid precision', async () => {
    const user = userEvent.setup();
    const callback = jest.fn();
    await renderWithProviders(<NumericInputHarness callback={callback} />);
    const input = screen.getByTestId('Test number');

    await user.type(input, '01,234');

    expect(input.props.value).toBe('1.23');
    expect(callback).not.toHaveBeenCalled();
  });

  it('disables the input while login is in progress', async () => {
    await act(async () => {
      mockStore.dispatch(setIsDisabledWhenLogining(true));
    });
    await renderWithProviders(<TextInputHarness />);

    expect(screen.getByTestId('Test email')).toBeDisabled();
    await act(async () => {
      mockStore.dispatch(setIsDisabledWhenLogining(false));
    });
  });

  it('renders validation text after the input loses focus', async () => {
    await renderWithProviders(<TextInputHarness />);
    const input = screen.getByTestId('Test email');

    await fireEvent.changeText(input, '');

    expect(await screen.findByText('Обязательно для заполнения')).toBeOnTheScreen();
  });

  it('supports a standalone placeholder without a field label', async () => {
    await renderWithProviders(<PlaceholderInputHarness />);

    expect(screen.getByTestId('post-input').props.placeholder).toBe('Write an update');
  });
});
