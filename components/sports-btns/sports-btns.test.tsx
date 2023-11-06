import { screen, userEvent } from '@testing-library/react-native';

import SportsBtns from './sports-btns';
import { setIsDisableWhileSending } from '../../redux/activity/activity';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Sports btns', () => {
  it('should correctly renders', () => {
    renderWithProviders(<SportsBtns isDisabled={false} setSport={jest.fn()} sport="" />, {
      store: mockStore,
    });
    ['Running', 'Swimming', 'Riding'].map((emotion) => expect(screen.getByText(new RegExp(emotion))).toBeOnTheScreen());
  });
  it('should interract with the user', async () => {
    const setSportFn = jest.fn();
    renderWithProviders(<SportsBtns isDisabled={false} setSport={setSportFn} sport="" />, {
      store: mockStore,
    });
    const runningInput = screen.getByText('Running');
    const swimmingInput = screen.getByText('Swimming');
    const ridingInput = screen.getByText('Riding');
    await userEvent.press(runningInput);
    expect(setSportFn).toHaveBeenCalled();
    expect(setSportFn).toHaveBeenCalledWith('run');
    await userEvent.press(swimmingInput);
    expect(setSportFn).toHaveBeenCalled();
    expect(setSportFn).toHaveBeenCalledWith('swim');
    await userEvent.press(ridingInput);
    expect(setSportFn).toHaveBeenCalled();
    expect(setSportFn).toHaveBeenCalledWith('Bike');
  });
  it('should correctly handle isDisabled state', () => {
    const setSportFn = jest.fn();
    renderWithProviders(<SportsBtns isDisabled setSport={setSportFn} sport="" />, {
      store: mockStore,
    });
    const runningInput = screen.getByText('Running');
    const swimmingInput = screen.getByText('Swimming');
    const ridingInput = screen.getByText('Riding');
    [runningInput, swimmingInput, ridingInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSending state', () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    const setSportFn = jest.fn();
    renderWithProviders(<SportsBtns isDisabled setSport={setSportFn} sport="" />, {
      store: mockStore,
    });
    const runningInput = screen.getByText('Running');
    const swimmingInput = screen.getByText('Swimming');
    const ridingInput = screen.getByText('Riding');
    [runningInput, swimmingInput, ridingInput].map((input) => expect(input).toBeDisabled());
  });
  // it('should correctly handle global state', async () => {
  //   const setSportFn = jest.fn();
  //   renderWithProviders(<SportsBtns isDisabled={false} setSport={setSportFn} sport="" />, {
  //     store: mockStore,
  //   });
  //   const runningInput = screen.getByText('Running');
  //   const swimmingInput = screen.getByText('Swimming');
  //   const ridingInput = screen.getByText('Riding');
  //   await userEvent.press(runningInput);
  //   expect(mockStore.getState().activity.additionalInfo.sport).toEqual('run');
  //   await userEvent.press(swimmingInput);
  //   expect(mockStore.getState().activity.additionalInfo.sport).toEqual('swim');
  //   await userEvent.press(ridingInput);
  //   expect(mockStore.getState().activity.additionalInfo.sport).toEqual('Bike');
  // });
});
