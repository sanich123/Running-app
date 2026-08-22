import { createRef } from 'react';
import { screen } from '@testing-library/react-native';
import type { View } from 'react-native';
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
        cardRef={createRef<View>()}
      />,
    );

    expect(screen.getByTestId('https://example.com/map.jpg')).toBeOnTheScreen();
    expect(screen.getByText('runich')).toBeOnTheScreen();
    expect(screen.getByText('Утренняя пробежка')).toBeOnTheScreen();
    expect(screen.getByText('00:05:00')).toBeOnTheScreen();
    expect(screen.getByText('5.00 км')).toBeOnTheScreen();
    expect(screen.getByText('Время')).toBeOnTheScreen();
    expect(screen.getByText('Дистанция')).toBeOnTheScreen();
  });

  it('uses the themed fallback when the activity has no map image', async () => {
    await renderWithProviders(
      <ShareActivityImage distance={0} duration={0} date="not-a-date" title="" cardRef={createRef<View>()} />,
    );
    expect(screen.getByText('Активность')).toBeOnTheScreen();
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
