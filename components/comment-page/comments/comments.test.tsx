import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { MOCK_COMMENTS } from '@T/mocks/mock-comments';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import Comments from './comments';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/home/activity/someActivityId',
}));
jest.mock('expo-image', () => {
  const actualExpoImage = jest.requireActual('expo-image');
  const { Image } = jest.requireActual('react-native');
  return { ...actualExpoImage, Image };
});

describe('Comments', () => {
  it('should correctly renders with isLoading state and data from server in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(
      <Comments commentsModalRef={{ current: { snapToIndex: jest.fn() } as unknown as BottomSheetModalMethods }} />,
      { store: mockStore },
    );
    expect(await screen.findByText(MOCK_COMMENTS[0].comment)).toBeOnTheScreen();
    expect(
      await screen.findByText(new RegExp(`${formatDate(MOCK_COMMENTS[0].date, LANGUAGES.english)}`, 'i')),
    ).toBeOnTheScreen();
    expect(
      await screen.findByText(new RegExp(`${getHoursMinutes(MOCK_COMMENTS[0].date, LANGUAGES.english)}`)),
    ).toBeOnTheScreen();
  });
  it('should correctly renders with data from server in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(
      <Comments commentsModalRef={{ current: { snapToIndex: jest.fn() } as unknown as BottomSheetModalMethods }} />,

      { store: mockStore },
    );
    expect(await screen.findByText(MOCK_COMMENTS[0].comment)).toBeOnTheScreen();
    expect(
      await screen.findByText(new RegExp(`${formatDate(MOCK_COMMENTS[0].date, LANGUAGES.russian)}`, 'i')),
    ).toBeOnTheScreen();
    expect(
      await screen.findByText(new RegExp(`${getHoursMinutes(MOCK_COMMENTS[0].date, LANGUAGES.russian)}`, 'i')),
    ).toBeOnTheScreen();
  });
});
