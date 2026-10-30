import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupDetailsFields from './group-details-fields';
import type { GroupCreationDetails } from '../types';

describe('GroupDetailsFields', () => {
  it('reports edits and switches between local and worldwide groups', async () => {
    const details: GroupCreationDetails = { name: '', description: '', locationName: '', isWorldwide: false };
    const onChange = jest.fn();
    await renderWithProviders(<GroupDetailsFields details={details} onChange={onChange} />);

    await fireEvent.changeText(screen.getByTestId('group-name-input'), 'Saturday runners');
    expect(onChange).toHaveBeenCalledWith({ ...details, name: 'Saturday runners' });
    expect(screen.getByTestId('group-location-input')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('group-worldwide-toggle'));

    expect(onChange).toHaveBeenLastCalledWith({ ...details, isWorldwide: true });
  });
});
