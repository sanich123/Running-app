import { screen } from '@testing-library/react-native';

import Checkbox from '../../components/checkbox/checkbox';
import { CHECKBOX, CHECKBOX_TEST_ID } from '../../components/checkbox/const';
import { LANGUAGES } from '../../constants/enums';
import { setIsDisableWhileSending } from '../../redux/activity/activity';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

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
