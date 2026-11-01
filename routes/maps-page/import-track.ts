import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { parseImportedRoute } from '@U/activity-track/route-import';
import { saveActivityTrack } from '@U/activity-track/track-library';
import type { MapsPageCopy } from './const';

export async function importTrackFile(copy: MapsPageCopy) {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: '*/*',
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    if (!/\.(gpx|kml)$/i.test(asset.name)) {
      return errorToast(copy.unsupportedRoute);
    }
    const imported = parseImportedRoute(asset.name, await new File(asset.uri).text());
    await saveActivityTrack({
      activityId: `import-${Date.now()}`,
      title: imported.title,
      date: new Date().toISOString(),
      sport: SPORTS_BTNS_VALUES.run,
      locations: imported.locations,
    });
    successToast(copy.activityAdded);
  } catch (importError) {
    errorToast(copy.importFailed, importError);
  }
}
