import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupDetailsFields from './group-details-fields';
import type { GroupCreationDetails } from '../types';

describe('GroupDetailsFields', () => {
  it('reports edits and always shows the optional location field', async () => {
    const details: GroupCreationDetails = { name: '', description: '', locationName: '' };
    const onChange = jest.fn();
    await renderWithProviders(<GroupDetailsFields details={details} onChange={onChange} />);

    await fireEvent.changeText(screen.getByTestId('group-name-input'), 'Saturday runners');
    expect(onChange).toHaveBeenCalledWith({ ...details, name: 'Saturday runners' });
    expect(screen.getByTestId('group-location-input')).toBeOnTheScreen();
    expect(screen.queryByTestId('group-worldwide-toggle')).not.toBeOnTheScreen();
  });
});
