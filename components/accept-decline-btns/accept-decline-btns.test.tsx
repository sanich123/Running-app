import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent } from '@testing-library/react-native';

import AcceptDeclineBtns from './accept-decline-btns';

jest.useFakeTimers();
describe('Accept-decline-btns', () => {
  it('should correctly renders', () => {
    render(
      <AcceptDeclineBtns
        title="Some title"
        description="Some description"
        sport="Some sport"
        emotion="Some emotion"
        isSwitchOn
      />,
    );
    const saveBtn = screen.getByText(/save/i);
    const discardBtn = screen.getByText(/discard/i);
    expect(saveBtn).toBeDefined();
    expect(discardBtn).toBeDefined();
  });
  it('should interract with AsyncStorage', async () => {
    const user = userEvent.setup();
    render(
      <AcceptDeclineBtns
        title="Some title"
        description="Some description"
        sport="Some sport"
        emotion="Some emotion"
        isSwitchOn
      />,
    );
    const discardBtn = screen.getByText(/discard/i);
    await user.press(discardBtn);
    expect(AsyncStorage.getItem).toBeCalledWith('userData');
    const saveBtn = screen.getByText(/save/i);
    await user.press(saveBtn);
    expect(AsyncStorage.setItem).toBeCalled();
  });
});
