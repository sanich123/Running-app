import { createRef } from 'react';
import { screen } from '@testing-library/react-native';
import type { View } from 'react-native';
import { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { renderWithProviders } from '@T/utils/test-utils';
import ShareActivityImage from './share-activity-image';

describe('share activity image', () => {
  it('renders the branded activity card with date and metrics over a map', async () => {
    await renderWithProviders(
      <ShareActivityImage
        distance={5000}
        duration={300000}
        date="2026-08-09T10:00:00.000Z"
        title="Утренняя пробежка"
        mapPhotoUrl="https://example.com/map.jpg"
        emotion={EMOTIONS_BTNS_VALUES.good}
        elevationGain={208}
        steps={1234}
        profile={MOCK_PROFILE}
        locationName="Москва"
        weatherTemperature={18}
        weatherWindSpeed={6}
        weatherCode={0}
        caloriesActive={742}
        cardRef={createRef<View>()}
      />,
    );

    const map = screen.getByTestId('https://example.com/map.jpg');
    expect(map).toBeOnTheScreen();
    expect(map.props.priority).toBe('low');
    expect(map.props.cachePolicy).toBe('disk');
    expect(map.props.transition).toBe(0);
    expect(screen.getByTestId('share-activity-image')).toHaveStyle({ left: -10000, top: -10000 });
    expect(screen.getByTestId('share-profile-avatar')).toBeOnTheScreen();
    expect(screen.getByTestId('share-profile-avatar').props.source).toEqual({ uri: MOCK_PROFILE.profilePhoto });
    expect(screen.getByTestId('share-activity-title')).toBeOnTheScreen();
    expect(screen.queryByText('© Mapbox · © OpenStreetMap · Improve this map')).not.toBeOnTheScreen();
    expect(screen.getByText('runich')).toBeOnTheScreen();
    expect(screen.getByText('Утренняя пробежка')).toBeOnTheScreen();
    expect(screen.getByText('00:05:00')).toBeOnTheScreen();
    expect(screen.getByText('5.00 км')).toBeOnTheScreen();
    expect(screen.getByTestId('map-emotion-icon')).toBeOnTheScreen();
    expect(screen.queryByTestId('share-emotion-icon')).not.toBeOnTheScreen();
    expect(screen.queryByText('Класс')).not.toBeOnTheScreen();
    expect(screen.getByText('208 м')).toBeOnTheScreen();
    expect(screen.getByText('1234')).toBeOnTheScreen();
    expect(screen.getByText('742 ккал')).toBeOnTheScreen();
    expect(screen.getByText('Время')).toBeOnTheScreen();
    expect(screen.getByText('Дистанция')).toBeOnTheScreen();
    expect(screen.getByText('Набор выс.')).toBeOnTheScreen();
    expect(screen.getByText('Калории')).toBeOnTheScreen();
    expect(screen.getByText('Москва')).toBeOnTheScreen();
    expect(screen.getByText('18°C')).toBeOnTheScreen();
    expect(screen.getByText('6 м/с')).toBeOnTheScreen();
  });

  it('uses the themed fallback when the activity has no map image', async () => {
    await renderWithProviders(
      <ShareActivityImage distance={0} duration={0} date="not-a-date" title="" cardRef={createRef<View>()} />,
    );
    expect(screen.getByText('бег')).toBeOnTheScreen();
    expect(screen.queryByText('not-a-date')).not.toBeOnTheScreen();
  });

  it('uses kilometres per hour for non-running activities', async () => {
    await renderWithProviders(
      <ShareActivityImage
        distance={5000}
        duration={300000}
        date="2026-08-09T10:00:00.000Z"
        title="Велопрогулка"
        sport="bike"
        cardRef={createRef<View>()}
      />,
    );

    expect(screen.getByText('Скорость')).toBeOnTheScreen();
    expect(screen.getByText('60.0 км/ч')).toBeOnTheScreen();
    expect(screen.queryByText('Темп')).not.toBeOnTheScreen();
  });
});
