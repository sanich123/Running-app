import { screen } from '@testing-library/react-native';

import Comments from './comments';
import { LANGUAGES } from '../../../constants/enums';
import { changeLanguage } from '../../../redux/language/language';
import { MOCK_COMMENTS } from '../../../tests/mocks/mock-comments';
import { mockStore } from '../../../tests/utils/mock-store';
import { renderWithProviders } from '../../../tests/utils/test-utils';
import { formatDate, getHoursMinutes } from '../../../utils/time-formatter';

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
      <Comments
        activityId="someActivityId"
        setIsShowingTextInput={jest.fn()}
        setIsNeedToGetUpdatedComments={jest.fn()}
        idOfUpdatingComment={''}
        setIdOfUpdatingComment={jest.fn()}
        comments={MOCK_COMMENTS}
      />,
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
      <Comments
        activityId="someActivityId"
        setIsShowingTextInput={jest.fn()}
        setIsNeedToGetUpdatedComments={jest.fn()}
        idOfUpdatingComment={''}
        setIdOfUpdatingComment={jest.fn()}
        comments={MOCK_COMMENTS}
      />,

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
