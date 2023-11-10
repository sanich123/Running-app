import { screen, userEvent } from '@testing-library/react-native';

import { EMOTIONS_BTNS_TEST_IDS, EMOTIONS_BTNS_VALUES, EMOTION_BTNS } from './const';
import EmotionBtns from './emotion-btns';
import { LANGUAGES } from '../../constants/enums';
import { setIsDisableWhileSending } from '../../redux/activity/activity';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Emotion btns', () => {
  it('should correctly change global state interract with user', async () => {
    renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    const normalInput = screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.normalInput);
    const fuckedInput = screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.fuckedInput);
    const fineInput = screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.goodInput);
    await userEvent.press(normalInput);
    expect(normalInput.props.accessibilityState.checked).toEqual(true);
    expect(mockStore.getState().activity.additionalInfo.emotion).toEqual(EMOTIONS_BTNS_VALUES.normal);
    await userEvent.press(fuckedInput);
    expect(fuckedInput.props.accessibilityState.checked).toEqual(true);
    expect(mockStore.getState().activity.additionalInfo.emotion).toEqual(EMOTIONS_BTNS_VALUES.fucked);
    await userEvent.press(fineInput);
    expect(fineInput.props.accessibilityState.checked).toEqual(true);
    expect(mockStore.getState().activity.additionalInfo.emotion).toEqual(EMOTIONS_BTNS_VALUES.good);
  });
  it('should correctly render labels in english', () => {
    renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    [EMOTION_BTNS.english.normalLabel, EMOTION_BTNS.english.fineLabel, EMOTION_BTNS.english.fuckedLabel].map(
      (emotion) => expect(screen.getByText(new RegExp(emotion))).toBeOnTheScreen(),
    );
  });
  it('should correctly render labels in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    [EMOTION_BTNS.russian.normalLabel, EMOTION_BTNS.russian.fineLabel, EMOTION_BTNS.russian.fuckedLabel].map(
      (emotion) => expect(screen.getByText(new RegExp(emotion))).toBeOnTheScreen(),
    );
  });
  it('should correctly handle isDisabled state', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<EmotionBtns isDisabled />, { store: mockStore });
    const normalInput = screen.getByText(EMOTION_BTNS.english.normalLabel);
    const fuckedInput = screen.getByText(EMOTION_BTNS.english.fuckedLabel);
    const fineInput = screen.getByText(EMOTION_BTNS.english.fineLabel);
    [normalInput, fuckedInput, fineInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSending state', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setIsDisableWhileSending(true));
    renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    const normalInput = screen.getByText(EMOTION_BTNS.english.normalLabel);
    const fuckedInput = screen.getByText(EMOTION_BTNS.english.fuckedLabel);
    const fineInput = screen.getByText(EMOTION_BTNS.english.fineLabel);
    [normalInput, fuckedInput, fineInput].map((input) => expect(input).toBeDisabled());
  });
});
