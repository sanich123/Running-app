import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupOptionsFields from './group-options-fields';
import type { GroupCreationOptions } from '../types';

describe('GroupOptionsFields', () => {
  beforeEach(() => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('offers four activities without a group type selector', async () => {
    const options: GroupCreationOptions = {
      sports: ['run'],
      privacy: 'open',
    };
    const onChange = jest.fn();
    await renderWithProviders(<GroupOptionsFields options={options} onChange={onChange} />);

    await fireEvent.press(screen.getByTestId('group-sport-selector'));
    expect(screen.getByTestId('group-sport-option-run')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-walk')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-hike')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-bike')).toBeOnTheScreen();
    expect(screen.queryByTestId('group-sport-option-swim')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('group-category-selector')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('group-sport-option-bike'));
    expect(onChange).toHaveBeenCalledWith({ ...options, sports: ['bike'] });
  });
});
