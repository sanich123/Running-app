import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import LanguageSwitcher from './language-switcher';

describe('language switcher', () => {
  it('changes the language directly from the settings row', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<LanguageSwitcher />);
    await user.press(screen.getByTestId('language-english'));
    expect(mockStore.getState().language.language).toBe(LANGUAGES.english);
  });
});
