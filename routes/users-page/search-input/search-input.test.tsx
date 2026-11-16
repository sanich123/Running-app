import { act, fireEvent, screen } from '@testing-library/react-native';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { SEARCH_CLEAR_ICON_TEST_ID, SEARCH_ICON_TEST_ID, SEARCH_INPUT, SEARCH_INPUT_TEST_ID } from './const';
import SearchInput from './search-input';

describe('SearchInput', () => {
  const originalPlatformOS = Platform.OS;

  beforeEach(() => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
  });
  it('normalizes typing and marks the page non-initial', async () => {
    const setSearch = jest.fn();
    const setIsInitial = jest.fn();
    await renderWithProviders(<SearchInput search="" setSearch={setSearch} setIsInitial={setIsInitial} />);
    expect(screen.getByPlaceholderText(SEARCH_INPUT.english.label)).toBeOnTheScreen();
    fireEvent.changeText(screen.getByTestId(SEARCH_INPUT_TEST_ID), 'Eliud');
    expect(setSearch).toHaveBeenCalledWith('eliud');
    expect(setIsInitial).toHaveBeenCalledWith(false);
  });

  it.each([
    ['iOS', 'ios'],
    ['Android', 'android'],
    ['web', 'web'],
  ] as const)('shows search and clear icons on %s and clears the search', async (_, platformOS) => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: platformOS });
    const setSearch = jest.fn();
    const setIsInitial = jest.fn();
    await renderWithProviders(<SearchInput search="eliud" setSearch={setSearch} setIsInitial={setIsInitial} />);
    const searchIcon = screen.getByTestId(SEARCH_ICON_TEST_ID);
    const clearIcon = screen.getByTestId(SEARCH_CLEAR_ICON_TEST_ID);
    expect(searchIcon).toBeOnTheScreen();
    expect(clearIcon).toBeOnTheScreen();
    fireEvent.press(clearIcon);
    expect(setSearch).toHaveBeenCalledWith('');
    expect(setIsInitial).toHaveBeenCalledWith(false);
  });

  it('fills the available width on mobile web', async () => {
    const originalOS = Platform.OS;
    const originalWindow = Dimensions.get('window');
    const originalScreen = Dimensions.get('screen');
    const mobileWindow = { ...originalWindow, width: 375 };
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    await act(async () => {
      Dimensions.set({ window: mobileWindow, screen: { ...originalScreen, width: 375 } });
    });

    try {
      await renderWithProviders(<SearchInput search="" setSearch={jest.fn()} setIsInitial={jest.fn()} />);

      const inputContainerStyle = StyleSheet.flatten(
        screen.getByTestId(SEARCH_INPUT_TEST_ID).parent?.parent?.props.style,
      );
      expect(inputContainerStyle.width).toBe('100%');
      expect(inputContainerStyle.marginHorizontal).toBe(0);
    } finally {
      await act(async () => {
        Dimensions.set({ window: originalWindow, screen: originalScreen });
      });
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });
});
