import { screen } from '@testing-library/react-native';
import { PROFILE_INPUT_LIMITS } from '@const/input-limits';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { AGE_TEST_ID, HEIGHT_TEST_ID } from './const';
import InputsHeightAge from './inputs-height-age';

const mockParams = { height: '', age: '' };
const mockSetParams = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('Inputs height-age', () => {
  beforeEach(() => {
    mockParams.height = '';
    mockParams.age = '';
    mockSetParams.mockClear();
  });

  it('renders values and normalizes numeric profile fields', async () => {
    mockParams.height = '180';
    mockParams.age = '30';
    await renderWithProviders(<InputsHeightAge isDisabled={false} />, { store: mockStore });

    const height = screen.getByTestId(HEIGHT_TEST_ID);
    const age = screen.getByTestId(AGE_TEST_ID);
    expect(height.props.value).toBe('180');
    expect(age.props.value).toBe('30');
    expect(height.props.maxLength).toBe(PROFILE_INPUT_LIMITS.height);
    expect(age.props.maxLength).toBe(PROFILE_INPUT_LIMITS.age);

    height.props.onChangeText('181cm');
    age.props.onChangeText('31 years');
    expect(mockSetParams).toHaveBeenNthCalledWith(1, { height: '181' });
    expect(mockSetParams).toHaveBeenNthCalledWith(2, { age: '31' });
  });

  it('disables both inputs', async () => {
    await renderWithProviders(<InputsHeightAge isDisabled />);
    expect(screen.getByTestId(HEIGHT_TEST_ID)).toBeDisabled();
    expect(screen.getByTestId(AGE_TEST_ID)).toBeDisabled();
  });
});
