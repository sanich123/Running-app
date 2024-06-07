import { setIsDisableWhileSending } from '@R/activity/activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import { INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID } from './const';
import InputsDistanceTime from './inputs-distance-time';

describe('Inputs manual distance duration', () => {
  it('shoudl correctly renders', () => {
    renderWithProviders(<InputsDistanceTime isDisabled={false} />, { store: mockStore });
    [INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID].map((testId) =>
      expect(screen.getByTestId(testId)).toBeOnTheScreen(),
    );
  });
  it('shoudl correctly handle isDisabled state', () => {
    renderWithProviders(<InputsDistanceTime isDisabled />, { store: mockStore });
    [INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID].map((testId) =>
      expect(screen.getByTestId(testId)).toBeDisabled(),
    );
  });
  it('shoudl correctly handle isDisabledWhileSending state', () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    renderWithProviders(<InputsDistanceTime isDisabled={false} />, { store: mockStore });
    [INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID].map((testId) =>
      expect(screen.getByTestId(testId)).toBeDisabled(),
    );
  });
});
