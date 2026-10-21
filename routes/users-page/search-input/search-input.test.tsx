import { act, fireEvent, screen } from '@testing-library/react-native';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { SEARCH_ICON_TEST_ID, SEARCH_INPUT, SEARCH_INPUT_TEST_ID } from './const';
import SearchInput from './search-input';

describe('SearchInput', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.english)));
  it('normalizes typing and marks the page non-initial', async () => {
    const setSearch = jest.fn();
    const setIsInitial = jest.fn();
    await renderWithProviders(<SearchInput search="" setSearch={setSearch} setIsInitial={setIsInitial} />);
    expect(screen.getByPlaceholderText(SEARCH_INPUT.english.label)).toBeOnTheScreen();
    fireEvent.changeText(screen.getByTestId(SEARCH_INPUT_TEST_ID), 'Eliud');
    expect(setSearch).toHaveBeenCalledWith('eliud');
    expect(setIsInitial).toHaveBeenCalledWith(false);
  });

  it('submits the current search from the icon', async () => {
    const setSearch = jest.fn();
    await renderWithProviders(<SearchInput search="eliud" setSearch={setSearch} setIsInitial={jest.fn()} />);
    fireEvent.press(screen.getByTestId(SEARCH_ICON_TEST_ID));
    expect(setSearch).toHaveBeenCalledWith('eliud');
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
