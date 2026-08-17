import { screen, userEvent } from '@testing-library/react-native';
import { Appearance } from 'react-native';
import { LANGUAGES, THEMES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ChangeTheme from './change-theme';
import { THEMES_ARRAY } from '../change-theme-modal/const';

describe('change theme', () => {
  it('applies a theme selected by the user', async () => {
    const user = userEvent.setup();
    const setColorScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ChangeTheme />);
    await user.press(screen.getByText(THEMES_ARRAY.english[1].title));
    expect(mockStore.getState().settings.theme).toBe(THEMES.light);
    expect(setColorScheme).toHaveBeenCalledWith(THEMES.light);
  });
});
