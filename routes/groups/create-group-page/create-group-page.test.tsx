import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Keyboard, Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_GROUP_DETAILS } from '@T/responses/groups';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { GROUPS_COPY } from '../const';
import CreateGroupPage from './create-group-page';

const mockReplace = jest.fn();
const mockErrorToast = jest.fn();
const mockGetAccessToGallery = jest.fn();
const mockCompressMediaFile = jest.fn();
const mockUploadMediaFile = jest.fn();
const createGroupRequests: Record<string, unknown>[] = [];
let createGroupError = false;
let holdCreateGroupResponse = false;
let releaseCreateGroupResponse: (() => void) | undefined;

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('@U/file-sending', () => ({
  getAccessToGallery: (...args: unknown[]) => mockGetAccessToGallery(...args),
  compressMediaFile: (...args: unknown[]) => mockCompressMediaFile(...args),
  uploadMediaFile: (...args: unknown[]) => mockUploadMediaFile(...args),
}));
describe('CreateGroupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createGroupRequests.length = 0;
    createGroupError = false;
    holdCreateGroupResponse = false;
    releaseCreateGroupResponse = undefined;
    server.use(
      http.post(`${BASE_URL}/groups`, async ({ request }) => {
        createGroupRequests.push((await request.json()) as Record<string, unknown>);
        if (createGroupError) return HttpResponse.json({ message: 'network failed' }, { status: 500 });
        if (holdCreateGroupResponse) {
          await new Promise<void>((resolve) => {
            releaseCreateGroupResponse = resolve;
          });
        }
        return HttpResponse.json({ ...MOCK_GROUP_DETAILS, id: 'new-group' }, { status: 201 });
      }),
    );
    jest.spyOn(Keyboard, 'addListener').mockImplementation(() => ({ remove: jest.fn() }) as never);
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetAccessToGallery.mockResolvedValue({ canceled: true, assets: [] });
    mockCompressMediaFile.mockResolvedValue('file:///compressed-group-photo.jpg');
    mockUploadMediaFile.mockResolvedValue({ assetId: 'photo-asset-1' });
  });

  it('creates a group with the selected supported activities and opens its detail page', async () => {
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-name-input'), 'City walkers');
    await user.press(screen.getByTestId('group-sport-selector'));
    await user.press(screen.getByTestId('group-sport-option-walk'));
    await user.press(screen.getByTestId('create-group-submit'));

    await waitFor(() =>
      expect(createGroupRequests).toEqual([
        {
          name: 'City walkers',
          sports: ['walk'],
          privacy: 'open',
        },
      ]),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/groups/new-group'));
  });

  it('renders exactly the four supported group sport choices', async () => {
    await renderWithProviders(<CreateGroupPage />);
    await userEvent.press(screen.getByTestId('group-sport-selector'));

    expect(screen.getByTestId('group-sport-option-run')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-walk')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-hike')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-bike')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-bike')).toBeOnTheScreen();
    expect(screen.queryByTestId('group-sport-option-swim')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('group-sport-option-workout')).not.toBeOnTheScreen();
  });

  it('requires a group name before creating', async () => {
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();

    await user.press(screen.getByTestId('create-group-submit'));
    expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].nameRequired);
    expect(createGroupRequests).toHaveLength(0);
  });

  it('sends a closed-group request and reports a save failure', async () => {
    createGroupError = true;
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('group-name-input'), 'Closed runners');
    await user.press(screen.getByText(/Closed/));
    await user.press(screen.getByTestId('group-sport-selector'));
    await user.press(screen.getByTestId('group-sport-option-hike'));
    await user.press(screen.getByTestId('create-group-submit'));

    await waitFor(() =>
      expect(createGroupRequests).toEqual([
        expect.objectContaining({ name: 'Closed runners', sports: ['hike'], privacy: 'closed' }),
      ]),
    );
    expect(mockErrorToast).toHaveBeenCalledWith(
      GROUPS_COPY[LANGUAGES.english].saveError,
      expect.objectContaining({ status: 500 }),
    );
  });

  it('disables submission while the create request is loading', async () => {
    holdCreateGroupResponse = true;
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-name-input'), 'City runners');
    await user.press(screen.getByTestId('create-group-submit'));

    await waitFor(() => expect(createGroupRequests).toHaveLength(1));
    expect(screen.getByTestId('create-group-submit')).toBeDisabled();
    await act(async () => releaseCreateGroupResponse?.());
  });

  it('renders Russian creation copy with the Android keyboard behavior', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<CreateGroupPage />);

    expect(screen.getByText(GROUPS_COPY[LANGUAGES.russian].createIntroTitle)).toBeOnTheScreen();
    expect(screen.getByText(GROUPS_COPY[LANGUAGES.russian].createIntroText)).toBeOnTheScreen();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('reports a photo preparation failure without starting an upload', async () => {
    mockGetAccessToGallery.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///group-photo.jpg', fileName: 'group-photo.jpg' }],
    });
    mockCompressMediaFile.mockResolvedValueOnce(null);
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();

    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].addPhoto));

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].photoUploadError));
    expect(mockUploadMediaFile).not.toHaveBeenCalled();
  });

  it('uploads a group photo and creates a worldwide group', async () => {
    mockGetAccessToGallery.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///group-photo.jpg', fileName: 'group-photo.jpg' }],
    });
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();

    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].addPhoto));
    await waitFor(() =>
      expect(mockUploadMediaFile).toHaveBeenCalledWith('file:///compressed-group-photo.jpg', { scope: 'group' }),
    );
    await user.type(screen.getByTestId('group-name-input'), 'Global running team');
    await user.press(screen.getByText(GROUPS_COPY[LANGUAGES.english].worldwide));
    await user.press(screen.getByTestId('create-group-submit'));

    await waitFor(() =>
      expect(createGroupRequests).toEqual([
        {
          name: 'Global running team',
          sports: ['run'],
          photoAssetId: 'photo-asset-1',
          privacy: 'open',
        },
      ]),
    );
  });

  it('does not create a group while its selected photo upload fails', async () => {
    mockGetAccessToGallery.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///group-photo.jpg', fileName: 'group-photo.jpg' }],
    });
    mockUploadMediaFile.mockRejectedValueOnce(new Error('upload failed'));
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();

    await user.press(screen.getByLabelText(GROUPS_COPY[LANGUAGES.english].addPhoto));
    await user.type(screen.getByTestId('group-name-input'), 'City runners');
    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].photoUploadError, expect.any(Error)),
    );
    expect(screen.getByTestId('create-group-submit')).not.toBeDisabled();
    expect(createGroupRequests).toHaveLength(0);
  });
});
