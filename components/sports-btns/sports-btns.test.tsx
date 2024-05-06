import { setIsDisableWhileSending } from '@R/activity/activity';
import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen, userEvent } from '@testing-library/react-native';

import { RIDE_BTN_TEST_ID, RUN_BTN_TEST_ID, SPORTS_BTNS, SPORTS_BTNS_VALUES, SWIM_BTN_TEST_ID } from './const';
import SportsBtns from './sports-btns';

describe('Sports btns', () => {
  mockStore.dispatch(changeLanguage(LANGUAGES.english));
  it('should correctly handle global state', async () => {
    renderWithProviders(<SportsBtns isDisabled={false} />, {
      store: mockStore,
    });
    const runningInput = screen.getByText(SPORTS_BTNS.english.labelRun);
    const swimmingInput = screen.getByText(SPORTS_BTNS.english.labelSwim);
    const ridingInput = screen.getByText(SPORTS_BTNS.english.labelBike);
    await userEvent.press(runningInput);
    expect(mockStore.getState().activity.additionalInfo.sport).toEqual(SPORTS_BTNS_VALUES.run);
    await userEvent.press(swimmingInput);
    expect(mockStore.getState().activity.additionalInfo.sport).toEqual(SPORTS_BTNS_VALUES.swim);
    await userEvent.press(ridingInput);
    expect(mockStore.getState().activity.additionalInfo.sport).toEqual(SPORTS_BTNS_VALUES.bike);
  });
  it('should correctly render labels in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<SportsBtns isDisabled={false} />, { store: mockStore });
    [SPORTS_BTNS.english.labelRun, SPORTS_BTNS.english.labelSwim, SPORTS_BTNS.english.labelBike].map((sport) =>
      expect(screen.getByText(new RegExp(sport))).toBeOnTheScreen(),
    );
  });
  it('should correctly render labels in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<SportsBtns isDisabled={false} />, { store: mockStore });
    [SPORTS_BTNS.russian.labelRun, SPORTS_BTNS.russian.labelSwim, SPORTS_BTNS.russian.labelBike].map((sport) =>
      expect(screen.getByText(new RegExp(sport))).toBeOnTheScreen(),
    );
  });
  it('should interract with the user', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<SportsBtns isDisabled={false} />, { store: mockStore });
    const runningInput = screen.getByTestId(RUN_BTN_TEST_ID);
    const swimmingInput = screen.getByTestId(SWIM_BTN_TEST_ID);
    const ridingInput = screen.getByTestId(RIDE_BTN_TEST_ID);
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
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const runningInput = screen.getByText(SPORTS_BTNS.english.labelRun);
    const swimmingInput = screen.getByText(SPORTS_BTNS.english.labelSwim);
    const ridingInput = screen.getByText(SPORTS_BTNS.english.labelBike);
    [runningInput, swimmingInput, ridingInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSending state', () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<SportsBtns isDisabled />, {
      store: mockStore,
    });
    const runningInput = screen.getByText(SPORTS_BTNS.english.labelRun);
    const swimmingInput = screen.getByText(SPORTS_BTNS.english.labelSwim);
    const ridingInput = screen.getByText(SPORTS_BTNS.english.labelBike);
    [runningInput, swimmingInput, ridingInput].map((input) => expect(input).toBeDisabled());
  });
});
