import { screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

import ActivityCardDeleteBtn from './card-delete-btn';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.spyOn(Alert, 'alert');
describe('Activity card delete btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivityCardDeleteBtn activityId="someActivityId" />);
    expect(screen.getByTestId('activityCardDeleteBtn')).toBeOnTheScreen();
  });
  it('should correctly interracts with the user', async () => {
    renderWithProviders(<ActivityCardDeleteBtn activityId="someActivityId" />);
    const deleteBtn = screen.getByTestId('activityCardDeleteBtn');
    await userEvent.press(deleteBtn);
    expect(Alert.alert).toHaveBeenCalled();
  });
});
