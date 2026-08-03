import { render, screen } from '@testing-library/react-native';
import React from 'react';

import ShareBtn from './share-btn';
jest.mock('expo-router', () => ({
  usePathname: () => 'home/activity',
}));
describe('Activity card share btn', () => {
  it('should correctly renders', () => {
    render(<ShareBtn cardRef={{ current: null }} />);
    expect(screen.getByTestId('iconShareBtn')).toBeOnTheScreen();
  });
});
