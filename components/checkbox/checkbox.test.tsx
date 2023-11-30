import { setIsDisableWhileSending } from '@R/activity/activity';
import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import Checkbox from './checkbox';
import { CHECKBOX, CHECKBOX_TEST_ID } from './const';

describe('Checkbox', () => {
  it('should correctly renders in english', async () => {
    renderWithProviders(<Checkbox isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(CHECKBOX.english.public)).toBeOnTheScreen();
  });
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<Checkbox isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(CHECKBOX.russian.public)).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled state', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<Checkbox isDisabled />, { store: mockStore });
    expect(screen.getByTestId(CHECKBOX_TEST_ID)).toBeDisabled();
  });
  it('should correctly handle isDisabledWhileSendnig state', async () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    renderWithProviders(<Checkbox isDisabled={false} />, { store: mockStore });
    expect(screen.getByTestId(CHECKBOX_TEST_ID)).toBeDisabled();
  });
});
