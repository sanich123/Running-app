import { screen } from '@testing-library/react-native';
import { setIsDisabledWhileSendingProfile } from '@R/slices/profile/profile';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { CITY_TEST_ID, WEIGHT_TEST_ID } from './const';
import InputsWeightCity from './inputs-weight-city';

const mockParams = { city: '', weight: '' };
const mockSetParams = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('Inputs weight-city', () => {
  beforeEach(() => {
    mockParams.city = '';
    mockParams.weight = '';
    mockStore.dispatch(setIsDisabledWhileSendingProfile(false));
  });

  it('should render values from local search params and update them', async () => {
    mockParams.city = 'Moscow';
    mockParams.weight = '80';
    await renderWithProviders(<InputsWeightCity isDisabled={false} />, { store: mockStore });
    const inputWeight = screen.getByTestId(WEIGHT_TEST_ID);
    const inputCity = screen.getByTestId(CITY_TEST_ID);
    expect(inputWeight.props.value).toEqual('80');
    expect(inputCity.props.value).toEqual('Moscow');
    inputWeight.props.onChangeText('90');
    expect(mockSetParams).toHaveBeenCalledWith({ weight: '90' });
    inputCity.props.onChangeText('Otso-city');
    expect(mockSetParams).toHaveBeenCalledWith({ city: 'Otso-city' });
  });
  it('should correctly handle isDisabled state', async () => {
    await renderWithProviders(<InputsWeightCity isDisabled />, { store: mockStore });
    expect(screen.getByTestId(WEIGHT_TEST_ID)).toBeDisabled();
    expect(screen.getByTestId(CITY_TEST_ID)).toBeDisabled();
  });
  it('should correctly handle isDisabledWhileSending state', async () => {
    mockStore.dispatch(setIsDisabledWhileSendingProfile(true));
    await renderWithProviders(<InputsWeightCity isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId(WEIGHT_TEST_ID)).toBeDisabled();
    expect(screen.getByTestId(CITY_TEST_ID)).toBeDisabled();
  });
});
