import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import EmailRegistrationRestriction from './email-registration-restriction';

describe('EmailRegistrationRestriction', () => {
  it('opens an explanation when the restriction notice is pressed', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    const user = userEvent.setup();
    await renderWithProviders(<EmailRegistrationRestriction />);

    await user.press(screen.getByTestId('registration-email-restriction'));

    expect(screen.getByTestId('registration-email-restriction-dialog')).toBeVisible();
  });
});
