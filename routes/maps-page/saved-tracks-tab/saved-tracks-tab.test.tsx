import type React from 'react';
import { createElement as mockCreateElement } from 'react';
import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import * as Sharing from 'expo-sharing';
import type * as ReactNative from 'react-native';
import { ROUTES, LANGUAGES } from '@const/enums';
import { setNavigationTrackId } from '@R/slices/location/location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import {
  deleteAllSavedActivityTracks,
  deleteSavedActivityTrack,
  getSavedActivityTracksStorageBytes,
  getSavedActivityTrackFile,
  listSavedActivityTracks,
  renameSavedActivityTrack,
} from '@U/activity-track/track-library';
import { MAPS_PAGE_COPY } from '../const';
import SavedTracksTab from './saved-tracks-tab';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('@U/activity-track/track-library', () => ({
  deleteAllSavedActivityTracks: jest.fn(),
  deleteSavedActivityTrack: jest.fn(),
  getSavedActivityTracksStorageBytes: jest.fn(),
  getSavedActivityTrackFile: jest.fn(),
  listSavedActivityTracks: jest.fn(),
  renameSavedActivityTrack: jest.fn(),
}));
jest.mock('@expo/ui/swift-ui', () => {
  const { Pressable, Text, View } = jest.requireActual('react-native') as typeof ReactNative;
  return {
    Button: ({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) =>
      mockCreateElement(Pressable, { onPress, testID }, mockCreateElement(Text, null, label)),
    Host: ({ children }: { children: React.ReactNode }) => mockCreateElement(View, null, children),
    Label: ({ systemImage }: { systemImage: string }) => mockCreateElement(Text, null, systemImage),
    Menu: ({ children, label, testID }: { children: React.ReactNode; label: React.ReactNode; testID: string }) =>
      mockCreateElement(View, { testID }, label, children),
  };
});
jest.mock('@expo/ui/swift-ui/modifiers', () => ({ accessibilityLabel: (label: string) => label }));

const copy = MAPS_PAGE_COPY[LANGUAGES.russian];
const savedTrack = {
  id: 'activity-run-1',
  activityId: 'run-1',
  title: 'Morning run',
  date: '2026-10-29T06:00:00.000Z',
  pointCount: 245,
};

describe('saved tracks tab', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockStore.dispatch(setNavigationTrackId(null));
    jest.mocked(listSavedActivityTracks).mockReset().mockResolvedValue([savedTrack]);
    jest.mocked(renameSavedActivityTrack).mockReset();
    jest.mocked(deleteSavedActivityTrack).mockReset();
    jest.mocked(deleteAllSavedActivityTracks).mockReset().mockResolvedValue([]);
    jest.mocked(getSavedActivityTracksStorageBytes).mockReset().mockReturnValue(1024);
    jest.mocked(getSavedActivityTrackFile).mockReset();
    jest.mocked(Sharing.isAvailableAsync).mockReset().mockResolvedValue(true);
    jest.mocked(Sharing.shareAsync).mockReset().mockResolvedValue(undefined);
  });

  it('renames, shares and navigates along a saved track', async () => {
    jest.mocked(renameSavedActivityTrack).mockResolvedValue([{ ...savedTrack, title: 'Park loop' }]);
    jest
      .mocked(getSavedActivityTrackFile)
      .mockResolvedValue({ uri: 'file:///track.gpx' } as Awaited<ReturnType<typeof getSavedActivityTrackFile>>);
    const user = userEvent.setup();
    await renderWithProviders(<SavedTracksTab copy={copy} />, { store: mockStore });

    await user.press(await screen.findByTestId(`track-actions-${savedTrack.id}`));
    await user.press(await screen.findByText(copy.rename));
    const titleInput = screen.getByDisplayValue(savedTrack.title);
    await user.clear(titleInput);
    await user.type(titleInput, 'Park loop');
    await user.press(screen.getByLabelText(copy.save));
    await waitFor(() => expect(renameSavedActivityTrack).toHaveBeenCalledWith(savedTrack.id, 'Park loop'));

    await user.press(screen.getByTestId(`track-actions-${savedTrack.id}`));
    await user.press(await screen.findByText(copy.shareGpx));
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///track.gpx', expect.any(Object)));
    await user.press(screen.getByTestId(`navigate-saved-track-${savedTrack.id}`));

    expect(mockStore.getState().location.navigationTrackId).toBe(savedTrack.id);
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.tabs}/${ROUTES.activity}`);
  });

  it('deletes the selected route and clears active navigation', async () => {
    jest.mocked(deleteSavedActivityTrack).mockResolvedValue([]);
    mockStore.dispatch(setNavigationTrackId(savedTrack.id));
    const user = userEvent.setup();
    await renderWithProviders(<SavedTracksTab copy={copy} />, { store: mockStore });

    await user.press(await screen.findByTestId(`track-actions-${savedTrack.id}`));
    await user.press(await screen.findByText(copy.delete));
    await waitFor(() => expect(deleteSavedActivityTrack).toHaveBeenCalledWith(savedTrack.id));
    expect(mockStore.getState().location.navigationTrackId).toBeNull();
  });

  it('confirms before clearing all tracks and clears active navigation after completion', async () => {
    let finishClear!: (tracks: []) => void;
    jest
      .mocked(deleteAllSavedActivityTracks)
      .mockImplementation(() => new Promise((resolve) => (finishClear = resolve)));
    mockStore.dispatch(setNavigationTrackId(savedTrack.id));
    const user = userEvent.setup();
    await renderWithProviders(<SavedTracksTab copy={copy} />, { store: mockStore });

    await user.press(screen.getByTestId('clear-all-saved-tracks'));
    expect(screen.getByText(copy.clearTracksConfirmTitle)).toBeOnTheScreen();
    await user.press(screen.getByTestId('confirm-dialog-cancel-button'));
    expect(deleteAllSavedActivityTracks).not.toHaveBeenCalled();

    await user.press(screen.getByTestId('clear-all-saved-tracks'));
    await user.press(screen.getByTestId('confirm-dialog-confirm-button'));
    expect(deleteAllSavedActivityTracks).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('confirm-dialog-loading')).toBeOnTheScreen();

    await act(async () => finishClear([]));
    await waitFor(() => expect(screen.queryByTestId('saved-track-activity-run-1')).toBeNull());
    expect(mockStore.getState().location.navigationTrackId).toBeNull();
  });

  it('offers to retry when the local track library fails to load', async () => {
    jest.mocked(listSavedActivityTracks).mockRejectedValueOnce(new Error('storage unavailable'));
    const user = userEvent.setup();
    await renderWithProviders(<SavedTracksTab copy={copy} />, { store: mockStore });

    await user.press(await screen.findByText(copy.retry));
    await waitFor(() => expect(screen.getByTestId(`saved-track-${savedTrack.id}`)).toBeOnTheScreen());
    expect(listSavedActivityTracks).toHaveBeenCalledTimes(2);
  });
});
