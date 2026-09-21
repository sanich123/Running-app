import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import LocationConsent from './location-consent';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('location consent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

  it('opens the Russian consent inside the app', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<LocationConsent accepted={false} onChange={jest.fn()} />);

    await user.press(screen.getByRole('link'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.locationConsent}`);
  });

  it('opens the English consent inside the app', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<LocationConsent accepted={false} onChange={jest.fn()} />);

    await user.press(screen.getByRole('link'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.locationConsentEnglish}`);
  });
});
