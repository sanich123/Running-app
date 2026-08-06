import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import Checkbox from './checkbox';
import { CHECKBOX } from './const';

describe('Checkbox', () => {
  it('should correctly renders in russia', async () => {
    await renderWithProviders(<Checkbox isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(CHECKBOX.russian.public)).toBeOnTheScreen();
  });
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<Checkbox isDisabled={false} />, { store: mockStore });
    expect(screen.getByText(CHECKBOX.english.public)).toBeOnTheScreen();
  });
});
