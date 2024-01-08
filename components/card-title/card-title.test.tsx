import { render, screen } from '@testing-library/react-native';

import CardTitle from './card-title';

describe('Activity card title', () => {
  it('should correctly renders', () => {
    render(<CardTitle title="some title" />);
    expect(screen.getByText('some title')).toBeOnTheScreen();
  });
});
