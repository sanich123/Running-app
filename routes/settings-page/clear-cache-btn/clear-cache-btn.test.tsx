import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { SETTINGS } from '../const';
import ClearCacheBtn from './clear-cache-btn';

describe('clear cache btn', () => {
  it('dispatches the RTK Query cache reset', async () => {
    const user = userEvent.setup();
    const dispatch = jest.spyOn(mockStore, 'dispatch');
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ClearCacheBtn />);
    await user.press(screen.getByText(SETTINGS.english.cache));
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: `${runichApi.reducerPath}/resetApiState` }));
  });
});
