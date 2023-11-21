import { render, screen } from '@testing-library/react-native';
import React from 'react';

import ActivityCardShareBtn from './card-share-btn';
jest.mock('expo-router', () => ({
  usePathname: () => 'home/activity',
}));
describe('Activity card share btn', () => {
  it('should correctly renders', () => {
    render(<ActivityCardShareBtn cardRef={undefined} fullViewRef={undefined} />);
    expect(screen.getByTestId('iconShareBtn')).toBeOnTheScreen();
  });
});
