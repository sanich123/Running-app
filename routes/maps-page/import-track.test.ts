import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { LANGUAGES } from '@const/enums';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { saveActivityTrack } from '@U/activity-track/track-library';
import { MAPS_PAGE_COPY } from './const';
import { importTrackFile } from './import-track';

const mockFileText = jest.fn();
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({ File: jest.fn().mockImplementation(() => ({ text: mockFileText })) }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
jest.mock('@S/success-toast/success-toast', () => ({ successToast: jest.fn() }));
jest.mock('@U/activity-track/track-library', () => ({ saveActivityTrack: jest.fn() }));

const gpxContents = [
  '<gpx>',
  '<trk><name>Morning loop</name><trkseg>',
  '<trkpt lat="55.7" lon="37.6"/>',
  '<trkpt lat="55.8" lon="37.7"/>',
  '</trkseg></trk>',
  '</gpx>',
].join('');

describe('importTrackFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileText.mockResolvedValue(gpxContents);
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ name: 'track21.gpx', uri: 'content://downloads/track21.gpx', mimeType: 'application/octet-stream' }],
    });
  });

  it('allows Android file providers to expose GPX as a generic MIME type', async () => {
    await importTrackFile(MAPS_PAGE_COPY[LANGUAGES.russian]);

    expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith({ copyToCacheDirectory: true, type: '*/*' });
    expect(File).toHaveBeenCalledWith('content://downloads/track21.gpx');
    expect(saveActivityTrack).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Morning loop', locations: expect.arrayContaining([expect.any(Object)]) }),
    );
    expect(successToast).toHaveBeenCalledWith(MAPS_PAGE_COPY[LANGUAGES.russian].activityAdded);
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('rejects files whose names are not GPX or KML', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ name: 'activity.fit', uri: 'content://downloads/activity.fit', mimeType: 'application/octet-stream' }],
    });

    await importTrackFile(MAPS_PAGE_COPY[LANGUAGES.russian]);

    expect(errorToast).toHaveBeenCalledWith(MAPS_PAGE_COPY[LANGUAGES.russian].unsupportedRoute);
    expect(File).not.toHaveBeenCalled();
    expect(saveActivityTrack).not.toHaveBeenCalled();
  });

  it('does nothing when the user cancels the file picker', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: null });

    await importTrackFile(MAPS_PAGE_COPY[LANGUAGES.russian]);

    expect(saveActivityTrack).not.toHaveBeenCalled();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('does nothing when the file provider returns no assets', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [] });

    await importTrackFile(MAPS_PAGE_COPY[LANGUAGES.russian]);

    expect(saveActivityTrack).not.toHaveBeenCalled();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('shows an import error when the selected GPX has no valid route points', async () => {
    mockFileText.mockResolvedValue('<gpx><trkpt lat="55.7" lon="37.6"/></gpx>');

    await importTrackFile(MAPS_PAGE_COPY[LANGUAGES.russian]);

    expect(saveActivityTrack).not.toHaveBeenCalled();
    expect(errorToast).toHaveBeenCalledWith(MAPS_PAGE_COPY[LANGUAGES.russian].importFailed, expect.any(Error));
  });
});
