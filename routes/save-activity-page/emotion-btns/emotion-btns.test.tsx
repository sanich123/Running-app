import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setSavingDisabled } from '@R/slices/activity/activity';
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
    await renderWithProviders(<EmotionBtns />, { store: mockStore });
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
    await renderWithProviders(<EmotionBtns />, { store: mockStore });
    expect(screen.getByText(EMOTION_BTNS.english.sectionLabel)).toBeOnTheScreen();
    expect(screen.getByText(EMOTION_BTNS.english.normalLabel)).toBeOnTheScreen();
    expect(screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.goodInput)).toHaveProp(
      'accessibilityLabel',
      EMOTION_BTNS.english.fineLabel,
    );
    expect(screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.fuckedInput)).toHaveProp(
      'accessibilityLabel',
      EMOTION_BTNS.english.fuckedLabel,
    );
  });
  it('should correctly render labels in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<EmotionBtns />, { store: mockStore });
    expect(screen.getByText(EMOTION_BTNS.russian.sectionLabel)).toBeOnTheScreen();
    expect(screen.getByText(EMOTION_BTNS.russian.normalLabel)).toBeOnTheScreen();
    expect(screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.goodInput)).toHaveProp(
      'accessibilityLabel',
      EMOTION_BTNS.russian.fineLabel,
    );
    expect(screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.fuckedInput)).toHaveProp(
      'accessibilityLabel',
      EMOTION_BTNS.russian.fuckedLabel,
    );
  });
  it('should correctly handle isSavingDisabled state', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setSavingDisabled(true));
    await renderWithProviders(<EmotionBtns />, { store: mockStore });
    const normalInput = screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.normalInput);
    const fuckedInput = screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.fuckedInput);
    const fineInput = screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.goodInput);
    [normalInput, fuckedInput, fineInput].map((input) => expect(input).toBeDisabled());
  });
});
