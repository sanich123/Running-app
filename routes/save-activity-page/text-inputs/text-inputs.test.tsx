import { act, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { TEXT_INPUTS_DESCRIPTION_TEST_ID, TEXT_INPUTS_TITLE_TEST_ID } from './const';
import TextInputs from './text-inputs';

const mockSetParams = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ description: '', title: '' }),
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('text inputs', () => {
  it('stores the entered activity title and description', async () => {
    await renderWithProviders(<TextInputs isDisabled={false} />);
    act(() => {
      screen.getByTestId(TEXT_INPUTS_TITLE_TEST_ID).props.onChangeText('Evening run');
      screen.getByTestId(TEXT_INPUTS_DESCRIPTION_TEST_ID).props.onChangeText('Felt strong');
    });
    expect(mockSetParams).toHaveBeenCalledWith({ title: 'Evening run' });
    expect(mockSetParams).toHaveBeenCalledWith({ description: 'Felt strong' });
  });
});
