import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import ActivityCard from './card';
import { getCardMapPhotoUrl } from './utils';
import { MOCK_ACTIVITY } from '../../tests/mocks/mock-activity';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import type { SPORTS_BTNS_VALUES } from '@const/sports';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => 'somePathname',
}));

describe('Activity card', () => {
  it('resizes the saved square Mapbox image before route locations load', () => {
    const mapPhotoUrl = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/auto/360x360@2x?access_token=test';

    expect(getCardMapPhotoUrl(mapPhotoUrl, 351)).toBe(
      'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/auto/351x202@2x?access_token=test',
    );
  });

  it('should correctly renders', async () => {
    mockStore.dispatch(setUserId('someUserId'));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const { description, title, date, sport, id, photoVideoUrls, profile, duration, distance } = MOCK_ACTIVITY;
    await renderWithProviders(
      <ActivityCard
        isShowDeleteBtn
        isShowDescription
        description={description}
        title={title}
        date={`${new Date(date)}`}
        sport={sport as SPORTS_BTNS_VALUES}
        id={id}
        userId="someUserId"
        photoVideoUrls={photoVideoUrls}
        duration={duration}
        distance={distance}
        profile={MOCK_PROFILE}
        commentsLength={6}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(new RegExp(`${profile.name}`))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(`${profile.surname}`))).toBeOnTheScreen();
    expect(await screen.findAllByText(title)).toHaveLength(2);
    ['Time', 'Pace', 'Distance'].map(async (word) =>
      expect(await screen.getAllByText(new RegExp(word))).toHaveLength(2),
    );
  });
});
