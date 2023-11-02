import { render, screen } from '@testing-library/react-native';

import ActivityCardShareBtn from './card-share-btn';

describe('Activity card share btn', () => {
  it('should correctly renders', () => {
    render(<ActivityCardShareBtn />);
    expect(screen.getByTestId('iconShareBtn')).toBeOnTheScreen();
  });
});
