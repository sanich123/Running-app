import { screen, userEvent } from '@testing-library/react-native';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { TEXT_INPUTS_DESCRIPTION_TEST_ID, TEXT_INPUTS_TITLE_TEST_ID } from './const';
import TextInputs from './text-inputs';

describe('text inputs', () => {
  it('stores the entered activity title and description', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<TextInputs isDisabled={false} />);
    await user.clear(screen.getByTestId(TEXT_INPUTS_TITLE_TEST_ID));
    await user.type(screen.getByTestId(TEXT_INPUTS_TITLE_TEST_ID), 'Evening run');
    await user.clear(screen.getByTestId(TEXT_INPUTS_DESCRIPTION_TEST_ID));
    await user.type(screen.getByTestId(TEXT_INPUTS_DESCRIPTION_TEST_ID), 'Felt strong');
    expect(mockStore.getState().additionalInfoActivity).toEqual(
      expect.objectContaining({ title: 'Evening run', description: 'Felt strong' }),
    );
  });
});
