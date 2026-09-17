import { act, screen } from '@testing-library/react-native';
import { ACTIVITY_INPUT_LIMITS } from '@const/input-limits';
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
    const titleInput = screen.getByTestId(TEXT_INPUTS_TITLE_TEST_ID);
    const descriptionInput = screen.getByTestId(TEXT_INPUTS_DESCRIPTION_TEST_ID);

    expect(titleInput.props.maxLength).toBe(ACTIVITY_INPUT_LIMITS.title);
    expect(descriptionInput.props.maxLength).toBe(ACTIVITY_INPUT_LIMITS.description);

    act(() => {
      titleInput.props.onChangeText('Evening run');
      descriptionInput.props.onChangeText('Felt strong');
      titleInput.props.onChangeText('T'.repeat(ACTIVITY_INPUT_LIMITS.title + 1));
      descriptionInput.props.onChangeText('D'.repeat(ACTIVITY_INPUT_LIMITS.description + 1));
    });
    expect(mockSetParams).toHaveBeenCalledWith({ title: 'Evening run' });
    expect(mockSetParams).toHaveBeenCalledWith({ description: 'Felt strong' });
    expect(mockSetParams).toHaveBeenCalledWith({ title: 'T'.repeat(ACTIVITY_INPUT_LIMITS.title) });
    expect(mockSetParams).toHaveBeenCalledWith({ description: 'D'.repeat(ACTIVITY_INPUT_LIMITS.description) });
  });
});
