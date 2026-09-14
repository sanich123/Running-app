import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES, ROUTES } from '@const/enums';
import { resetSettings } from '@R/slices/profile/profile';
import { changeLanguage } from '@R/slices/settings/settings';
import ProfilePage from '@Routes/profile/profile';
import GenderBtns from '@Routes/profile/profile-settings/gender-btns/gender-btns';
import { INPUT_BIO_TEST_ID } from '@Routes/profile/profile-settings/input-bio/const';
import InputBio from '@Routes/profile/profile-settings/input-bio/input-bio';
import { NAME_TEST_ID, SURNAME_TEST_ID } from '@Routes/profile/profile-settings/inputs-name-surname/const';
import InputsNameSurname from '@Routes/profile/profile-settings/inputs-name-surname/inputs-name-surname';
import { CITY_TEST_ID, WEIGHT_TEST_ID } from '@Routes/profile/profile-settings/inputs-weight-city/const';
import InputsWeightCity from '@Routes/profile/profile-settings/inputs-weight-city/inputs-weight-city';
import { UPDATE_BTN } from '@Routes/profile/update-btn/const';
import ProfileUpdateBtn from '@Routes/profile/update-btn/update-btn';
import { SETTINGS } from '@Routes/settings-page/const';
import { DELETE_ACCOUNT } from '@Routes/settings-page/delete-account/const';
import DeleteAccountBtn from '@Routes/settings-page/delete-account/delete-account';
import LogoutBtn from '@Routes/settings-page/logout/logout-btn';
import SettingsPage from '@Routes/settings-page/settings-page';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockProfileSettingsParams = {
  id: MOCK_SERVER_IDS.userId,
  name: MOCK_SERVER_PROFILE.name,
  surname: MOCK_SERVER_PROFILE.surname,
  city: MOCK_SERVER_PROFILE.city,
  weight: MOCK_SERVER_PROFILE.weight,
  bio: MOCK_SERVER_PROFILE.bio,
  gender: MOCK_SERVER_PROFILE.gender,
};
const mockSetParams = jest.fn((params: Record<string, string>) => Object.assign(mockProfileSettingsParams, params));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockProfileSettingsParams,
  usePathname: () => '/profile',
  useRouter: () => ({
    back: mockBack,
    canDismiss: () => false,
    dismissAll: jest.fn(),
    push: jest.fn(),
    replace: mockReplace,
    setParams: mockSetParams,
  }),
}));

describe('profile and account integration flows', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(resetSettings());
    Object.assign(mockProfileSettingsParams, {
      id: MOCK_SERVER_IDS.userId,
      name: MOCK_SERVER_PROFILE.name,
      surname: MOCK_SERVER_PROFILE.surname,
      city: MOCK_SERVER_PROFILE.city,
      weight: MOCK_SERVER_PROFILE.weight,
      bio: MOCK_SERVER_PROFILE.bio,
      gender: MOCK_SERVER_PROFILE.gender,
    });
  });

  it('views a profile, edits all profile fields, and sends the changed data to the server', async () => {
    let requestBody: unknown;
    let requestUrl = '';
    server.use(
      http.patch(`${BASE_URL}/user/:profileId/profile`, async ({ request }) => {
        requestUrl = request.url;
        requestBody = await request.json();
        return HttpResponse.json({ ...MOCK_SERVER_PROFILE, name: 'New name', surname: 'New surname' });
      }),
    );

    await renderWithProviders(
      <>
        <ProfilePage />
        <InputsNameSurname isDisabled={false} />
        <InputsWeightCity isDisabled={false} />
        <InputBio isDisabled={false} />
        <GenderBtns isDisabled={false} />
      </>,
    );

    expect(await screen.findByText(`${MOCK_SERVER_PROFILE.name} ${MOCK_SERVER_PROFILE.surname}`)).toBeOnTheScreen();

    await fireEvent.changeText(await screen.findByTestId(NAME_TEST_ID), 'New name');
    await fireEvent.changeText(screen.getByTestId(SURNAME_TEST_ID), 'New surname');
    await fireEvent.changeText(screen.getByTestId(CITY_TEST_ID), 'New city');
    await fireEvent.changeText(screen.getByTestId(WEIGHT_TEST_ID), '82');
    await fireEvent.changeText(screen.getByTestId(INPUT_BIO_TEST_ID), 'Updated bio');

    await userEvent.press(screen.getByText('Женщина'));
    await renderWithProviders(<ProfileUpdateBtn />);
    await userEvent.press(await screen.findByText(UPDATE_BTN.russian.update));

    await waitFor(() =>
      expect(requestBody).toEqual(
        expect.objectContaining({
          name: 'New name',
          surname: 'New surname',
          city: 'New city',
          weight: '82',
          bio: 'Updated bio',
          gender: 'female',
        }),
      ),
    );
    expect(requestUrl).toContain(`/user/${MOCK_SERVER_IDS.userId}/profile`);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('logs out through the settings flow and returns to sign in', async () => {
    await renderWithProviders(<SettingsPage />);
    await userEvent.press(screen.getByText(SETTINGS.russian.logout));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.signIn}`));
  });

  it('confirms account deletion, sends the request, and returns to sign in', async () => {
    let deletedUrl = '';
    server.use(
      http.delete(`${BASE_URL}/auth/${MOCK_SERVER_IDS.userId}`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await renderWithProviders(<DeleteAccountBtn />);
    await userEvent.press(screen.getByText(DELETE_ACCOUNT.russian.action));
    expect(screen.getByText(DELETE_ACCOUNT.russian.conscentDeleting)).toBeOnTheScreen();
    await userEvent.press(screen.getByText(DELETE_ACCOUNT.russian.sure));

    await waitFor(() => expect(deletedUrl).toContain(`/auth/${MOCK_SERVER_IDS.userId}`));
    expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.signIn}`);
  });

  it('exposes the logout control from the settings page', async () => {
    await renderWithProviders(<LogoutBtn />);
    expect(screen.getByText(SETTINGS.russian.logout)).toBeOnTheScreen();
  });
});
