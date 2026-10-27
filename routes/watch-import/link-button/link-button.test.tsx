import { screen, userEvent } from '@testing-library/react-native';
import { TEST_URLS } from '@T/mocks/const';
import { renderWithProviders } from '@T/utils/test-utils';
import LinkButton from './link-button';

describe('LinkButton', () => {
  it('opens the configured URL when pressed', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    await renderWithProviders(<LinkButton label="Open guide" url={TEST_URLS.guidePage} onOpen={onOpen} />);

    await user.press(screen.getByText('Open guide'));

    expect(onOpen).toHaveBeenCalledWith(TEST_URLS.guidePage);
  });
});
