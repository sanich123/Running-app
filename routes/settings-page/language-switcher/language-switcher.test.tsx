import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import LanguageSwitcher from './language-switcher';

const mockPresent = jest.fn();
jest.mock('../language-switcher-modal/language-switcher-modal', () => {
  const { View } = jest.requireActual('react-native');
  return ({ languagesModalRef }: any) => {
    languagesModalRef.current = { present: mockPresent };
    return <View testID="language-modal" />;
  };
});

describe('language switcher', () => {
  it('opens the language picker', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<LanguageSwitcher />);
    await user.press(screen.getByTestId('language-switcher-row'));
    expect(mockPresent).toHaveBeenCalledTimes(1);
  });
});
