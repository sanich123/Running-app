import { queuePendingRawRouteUpload, removePendingRawRouteUpload } from '@R/slices/activity/activity';
import { removeLocationJournal } from '@U/location/location-journal';
import type { UploadRawActivityLocationsRequest } from '@R/services/activity/types';
import type { PendingRawRouteUpload } from '@R/slices/activity/types';
import type { AppDispatch } from '@R/store';
import type { LocationObject } from 'expo-location';

export type UploadRawActivityLocationsTrigger = (request: UploadRawActivityLocationsRequest) => {
  unwrap: () => Promise<void>;
};

export interface UploadRawRouteOptions {
  pendingUpload: PendingRawRouteUpload;
  locations: LocationObject[];
  dispatch: AppDispatch;
  uploadRawLocations: UploadRawActivityLocationsTrigger;
}

export async function uploadRawRouteAndQueueOnFailure({
  pendingUpload,
  locations,
  dispatch,
  uploadRawLocations,
}: UploadRawRouteOptions): Promise<void> {
  const { activityId, routeJournalId } = pendingUpload;

  try {
    await uploadRawLocations({ activityId, locations }).unwrap();
  } catch (error) {
    dispatch(queuePendingRawRouteUpload(pendingUpload));
    throw error;
  }

  removeLocationJournal(routeJournalId);
  dispatch(removePendingRawRouteUpload(activityId));
}
