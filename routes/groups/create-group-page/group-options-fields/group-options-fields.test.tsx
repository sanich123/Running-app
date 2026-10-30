import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupOptionsFields from './group-options-fields';
import { GROUPS_COPY } from '../../const';
import type { GroupCreationOptions } from '../types';

const mockErrorToast = jest.fn();

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));

describe('GroupOptionsFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('offers four activities and reports category limit violations', async () => {
    const options: GroupCreationOptions = {
      sports: ['run'],
      categoryTags: ['casual', 'brand', 'team'],
      privacy: 'open',
    };
    const onChange = jest.fn();
    await renderWithProviders(<GroupOptionsFields options={options} onChange={onChange} />);

    expect(screen.getByTestId('group-sport-option-run')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-walk')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-hike')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-bike')).toBeOnTheScreen();
    expect(screen.queryByTestId('group-sport-option-swim')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('group-sport-option-bike'));
    expect(onChange).toHaveBeenCalledWith({ ...options, sports: ['run', 'bike'] });
    await fireEvent.press(screen.getByTestId('group-category-option-corporate'));
    expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].tooManyCategories);
  });

  it('lets members remove a selected category and add another below the limit', async () => {
    const options: GroupCreationOptions = {
      sports: ['run'],
      categoryTags: ['casual'],
      privacy: 'open',
    };
    const onChange = jest.fn();
    await renderWithProviders(<GroupOptionsFields options={options} onChange={onChange} />);

    await fireEvent.press(screen.getByTestId('group-category-option-casual'));
    expect(onChange).toHaveBeenLastCalledWith({ ...options, categoryTags: [] });

    await fireEvent.press(screen.getByTestId('group-category-option-brand'));
    expect(onChange).toHaveBeenLastCalledWith({ ...options, categoryTags: ['casual', 'brand'] });
  });
});
