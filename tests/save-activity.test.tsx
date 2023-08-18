import { render, screen } from '@testing-library/react-native';

import SaveResult from '../app/save-activity';
import { DESCRIPTION_PLACEHOLDER, TITLE_PLACEHOLDER } from '../components/text-inputs/text-inputs-const';
jest.useFakeTimers();
describe('Save-activity page', () => {
  it('should correctly renders', () => {
    render(<SaveResult />);
    expect(screen.getAllByRole('button')).toHaveLength(10);

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