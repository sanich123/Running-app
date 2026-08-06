import { screen, userEvent } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { renderWithProviders } from '@T/utils/test-utils';
import CustomTextInput from './custom-text-input';

function TextInputHarness({ callback }: { callback: (value: string) => void }) {
  const { control } = useForm<{ email: string }>({ defaultValues: { email: '' } });
  return (
    <CustomTextInput control={control} fieldName="email" label="Test email" inputMode="email" callback={callback} />
  );
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
});
