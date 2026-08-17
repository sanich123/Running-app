import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setIsDisableWhileSending } from '@R/slices/activity/activity';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { EMOTIONS_BTNS_TEST_IDS, EMOTIONS_BTNS_VALUES, EMOTION_BTNS } from './const';
import EmotionBtns from './emotion-btns';

const mockSetParams = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ emotion: 'normal' }),
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('Emotion btns', () => {
  it('should correctly change global state interract with user', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    const normalInput = screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.normalInput);
    const fuckedInput = screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.fuckedInput);
    const fineInput = screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.goodInput);
    await userEvent.press(normalInput);
    await userEvent.press(fuckedInput);
    await userEvent.press(fineInput);
    expect(mockSetParams).toHaveBeenCalledWith({ emotion: EMOTIONS_BTNS_VALUES.good });
  });
  it('should correctly render labels in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    [EMOTION_BTNS.english.normalLabel, EMOTION_BTNS.english.fineLabel, EMOTION_BTNS.english.fuckedLabel].map(
      (emotion) => expect(screen.getByText(new RegExp(emotion))).toBeOnTheScreen(),
    );
  });
  it('should correctly render labels in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    [EMOTION_BTNS.russian.normalLabel, EMOTION_BTNS.russian.fineLabel, EMOTION_BTNS.russian.fuckedLabel].map(
      (emotion) => expect(screen.getByText(new RegExp(emotion))).toBeOnTheScreen(),
    );
  });
  it('should correctly handle isDisabled state', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<EmotionBtns isDisabled />, { store: mockStore });
    const normalInput = screen.getByText(EMOTION_BTNS.english.normalLabel);
    const fuckedInput = screen.getByText(EMOTION_BTNS.english.fuckedLabel);
    const fineInput = screen.getByText(EMOTION_BTNS.english.fineLabel);
    [normalInput, fuckedInput, fineInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSending state', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setIsDisableWhileSending(true));
    await renderWithProviders(<EmotionBtns isDisabled={false} />, { store: mockStore });
    const normalInput = screen.getByText(EMOTION_BTNS.english.normalLabel);
    const fuckedInput = screen.getByText(EMOTION_BTNS.english.fuckedLabel);
    const fineInput = screen.getByText(EMOTION_BTNS.english.fineLabel);
    [normalInput, fuckedInput, fineInput].map((input) => expect(input).toBeDisabled());
  });
});
