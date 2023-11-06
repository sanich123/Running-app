import { screen, userEvent } from '@testing-library/react-native';

import EmotionBtns from './emotion-btns';
import { setIsDisableWhileSending } from '../../redux/activity/activity';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Emotion btns', () => {
  it('should correctly change global state interract with user', async () => {
    renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    const normalInput = screen.getByTestId('normalInput');
    const fuckedInput = screen.getByTestId('fuckedInput');
    const fineInput = screen.getByTestId('goodInput');
    await userEvent.press(normalInput);
    expect(normalInput.props.accessibilityState.checked).toEqual(true);
    expect(mockStore.getState().activity.additionalInfo.emotion).toEqual('normal');
    await userEvent.press(fuckedInput);
    expect(fuckedInput.props.accessibilityState.checked).toEqual(true);
    expect(mockStore.getState().activity.additionalInfo.emotion).toEqual('fucked');
    await userEvent.press(fineInput);
    expect(fineInput.props.accessibilityState.checked).toEqual(true);
    expect(mockStore.getState().activity.additionalInfo.emotion).toEqual('good');
  });
  it('should correctly renders', () => {
    renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    ['Normal', 'Fine', 'Fucked'].map((emotion) => expect(screen.getByText(new RegExp(emotion))).toBeOnTheScreen());
  });
  it('should correctly handle isDisabled state', () => {
    renderWithProviders(<EmotionBtns isDisabled />, { store: mockStore });
    const normalInput = screen.getByText('Normal');
    const fuckedInput = screen.getByText('Fucked');
    const fineInput = screen.getByText('Fine');
    [normalInput, fuckedInput, fineInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSending state', () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    const normalInput = screen.getByText('Normal');
    const fuckedInput = screen.getByText('Fucked');
    const fineInput = screen.getByText('Fine');
    [normalInput, fuckedInput, fineInput].map((input) => expect(input).toBeDisabled());
  });
});
