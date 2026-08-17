import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES_ARRAY } from './const';
import LanguageSwitcherModal from './language-switcher-modal';

describe('language switcher modal', () => {
  it('changes the language selected by the user', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<LanguageSwitcherModal languagesModalRef={{ current: null }} />);
    await user.press(screen.getByText(LANGUAGES_ARRAY.english.values[1].title));
    expect(mockStore.getState().settings.language).toBe(LANGUAGES.russian);
  });
});
