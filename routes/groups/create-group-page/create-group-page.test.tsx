import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { Keyboard, Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { GROUPS_COPY } from '../const';
import CreateGroupPage from './create-group-page';

const mockReplace = jest.fn();
const mockCreateGroupMutation = jest.fn();
const mockCreateGroup = jest.fn();
const mockErrorToast = jest.fn();
const mockGetAccessToGallery = jest.fn();
const mockCompressMediaFile = jest.fn();
const mockUploadMediaFile = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('@U/file-sending', () => ({
  getAccessToGallery: (...args: unknown[]) => mockGetAccessToGallery(...args),
  compressMediaFile: (...args: unknown[]) => mockCompressMediaFile(...args),
  uploadMediaFile: (...args: unknown[]) => mockUploadMediaFile(...args),
}));
jest.mock('@R/services/groups/groups', () => ({
  useCreateGroupMutation: () => mockCreateGroupMutation(),
}));

describe('CreateGroupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Keyboard, 'addListener').mockImplementation(() => ({ remove: jest.fn() }) as never);
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockCreateGroup.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'new-group' }) });
    mockCreateGroupMutation.mockReturnValue([mockCreateGroup, { isLoading: false }]);
    mockGetAccessToGallery.mockResolvedValue({ canceled: true, assets: [] });
    mockCompressMediaFile.mockResolvedValue('file:///compressed-group-photo.jpg');
    mockUploadMediaFile.mockResolvedValue({ assetId: 'photo-asset-1' });
  });

  it('creates a group with the selected supported activities and opens its detail page', async () => {
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-name-input'), 'City walkers');
    await user.press(screen.getByTestId('group-sport-option-walk'));
    await user.press(screen.getByTestId('create-group-submit'));

    await waitFor(() =>
      expect(mockCreateGroup).toHaveBeenCalledWith({
        name: 'City walkers',
        description: undefined,
        locationName: undefined,
        sports: ['run', 'walk'],
        categoryTags: [],
        privacy: 'open',
      }),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/groups/new-group'));
  });

  it('renders exactly the four supported group sport choices', async () => {
    await renderWithProviders(<CreateGroupPage />);

    expect(screen.getByTestId('group-sport-option-run')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-walk')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-hike')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-bike')).toBeOnTheScreen();
    expect(screen.getByTestId('group-sport-option-bike')).toBeOnTheScreen();
    expect(screen.queryByTestId('group-sport-option-swim')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('group-sport-option-workout')).not.toBeOnTheScreen();
  });

  it('requires a name and at least one activity before creating a group', async () => {
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();

    await user.press(screen.getByTestId('create-group-submit'));
    expect(mockErrorToast).toHaveBeenCalledWith('Enter a group name');

    await user.type(screen.getByTestId('group-name-input'), 'City team');
    await user.press(screen.getByTestId('group-sport-option-run'));
    await user.press(screen.getByTestId('create-group-submit'));

    expect(mockErrorToast).toHaveBeenLastCalledWith('Choose at least one activity');
    expect(mockCreateGroup).not.toHaveBeenCalled();
  });

  it('sends a closed-group request and reports a save failure', async () => {
    mockCreateGroup.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('network failed')) });
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();

    await user.type(screen.getByTestId('group-name-input'), 'Closed runners');
    await user.press(screen.getByText(/Closed/));
    await user.press(screen.getByTestId('group-sport-option-hike'));
    await user.press(screen.getByTestId('create-group-submit'));

    await waitFor(() =>
      expect(mockCreateGroup).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Closed runners',
          sports: ['run', 'hike'],
          privacy: 'closed',
        }),
      ),
    );
    expect(mockErrorToast).toHaveBeenCalledWith('Could not save changes', expect.any(Error));
  });

  it('disables submission while the create request is loading', async () => {
    mockCreateGroupMutation.mockReturnValue([mockCreateGroup, { isLoading: true }]);
    await renderWithProviders(<CreateGroupPage />);

    expect(screen.getByTestId('create-group-submit')).toBeDisabled();
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

  it('limits a group to three category tags', async () => {
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();

    await user.press(screen.getByTestId('group-category-option-casual'));
    await user.press(screen.getByTestId('group-category-option-brand'));
    await user.press(screen.getByTestId('group-category-option-team'));
    await user.press(screen.getByTestId('group-category-option-corporate'));

    expect(mockErrorToast).toHaveBeenCalledWith(GROUPS_COPY[LANGUAGES.english].tooManyCategories);
  });

  it('uploads a group photo and creates a worldwide group with category tags', async () => {
    mockGetAccessToGallery.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///group-photo.jpg', fileName: 'group-photo.jpg' }],
    });
    await renderWithProviders(<CreateGroupPage />);
    const user = userEvent.setup();

    await user.press(screen.getByLabelText('Add photo'));
    await waitFor(() =>
      expect(mockUploadMediaFile).toHaveBeenCalledWith('file:///compressed-group-photo.jpg', { scope: 'group' }),
    );
    await user.type(screen.getByTestId('group-name-input'), 'Global running team');
    await user.press(screen.getByTestId('group-category-option-team'));
    await user.press(screen.getByTestId('group-category-option-local'));
    await user.press(screen.getByText('This group is for everyone, everywhere'));
    await user.press(screen.getByTestId('create-group-submit'));

    await waitFor(() =>
      expect(mockCreateGroup).toHaveBeenCalledWith({
        name: 'Global running team',
        description: undefined,
        locationName: undefined,
        sports: ['run'],
        categoryTags: ['team', 'local'],
        photoAssetId: 'photo-asset-1',
        privacy: 'open',
      }),
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

    await user.press(screen.getByLabelText('Add photo'));
    await user.type(screen.getByTestId('group-name-input'), 'City runners');
    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith('Could not upload the group photo', expect.any(Error)),
    );
    expect(screen.getByTestId('create-group-submit')).not.toBeDisabled();
    expect(mockCreateGroup).not.toHaveBeenCalled();
  });
});
