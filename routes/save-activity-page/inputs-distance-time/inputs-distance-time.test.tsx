import { act, screen } from '@testing-library/react-native';
import { setSavingDisabled } from '@R/slices/activity/activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID, INPUT_SECONDS_ID } from './const';
import InputsDistanceTime from './inputs-distance-time';

const mockSetParams = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ manualDistance: '0', manualHours: '0', manualMinutes: '0', manualSeconds: '0' }),
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('Inputs manual distance duration', () => {
  it('shoudl correctly renders', async () => {
    await renderWithProviders(<InputsDistanceTime isDisabled={false} />, { store: mockStore });
    [INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID, INPUT_SECONDS_ID].map((testId) =>
      expect(screen.getByTestId(testId)).toBeOnTheScreen(),
    );
  });
  it('shoudl correctly handle isDisabled state', async () => {
    await renderWithProviders(<InputsDistanceTime isDisabled />, { store: mockStore });
    [INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID, INPUT_SECONDS_ID].map((testId) =>
      expect(screen.getByTestId(testId)).toBeDisabled(),
    );
  });
  it('should correctly handle isSavingDisabled state', async () => {
    mockStore.dispatch(setSavingDisabled(true));
    await renderWithProviders(<InputsDistanceTime isDisabled={false} />, { store: mockStore });
    [INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID, INPUT_SECONDS_ID].map((testId) =>
      expect(screen.getByTestId(testId)).toBeDisabled(),
    );
  });

  it('stores distance, hours and minutes entered by the user', async () => {
    mockStore.dispatch(setSavingDisabled(false));
    await renderWithProviders(<InputsDistanceTime isDisabled={false} />);
    act(() => {
      screen.getByTestId(INPUT_DISTANCE_ID).props.onChangeText('12.5');
      screen.getByTestId(INPUT_HOURS_ID).props.onChangeText('1');
      screen.getByTestId(INPUT_MINUTES_ID).props.onChangeText('35');
      screen.getByTestId(INPUT_SECONDS_ID).props.onChangeText('12');
    });
    expect(mockSetParams).toHaveBeenCalledWith({ manualDistance: '12.5' });
    expect(mockSetParams).toHaveBeenCalledWith({ manualHours: '1' });
    expect(mockSetParams).toHaveBeenCalledWith({ manualMinutes: '35' });
    expect(mockSetParams).toHaveBeenCalledWith({ manualSeconds: '12' });
  });
});
