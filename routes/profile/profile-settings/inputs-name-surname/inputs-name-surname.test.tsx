import { screen } from '@testing-library/react-native';
import { PROFILE_INPUT_LIMITS } from '@const/input-limits';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { NAME_TEST_ID, SURNAME_TEST_ID } from './const';
import InputsNameSurname from './inputs-name-surname';

const mockParams = { name: '', surname: '' };
const mockSetParams = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('Inputs name-surname', () => {
  beforeEach(() => {
    mockParams.name = '';
    mockParams.surname = '';
  });

  it('should render values from local search params and update them', async () => {
    mockParams.name = 'Alexander';
    mockParams.surname = 'Voronin';
    await renderWithProviders(<InputsNameSurname isDisabled={false} />, { store: mockStore });
    const inputName = screen.getByTestId(NAME_TEST_ID);
    const inputSurname = screen.getByTestId(SURNAME_TEST_ID);
    expect(inputName.props.value).toEqual('Alexander');
    expect(inputSurname.props.value).toEqual('Voronin');
    expect(inputName.props.maxLength).toBe(PROFILE_INPUT_LIMITS.name);
    expect(inputSurname.props.maxLength).toBe(PROFILE_INPUT_LIMITS.surname);

    inputName.props.onChangeText('Vova');
    expect(mockSetParams).toHaveBeenCalledWith({ name: 'Vova' });
    inputSurname.props.onChangeText('Putin');
    expect(mockSetParams).toHaveBeenCalledWith({ surname: 'Putin' });

    inputName.props.onChangeText('N'.repeat(PROFILE_INPUT_LIMITS.name + 1));
    expect(mockSetParams).toHaveBeenCalledWith({ name: 'N'.repeat(PROFILE_INPUT_LIMITS.name) });
  });
  it('should correctly handle isDisabled', async () => {
    await renderWithProviders(<InputsNameSurname isDisabled />);
    const inputName = screen.getByTestId(NAME_TEST_ID);
    const inputSurname = screen.getByTestId(SURNAME_TEST_ID);
    expect(inputName).toBeDisabled();
    expect(inputSurname).toBeDisabled();
  });
});
