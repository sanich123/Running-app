import { screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

import ActivityCloseBtn from './activity-close-btn';
import { STATUSES } from '../../constants/enums';
import { setDuration } from '../../redux/location/location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.spyOn(Alert, 'alert');

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

describe('Activity close btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivityCloseBtn />);
    expect(screen.getByText(/close/i)).toBeDefined();
  });
  it('should correctly show alert message, when duration is greater than 0', async () => {
    mockStore.dispatch(setDuration(10000));
    renderWithProviders(<ActivityCloseBtn />, { store: mockStore });
    const closeBtn = screen.getByText(/close/i);
    await userEvent.press(closeBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.paused);
    expect(Alert.alert).toHaveBeenCalled();
  });
});
