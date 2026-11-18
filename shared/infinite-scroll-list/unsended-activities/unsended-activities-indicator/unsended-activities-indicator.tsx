import { View, StyleSheet } from 'react-native';
import { Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { useAddActivityByUserIdMutation, useUploadRawActivityLocationsMutation } from '@R/services/activity/activity';
import {
  clearPendingRawRouteUploads,
  clearUnsyncedActivities,
  removeFirstUnsyncedActivity,
} from '@R/slices/activity/activity';
import { clearTrackingRecovery } from '@R/slices/tracking-recovery/tracking-recovery';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { uploadRawRouteAndQueueOnFailure } from '@U/activity-track/upload-raw-route';
import { MAX_SAVED_ROUTE_LOCATIONS } from '@U/location/const';
import { getReducedLocations } from '@U/location/location-geometry';
import { deactivateLocationJournal, readLocationJournal, removeLocationJournal } from '@U/location/location-journal';
import { UNSYNCED_ACTIVITIES_TEXT } from '../const';
import HealthSyncIndicator from './health-sync-indicator';

export default function UnsendedActivitiesIndicator() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = UNSYNCED_ACTIVITIES_TEXT[language];
  const { unsyncedActivities = [], pendingRawRouteUploads = [] } = useAppSelector(({ activity }) => activity);
  const trackingRecovery = useAppSelector(({ trackingRecovery }) => trackingRecovery);
  const [sendActivity, { isLoading }] = useAddActivityByUserIdMutation();
  const [uploadRawLocations, { isLoading: isRouteUploadLoading }] = useUploadRawActivityLocationsMutation();
  const pendingCount = unsyncedActivities.length + pendingRawRouteUploads.length;

  async function sendPending() {
    const pendingActivity = unsyncedActivities[0];
    if (pendingActivity) {
      const journalId = pendingActivity.routeJournalId ?? null;
      const routeLocations = journalId ? (readLocationJournal(journalId)?.locations ?? []) : [];
      if (journalId && !routeLocations.length) {
        return errorToast('', copy.restoreRouteError);
      }

      await sendActivity({
        id: pendingActivity.id,
        body: {
          ...pendingActivity.body,
          locations: getReducedLocations(routeLocations, MAX_SAVED_ROUTE_LOCATIONS),
        },
      })
        .unwrap()
        .then((savedActivity) => {
          if (journalId && routeLocations.length) {
            deactivateLocationJournal(journalId);
            if (trackingRecovery.journalId === journalId) dispatch(clearTrackingRecovery());
            void uploadRawRouteAndQueueOnFailure({
              pendingUpload: {
                activityId: savedActivity.id,
                routeJournalId: journalId,
                title: pendingActivity.body.title,
                date: pendingActivity.body.date ?? new Date().toISOString(),
                sport: pendingActivity.body.sport,
              },
              locations: routeLocations,
              dispatch,
              uploadRawLocations,
            })
              .then(() => {
                successToast(copy.routeSuccess);
              })
              .catch((error: unknown) => errorToast(copy.routeError, getErrorMessageFromError(error)));
          }
          dispatch(removeFirstUnsyncedActivity());
          successToast(copy.success);
        })
        .catch((error: unknown) => errorToast('', getErrorMessageFromError(error)));
      return;
    }

    const pendingRouteUpload = pendingRawRouteUploads[0];
    const locations = readLocationJournal(pendingRouteUpload.routeJournalId)?.locations ?? [];
    if (!locations.length) {
      return errorToast('', copy.restoreRouteError);
    }

    await uploadRawRouteAndQueueOnFailure({
      pendingUpload: pendingRouteUpload,
      locations,
      dispatch,
      uploadRawLocations,
    })
      .then(() => {
        successToast(copy.routeSuccess);
      })
      .catch((error: unknown) => errorToast(copy.routeError, getErrorMessageFromError(error)));
  }

  function removePendingItems() {
    const shouldClearRecovery =
      unsyncedActivities.some(
        ({ routeJournalId }) => routeJournalId && routeJournalId === trackingRecovery.journalId,
      ) || pendingRawRouteUploads.some(({ routeJournalId }) => routeJournalId === trackingRecovery.journalId);
    unsyncedActivities.forEach(({ routeJournalId }) => {
      if (routeJournalId) removeLocationJournal(routeJournalId);
    });
    pendingRawRouteUploads.forEach(({ routeJournalId }) => removeLocationJournal(routeJournalId));
    if (shouldClearRecovery) dispatch(clearTrackingRecovery());
    dispatch(clearUnsyncedActivities());
    dispatch(clearPendingRawRouteUploads());
  }

  return (
    <>
      <HealthSyncIndicator />
      {pendingCount > 0 ? (
        <View
          style={[styles.container, { backgroundColor: colors.primaryContainer, borderColor: colors.outlineVariant }]}>
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <Icon source="cloud-upload-outline" size={24} color={colors.onPrimary} />
            </View>
            <View style={styles.copy}>
              <Text variant="titleMedium" style={{ color: colors.onPrimaryContainer }}>
                {copy.title(pendingCount)}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {isLoading || isRouteUploadLoading ? copy.sending : copy.pending}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="sync"
              testID="send-unsynced-activities"
              mode="contained-tonal"
              iconColor={colors.primary}
              containerColor={colors.surface}
              loading={isLoading || isRouteUploadLoading}
              disabled={isLoading || isRouteUploadLoading}
              onPress={sendPending}
              accessibilityLabel={copy.send}
            />
            <IconButton
              icon="delete-outline"
              testID="delete-unsynced-activities"
              mode="contained-tonal"
              iconColor={colors.error}
              containerColor={colors.errorContainer}
              loading={isLoading || isRouteUploadLoading}
              disabled={isLoading || isRouteUploadLoading}
              onPress={removePendingItems}
              accessibilityLabel={copy.remove}
            />
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 12,
    padding: 14,
  },
  content: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12 },
  iconContainer: { alignItems: 'center', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  copy: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', gap: 2 },
});
