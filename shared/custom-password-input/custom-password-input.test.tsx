import { screen, userEvent } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import CustomPasswordInput from './custom-password-input';

function PasswordInputHarness({ callback }: { callback: (value: string) => void }) {
  const { control } = useForm<{ password: string }>({ defaultValues: { password: '' } });
  return <CustomPasswordInput control={control} fieldName="password" label="Test password" callback={callback} />;
}

describe('custom password input', () => {
  it('updates the password and makes it visible on demand', async () => {
    const user = userEvent.setup();
    const callback = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<PasswordInputHarness callback={callback} />);
    const input = screen.getByTestId('Test password');
    await user.type(input, 'secret');
    expect(callback).toHaveBeenLastCalledWith('secret');
    expect(input.props.secureTextEntry).toBe(true);
    expect(screen.getByRole('button', { name: 'Показать пароль' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Показать пароль' }));
    expect(screen.getByTestId('Test password').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'Скрыть пароль' })).toBeOnTheScreen();
  });
});
