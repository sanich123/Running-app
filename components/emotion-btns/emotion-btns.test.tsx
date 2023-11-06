import { screen, userEvent } from '@testing-library/react-native';

import EmotionBtns from './emotion-btns';
import { setIsDisableWhileSending } from '../../redux/activity/activity';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Emotion btns', () => {
  it('should correctly renders', () => {
    renderWithProviders(<EmotionBtns isDisabled={false} setEmotion={jest.fn()} emotion="sad" />, {
      store: mockStore,
    });
    ['Normal', 'Fine', 'Fucked'].map((emotion) => expect(screen.getByText(new RegExp(emotion))).toBeOnTheScreen());
  });
  it('should interract with the user', async () => {
    const setEmotionFn = jest.fn();

    renderWithProviders(<EmotionBtns isDisabled={false} setEmotion={setEmotionFn} emotion="" />, {
      store: mockStore,
    });
    ['Normal', 'Fine', 'Fucked'].map((emotion) => expect(screen.getByText(new RegExp(emotion))).toBeOnTheScreen());
    const normalEmotion = screen.getByText('Normal');
    const fineEmotion = screen.getByText('Fine');
    const fuckedEmotion = screen.getByText('Fucked');
    await userEvent.press(fineEmotion);
    expect(setEmotionFn).toHaveBeenCalled();
    expect(setEmotionFn).toHaveBeenCalledWith('good');
    await userEvent.press(fuckedEmotion);
    expect(setEmotionFn).toHaveBeenCalled();
    expect(setEmotionFn).toHaveBeenCalledWith('fucked');
    await userEvent.press(normalEmotion);
    expect(setEmotionFn).toHaveBeenCalled();
    expect(setEmotionFn).toHaveBeenCalledWith('normal');
  });
  it('should correctly handle isDisabled state', () => {
    renderWithProviders(<EmotionBtns isDisabled setEmotion={jest.fn()} emotion="sad" />, {
      store: mockStore,
    });
    const normalInput = screen.getByText('Normal');
    const fuckedInput = screen.getByText('Fucked');
    const fineInput = screen.getByText('Fine');
    [normalInput, fuckedInput, fineInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSending state', () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    renderWithProviders(<EmotionBtns isDisabled={false} setEmotion={jest.fn()} emotion="sad" />, {
      store: mockStore,
    });
    const normalInput = screen.getByText('Normal');
    const fuckedInput = screen.getByText('Fucked');
    const fineInput = screen.getByText('Fine');
    [normalInput, fuckedInput, fineInput].map((input) => expect(input).toBeDisabled());
  });
  // it('should correctly handle global state', async () => {
  //   renderWithProviders(<EmotionBtns isDisabled={false} setEmotion={jest.fn()} emotion="" />, {
  //     store: mockStore,
  //   });
  //   const normalInput = screen.getByText('Normal');
  //   const fuckedInput = screen.getByText('Fucked');
  //   const fineInput = screen.getByText('Fine');
  //   await userEvent.press(normalInput);
  //   expect(mockStore.getState().activity.additionalInfo.emotion).toEqual('normal');
  //   await userEvent.press(fuckedInput);
  //   expect(mockStore.getState().activity.additionalInfo.emotion).toEqual('fucked');
  //   await userEvent.press(fineInput);
  //   expect(mockStore.getState().activity.additionalInfo.emotion).toEqual('good');
  // });
});
