import { render, screen } from '@testing-library/react-native';
import React from 'react';

import ActivityCardShareBtn from './share-btn';
jest.mock('expo-router', () => ({
  usePathname: () => 'home/activity',
}));
describe('Activity card share btn', () => {
  it('should correctly renders', () => {
    render(<ActivityCardShareBtn cardRef={{ current: undefined }} fullViewRef={{ current: undefined }} />);
    expect(screen.getByTestId('iconShareBtn')).toBeOnTheScreen();
  });
});
