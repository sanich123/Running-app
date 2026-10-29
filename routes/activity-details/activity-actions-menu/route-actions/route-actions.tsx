import { useState } from 'react';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { useLazyGetLocationsByActivityIdQuery } from '@R/services/activity/activity';
import { setNavigationTrackId } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { getSavedActivityTrackFile, saveActivityTrack } from '@U/activity-track/track-library';
import { ACTIVITY_ACTIONS_MENU, ACTIVITY_ACTIONS_MENU_TEST_IDS } from '../const';
import MenuItem from '../menu-item/menu-item';
import type { ActivityResponse } from '@R/runich-api/types';

export default function ActivityRouteActions({ activity }: { activity: ActivityResponse }) {
  const { language } = useAppSelector(({ settings }) => settings);
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const [getLocations] = useLazyGetLocationsByActivityIdQuery();
  const [isWorking, setIsWorking] = useState(false);
  const copy = ACTIVITY_ACTIONS_MENU[language];

  async function getRawLocations() {
    const response = await getLocations({ activityId: activity.id, raw: true }).unwrap();
    const locations = response?.locations ?? [];
    if (locations.length < 2) throw new Error('У активности нет полного маршрута для этого действия');
    return locations;
  }

  async function shareTrack(format: 'gpx' | 'fit') {
    if (isWorking) return;
    setIsWorking(true);
    try {
      const locations = await getRawLocations();
      const track = await saveActivityTrack({
        activityId: activity.id,
        title: activity.title ?? copy.defaultTrackName,
        date: activity.date,
        sport: activity.sport,
        locations,
      });
      if (!(await Sharing.isAvailableAsync())) throw new Error(copy.sharingUnavailable);
      const file = await getSavedActivityTrackFile(track.id, format);
      await Sharing.shareAsync(file.uri, {
        dialogTitle: format === 'gpx' ? copy.downloadGpx : copy.downloadFit,
        mimeType: format === 'gpx' ? 'application/gpx+xml' : 'application/vnd.ant.fit',
        UTI: format === 'gpx' ? 'com.topografix.gpx' : 'com.garmin.fit',
      });
    } catch (error) {
      errorToast(copy.trackExportFailed, error);
    } finally {
      setIsWorking(false);
    }
  }

  async function startNavigation() {
    if (isWorking) return;
    setIsWorking(true);
    try {
      const locations = await getRawLocations();
      const track = await saveActivityTrack({
        activityId: activity.id,
        title: activity.title ?? copy.defaultTrackName,
        date: activity.date,
        sport: activity.sport,
        locations,
      });
      dispatch(setNavigationTrackId(track.id));
      push(`/${ROUTES.tabs}/${ROUTES.activity}` as never);
    } catch (error) {
      errorToast(copy.navigationFailed, error);
    } finally {
      setIsWorking(false);
    }
  }

  if (Platform.OS === 'web') return null;

  return (
    <>
      <MenuItem
        action="gpx"
        label={copy.downloadGpx}
        testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.downloadGpx}
        onPress={() => void shareTrack('gpx')}
      />
      <MenuItem
        action="fit"
        label={copy.downloadFit}
        testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.downloadFit}
        onPress={() => void shareTrack('fit')}
      />
      <MenuItem
        action="navigation"
        label={copy.navigate}
        testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.navigate}
        onPress={() => void startNavigation()}
      />
    </>
  );
}
