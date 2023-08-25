import { render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import SaveResult from '../../app/(tabs)/activity/save-activity';
import { DESCRIPTION_PLACEHOLDER, TITLE_PLACEHOLDER } from '../../components/text-inputs/text-inputs-const';
import { store } from '../../redux/store';
jest.useFakeTimers();
describe('Save-activity page', () => {
  it('should correctly renders', () => {
    render(
      <Provider store={store}>
        <SaveResult />
      </Provider>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(11);

    const titleInput = screen.getByPlaceholderText(TITLE_PLACEHOLDER);
    const descriptionInput = screen.getByPlaceholderText(DESCRIPTION_PLACEHOLDER);
    const run = screen.getByText(/running/i);
    const swim = screen.getByText(/swimming/i);
    const ride = screen.getByText(/riding/i);
    const emotionFine = screen.getByText(/fine/i);
    const emotionNormal = screen.getByText(/normal/i);
    const emotionFucked = screen.getByText(/fucked/i);
    const isEnablePublishing = screen.getByText(/publish on home or club feeds/i);

    const arrayOfButtons = [
      titleInput,
      descriptionInput,
      run,
      swim,
      ride,
      emotionFine,
      emotionNormal,
      emotionFucked,
      isEnablePublishing,
    ];
    arrayOfButtons.forEach((button) => expect(button).toBeDefined());
  });
});
