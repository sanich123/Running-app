import { screen, userEvent } from '@testing-library/react-native';
import { setIsDisableWhileSending } from '@R/slices/activity/activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID } from './const';
import InputsDistanceTime from './inputs-distance-time';

describe('Inputs manual distance duration', () => {
  it('shoudl correctly renders', async () => {
    await renderWithProviders(<InputsDistanceTime isDisabled={false} />, { store: mockStore });
    [INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID].map((testId) =>
      expect(screen.getByTestId(testId)).toBeOnTheScreen(),
    );
  });
  it('shoudl correctly handle isDisabled state', async () => {
    await renderWithProviders(<InputsDistanceTime isDisabled />, { store: mockStore });
    [INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID].map((testId) =>
      expect(screen.getByTestId(testId)).toBeDisabled(),
    );
  });
  it('shoudl correctly handle isDisabledWhileSending state', async () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    await renderWithProviders(<InputsDistanceTime isDisabled={false} />, { store: mockStore });
    [INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID].map((testId) =>
      expect(screen.getByTestId(testId)).toBeDisabled(),
    );
  });

  it('stores distance, hours and minutes entered by the user', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setIsDisableWhileSending(false));
    await renderWithProviders(<InputsDistanceTime isDisabled={false} />);
    await user.clear(screen.getByTestId(INPUT_DISTANCE_ID));
    await user.type(screen.getByTestId(INPUT_DISTANCE_ID), '12.5');
    await user.clear(screen.getByTestId(INPUT_HOURS_ID));
    await user.type(screen.getByTestId(INPUT_HOURS_ID), '1');
    await user.clear(screen.getByTestId(INPUT_MINUTES_ID));
    await user.type(screen.getByTestId(INPUT_MINUTES_ID), '35');
    expect(mockStore.getState().manualActivity).toEqual(
      expect.objectContaining({ manualDistance: 12.5, manualHours: 1, manualMinutes: 35 }),
    );
  });
});
