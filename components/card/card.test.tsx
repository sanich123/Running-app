import { changeLanguage } from '@R/language/language';
import { LANGUAGES } from '@const/enums';
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
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const { description, title, date, sport, id, photoVideoUrls, profile, duration, distance } = MOCK_ACTIVITY;
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
        photoVideoUrls={photoVideoUrls}
        duration={duration}
        distance={distance}
        fullViewRef={{ current: undefined }}
        profile={profile}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(new RegExp(`${profile.name}`))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(`${profile.surname}`))).toBeOnTheScreen();
    expect(await screen.findByText(title)).toBeOnTheScreen();
    ['Time', 'Pace', 'Distance'].map(async (word) =>
      expect(await screen.getByText(new RegExp(word))).toBeOnTheScreen(),
    );
  });
});
