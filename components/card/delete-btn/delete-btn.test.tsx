import { screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

import ActivityCardDeleteBtn from './delete-btn';
import { CARD_DELETE_BTN_TEST_ID } from './const';
import { renderWithProviders } from '../../../tests/utils/test-utils';

jest.spyOn(Alert, 'alert');
describe('Activity card delete btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivityCardDeleteBtn activityId="someActivityId" />);
    expect(screen.getByTestId(CARD_DELETE_BTN_TEST_ID)).toBeOnTheScreen();
  });
  it('should correctly interracts with the user', async () => {
    renderWithProviders(<ActivityCardDeleteBtn activityId="someActivityId" />);
    const deleteBtn = screen.getByTestId(CARD_DELETE_BTN_TEST_ID);
    await userEvent.press(deleteBtn);
    expect(Alert.alert).toHaveBeenCalled();
  });
});
