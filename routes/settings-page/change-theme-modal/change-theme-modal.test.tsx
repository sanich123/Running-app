import { screen, userEvent } from '@testing-library/react-native';
import { Appearance } from 'react-native';
import { LANGUAGES, THEMES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ChangeThemeModal from './change-theme-modal';
import { THEMES_ARRAY } from './const';

describe('change theme modal', () => {
  it('changes the application theme after selecting an option', async () => {
    const user = userEvent.setup();
    const setColorScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ChangeThemeModal themesModalRef={{ current: null }} />);
    await user.press(screen.getByText(THEMES_ARRAY.english[0].title));
    expect(mockStore.getState().settings.theme).toBe(THEMES.dark);
    expect(setColorScheme).toHaveBeenCalledWith(THEMES.dark);
  });
});
