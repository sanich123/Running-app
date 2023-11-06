import { screen, userEvent } from '@testing-library/react-native';

import SportsBtns from './sports-btns';
import { setIsDisableWhileSending } from '../../redux/activity/activity';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Sports btns', () => {
  it('should correctly handle global state', async () => {
    renderWithProviders(<SportsBtns isDisabled={false} />, {
      store: mockStore,
    });
    const runningInput = screen.getByText('Running');
    const swimmingInput = screen.getByText('Swimming');
    const ridingInput = screen.getByText('Riding');
    await userEvent.press(runningInput);
    expect(mockStore.getState().activity.additionalInfo.sport).toEqual('run');
    await userEvent.press(swimmingInput);
    expect(mockStore.getState().activity.additionalInfo.sport).toEqual('swim');
    await userEvent.press(ridingInput);
    expect(mockStore.getState().activity.additionalInfo.sport).toEqual('Bike');
  });
  it('should correctly renders', () => {
    renderWithProviders(<SportsBtns isDisabled={false} />, { store: mockStore });
    ['Running', 'Swimming', 'Riding'].map((emotion) => expect(screen.getByText(new RegExp(emotion))).toBeOnTheScreen());
  });
  it('should interract with the user', async () => {
    renderWithProviders(<SportsBtns isDisabled={false} />, { store: mockStore });
    const runningInput = screen.getByTestId('runningBtn');
    const swimmingInput = screen.getByTestId('swimmingBtn');
    const ridingInput = screen.getByTestId('ridingBtn');
    await userEvent.press(runningInput);
    expect(runningInput.props.accessibilityState.checked).toEqual(true);
    await userEvent.press(swimmingInput);
    expect(swimmingInput.props.accessibilityState.checked).toEqual(true);
    await userEvent.press(ridingInput);
    expect(ridingInput.props.accessibilityState.checked).toEqual(true);
  });
  it('should correctly handle isDisabled state', () => {
    renderWithProviders(<SportsBtns isDisabled />, {
      store: mockStore,
    });
    const runningInput = screen.getByText('Running');
    const swimmingInput = screen.getByText('Swimming');
    const ridingInput = screen.getByText('Riding');
    [runningInput, swimmingInput, ridingInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSending state', () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    renderWithProviders(<SportsBtns isDisabled />, {
      store: mockStore,
    });
    const runningInput = screen.getByText('Running');
    const swimmingInput = screen.getByText('Swimming');
    const ridingInput = screen.getByText('Riding');
    [runningInput, swimmingInput, ridingInput].map((input) => expect(input).toBeDisabled());
  });
});
