import { MOCK_COMMENTS } from '@T/mocks/mock-comments';
import { MOCK_LIKE } from '@T/mocks/mock-likes';
import { screen } from '@testing-library/react-native';

import ActivityCard from './card';
import * as auth from '../../auth/context/auth-context';
import { MOCK_ACTIVITY } from '../../tests/mocks/mock-activity';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { SPORTS_BTNS_VALUES } from '../sports-btns/const';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => 'somePathname',
}));

describe('Activity card', () => {
  it('should correctly renders', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    const { description, title, date, sport, id, photoUrls, duration, distance } = MOCK_ACTIVITY;
    renderWithProviders(
      <ActivityCard
        isShowDeleteBtn
        isShowDescription
        description={description}
        title={title}
        date={new Date(date)}
        sport={sport as SPORTS_BTNS_VALUES}
        id={id}
        userId="someUserId"
        photoUrls={photoUrls}
        duration={duration}
        distance={distance}
        fullViewRef={{ current: undefined }}
        likes={MOCK_LIKE}
        comments={MOCK_COMMENTS}
      />,
      { store: mockStore },
    );
    expect(await screen.findByText(title)).toBeOnTheScreen();
    expect(await screen.findByText('Искандер')).toBeOnTheScreen();
    expect(await screen.findByText('Ядгаров')).toBeOnTheScreen();
    expect(await screen.findByText('Friday, November 3, 2023')).toBeOnTheScreen();
    ['Time', 'Pace', 'Distance'].map(async (word) =>
      expect(await screen.getByText(new RegExp(word))).toBeOnTheScreen(),
    );
  });
});
