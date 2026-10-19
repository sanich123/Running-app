import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { HEART_RATE_INPUTS, MAX_HEART_RATE_TEST_ID, RESTING_HEART_RATE_TEST_ID } from './const';
import InputsHeartRate from './inputs-heart-rate';

const mockSetRestingHeartRate = jest.fn();
const mockSetMaxHeartRate = jest.fn();

jest.mock('../profile-settings-params', () => ({
  ...jest.requireActual('../profile-settings-params'),
  useSetProfileFormParams: () => ({
    setRestingHeartRate: mockSetRestingHeartRate,
    setMaxHeartRate: mockSetMaxHeartRate,
  }),
}));

describe('InputsHeartRate', () => {
  beforeEach(() => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockSetRestingHeartRate.mockReset();
    mockSetMaxHeartRate.mockReset();
  });

  it('renders both editable heart-rate values', async () => {
    await renderWithProviders(<InputsHeartRate isDisabled={false} />, { store: mockStore });

    expect(screen.getByTestId(RESTING_HEART_RATE_TEST_ID)).toBeEnabled();
    expect(screen.getByTestId(MAX_HEART_RATE_TEST_ID)).toBeEnabled();
    expect(screen.getByText(HEART_RATE_INPUTS[LANGUAGES.english].sectionHint)).toBeOnTheScreen();
  });

  it('disables both fields while the profile is loading', async () => {
    await renderWithProviders(<InputsHeartRate isDisabled />, { store: mockStore });

    expect(screen.getByTestId(RESTING_HEART_RATE_TEST_ID)).toBeDisabled();
    expect(screen.getByTestId(MAX_HEART_RATE_TEST_ID)).toBeDisabled();
  });

  it('keeps the fields numeric and accepts a resting-heart-rate edit', async () => {
    await renderWithProviders(<InputsHeartRate isDisabled={false} />, { store: mockStore });

    fireEvent.changeText(screen.getByTestId(RESTING_HEART_RATE_TEST_ID), '5x5');

    expect(mockSetRestingHeartRate).toHaveBeenLastCalledWith('55');
  });
});
