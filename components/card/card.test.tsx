import { screen } from '@testing-library/react-native';

import ActivityCard from './card';
import * as auth from '../../auth/context/auth-context';
import { SportsProps } from '../../constants/types/activity-cart';
import { MOCK_ACTIVITY } from '../../tests/mocks/mock-activity';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

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
    const { description, title, date, sport, id, locations, photoUrls, duration, distance } = MOCK_ACTIVITY;
    renderWithProviders(
      <ActivityCard
        description={description}
        title={title}
        date={new Date(date)}
        sport={sport as SportsProps}
        id={id}
        userId="someUserId"
        locations={locations}
        photoUrls={photoUrls}
        duration={duration}
        distance={distance}
      />,
      { store: mockStore },
    );
    expect(await screen.findByText(title)).toBeOnTheScreen();
    expect(await screen.findByText('Искандер')).toBeOnTheScreen();
    expect(await screen.findByText('Ядгаров')).toBeOnTheScreen();
    expect(await screen.findByText('Friday, November 3, 2023')).toBeOnTheScreen();
    expect(await screen.findByText('at 18:28')).toBeOnTheScreen();
    ['Time', 'Pace', 'Distance'].map(async (word) =>
      expect(await screen.getByText(new RegExp(word))).toBeOnTheScreen(),
    );
  });
});
